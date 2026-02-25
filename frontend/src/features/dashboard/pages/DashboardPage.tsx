import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { productService } from "@/services/productService"
import { rawMaterialService } from "@/services/rawMaterialService"

export default function DashboardPage() {
  const productsCount = useQuery({
    queryKey: ["products", "count"],
    queryFn: async () => {
      const page = await productService.list({ page: 0, size: 1 })
      return page.totalElements
    },
  })

  const materialsCount = useQuery({
    queryKey: ["raw-materials", "count"],
    queryFn: async () => {
      const page = await rawMaterialService.list({ page: 0, size: 1 })
      return page.totalElements
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Products">
          {productsCount.isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-3xl font-semibold">
              {productsCount.data ?? 0}
            </div>
          )}
          <div className="mt-1 text-sm text-slate-600">
            Tracked finished goods
          </div>
        </Card>

        <Card title="Raw Materials">
          {materialsCount.isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-3xl font-semibold">
              {materialsCount.data ?? 0}
            </div>
          )}
          <div className="mt-1 text-sm text-slate-600">
            Inventory inputs for production
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Next step">
          <div className="text-sm text-slate-700">
            Keep products and raw materials up to date, then open Production to
            see what can be manufactured from current stock.
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
