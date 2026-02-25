import { FormEvent, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Skeleton } from "@/components/ui/Skeleton"
import { apiErrorMessage } from "@/services/errors"
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
    setPrice(String(m.price))
    setStockQuantity(String(m.stockQuantity))
    setUnit(m.unit)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const body: RawMaterialRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card title={editing ? "Edit raw material" : "Create raw material"}>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
            <Input
              label="Price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={saving}
              required
            />
            <Input
              label="Stock Quantity"
              inputMode="numeric"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              disabled={saving}
              required
            />
            <Input
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={saving}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="secondary"
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
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Raw Materials">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="pb-1">
              <Button
                variant="secondary"
                onClick={() => listQuery.refetch()}
                disabled={listQuery.isFetching}
              >
                {listQuery.isFetching ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {listQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Unit</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {content.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-slate-900">
                          {m.name}
                        </div>
                        {m.description ? (
                          <div className="text-slate-600">{m.description}</div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">{m.unit}</td>
                      <td className="py-3 pr-3">
                        {Number(m.price).toFixed(2)}
                      </td>
                      <td className="py-3 pr-3">{m.stockQuantity}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="secondary"
                            onClick={() => startEdit(m)}
                            disabled={saving}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => deleteMutation.mutate(m.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {content.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-slate-600"
                      >
                        No raw materials found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">
              Page {(listQuery.data?.page ?? 0) + 1} of{" "}
              {listQuery.data?.totalPages ?? 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || listQuery.isFetching}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={listQuery.data?.last ?? true}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
