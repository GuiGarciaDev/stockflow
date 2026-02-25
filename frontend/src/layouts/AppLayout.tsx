import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"
import { logout } from "@/features/auth/authThunks"
import { Button } from "@/components/ui/Button"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-md px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ")

export function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector(selectAuth)

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-start gap-6">
          <aside className="w-56 shrink-0">
            <div className="rounded-xl bg-white p-4 border border-slate-200">
              <div className="mb-4">
                <div className="text-sm text-slate-500">Fabrika360</div>
                <div className="text-base font-semibold">
                  Production Planner
                </div>
              </div>
              <nav className="space-y-1">
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/products" className={navLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/materials" className={navLinkClass}>
                  Raw Materials
                </NavLink>
                <NavLink to="/production" className={navLinkClass}>
                  Production
                </NavLink>
              </nav>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500">Signed in as</div>
                <div className="text-sm font-medium truncate">
                  {auth.user?.email}
                </div>
                <div className="text-xs text-slate-500">
                  Role: {auth.user?.role}
                </div>
                <Button
                  className="mt-3 w-full"
                  variant="secondary"
                  onClick={async () => {
                    await dispatch(logout())
                      .unwrap()
                      .catch(() => undefined)
                    navigate("/login", { replace: true })
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
