import { FormEvent, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import toast from "react-hot-toast"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"
import { login } from "@/features/auth/authThunks"

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const from = useMemo(() => {
    const state = location.state as any
    return state?.from ?? "/dashboard"
  }, [location.state])

  const disabled = auth.loading

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await dispatch(
      login({
        email: email.trim(),
        password,
      }),
    )
      .unwrap()
      .then(() => navigate(from, { replace: true }))
      .catch(() => undefined)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="hidden md:flex w-1/2 relative bg-[#050505] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full"></div>

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-lg space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Icon icon="lucide:trending-up" />
              <span>Market Insights 2.0</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              Precision-engineered
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                portfolio growth.
              </span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-md">
              Monitor assets, execute trades, and scale your wealth with our
              institutional-grade terminal.
            </p>
          </div>

          <div className="relative p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md shadow-2xl">
            <div className="flex items-end gap-3 h-48 mb-6">
              <div
                className="w-full bg-emerald-500/20 rounded-t-lg"
                style={{ height: "40%" }}
              ></div>
              <div
                className="w-full bg-emerald-500/30 rounded-t-lg"
                style={{ height: "65%" }}
              ></div>
              <div
                className="w-full bg-emerald-500/40 rounded-t-lg"
                style={{ height: "50%" }}
              ></div>
              <div
                className="w-full bg-emerald-500/60 rounded-t-lg"
                style={{ height: "85%" }}
              ></div>
              <div
                className="w-full bg-emerald-500/80 rounded-t-lg"
                style={{ height: "70%" }}
              ></div>
              <div
                className="w-full bg-emerald-400 rounded-t-lg"
                style={{ height: "100%" }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-neutral-500 text-xs uppercase font-semibold">
                  Total Equity
                </p>
                <p className="text-xl font-bold mt-1">$1,284,092.40</p>
                <p className="text-emerald-400 text-xs mt-1 font-medium">
                  +12.4% this month
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-neutral-500 text-xs uppercase font-semibold">
                  Open Positions
                </p>
                <p className="text-xl font-bold mt-1">24 Assets</p>
                <p className="text-neutral-400 text-xs mt-1 font-medium">
                  Diversified Portfolio
                </p>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full"></div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center">
                <Icon
                  icon="ph:user-circle-fill"
                  className="text-neutral-500 text-2xl"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-black bg-neutral-700 flex items-center justify-center">
                <Icon
                  icon="ph:user-circle-fill"
                  className="text-neutral-400 text-2xl"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-black bg-neutral-600 flex items-center justify-center">
                <Icon
                  icon="ph:user-circle-fill"
                  className="text-neutral-300 text-2xl"
                />
              </div>
            </div>
            <p className="text-sm text-neutral-400">
              Joined by <span className="text-white font-semibold">10k+</span>{" "}
              active traders this week
            </p>
          </div>
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mb-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Icon
                  icon="lucide:layout-dashboard"
                  className="text-white text-xl"
                />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">
                StockFlow<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-neutral-400">
              Please enter your details to access your terminal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-300"
              >
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-emerald-500 transition-colors">
                  <Icon icon="lucide:mail" className="text-xl" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={disabled}
                  className={[
                    "block w-full pl-12 pr-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none placeholder-neutral-600 text-white",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                  placeholder="alex@stockflow.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-300"
                >
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-emerald-500 transition-colors">
                  <Icon icon="lucide:lock" className="text-xl" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={disabled}
                  className={[
                    "block w-full pl-12 pr-4 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none placeholder-neutral-600 text-white",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={disabled}
              className={[
                "w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98] active:brightness-90",
                disabled ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {disabled ? "Signing in…" : "Sign In to Terminal"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f0f] px-4 text-neutral-500 font-medium tracking-widest">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                aria-disabled="true"
                onClick={() =>
                  toast("Work in progress: Google login isn’t available yet.")
                }
                className="w-full inline-flex justify-center items-center gap-3 py-3.5 px-4 border border-neutral-800 rounded-2xl bg-neutral-900/50 text-sm font-semibold text-neutral-200 opacity-60 cursor-not-allowed"
              >
                <Icon icon="logos:google-icon" className="text-lg" />
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-white hover:text-emerald-400 transition-colors"
            >
              Create an account
            </Link>
          </p>

          <footer className="pt-8 flex justify-center gap-6 text-xs text-neutral-600 border-t border-neutral-900/50">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-neutral-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-neutral-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-neutral-400 transition-colors"
            >
              System Status
            </a>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
