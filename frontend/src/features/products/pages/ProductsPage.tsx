import { FormEvent, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"

import { apiErrorMessage } from "@/services/errors"
import {
  currencyDigitsOnly,
  digitsFromNumber,
  formatCurrencyFromDigits,
  parseCurrencyFromDigits,
} from "@/lib/currency"
import {
  productService,
  type Product,
  type ProductRequest,
  type ProductRawMaterialRequest,
} from "@/services/productService"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  rawMaterialService,
  type RawMaterial,
} from "@/services/rawMaterialService"

type CompositionModalState =
  | { open: false }
  | {
      open: true
      product: Product
      qtyByMaterialId: Record<string, string>
      search: string
    }

function formatComposition(rawMaterials?: Product["rawMaterials"]) {
  const list = rawMaterials ?? []
  if (list.length === 0) return "No composition"
  const parts = list
    .slice(0, 3)
    .map((a) => `${a.quantityNeeded} ${a.rawMaterialName}`)
  const suffix = list.length > 3 ? ` +${list.length - 3} more` : ""
  return `Composition: ${parts.join(", ")}${suffix}`
}

function clampInt(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (!Number.isInteger(n)) return null
  return n
}

export default function ProductsPage() {
  const qc = useQueryClient()

  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)

  const [editing, setEditing] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")

  const [compositionOpen, setCompositionOpen] = useState(false)
  const [compositionQtyByMaterialId, setCompositionQtyByMaterialId] = useState<
    Record<string, string>
  >({})
  const [compositionSearch, setCompositionSearch] = useState("")

  const [syncingComposition, setSyncingComposition] = useState(false)

  const [compositionModal, setCompositionModal] =
    useState<CompositionModalState>({ open: false })

  const queryKey = useMemo(
    () => ["products", { page, size, search: debouncedSearch }],
    [page, size, debouncedSearch],
  )

  const listQuery = useQuery({
    queryKey,
    queryFn: () => productService.list({ page, size, search: debouncedSearch }),
  })

  const editingProductQuery = useQuery({
    queryKey: ["product", editing?.id ?? ""],
    queryFn: () => productService.get(editing?.id ?? ""),
    enabled: Boolean(editing?.id),
  })

  const materialsQuery = useQuery({
    queryKey: ["raw-materials", "all"],
    queryFn: () => rawMaterialService.listAll(),
  })

  const createMutation = useMutation({
    mutationFn: (body: ProductRequest) => productService.create(body),
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Create failed", {
        id: "product-create-failed",
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProductRequest }) =>
      productService.update(id, body),
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Update failed", {
        id: "product-update-failed",
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: async () => {
      toast.success("Product deleted", { id: "product-deleted" })
      await qc.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Delete failed", {
        id: "product-delete-failed",
      }),
  })

  const linkMaterialsMutation = useMutation({
    mutationFn: (vars: {
      productId: string
      items: ProductRawMaterialRequest[]
    }) => productService.addRawMaterials(vars.productId, vars.items),
    onSuccess: async () => {
      toast.success("Raw materials linked", { id: "product-materials-linked" })
      await qc.invalidateQueries({ queryKey: ["products"] })
      setCompositionModal({ open: false })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Link failed", {
        id: "product-materials-link-failed",
      }),
  })

  const saving =
    createMutation.isPending || updateMutation.isPending || syncingComposition

  useEffect(() => {
    const full = editingProductQuery.data
    if (!full) return
    if (!editing || full.id !== editing.id) return

    setEditing(full)

    setCompositionQtyByMaterialId((prev) => {
      if (Object.keys(prev).length > 0) return prev
      const next: Record<string, string> = {}
      for (const assoc of full.rawMaterials ?? []) {
        next[assoc.rawMaterialId] = String(assoc.quantityNeeded)
      }
      return next
    })
  }, [editingProductQuery.data, editing])

  function startEdit(p: Product) {
    setEditing(p)
    setName(p.name)
    setDescription(p.description ?? "")
    setPrice(digitsFromNumber(p.price))
    setStockQuantity(String(p.stockQuantity))
    setCompositionOpen(true)

    const next: Record<string, string> = {}
    for (const assoc of p.rawMaterials ?? []) {
      next[assoc.rawMaterialId] = String(assoc.quantityNeeded)
    }
    setCompositionQtyByMaterialId(next)
  }

  async function syncComposition(product: Product) {
    const existing = product.rawMaterials ?? []

    const desiredItems: ProductRawMaterialRequest[] = Object.entries(
      compositionQtyByMaterialId,
    )
      .map(([rawMaterialId, raw]) => {
        const qty = clampInt(raw)
        if (qty == null || qty < 1) return null
        return { rawMaterialId, quantityNeeded: qty }
      })
      .filter((x): x is ProductRawMaterialRequest => Boolean(x))

    const desiredById = new Map(
      desiredItems.map((x) => [x.rawMaterialId, x.quantityNeeded]),
    )

    const existingByMaterialId = new Map(
      existing.map((a) => [a.rawMaterialId, a]),
    )

    const toRemove = existing
      .filter((a) => !desiredById.has(a.rawMaterialId))
      .map((a) => a.id)

    const toUpdate = existing
      .map((a) => {
        const desiredQty = desiredById.get(a.rawMaterialId)
        if (desiredQty == null) return null
        if (desiredQty === a.quantityNeeded) return null
        return {
          associationId: a.id,
          rawMaterialId: a.rawMaterialId,
          quantityNeeded: desiredQty,
        }
      })
      .filter(
        (
          x,
        ): x is {
          associationId: string
          rawMaterialId: string
          quantityNeeded: number
        } => Boolean(x),
      )

    const toAdd = desiredItems.filter(
      (x) => !existingByMaterialId.has(x.rawMaterialId),
    )

    if (toAdd.length === 0 && toUpdate.length === 0 && toRemove.length === 0) {
      return
    }

    setSyncingComposition(true)
    try {
      if (toAdd.length > 0) {
        await productService.addRawMaterials(product.id, toAdd)
      }

      await Promise.all(
        toUpdate.map((u) =>
          productService.updateRawMaterial(product.id, u.associationId, {
            rawMaterialId: u.rawMaterialId,
            quantityNeeded: u.quantityNeeded,
          }),
        ),
      )

      await Promise.all(
        toRemove.map((associationId) =>
          productService.removeRawMaterial(product.id, associationId),
        ),
      )
    } finally {
      setSyncingComposition(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const parsedPrice = parseCurrencyFromDigits(price)

    const body: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parsedPrice,
      stockQuantity: Number(stockQuantity),
    }

    if (!body.name) {
      toast.error("Product name is required", { id: "product-name-required" })
      return
    }
    if (!Number.isFinite(body.price) || body.price <= 0) {
      toast.error("Price must be greater than 0", {
        id: "product-price-invalid",
      })
      return
    }
    if (!Number.isInteger(body.stockQuantity) || body.stockQuantity < 0) {
      toast.error("Stock quantity must be 0 or more", {
        id: "product-stock-invalid",
      })
      return
    }

    if (editing) {
      if (compositionOpen && materialsQuery.isLoading) {
        toast.error("Please wait for raw materials to load", {
          id: "composition-materials-loading",
        })
        return
      }

      const current = editing
      await updateMutation.mutateAsync({ id: current.id, body })

      try {
        await syncComposition(current)
      } catch (err) {
        toast.error(apiErrorMessage(err) ?? "Composition update failed", {
          id: "product-composition-update-failed",
        })
      }

      toast.success("Product updated", { id: "product-updated" })
      await qc.invalidateQueries({ queryKey: ["products"] })
      resetForm()
    } else {
      if (compositionOpen && materialsQuery.isLoading) {
        toast.error("Please wait for raw materials to load", {
          id: "composition-materials-loading",
        })
        return
      }

      const created = await createMutation.mutateAsync(body)

      const compositionItems: ProductRawMaterialRequest[] = compositionOpen
        ? Object.entries(compositionQtyByMaterialId)
            .map(([rawMaterialId, raw]) => {
              const qty = clampInt(raw)
              if (qty == null || qty < 1) return null
              return { rawMaterialId, quantityNeeded: qty }
            })
            .filter((x): x is ProductRawMaterialRequest => Boolean(x))
        : []

      if (compositionItems.length > 0) {
        try {
          await productService.addRawMaterials(created.id, compositionItems)
          toast.success("Product created with composition", {
            id: "product-created-with-composition",
          })
        } catch (err) {
          toast.error(apiErrorMessage(err) ?? "Composition link failed", {
            id: "product-created-composition-failed",
          })
        }
      } else {
        toast.success("Product created", { id: "product-created" })
      }

      await qc.invalidateQueries({ queryKey: ["products"] })
      setName("")
      setDescription("")
      setPrice("")
      setStockQuantity("")
      setCompositionOpen(false)
      setCompositionQtyByMaterialId({})
      setCompositionSearch("")
    }
  }

  const content = listQuery.data?.content ?? []

  const maxStockInPage = useMemo(() => {
    const values = content.map((p) => p.stockQuantity ?? 0)
    return Math.max(1, ...values)
  }, [content])

  const modalFilteredMaterials = useMemo(() => {
    const list = materialsQuery.data ?? []
    if (!compositionModal.open) return list
    const term = compositionModal.search.trim().toLowerCase()
    if (!term) return list
    return list.filter((m) => m.name.toLowerCase().includes(term))
  }, [materialsQuery.data, compositionModal])

  const compositionMaterials = useMemo(() => {
    return materialsQuery.data ?? []
  }, [materialsQuery.data])

  const compositionFilteredMaterials = useMemo(() => {
    const list = compositionMaterials
    const term = compositionSearch.trim().toLowerCase()
    if (!term) return list
    return list.filter((m) => m.name.toLowerCase().includes(term))
  }, [compositionMaterials, compositionSearch])

  const isBusy =
    saving ||
    deleteMutation.isPending ||
    linkMaterialsMutation.isPending ||
    listQuery.isFetching

  function resetForm() {
    setEditing(null)
    setName("")
    setDescription("")
    setPrice("")
    setStockQuantity("")
    setCompositionOpen(false)
    setCompositionQtyByMaterialId({})
    setCompositionSearch("")
  }

  function openLinkModal(product: Product) {
    setCompositionModal({
      open: true,
      product,
      qtyByMaterialId: {},
      search: "",
    })
  }

  async function submitLinkModal() {
    if (!compositionModal.open) return
    const list = materialsQuery.data ?? []
    const items: ProductRawMaterialRequest[] = list
      .map((m) => {
        const raw = compositionModal.qtyByMaterialId[m.id] ?? ""
        const qty = clampInt(raw)
        if (qty == null || qty < 1) return null
        return { rawMaterialId: m.id, quantityNeeded: qty }
      })
      .filter((x): x is ProductRawMaterialRequest => Boolean(x))

    if (items.length === 0) {
      toast.error("Select at least one raw material with qty ≥ 1", {
        id: "link-materials-empty",
      })
      return
    }
    await linkMaterialsMutation.mutateAsync({
      productId: compositionModal.product.id,
      items,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-10">
        <section>
          <div className="glass-card p-8 rounded-[2rem] space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {editing ? (
                  <>
                    Edit <span className="text-emerald-500">Product</span>
                  </>
                ) : (
                  <>
                    Create <span className="text-emerald-500">Product</span>
                  </>
                )}
              </h2>
              <p className="text-neutral-500 text-xs">
                Define new items and their material requirements
              </p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl input-field text-sm"
                    placeholder="e.g., Office Chair Pro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Price ($)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-xl input-field text-sm"
                    placeholder="0.00"
                    value={formatCurrencyFromDigits(price)}
                    onChange={(e) =>
                      setPrice(currencyDigitsOnly(e.target.value))
                    }
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl input-field text-sm"
                    placeholder="Brief product overview..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl input-field text-sm"
                    placeholder="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  onClick={() => setCompositionOpen((v) => !v)}
                  disabled={materialsQuery.isLoading}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="lucide:layers"
                      className="text-emerald-500 text-xl"
                    />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      Link Raw Materials (Composition)
                    </span>
                  </div>
                  <Icon
                    icon="lucide:chevron-down"
                    className={
                      compositionOpen
                        ? "text-neutral-500 transition-transform duration-300 rotate-180"
                        : "text-neutral-500 transition-transform duration-300"
                    }
                  />
                </button>

                {compositionOpen ? (
                  <div className="space-y-4 p-4 border border-white/5 rounded-xl bg-[#0d0d0d]">
                    <p className="text-xs text-neutral-500 mb-4 italic">
                      Select available materials and specify quantity per
                      product unit.
                    </p>

                    <div className="relative">
                      <Icon
                        icon="lucide:search"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                      />
                      <input
                        type="text"
                        className="w-full pl-9 pr-3 py-2 rounded-xl input-field text-sm"
                        placeholder="Search raw materials..."
                        value={compositionSearch}
                        onChange={(e) => setCompositionSearch(e.target.value)}
                      />
                    </div>

                    {materialsQuery.isLoading ? (
                      <div className="space-y-2">
                        <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                        <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                        <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                      </div>
                    ) : materialsQuery.isError ? (
                      <div className="text-xs text-red-400">
                        Failed to load raw materials.
                      </div>
                    ) : (
                      <div className="max-h-[52vh] overflow-y-auto scrollbar-app rounded-xl border border-white/5 p-2 pr-1">
                        <div className="space-y-2">
                          {compositionFilteredMaterials.map(
                            (m: RawMaterial) => {
                              const qtyRaw =
                                compositionQtyByMaterialId[m.id] ?? ""
                              const qty = clampInt(qtyRaw)
                              const isSelected = qty != null && qty > 0

                              return (
                                <div
                                  key={m.id}
                                  className={[
                                    "flex items-center justify-between p-3 rounded-lg border group transition-colors",
                                    isSelected
                                      ? "bg-emerald-500/5 border-emerald-500/20"
                                      : "bg-white/[0.03] border-white/5",
                                  ].join(" ")}
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon
                                      icon="lucide:circle"
                                      className={
                                        isSelected
                                          ? "text-[10px] text-emerald-500"
                                          : "text-[10px] text-emerald-500/40 group-hover:text-emerald-500"
                                      }
                                    />
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {m.name}
                                      </p>
                                      <p className="text-[10px] text-neutral-500">
                                        Available: {m.stockQuantity} {m.unit}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                                      Qty:
                                    </span>
                                    <input
                                      type="number"
                                      className={[
                                        "w-20 px-3 py-1.5 rounded-lg bg-black/40 border text-xs text-white outline-none",
                                        isSelected
                                          ? "border-emerald-500/40 focus:border-emerald-500"
                                          : "border-white/10 focus:border-emerald-500",
                                      ].join(" ")}
                                      placeholder="0"
                                      value={qtyRaw}
                                      onChange={(e) =>
                                        setCompositionQtyByMaterialId(
                                          (prev) => ({
                                            ...prev,
                                            [m.id]: e.target.value,
                                          }),
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              )
                            },
                          )}

                          {compositionFilteredMaterials.length === 0 ? (
                            <div className="py-8 text-center text-xs text-neutral-500">
                              No raw materials match your search.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  <Icon icon="lucide:save" className="text-xl" />
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Update Product"
                      : "Register Product"}
                </button>

                {editing ? (
                  <button
                    type="button"
                    className="w-full py-3 px-4 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                    disabled={saving}
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-card p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Final <span className="text-neutral-500">Goods</span>
              </h2>
              <p className="text-neutral-500 text-xs">
                Browse and manage your registered product catalog
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Icon
                  icon="lucide:search"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl input-field text-sm"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                />
              </div>
              <button
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium text-neutral-400 disabled:opacity-60"
                onClick={() => listQuery.refetch()}
                disabled={listQuery.isFetching}
                aria-label="Refresh products"
              >
                <Icon icon="lucide:rotate-cw" className="text-lg" />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-white/[0.02] border-b border-white/5 text-neutral-500 uppercase text-[10px] font-bold tracking-[0.15em]">
              <div className="col-span-5">Product Information</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-3">Current Stock</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {listQuery.isLoading ? (
                <div className="px-8 py-10 space-y-3">
                  <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                  <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                  <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                </div>
              ) : content.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5 mb-4">
                    <Icon
                      icon="lucide:package-search"
                      className="text-4xl text-neutral-600"
                    />
                  </div>
                  <h3 className="text-lg font-bold">No products found.</h3>
                  <p className="text-xs">
                    Start by creating your first manufacturing item above.
                  </p>
                </div>
              ) : (
                content.map((p) => {
                  const percent = Math.max(
                    0,
                    Math.min(100, (p.stockQuantity / maxStockInPage) * 100),
                  )
                  const compositionText = formatComposition(p.rawMaterials)
                  const hasComposition = (p.rawMaterials ?? []).length > 0
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 hover:bg-white/[0.02] transition-colors group items-center"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon
                              icon="lucide:box"
                              className="text-emerald-500 text-xl"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-neutral-100">
                              {p.name}
                            </p>
                            <div className="text-xs text-neutral-500">
                              {compositionText}
                              {!hasComposition ? (
                                <button
                                  type="button"
                                  className="ml-2 text-[10px] text-emerald-500 font-bold uppercase hover:text-emerald-400"
                                  onClick={() => openLinkModal(p)}
                                  disabled={materialsQuery.isLoading}
                                >
                                  Link
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-2 flex items-center">
                        <span className="md:hidden text-[10px] text-neutral-500 font-bold uppercase mr-2">
                          Price:
                        </span>
                        <span className="text-sm font-semibold text-emerald-500">
                          ${Number(p.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-3 flex items-center gap-3">
                        <span className="md:hidden text-[10px] text-neutral-500 font-bold uppercase mr-2">
                          Stock:
                        </span>
                        <div className="hidden sm:block w-24 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">
                          {p.stockQuantity}{" "}
                          <span className="text-[10px] text-neutral-600 font-medium uppercase">
                            Units
                          </span>
                        </span>
                      </div>
                      <div className="col-span-12 md:col-span-2 text-right space-x-2">
                        <button
                          className="inline-flex items-center justify-center p-2.5 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-60"
                          onClick={() => {
                            startEdit(p)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                          disabled={isBusy}
                          aria-label="Edit product"
                        >
                          <Icon icon="lucide:settings-2" />
                        </button>
                        <button
                          className="inline-flex items-center justify-center p-2.5 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-60"
                          onClick={() => deleteMutation.mutate(p.id)}
                          disabled={isBusy}
                          aria-label="Delete product"
                        >
                          <Icon icon="lucide:trash-2" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Viewing {content.length}{" "}
                <span className="lowercase text-neutral-600 px-1">of</span>{" "}
                {listQuery.data?.totalElements ?? content.length} Product
                {(listQuery.data?.totalElements ?? content.length) === 1
                  ? ""
                  : "s"}
              </p>
              <div className="flex gap-2">
                <button
                  className={
                    page === 0 || listQuery.isFetching
                      ? "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg text-neutral-700 cursor-not-allowed"
                      : "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                  }
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || listQuery.isFetching}
                >
                  Prev
                </button>
                <button
                  className={
                    (listQuery.data?.last ?? true)
                      ? "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg text-neutral-700 cursor-not-allowed"
                      : "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                  }
                  onClick={() => setPage((p) => p + 1)}
                  disabled={listQuery.data?.last ?? true}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {compositionModal.open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target)
              setCompositionModal({ open: false })
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-card w-full max-w-3xl rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  Link <span className="text-emerald-500">Raw Materials</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Product:{" "}
                  <span className="text-neutral-200 font-semibold">
                    {compositionModal.product.name}
                  </span>
                </p>
              </div>
              <button
                className="p-2 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setCompositionModal({ open: false })}
                aria-label="Close"
              >
                <Icon icon="lucide:x" className="text-lg" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Icon
                    icon="lucide:search"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl input-field text-sm"
                    placeholder="Search raw materials..."
                    value={compositionModal.search}
                    onChange={(e) =>
                      setCompositionModal((prev) =>
                        prev.open ? { ...prev, search: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <button
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-neutral-400 disabled:opacity-60"
                  onClick={() => materialsQuery.refetch()}
                  disabled={materialsQuery.isFetching}
                  aria-label="Refresh raw materials"
                >
                  <Icon icon="lucide:rotate-cw" className="text-lg" />
                </button>
              </div>

              {materialsQuery.isLoading ? (
                <div className="space-y-2">
                  <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                  <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                  <div className="h-12 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                </div>
              ) : materialsQuery.isError ? (
                <div className="text-sm text-red-400">
                  Failed to load raw materials.
                </div>
              ) : (
                <div className="max-h-[52vh] overflow-auto scrollbar-app rounded-xl border border-white/5 pr-1">
                  <div className="divide-y divide-white/[0.03]">
                    {modalFilteredMaterials.map((m) => {
                      const qtyRaw =
                        compositionModal.qtyByMaterialId[m.id] ?? ""
                      const qty = clampInt(qtyRaw)
                      const isSelected = qty != null && qty > 0

                      return (
                        <div
                          key={m.id}
                          className={[
                            "flex items-center justify-between gap-4 px-4 py-3 transition-colors",
                            isSelected
                              ? "bg-emerald-500/5"
                              : "bg-white/[0.01] hover:bg-white/[0.02]",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-100 truncate">
                              {m.name}
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
                              Available: {m.stockQuantity} {m.unit}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase">
                              Qty
                            </span>
                            <input
                              type="number"
                              className={[
                                "w-24 px-3 py-2 rounded-lg bg-black/40 border text-xs text-white outline-none",
                                isSelected
                                  ? "border-emerald-500/40 focus:border-emerald-500"
                                  : "border-white/10 focus:border-emerald-500",
                              ].join(" ")}
                              placeholder="0"
                              value={qtyRaw}
                              onChange={(e) =>
                                setCompositionModal((prev) =>
                                  prev.open
                                    ? {
                                        ...prev,
                                        qtyByMaterialId: {
                                          ...prev.qtyByMaterialId,
                                          [m.id]: e.target.value,
                                        },
                                      }
                                    : prev,
                                )
                              }
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <p className="text-xs text-neutral-500">
                Enter a quantity (≥ 1) to link.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-3 rounded-xl border border-white/5 text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setCompositionModal({ open: false })}
                  disabled={linkMaterialsMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all disabled:opacity-60"
                  onClick={submitLinkModal}
                  disabled={linkMaterialsMutation.isPending}
                >
                  {linkMaterialsMutation.isPending
                    ? "Linking…"
                    : "Link Materials"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
