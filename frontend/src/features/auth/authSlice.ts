import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/app/store"
import type { User } from "@/features/auth/types"

type AuthState = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setSession(
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.loading = false
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
    },
    clearSession(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.loading = false
    },
  },
})

export const { setLoading, setSession, setAccessToken, clearSession } =
  authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuth = (state: RootState) => state.auth
export const selectAccessToken = (state: RootState) => state.auth.accessToken
