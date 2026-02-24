# DuckStock Backend 🦆⚙️

The DuckStock Backend is a Java application built with **Quarkus**, providing a robust RESTful API for the Manufacturing Production Planner.

## Tech Stack

- **Framework**: Quarkus 3.x
- **Language**: Java 17+
- **Persistence**: Hibernate ORM with Panache
- **Database**: PostgreSQL
- **Security**: SmallRye JWT (Token-based authentication)
- **API Documentation**: SmallRye OpenAPI (Swagger)

## Prerequisites

- **Java JDK 17+**
- **Maven 3.9+** (or use the included `mvnw`)
- **Docker** (for local PostgreSQL instance)

## Local Setup

1. **Start the database:**
   Ensure you are in the project root and run:

   ```bash
   docker-compose up -d
   ```

2. **Run in development mode:**

   ```bash
   cd backend
   ./mvnw.cmd quarkus:dev
   ```

   The application will be available at `http://localhost:8080`.

3. **Running tests:**
   ```bash
   ./mvnw.cmd test
   ```

## Configuration

Configuration is managed via `src/main/resources/application.properties`. You can override properties using environment variables:

- `POSTGRES_DB`: Name of the database (default: `duckstock`)
- `POSTGRES_USER`: Database user (default: `duckstock`)
- `POSTGRES_PASSWORD`: Database password (default: `duckstock123`)
- `JWT_EXPIRATION`: Token lifespan in seconds (default: `3600`)

## API Documentation

When the application is running in dev mode, you can access the **Swagger UI** to explore and test the endpoints:

🔗 [http://localhost:8080/q/swagger-ui](http://localhost:8080/q/swagger-ui)
