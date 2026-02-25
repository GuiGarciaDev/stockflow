import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit"
import { authReducer } from "@/features/auth/authSlice"

export const listenerMiddleware = createListenerMiddleware()

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(listenerMiddleware.middleware),
  devTools: false,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
