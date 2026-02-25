import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"
import { register } from "@/features/auth/authThunks"

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const disabled = auth.loading

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await dispatch(
      register({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    )
      .unwrap()
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() => undefined)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card title="Register">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
            required
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
            required
            minLength={6}
          />
          <Button className="w-full" type="submit" disabled={disabled}>
            {disabled ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="text-slate-900 font-medium hover:underline"
            to="/login"
          >
            Login
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
