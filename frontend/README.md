# DuckStock Frontend 🦆💻

The DuckStock Frontend is a modern, responsive user interface built with **React** and **Vite**, utilizing **Bun** for fast dependency management and execution.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Package Manager**: Bun
- **State Management**: Redux Toolkit & React Query
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS (Custom design system in `src/styles`)
- **Testing**: Vitest & Cypress

## Prerequisites

- **Bun** (recommended) or **Node.js**

## Local Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

   _(or `npm install` if using Node.js)_

2. **Run in development mode:**

   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:5173`.

3. **Build for production:**
   ```bash
   bun run build
   ```

## Scripts

- `bun run dev`: Starts the development server.
- `bun run build`: Builds the application for production.
- `bun run preview`: Previews the production build locally.
- `bun run test`: Runs unit tests with Vitest.
- `bun run cypress:open`: Opens Cypress for end-to-end testing.

## Folder Structure

- `src/api/`: API client configurations.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/pages/`: Main application views/pages.
- `src/services/`: Business logic and API service wrappers.
- `src/store/`: Redux store and slices.
- `src/styles/`: Global styles and CSS design tokens.
