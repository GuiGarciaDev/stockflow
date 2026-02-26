# StockFlow Frontend

React + Vite UI for StockFlow, focused on production planning and inventory management.

## Tech Stack

- **Runtime**: Node.js (recommended: 18+)
- **Build tool**: Vite 5
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS (utility classes + local utilities in `src/index.css`)
- **Routing**: React Router
- **Server state**: TanStack React Query
- **Client state**: Redux Toolkit (kept intentionally small; used mainly for auth session)
- **HTTP**: Axios (with interceptors)
- **Toasts**: react-hot-toast

## Prerequisites

- Node.js 18+
- A running backend API (see `../backend/README.md`)

## Environment Variables

Create `frontend/.env` (optional) by copying the example:

```bash
cd frontend
copy .env.example .env
```

Supported variables:

- `VITE_API_BASE_URL` (default: `http://localhost:8080`)

## Running Locally

From `frontend/`:

```bash
npm install
npm run dev
```

- Frontend dev server: `http://localhost:5173`
- Backend API default: `http://localhost:8080`

## Build & Preview

```bash
npm run build
npm run preview
```

`preview` serves the production build using Vite’s preview server.

## App Structure

High-level layout:

- `src/routes/router.tsx`: route table + lazy-loaded pages
- `src/layouts/`:
  - `PublicLayout`: unauthenticated layout (login/register)
  - `AppLayout`: authenticated layout (sidebar + header + outlet)
- `src/features/`: feature modules organized by domain
- `src/services/`: API client (`api.ts`) + domain services (`*Service.ts`)
- `src/components/`: reusable UI building blocks

Routes:

- Public
  - `/login`
  - `/register`
- Authenticated
  - `/dashboard`
  - `/products`
  - `/products/:id/composition`
  - `/materials`
  - `/production`

## Authentication Model (Frontend)

The frontend uses a **hybrid** token approach that matches the backend:

- **Access token**: returned in JSON responses and stored in Redux state (memory)
- **Refresh token**: stored as an **HTTP-only cookie** set by the backend

Key implementation points:

- `src/services/api.ts`
  - `withCredentials: true` so the browser sends the refresh cookie to `/auth/refresh`
  - Adds `Authorization: Bearer <accessToken>` automatically for authenticated API calls
  - On `401`, performs a single-flight refresh (`/auth/refresh`) and retries once
- `src/app/bootstrap.ts`
  - On app load, attempts a **silent refresh** so the session is restored if a refresh cookie exists
- `src/features/auth/refreshScheduler.ts`
  - Refresh cadence is fixed at **14 minutes** (backend access tokens default to 900s)

## Data Fetching

React Query is used for server state:

- Default query behavior lives in `src/lib/queryClient.ts`.
- Queries avoid retrying on `401/403` (auth errors).

## Troubleshooting

### Login works but subsequent requests fail

Most commonly:

- `VITE_API_BASE_URL` points to the wrong backend URL.
- Cookies are not being stored/sent (check browser devtools → Application/Storage).
- Cross-origin cookie rules:
  - If frontend and backend are on different origins, the backend may need `SameSite=None` and `Secure=true` for the refresh cookie.
  - The backend also must allow `quarkus.http.cors.access-control-allow-credentials=true` (already enabled).
