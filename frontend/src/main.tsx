import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import "@/index.css"
import "@/app/bootstrap"
import { store } from "@/app/store"
import { queryClient } from "@/lib/queryClient"
import { router } from "@/routes/router"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
