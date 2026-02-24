# DuckStock 🦆📈

DuckStock is a Manufacturing Production Planner application designed to help small to mid-sized manufacturing businesses manage their raw materials, products, and production flow efficiently.

## Project Structure

- `backend/`: Java Quarkus application providing a RESTful API.
- `frontend/`: React + Vite application (built with Bun) for the user interface.
- `docker-compose.yml`: Local infrastructure setup (PostgreSQL).

## Prerequisites

Before building and running the application, ensure you have the following installed:

- **Java JDK 17+** (for the backend)
- **Bun** or **Node.js** (for the frontend)
- **Docker & Docker Compose** (for the database)
- **Maven** (optional, `mvnw` wrapper included in backend)

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd duck-stock
   ```

2. **Setup Environment Variables:**
   Copy `.env.example` to `.env` (if applicable) or use the defaults provided in the subdirectories.

3. **Start the Infrastructure:**

   ```bash
   docker-compose up -d
   ```

4. **Run the Backend:**

   ```bash
   cd backend
   ./mvnw.cmd quarkus:dev
   ```

5. **Run the Frontend:**
   ```bash
   cd frontend
   bun install
   bun run dev
   ```

Refer to the specific README files in `backend/` and `frontend/` for more detailed instructions.
