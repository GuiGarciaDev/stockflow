import { FormEvent, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Skeleton } from "@/components/ui/Skeleton"
import { DropdownSelect } from "@/components/DropdownSelect"
import { apiErrorMessage } from "@/services/errors"
import { productService } from "@/services/productService"
import { rawMaterialService } from "@/services/rawMaterialService"

export default function ProductCompositionPage() {
  const { id } = useParams()
  const productId = id ?? ""
  const qc = useQueryClient()

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.get(productId),
    enabled: Boolean(productId),
  })

  const materialsQuery = useQuery({
    queryKey: ["raw-materials", "all"],
    queryFn: () => rawMaterialService.listAll(),
  })

  const [rawMaterialId, setRawMaterialId] = useState("")
  const [quantityNeeded, setQuantityNeeded] = useState("1")

  const addMutation = useMutation({
    mutationFn: () =>
      productService.addRawMaterial(productId, {
        rawMaterialId,
        quantityNeeded: Number(quantityNeeded),
      }),
    onSuccess: async () => {
      toast.success("Added to composition", { id: "assoc-added" })
      await qc.invalidateQueries({ queryKey: ["product", productId] })
      setQuantityNeeded("1")
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Add failed", {
        id: "assoc-add-failed",
      }),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: {
      associationId: string
      rawMaterialId: string
      quantityNeeded: number
    }) =>
      productService.updateRawMaterial(productId, vars.associationId, {
        rawMaterialId: vars.rawMaterialId,
        quantityNeeded: vars.quantityNeeded,
      }),
    onSuccess: async () => {
      toast.success("Updated quantity", { id: "assoc-updated" })
      await qc.invalidateQueries({ queryKey: ["product", productId] })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Update failed", {
        id: "assoc-update-failed",
      }),
  })

  const removeMutation = useMutation({
    mutationFn: (associationId: string) =>
      productService.removeRawMaterial(productId, associationId),
    onSuccess: async () => {
      toast.success("Removed", { id: "assoc-removed" })
      await qc.invalidateQueries({ queryKey: ["product", productId] })
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Remove failed", {
        id: "assoc-remove-failed",
      }),
  })

  const product = productQuery.data

  const availableOptions = useMemo(() => {
    const materials = materialsQuery.data ?? []
    return materials
  }, [materialsQuery.data])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!rawMaterialId) {
      toast.error("Pick a raw material", { id: "assoc-material-required" })
      return
    }
    const qty = Number(quantityNeeded)
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error("Quantity must be at least 1", { id: "assoc-qty-invalid" })
      return
    }
    await addMutation.mutateAsync()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4">
        <Link className="text-sm text-slate-700 hover:underline" to="/products">
          ← Back to Products
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card title="Add raw material">
          {materialsQuery.isLoading || productQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-28" />
            </div>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Raw Material
                </label>
                <div className="mt-2">
                  <DropdownSelect
                    value={rawMaterialId}
                    onChange={setRawMaterialId}
                    disabled={addMutation.isPending}
                    placeholder="Select..."
                    options={availableOptions.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                  />
                </div>
              </div>
              <Input
                label="Quantity needed"
                inputMode="numeric"
                value={quantityNeeded}
                onChange={(e) => setQuantityNeeded(e.target.value)}
                disabled={addMutation.isPending}
                required
              />
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add"}
              </Button>
            </form>
          )}
        </Card>

        <Card title={product ? `Composition — ${product.name}` : "Composition"}>
          {productQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : productQuery.isError ? (
            <div className="text-sm text-red-700">Failed to load product.</div>
          ) : (
            <div className="space-y-3">
              {(product?.rawMaterials ?? []).map((assoc) => (
                <div
                  key={assoc.id}
                  className="flex flex-wrap items-end justify-between gap-3 border border-slate-200 rounded-lg p-3"
                >
                  <div className="min-w-[220px]">
                    <div className="text-sm font-medium">
                      {assoc.rawMaterialName}
                    </div>
                    <div className="text-xs text-slate-500">
                      Association ID: {assoc.id}
                    </div>
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-medium text-slate-700">
                      Qty
                    </label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                      inputMode="numeric"
                      defaultValue={String(assoc.quantityNeeded)}
                      onBlur={(e) => {
                        const next = Number(e.target.value)
                        if (!Number.isInteger(next) || next < 1) return
                        if (next === assoc.quantityNeeded) return
                        updateMutation.mutate({
                          associationId: assoc.id,
                          rawMaterialId: assoc.rawMaterialId,
                          quantityNeeded: next,
                        })
                      }}
                    />
                    <div className="mt-1 text-xs text-slate-500">
                      Blur to save
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="danger"
                      onClick={() => removeMutation.mutate(assoc.id)}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {(product?.rawMaterials ?? []).length === 0 ? (
                <div className="text-sm text-slate-600">
                  No raw materials added yet.
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}
