import type { AxiosError } from "axios"

type ErrorResponse = {
  status?: number
  message?: string
  detail?: string
}

export function apiErrorMessage(error: unknown): string | null {
  const ax = error as AxiosError<ErrorResponse>
  const data = ax?.response?.data
  if (data?.detail) return data.detail
  if (data?.message) return data.message
  if (typeof ax?.message === "string" && ax.message.trim().length > 0)
    return ax.message
  return null
}
