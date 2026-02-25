import { FormEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Skeleton } from "@/components/ui/Skeleton"
import { apiErrorMessage } from "@/services/errors"
import {
  productService,
  type Product,
  type ProductRequest,
} from "@/services/productService"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

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

  const queryKey = useMemo(
    () => ["products", { page, size, search: debouncedSearch }],
    [page, size, debouncedSearch],
  )

  const listQuery = useQuery({
    queryKey,
    queryFn: () => productService.list({ page, size, search: debouncedSearch }),
  })

  const createMutation = useMutation({
    mutationFn: (body: ProductRequest) => productService.create(body),
    onSuccess: async () => {
      toast.success("Product created", { id: "product-created" })
      await qc.invalidateQueries({ queryKey: ["products"] })
      setName("")
      setDescription("")
      setPrice("")
      setStockQuantity("")
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err) ?? "Create failed", {
        id: "product-create-failed",
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProductRequest }) =>
      productService.update(id, body),
    onSuccess: async () => {
      toast.success("Product updated", { id: "product-updated" })
      await qc.invalidateQueries({ queryKey: ["products"] })
      setEditing(null)
      setName("")
      setDescription("")
      setPrice("")
      setStockQuantity("")
    },
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

  const saving = createMutation.isPending || updateMutation.isPending

  function startEdit(p: Product) {
    setEditing(p)
    setName(p.name)
    setDescription(p.description ?? "")
    setPrice(String(p.price))
    setStockQuantity(String(p.stockQuantity))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const body: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
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
        <Card title={editing ? "Edit product" : "Create product"}>
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
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Products">
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
                    <th className="py-2">Price</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {content.map((p) => (
                    <tr key={p.id} className="align-top">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-slate-900">
                          {p.name}
                        </div>
                        {p.description ? (
                          <div className="text-slate-600">{p.description}</div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        {Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3 pr-3">{p.stockQuantity}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="secondary"
                            onClick={() => startEdit(p)}
                            disabled={saving}
                          >
                            Edit
                          </Button>
                          <Link
                            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                            to={`/products/${p.id}/composition`}
                          >
                            Composition
                          </Link>
                          <Button
                            variant="danger"
                            onClick={() => deleteMutation.mutate(p.id)}
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
                        colSpan={4}
                        className="py-6 text-center text-slate-600"
                      >
                        No products found.
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
