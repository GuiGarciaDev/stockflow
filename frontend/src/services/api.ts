import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios"
import toast from "react-hot-toast"

import { env } from "@/services/env"
import { store } from "@/app/store"
import { clearSession, setAccessToken } from "@/features/auth/authSlice"
import { apiErrorMessage } from "@/services/errors"

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const baseConfig = {
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
} as const

export const publicApi: AxiosInstance = axios.create(baseConfig)

export const api: AxiosInstance = axios.create({
  ...baseConfig,
  headers: {
    ...baseConfig.headers,
    "Content-Type": "application/json",
  },
})

function isAuthRefreshRequest(config: InternalAxiosRequestConfig | undefined) {
  const url = config?.url ?? ""
  return url.includes("/auth/refresh")
}

function attachAccessToken(config: InternalAxiosRequestConfig) {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(attachAccessToken)

let refreshPromise: Promise<string> | null = null

export async function refreshAccessTokenSingleFlight(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const response = await publicApi.post<{ accessToken: string }>(
      "/auth/refresh",
      null,
    )
    const newToken = response.data?.accessToken
    if (!newToken) {
      throw new Error("Refresh succeeded but no accessToken returned")
    }
    store.dispatch(setAccessToken(newToken))
    return newToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function forceLogout(message?: string) {
  store.dispatch(clearSession())
  if (message) {
    toast.error(message, { id: "auth-expired" })
  }
  // Hard redirect to fully reset route state.
  if (window.location.pathname !== "/login") {
    window.location.assign("/login")
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined
    const status = error.response?.status

    if (!originalConfig || status !== 401) {
      return Promise.reject(error)
    }

    // Never try to refresh when refresh itself fails.
    if (isAuthRefreshRequest(originalConfig)) {
      forceLogout("Session expired")
      return Promise.reject(error)
    }

    // Avoid infinite loops: only retry once.
    if (originalConfig._retry) {
      forceLogout("Session expired")
      return Promise.reject(error)
    }

    originalConfig._retry = true

    try {
      const newToken = await refreshAccessTokenSingleFlight()
      originalConfig.headers = originalConfig.headers ?? {}
      originalConfig.headers.Authorization = `Bearer ${newToken}`
      return api(originalConfig)
    } catch (refreshErr) {
      const msg = apiErrorMessage(refreshErr) ?? "Session refresh failed"
      forceLogout(msg)
      return Promise.reject(error)
    }
  },
)
