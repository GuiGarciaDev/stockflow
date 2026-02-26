import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"

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
      <div className="space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Production <span className="gradient-text">Overview</span>
          </h1>
          <p className="text-neutral-400 text-sm">
            Track your manufacturing progress and inventory levels in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-[2rem] glow-on-hover transition-all relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-2">
                <Icon
                  icon="lucide:package"
                  className="text-emerald-500 text-2xl"
                />
              </div>
              <div>
                <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                  Products
                </h3>
                <div className="flex items-baseline gap-2">
                  {productsCount.isLoading ? (
                    <Skeleton className="h-12 w-20 bg-white/10" />
                  ) : (
                    <span className="text-5xl font-bold tracking-tighter">
                      {productsCount.data ?? 0}
                    </span>
                  )}
                  <span className="text-neutral-500 text-sm font-medium">
                    items
                  </span>
                </div>
                <p className="text-neutral-500 text-sm mt-2">
                  Tracked finished goods in inventory
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] glow-on-hover transition-all relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-2">
                <Icon
                  icon="lucide:container"
                  className="text-emerald-500 text-2xl"
                />
              </div>
              <div>
                <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                  Raw Materials
                </h3>
                <div className="flex items-baseline gap-2">
                  {materialsCount.isLoading ? (
                    <Skeleton className="h-12 w-20 bg-white/10" />
                  ) : (
                    <span className="text-5xl font-bold tracking-tighter">
                      {materialsCount.data ?? 0}
                    </span>
                  )}
                  <span className="text-neutral-500 text-sm font-medium">
                    SKUs
                  </span>
                </div>
                <p className="text-neutral-500 text-sm mt-2">
                  Inventory inputs ready for production
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <Icon icon="lucide:lightbulb" />
                Next Step
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to start production?
              </h2>
              <p className="text-neutral-400 leading-relaxed">
                Keep your product database and raw materials up to date to
                ensure accurate forecasting. Once your stock levels are
                synchronized, open the{" "}
                <span className="text-white font-medium">
                  Production Module
                </span>{" "}
                to see exactly what can be manufactured from current on-hand
                quantities.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/production"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Go to Production
                  <Icon icon="lucide:arrow-right" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="w-48 h-48 rounded-full border border-emerald-500/10 flex items-center justify-center bg-gradient-to-tr from-emerald-500/5 to-transparent">
                <Icon
                  icon="lucide:layers"
                  className="text-7xl text-emerald-500/20 animate-pulse"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 glass-card p-4 rounded-2xl border-emerald-500/30 scale-75 animate-bounce">
                <Icon
                  icon="lucide:check-circle-2"
                  className="text-emerald-500 text-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                Recent Activity
              </h4>
              <button className="text-xs text-neutral-500 hover:text-emerald-400">
                View All
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-50">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5">
                <Icon
                  icon="lucide:inbox"
                  className="text-3xl text-neutral-600"
                />
              </div>
              <p className="text-neutral-500 text-sm">
                No recent production cycles recorded.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">
              System Health
            </h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-400">Database Latency</span>
                  <span className="text-emerald-400">24ms</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="w-[15%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-400">Inventory Sync</span>
                  <span className="text-emerald-400">100%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="w-[100%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mt-4">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">
                  Last Updated
                </p>
                <p className="text-sm font-semibold">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
