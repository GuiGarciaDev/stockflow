import React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"
import { FullPageLoader } from "@/components/FullPageLoader"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const auth = useAppSelector(selectAuth)

  if (auth.loading) {
    return <FullPageLoader label="Checking session…" />
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
