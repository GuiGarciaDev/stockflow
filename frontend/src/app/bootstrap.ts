import { listenerMiddleware, store } from "@/app/store"
import { clearSession, setSession } from "@/features/auth/authSlice"
import { initializeAuth, refreshAccessToken } from "@/features/auth/authThunks"
import {
  startAuthRefreshScheduler,
  stopAuthRefreshScheduler,
} from "@/features/auth/refreshScheduler"

listenerMiddleware.startListening({
  actionCreator: setSession,
  effect: async (_action, api) => {
    startAuthRefreshScheduler(() => api.dispatch(refreshAccessToken()))
  },
})

listenerMiddleware.startListening({
  actionCreator: clearSession,
  effect: async () => {
    stopAuthRefreshScheduler()
  },
})

// App-load refresh attempt (silent if no cookie).
void store.dispatch(initializeAuth({ silent: true }))
