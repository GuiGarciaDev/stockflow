# DuckStock

DuckStock is a Manufacturing Production Planner: manage raw materials, build product compositions (BOM), and generate production suggestions based on current inventory.

## What you get

- **Authentication** with access tokens + refresh cookie
- **Raw materials** CRUD + stock tracking
- **Products** CRUD + composition management (product ↔ raw materials)
- **Production suggestions** driven by available stock (highest-value products first)
- **Swagger UI** for API exploration

## Screenshots
<img width="1900" height="880" alt="image" src="https://github.com/user-attachments/assets/35c6885f-dbee-4b61-8ae2-d2313cd197fd" />

<img width="1900" height="876" alt="image" src="https://github.com/user-attachments/assets/0a2996f4-5bb1-490f-99ed-fca1c729fc84" />

<img width="1901" height="880" alt="image" src="https://github.com/user-attachments/assets/96b07dae-6027-4a61-8a69-1fe3a84ae3e2" />

<img width="1900" height="873" alt="image" src="https://github.com/user-attachments/assets/f4cc6365-dc17-4ff9-b7fe-59bdb3a50c87" />

## Repository Structure

- `backend/`: Quarkus (Java) REST API
- `frontend/`: React + Vite UI
- `backend/docker-compose.yml`: Postgres database for backend runs

## Prerequisites

- Java 17+
- Node.js 18+
- Docker Desktop

## Quick Start (Local)

### 1) Start Postgres (backend)

```bash
cd backend
copy .env.example .env
docker compose up -d
```

### 2) Run the backend (dev profile)

```bash
cd backend
./mvnw.cmd quarkus:dev
```

Backend: `http://localhost:8080`

Swagger UI: `http://localhost:8080/q/swagger-ui`

### 3) Run the frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Running “Production Profile” locally (uses the same Compose DB)

```bash
cd backend
docker compose up -d
./mvnw.cmd package
java -Dquarkus.profile=prod -jar target/quarkus-app/quarkus-run.jar
```

## More documentation

- Backend details: see `backend/README.md`
- Frontend details: see `frontend/README.md`
