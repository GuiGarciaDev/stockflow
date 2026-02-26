# DuckStock Backend

Quarkus REST API for DuckStock (Manufacturing Production Planner). Provides authentication, inventory management (raw materials + products), and production suggestion logic.

## Tech Stack

- **Java**: 17
- **Framework**: Quarkus 3.17
- **REST**: Quarkus REST + Jackson
- **Persistence**: Hibernate ORM with Panache
- **Database**: PostgreSQL
- **Validation**: Hibernate Validator
- **Security**: SmallRye JWT (access/refresh tokens)
- **Docs**: OpenAPI + Swagger UI
- **Tests**: Quarkus JUnit5 + RestAssured (+ Dev Services/Testcontainers)

## Project Layout

- `src/main/java/com/duckstock/resource/`: REST resources (controllers)
- `src/main/java/com/duckstock/service/`: business logic
- `src/main/java/com/duckstock/entity/`: Panache entities
- `src/main/java/com/duckstock/security/`: JWT/token helpers + global rate limiting
- `src/main/java/com/duckstock/exception/`: exception types + global mapper
- `src/main/resources/application.properties`: runtime configuration
- `docker-compose.yml`: PostgreSQL for local/prod-like runs
- `.env.example`: backend env template for Compose + runtime

## Prerequisites

- Java 17+
- Docker Desktop

Maven is optional because the repo includes `./mvnw` / `./mvnw.cmd`.

## Local Database (Docker Compose)

From `backend/`:

```bash
copy .env.example .env
docker compose up -d
```

Defaults:

- Postgres port: `5432`
- Database/user/password: `duckstock` / `duckstock` / `duckstock123`

## Running (Development)

From `backend/`:

```bash
./mvnw.cmd quarkus:dev
```

Dev profile notes:

- `%dev` is configured to use the Postgres from `docker-compose.yml`.
- You can enable a **dev-only bootstrap seed** via config (see “Seeding”).

## Running (Production Profile, locally)

This is the easiest way to run against the Compose database in a “prod-like” mode.

1. Start Postgres:

```bash
cd backend
docker compose up -d
```

2. Build the app:

```bash
./mvnw.cmd package
```

3. Run with the prod profile:

```bash
java -Dquarkus.profile=prod -jar target/quarkus-app/quarkus-run.jar
```

## Configuration

Main config is in `src/main/resources/application.properties`.

### Database

The application uses the following environment variables (defaults shown):

- `POSTGRES_HOST` (default: `localhost`)
- `POSTGRES_PORT` (default: `5432`)
- `POSTGRES_DB` (default: `duckstock`)
- `POSTGRES_USER` (default: `duckstock`)
- `POSTGRES_PASSWORD` (default: `duckstock123`)

Hibernate generation strategy:

- `%dev`: `drop-and-create` (fast iteration)
- `%test`: `drop-and-create`
- `%prod`: `update` (safer than dropping data)

### JWT / Auth

Auth model:

- **Access token**: returned in JSON (`accessToken`) and must be sent as `Authorization: Bearer <token>`
- **Refresh token**: stored in an **HTTP-only cookie** named `jwt_token`

Token settings:

- `JWT_ACCESS_EXPIRATION` (seconds, default: `900`)
- `JWT_REFRESH_EXPIRATION` (seconds, default: `604800`)

Cookie settings:

- `AUTH_COOKIE_SECURE` (default: `false`)
- `AUTH_COOKIE_SAMESITE` (default: `STRICT`; supported: `STRICT`, `LAX`, `NONE`)

If the frontend is on a different origin and you need cross-site cookies, you typically want:

- `AUTH_COOKIE_SAMESITE=NONE`
- `AUTH_COOKIE_SECURE=true`

### CORS

- `CORS_ORIGIN` (default: `http://localhost:5173`)

The backend is configured to allow credentials so the refresh cookie can be used.

### Rate limiting

Global (in-memory) rate limiting is enabled by default:

- `RATE_LIMIT_ENABLED` (default: `true`)
- `RATE_LIMIT_LIMIT` (default: `300`)
- `RATE_LIMIT_WINDOW_SECONDS` (default: `60`)

## Seeding

Two options:

1. **Dev-only automatic seed on startup** (recommended for local dev)

Set in `application.properties` (dev profile):

- `DEV_BOOTSTRAP_ENABLED=true`
- `DEV_BOOTSTRAP_ADMIN_EMAIL=...`
- `DEV_BOOTSTRAP_ADMIN_PASSWORD=...`

This runs only in the `dev` profile.

2. **Admin endpoint**

- `POST /admin/seed` (requires `ADMIN` role)

## API Endpoints (Summary)

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Raw materials:

- `GET /raw-materials` (paged)
- `GET /raw-materials/all` (no pagination)
- `GET /raw-materials/{id}`
- `POST /raw-materials`
- `PUT /raw-materials/{id}`
- `DELETE /raw-materials/{id}`

Products:

- `GET /products` (paged)
- `GET /products/{id}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /products/{id}/raw-materials` (bulk add)
- `PUT /products/{id}/raw-materials/{associationId}` (update qty)
- `DELETE /products/{id}/raw-materials/{associationId}` (remove)

Production:

- `GET /production/suggestions`
- `POST /production/confirm` (**ADMIN only**; deducts stock)

## Errors

Errors are normalized by a global exception mapper. The frontend expects:

```json
{ "status": 400, "message": "...", "detail": "..." }
```

## API Documentation

Swagger UI (when running):

- `http://localhost:8080/q/swagger-ui`

OpenAPI JSON:

- `http://localhost:8080/q/openapi`

## Tests

From `backend/`:

```bash
./mvnw.cmd test
```

Tests run under the `test` profile and (by default) use Quarkus Dev Services/Testcontainers for PostgreSQL.
