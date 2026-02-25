import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Button } from "@/components/ui/Button"
import { productionService } from "@/services/productionService"

export default function ProductionSuggestionsPage() {
  const suggestions = useQuery({
    queryKey: ["production", "suggestions"],
    queryFn: () => productionService.suggestions(),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card title="Production Suggestions">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Based on available raw materials.
          </div>
          <Button
            variant="secondary"
            onClick={() => suggestions.refetch()}
            disabled={suggestions.isFetching}
          >
            {suggestions.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        <div className="mt-4">
          {suggestions.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div>
              <div className="mb-3 text-sm">
                <span className="text-slate-600">Grand total: </span>
                <span className="font-semibold">
                  {Number(suggestions.data?.grandTotalValue ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2">Product</th>
                      <th className="py-2">Qty Possible</th>
                      <th className="py-2">Unit Price</th>
                      <th className="py-2">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <AnimatePresence initial={false}>
                      {(suggestions.data?.products ?? []).map((p) => (
                        <motion.tr
                          key={p.productId}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td className="py-3 pr-3">
                            <div className="font-medium text-slate-900">
                              {p.productName}
                            </div>
                          </td>
                          <td className="py-3 pr-3">{p.quantityPossible}</td>
                          <td className="py-3 pr-3">
                            {Number(p.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-3 pr-3">
                            {Number(p.totalValue).toFixed(2)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {(suggestions.data?.products ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-slate-600"
                        >
                          No suggestions available.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
