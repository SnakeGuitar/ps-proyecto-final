# Proyecto Final — Prácticas Profesionales

Monorepo con dos aplicaciones:

- **`backend/`** — API REST en Node.js + Express + Sequelize (MySQL), con JWT, Swagger y bitácora.
- **`frontend/`** — Aplicación web en ASP.NET Core MVC (.NET) que consume el backend.

La orquestación de ambos servicios + MySQL se hace con [`docker-compose.yml`](docker-compose.yml).

## Estructura

```
.
├── backend/            API Node.js
├── frontend/           Web .NET
├── docker-compose.yml  Orquestación de backend + frontend + MySQL
└── README.md
```

## Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env   # ajusta credenciales de MySQL
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm start
```

- API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/swagger`

Genera la documentación de Swagger con:

```bash
node swagger.js
```

## Frontend (.NET)

```bash
cd frontend
dotnet restore
dotnet run
```

- Web: `http://localhost:8080`

## Docker

```bash
docker compose up -d --build
```

Levanta MySQL 8, el backend y el frontend.
