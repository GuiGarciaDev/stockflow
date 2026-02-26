import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Icon } from "@iconify/react"

import { Skeleton } from "@/components/ui/Skeleton"
import { productionService } from "@/services/productionService"
import { productService } from "@/services/productService"

export default function ProductionSuggestionsPage() {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  )

  const suggestions = useQuery({
    queryKey: ["production", "suggestions"],
    queryFn: () => productionService.suggestions(),
  })

  const expandedProductQuery = useQuery({
    queryKey: ["product", expandedProductId ?? ""],
    queryFn: () => productService.get(expandedProductId ?? ""),
    enabled: Boolean(expandedProductId),
  })

  const products = suggestions.data?.products ?? []
  const grandTotal = useMemo(() => {
    return Number(suggestions.data?.grandTotalValue ?? 0)
  }, [suggestions.data?.grandTotalValue])

  const expandedProduct =
    expandedProductQuery.data?.id === expandedProductId
      ? expandedProductQuery.data
      : undefined
  const expandedMaterials = expandedProduct?.rawMaterials ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Production <span className="gradient-text">Suggestions</span>
          </h1>
          <p className="text-neutral-400 text-sm">
            Based on available raw materials and product compositions.
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
              Grand Total Value
            </p>
            {suggestions.isLoading ? (
              <Skeleton className="h-10 w-40 bg-white/10" />
            ) : (
              <div className="text-4xl font-bold tracking-tighter">
                ${grandTotal.toFixed(2)}
              </div>
            )}
          </div>

          <button
            type="button"
            className={[
              "p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium",
              suggestions.isFetching ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            onClick={() => suggestions.refetch()}
            disabled={suggestions.isFetching}
          >
            <Icon icon="lucide:rotate-cw" className="text-lg" />
            <span className="hidden sm:inline">
              {suggestions.isFetching ? "Refreshing" : "Refresh"}
            </span>
          </button>
        </div>

        <div className="glass-card rounded-[2rem] overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-white/[0.02] border-b border-white/5 text-neutral-500 uppercase text-[10px] font-bold tracking-[0.15em]">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Qty Possible</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Total Value</div>
            <div className="col-span-1 text-right">Details</div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {suggestions.isLoading ? (
              <div className="px-8 py-10 space-y-3">
                <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5 mb-4">
                  <Icon
                    icon="lucide:inbox"
                    className="text-4xl text-neutral-600"
                  />
                </div>
                <h3 className="text-lg font-bold">No suggestions available.</h3>
                <p className="text-xs">Add stock or review compositions.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {products.map((p) => {
                  const expanded = expandedProductId === p.productId
                  const showDetails = expanded
                  const loadingDetails =
                    expanded && expandedProductQuery.isLoading
                  const detailsError = expanded && expandedProductQuery.isError

                  return (
                    <motion.div
                      key={p.productId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-8 py-6"
                      layout
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Icon
                              icon="lucide:layers"
                              className="text-emerald-500 text-xl"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-neutral-100 truncate">
                              {p.productName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Ready-to-build quantity from current stock.
                            </p>
                          </div>
                        </div>

                        <div className="col-span-6 md:col-span-2 text-sm font-semibold">
                          <span className="md:hidden text-[10px] text-neutral-500 font-bold uppercase mr-2">
                            Qty:
                          </span>
                          {p.quantityPossible}
                        </div>

                        <div className="col-span-6 md:col-span-2 text-sm font-semibold text-emerald-500">
                          <span className="md:hidden text-[10px] text-neutral-500 font-bold uppercase mr-2">
                            Unit:
                          </span>
                          ${Number(p.unitPrice).toFixed(2)}
                        </div>

                        <div className="col-span-6 md:col-span-2 text-sm font-semibold">
                          <span className="md:hidden text-[10px] text-neutral-500 font-bold uppercase mr-2">
                            Total:
                          </span>
                          ${Number(p.totalValue).toFixed(2)}
                        </div>

                        <div className="col-span-6 md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() => {
                              setExpandedProductId((prev) =>
                                prev === p.productId ? null : p.productId,
                              )
                            }}
                            aria-label={
                              expanded ? "Collapse details" : "Expand details"
                            }
                          >
                            <Icon
                              icon="lucide:chevron-down"
                              className={
                                expanded
                                  ? "transition-transform duration-200 rotate-180"
                                  : "transition-transform duration-200"
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {showDetails ? (
                          <motion.div
                            key="details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 rounded-2xl border border-white/5 bg-neutral-950 p-5">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                                    Raw Materials
                                  </p>
                                  <p className="text-sm font-bold">
                                    Composition details
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className={[
                                    "p-2 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all",
                                    expandedProductQuery.isFetching
                                      ? "opacity-60 cursor-not-allowed"
                                      : "",
                                  ].join(" ")}
                                  onClick={() => expandedProductQuery.refetch()}
                                  disabled={expandedProductQuery.isFetching}
                                  aria-label="Refresh composition"
                                >
                                  <Icon
                                    icon="lucide:refresh-cw"
                                    className="text-base"
                                  />
                                </button>
                              </div>

                              <div className="mt-4">
                                {loadingDetails ? (
                                  <div className="space-y-2">
                                    <Skeleton className="h-10 w-full bg-white/10" />
                                    <Skeleton className="h-10 w-full bg-white/10" />
                                    <Skeleton className="h-10 w-full bg-white/10" />
                                  </div>
                                ) : detailsError ? (
                                  <div className="text-sm text-red-400">
                                    Failed to load composition.
                                  </div>
                                ) : expandedMaterials.length === 0 ? (
                                  <div className="text-sm text-neutral-400">
                                    This product has no raw materials linked.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {expandedMaterials.map((rm) => (
                                      <div
                                        key={rm.id}
                                        className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-white/5 bg-neutral-900"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-neutral-100 truncate">
                                            {rm.rawMaterialName}
                                          </p>
                                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                                            Per unit
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-bold text-emerald-500">
                                            {rm.quantityNeeded}
                                          </p>
                                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                                            qty
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
