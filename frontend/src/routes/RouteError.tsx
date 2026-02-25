import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export function RouteError() {
  const err = useRouteError()

  const title = isRouteErrorResponse(err)
    ? `Error ${err.status}`
    : "Something went wrong"
  const message = isRouteErrorResponse(err)
    ? err.statusText
    : err instanceof Error
      ? err.message
      : "Unexpected error"

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card title={title}>
          <div className="text-sm text-slate-700">{message}</div>
          <div className="mt-4 flex gap-2">
            <Link to="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
