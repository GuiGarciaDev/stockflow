import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"
import { logout } from "@/features/auth/authThunks"
import { queryClient } from "@/lib/queryClient"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "sidebar-link",
    isActive ? "active" : "",
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
  ].join(" ")

function getPageLabel(pathname: string) {
  if (pathname.startsWith("/products")) return "Product Management"
  if (pathname.startsWith("/materials")) return "Raw Materials"
  if (pathname.startsWith("/production")) return "Production"
  return "Dashboard"
}

export function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAppSelector(selectAuth)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  const notifications: Array<{ id: string; title: string; body?: string }> = []
  const hasNotifications = notifications.length > 0

  const pageLabel = getPageLabel(location.pathname)
  const isMaterials = location.pathname.startsWith("/materials")
  const isProducts = location.pathname.startsWith("/products")

  const userInitial = (auth.user?.name ?? auth.user?.email ?? "")
    .trim()
    .slice(0, 1)
    .toUpperCase()

  useEffect(() => {
    if (!notificationsOpen) return

    function onPointerDown(e: PointerEvent) {
      const root = notificationsRef.current
      if (!root) return
      if (root.contains(e.target as Node)) return
      setNotificationsOpen(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setNotificationsOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [notificationsOpen])

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <aside className="w-72 border-r border-white/5 flex flex-col fixed inset-y-0 z-50 bg-[#070707]">
        <div className="p-8">
          <NavLink to="/dashboard" className="flex flex-col gap-1 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Icon icon="lucide:factory" className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold tracking-tighter">
                StockFlow<span className="text-emerald-500">.</span>
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mt-1">
              Production Planner
            </span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <Icon icon="lucide:layout-dashboard" className="text-xl" />
            Dashboard
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            <Icon icon="lucide:package" className="text-xl" />
            Products
          </NavLink>
          <NavLink to="/materials" className={navLinkClass}>
            <Icon icon="lucide:container" className="text-xl" />
            Raw Materials
          </NavLink>
          <NavLink to="/production" className={navLinkClass}>
            <Icon icon="lucide:activity" className="text-xl" />
            Production
          </NavLink>
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
              <Icon icon="ph:user-fill" className="text-neutral-400 text-xl" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-neutral-200">
                {auth.user?.email ?? ""}
              </p>
              <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                Role: {auth.user?.role}
              </p>
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            onClick={async () => {
              await dispatch(logout())
                .unwrap()
                .catch(() => undefined)
              navigate("/login", { replace: true })
            }}
          >
            <Icon icon="lucide:log-out" className="text-base" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">
              Planner
            </span>
            <Icon icon="lucide:chevron-right" className="text-xs" />
            <span
              className={
                isMaterials || isProducts
                  ? "text-white font-medium uppercase tracking-widest text-[10px]"
                  : "text-white font-medium"
              }
            >
              {pageLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isMaterials || isProducts ? (
              <>
                <button
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                  onClick={async () => {
                    await queryClient.invalidateQueries({
                      queryKey: [isProducts ? "products" : "raw-materials"],
                    })
                  }}
                  aria-label={
                    isProducts ? "Sync products" : "Sync raw materials"
                  }
                >
                  <Icon icon="lucide:refresh-cw" className="text-lg" />
                </button>
                <div className="h-6 w-[1px] bg-white/10"></div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs border border-emerald-500/20">
                  {userInitial || "?"}
                </div>
              </>
            ) : (
              <>
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
                    onClick={() => setNotificationsOpen((v) => !v)}
                    aria-label="Open notifications"
                    aria-expanded={notificationsOpen}
                  >
                    <Icon
                      icon="lucide:bell"
                      className="text-xl text-neutral-400 hover:text-white transition-colors"
                      style={notificationsOpen ? { color: "#10b981" } : {}}
                    />
                    {hasNotifications ? (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></span>
                    ) : null}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen ? (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-white/10 overflow-hidden bg-neutral-900 shadow-2xl z-[60]"
                        role="menu"
                        aria-label="Notifications"
                      >
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold">
                              Notifications
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                              Updates
                            </div>
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() => setNotificationsOpen(false)}
                            aria-label="Close notifications"
                          >
                            <Icon icon="lucide:x" className="text-base" />
                          </button>
                        </div>

                        <div className="max-h-80 overflow-auto">
                          {hasNotifications ? (
                            <div className="py-1">
                              {notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className="px-5 py-3 hover:bg-white/[0.03] transition-colors"
                                >
                                  <div className="text-sm font-semibold text-neutral-100">
                                    {n.title}
                                  </div>
                                  {n.body ? (
                                    <div className="text-xs text-neutral-500 mt-0.5">
                                      {n.body}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-center p-5">
                              <p className="text-sm text-neutral-200 font-semibold">
                                No notifications yet
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <div className="h-8 w-[1px] bg-white/5 mx-2"></div>
                <button className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
                  <Icon icon="lucide:plus" className="text-lg" />
                  New Batch
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
