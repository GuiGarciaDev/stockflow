import { FormEvent, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { Skeleton } from "@/components/ui/Skeleton"
import { DropdownSelect } from "@/components/DropdownSelect"
import { apiErrorMessage } from "@/services/errors"
import {
  currencyDigitsOnly,
  digitsFromNumber,
  formatCurrencyFromDigits,
  parseCurrencyFromDigits,
} from "@/lib/currency"
import {
  rawMaterialService,
  type RawMaterial,
  type RawMaterialRequest,
} from "@/services/rawMaterialService"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

export default function RawMaterialsPage() {
  const qc = useQueryClient()

  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)

  const [editing, setEditing] = useState<RawMaterial | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [unit, setUnit] = useState("")

  const queryKey = useMemo(
    () => ["raw-materials", { page, size, search: debouncedSearch }],
    [page, size, debouncedSearch],
  )

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      rawMaterialService.list({ page, size, search: debouncedSearch }),
  })

  const createMutation = useMutation({
    mutationFn: (body: RawMaterialRequest) => rawMaterialService.create(body),
    onSuccess: async () => {
      toast.success("Raw material created", { id: "rm-created" })
      await qc.invalidateQueries({ queryKey: ["raw-materials"] })
      setName("")
      setDescription("")
      setPrice("")
      setStockQuantity("")
      setUnit("")
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Create failed", {
        id: "rm-create-failed",
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RawMaterialRequest }) =>
      rawMaterialService.update(id, body),
    onSuccess: async () => {
      toast.success("Raw material updated", { id: "rm-updated" })
      await qc.invalidateQueries({ queryKey: ["raw-materials"] })
      setEditing(null)
      setName("")
      setDescription("")
      setPrice("")
      setStockQuantity("")
      setUnit("")
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Update failed", {
        id: "rm-update-failed",
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rawMaterialService.remove(id),
    onSuccess: async () => {
      toast.success("Raw material deleted", { id: "rm-deleted" })
      await qc.invalidateQueries({ queryKey: ["raw-materials"] })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Delete failed", {
        id: "rm-delete-failed",
      }),
  })

  const saving = createMutation.isPending || updateMutation.isPending

  function startEdit(m: RawMaterial) {
    setEditing(m)
    setName(m.name)
    setDescription(m.description ?? "")
    setPrice(digitsFromNumber(m.price))
    setStockQuantity(String(m.stockQuantity))
    setUnit(m.unit)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const parsedPrice = parseCurrencyFromDigits(price)

    const body: RawMaterialRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parsedPrice,
      stockQuantity: Number(stockQuantity),
      unit: unit.trim(),
    }

    if (!body.name) {
      toast.error("Raw material name is required", { id: "rm-name-required" })
      return
    }
    if (!Number.isFinite(body.price) || body.price <= 0) {
      toast.error("Price must be greater than 0", { id: "rm-price-invalid" })
      return
    }
    if (!Number.isInteger(body.stockQuantity) || body.stockQuantity < 0) {
      toast.error("Stock quantity must be 0 or more", {
        id: "rm-stock-invalid",
      })
      return
    }
    if (!body.unit) {
      toast.error("Unit is required", { id: "rm-unit-required" })
      return
    }

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, body })
    } else {
      await createMutation.mutateAsync(body)
    }
  }

  const content = listQuery.data?.content ?? []
  const totalElements = listQuery.data?.totalElements ?? content.length

  const maxStockOnPage = Math.max(
    1,
    ...content.map((m) =>
      Number.isFinite(m.stockQuantity) ? m.stockQuantity : 0,
    ),
  )

  const unitOptions = [
    { value: "und", label: "Unit (und)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "m", label: "Meter (m)" },
    { value: "l", label: "Litre (l)" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-10">
        <section>
          <div className="glass-card p-8 rounded-[2rem] space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {editing ? (
                    <>
                      Edit{" "}
                      <span className="text-emerald-500">Raw Material</span>
                    </>
                  ) : (
                    <>
                      Create{" "}
                      <span className="text-emerald-500">Raw Material</span>
                    </>
                  )}
                </h2>
                <p className="text-neutral-500 text-xs">
                  Add new items to your manufacturing inventory
                </p>
              </div>

              {editing ? (
                <button
                  type="button"
                  className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  disabled={saving}
                  onClick={() => {
                    setEditing(null)
                    setName("")
                    setDescription("")
                    setPrice("")
                    setStockQuantity("")
                    setUnit("")
                  }}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
              onSubmit={onSubmit}
            >
              <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl input-field text-sm"
                  placeholder="e.g., Industrial Screws"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Unit
                </label>
                <DropdownSelect
                  value={unit}
                  onChange={setUnit}
                  disabled={saving}
                  placeholder="Select unit..."
                  options={unitOptions}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Price ($)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl input-field text-sm"
                  placeholder="0.00"
                  value={formatCurrencyFromDigits(price)}
                  onChange={(e) => setPrice(currencyDigitsOnly(e.target.value))}
                  disabled={saving}
                  required
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl input-field text-sm"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="md:col-span-9 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl input-field text-sm"
                  placeholder="Short material specification details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={[
                    "w-full bg-emerald-500 text-black h-[46px] rounded-xl font-bold hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2",
                    saving ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <Icon icon="lucide:plus-circle" className="text-xl" />
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Update Material"
                      : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-card p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Inventory <span className="text-neutral-500">List</span>
              </h2>
              <p className="text-neutral-500 text-xs">
                Manage and monitor your input stock levels
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
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={[
                  "p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium",
                  listQuery.isFetching ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                onClick={() => listQuery.refetch()}
                disabled={listQuery.isFetching}
              >
                <Icon icon="lucide:rotate-cw" className="text-lg" />
                <span className="hidden sm:inline">
                  {listQuery.isFetching ? "Refreshing" : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {listQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full bg-white/10" />
              <Skeleton className="h-20 w-full bg-white/10" />
              <Skeleton className="h-20 w-full bg-white/10" />
            </div>
          ) : content.length === 0 ? (
            <div className="glass-card p-8 rounded-[2rem] text-center text-neutral-500">
              No raw materials found.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden lg:grid grid-cols-12 px-8 py-3 text-neutral-500 uppercase text-[10px] font-bold tracking-[0.15em]">
                <div className="col-span-4">Material Information</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-3">Stock Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {content.map((m) => {
                const stock = m.stockQuantity
                const pct = Math.max(
                  0,
                  Math.min(100, Math.round((stock / maxStockOnPage) * 100)),
                )

                const lowStock = pct < 20
                const accentBg = lowStock
                  ? "bg-orange-500/10"
                  : "bg-emerald-500/10"
                const accentText = lowStock
                  ? "text-orange-500"
                  : "text-emerald-500"
                const barColor = lowStock ? "bg-orange-500" : "bg-emerald-500"
                const stockText = lowStock
                  ? "text-orange-400"
                  : "text-neutral-300"

                return (
                  <div
                    key={m.id}
                    className="glass-card p-6 rounded-2xl hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-0">
                      <div className="col-span-4 flex items-center gap-4">
                        <div
                          className={[
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            accentBg,
                          ].join(" ")}
                        >
                          <Icon
                            icon={lowStock ? "lucide:layers" : "lucide:box"}
                            className={["text-xl", accentText].join(" ")}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-neutral-100">
                            {m.name}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {m.description ?? ""}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-400 border border-white/5 uppercase tracking-tighter">
                          {m.unit}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1 lg:hidden">
                            Price
                          </span>
                          <span className="text-sm font-bold text-emerald-500">
                            ${Number(m.price).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="flex flex-col pr-8">
                          <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1 lg:hidden">
                            Stock
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                              <div
                                className={[
                                  "h-full rounded-full",
                                  barColor,
                                ].join(" ")}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span
                              className={["text-sm font-bold", stockText].join(
                                " ",
                              )}
                            >
                              {m.stockQuantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-right flex justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                          onClick={() => startEdit(m)}
                          disabled={saving}
                          aria-label="Edit raw material"
                        >
                          <Icon icon="lucide:edit-3" />
                        </button>
                        <button
                          type="button"
                          className={[
                            "inline-flex items-center justify-center w-10 h-10 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all",
                            deleteMutation.isPending
                              ? "opacity-60 cursor-not-allowed"
                              : "",
                          ].join(" ")}
                          onClick={() => deleteMutation.mutate(m.id)}
                          disabled={deleteMutation.isPending}
                          aria-label="Delete raw material"
                        >
                          <Icon icon="lucide:trash-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="p-6 flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
                  Showing {content.length}{" "}
                  <span className="lowercase text-neutral-600 px-1">
                    materials
                  </span>
                  <span className="text-neutral-700">/</span> {totalElements}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || listQuery.isFetching}
                    className={[
                      "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg transition-all",
                      page === 0 || listQuery.isFetching
                        ? "text-neutral-600 cursor-not-allowed"
                        : "text-neutral-400 hover:text-white hover:bg-white/5",
                    ].join(" ")}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={listQuery.data?.last ?? true}
                    className={[
                      "px-4 py-2 text-xs font-bold border border-white/5 rounded-lg transition-all",
                      listQuery.data?.last
                        ? "text-neutral-600 cursor-not-allowed"
                        : "text-neutral-400 hover:text-white hover:bg-white/5",
                    ].join(" ")}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}
