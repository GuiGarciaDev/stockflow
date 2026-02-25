import { FormEvent, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card title="Login">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
            required
          />
          <Button className="w-full" type="submit" disabled={disabled}>
            {disabled ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link
            className="text-slate-900 font-medium hover:underline"
            to="/register"
          >
            Register
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
