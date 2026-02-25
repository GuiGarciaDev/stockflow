import React, { Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"

import { PublicLayout } from "@/layouts/PublicLayout"
import { AppLayout } from "@/layouts/AppLayout"
import { RequireAuth } from "@/routes/RequireAuth"
import { FullPageLoader } from "@/components/FullPageLoader"
import { RouteError } from "@/routes/RouteError"

const LoginPage = React.lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = React.lazy(
  () => import("@/features/auth/pages/RegisterPage"),
)
const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
)
const ProductsPage = React.lazy(
  () => import("@/features/products/pages/ProductsPage"),
)
const ProductCompositionPage = React.lazy(
  () => import("@/features/products/pages/ProductCompositionPage"),
)
const RawMaterialsPage = React.lazy(
  () => import("@/features/rawMaterials/pages/RawMaterialsPage"),
)
const ProductionSuggestionsPage = React.lazy(
  () => import("@/features/production/pages/ProductionSuggestionsPage"),
)

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<FullPageLoader label="Loading…" />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/login",
        element: (
          <Lazy>
            <LoginPage />
          </Lazy>
        ),
      },
      {
        path: "/register",
        element: (
          <Lazy>
            <RegisterPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      {
        path: "/dashboard",
        element: (
          <Lazy>
            <DashboardPage />
          </Lazy>
        ),
      },
      {
        path: "/products",
        element: (
          <Lazy>
            <ProductsPage />
          </Lazy>
        ),
      },
      {
        path: "/products/:id/composition",
        element: (
          <Lazy>
            <ProductCompositionPage />
          </Lazy>
        ),
      },
      {
        path: "/materials",
        element: (
          <Lazy>
            <RawMaterialsPage />
          </Lazy>
        ),
      },
      {
        path: "/production",
        element: (
          <Lazy>
            <ProductionSuggestionsPage />
          </Lazy>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
