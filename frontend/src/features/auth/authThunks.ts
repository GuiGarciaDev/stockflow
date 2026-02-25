import { createAsyncThunk } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

import { authService } from "@/services/authService"
import { apiErrorMessage } from "@/services/errors"
import { clearSession, setLoading, setSession } from "@/features/auth/authSlice"
import type { LoginRequest, RegisterRequest } from "@/features/auth/types"
import { refreshAccessTokenSingleFlight } from "@/services/api"

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async ({ silent }: { silent: boolean }, { dispatch }) => {
    dispatch(setLoading(true))
    try {
      const { accessToken } = await authService.refresh()
      const user = await authService.me(accessToken)
      dispatch(setSession({ user, accessToken }))
    } catch (err) {
      dispatch(clearSession())
      if (!silent) {
        toast.error(apiErrorMessage(err) ?? "Session refresh failed", {
          id: "refresh-failed",
        })
      }
    }
  },
)

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_: void, { dispatch }) => {
    try {
      await refreshAccessTokenSingleFlight()
    } catch (err) {
      dispatch(clearSession())
      toast.error(apiErrorMessage(err) ?? "Session refresh failed", {
        id: "refresh-failed",
      })
      if (window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
      throw err
    }
  },
)

export const login = createAsyncThunk(
  "auth/login",
  async (body: LoginRequest, { dispatch }) => {
    dispatch(setLoading(true))
    try {
      const result = await authService.login(body)
      dispatch(
        setSession({ user: result.user, accessToken: result.accessToken }),
      )
      toast.success("Welcome back!", { id: "login-success" })
    } catch (err) {
      dispatch(clearSession())
      toast.error(apiErrorMessage(err) ?? "Login failed", {
        id: "login-failed",
      })
      throw err
    }
  },
)

export const register = createAsyncThunk(
  "auth/register",
  async (body: RegisterRequest, { dispatch }) => {
    dispatch(setLoading(true))
    try {
      const result = await authService.register(body)
      dispatch(
        setSession({ user: result.user, accessToken: result.accessToken }),
      )
      toast.success("Account created", { id: "register-success" })
    } catch (err) {
      dispatch(clearSession())
      toast.error(apiErrorMessage(err) ?? "Registration failed", {
        id: "register-failed",
      })
      throw err
    }
  },
)

export const logout = createAsyncThunk(
  "auth/logout",
  async (_: void, { dispatch }) => {
    try {
      await authService.logout()
    } catch {
      // Intentionally ignore network/logout errors; still clear local session.
    } finally {
      dispatch(clearSession())
    }
  },
)
