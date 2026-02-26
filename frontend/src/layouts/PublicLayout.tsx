import { Outlet, Navigate } from "react-router-dom"

import { useAppSelector } from "@/app/hooks"
import { selectAuth } from "@/features/auth/authSlice"

export function PublicLayout() {
  const auth = useAppSelector(selectAuth)

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
