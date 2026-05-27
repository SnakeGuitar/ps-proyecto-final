# Proyecto Final — Prácticas Profesionales (Seguridad en Sistemas)

Aplicación de e-commerce educativa con controles de seguridad implementados y documentados.  
Monorepo compuesto por tres servicios orquestados con Docker Compose:

| Servicio | Tecnología | Puerto |
|----------|-----------|--------|
| **`backend/`** | Node.js 20 · Express · Sequelize · MySQL | `3000` |
| **`frontend/`** | ASP.NET Core 8 MVC | `8080` |
| **`db`** | MySQL 8 | `3307` (host) |

---

## Requisitos

- Docker Desktop ≥ 24 (o Docker Engine + Compose v2)
- Git

> Para ejecución local sin Docker: Node.js ≥ 20 y .NET SDK 8.

---

## Inicio rápido (Docker — recomendado)

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd ps-proyecto-final

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env y cambiar TODAS las contraseñas antes de levantar

# 3. Construir e iniciar todos los servicios
docker compose up -d --build

# 4. Ejecutar migraciones y seeders (solo la primera vez)
docker exec mercadolibre_backend npx sequelize-cli db:migrate
docker exec mercadolibre_backend npx sequelize-cli db:seed:all
```

La aplicación queda disponible en:

- **Frontend** → http://localhost:8080
- **API REST** → http://localhost:3000/api
- **Swagger UI** → http://localhost:3000/swagger *(solo en development)*

---

## Cuentas de acceso predeterminadas

Las contraseñas se configuran en `.env` antes de ejecutar los seeders.

| Rol | Email | Contraseña (variable en .env) |
|-----|-------|-------------------------------|
| Administrador | `admin@mail.com` | `ADMIN_SEED_PASSWORD` |
| Usuario | `usuario@mail.com` | `USER_SEED_PASSWORD` |

> Si no se definen las variables, los seeders usan `Admin.1234` y `User.1234` como fallback.

---

## Ejecución local sin Docker

### Backend

```bash
cd backend
npm install
cp .env.example .env          # configurar DB_* y JWT_SECRET
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm start
```

### Frontend

```bash
cd frontend
dotnet restore
dotnet run
```

---

## Variables de entorno requeridas

Archivo `.env` en la raíz del proyecto (ver [`.env.example`](.env.example)):

| Variable | Descripción |
|----------|-------------|
| `DB_DATABASE` | Nombre de la base de datos |
| `DB_USER` | Usuario de MySQL |
| `DB_PASSWORD` | Contraseña del usuario MySQL |
| `MYSQL_ROOT_PASSWORD` | Contraseña root de MySQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 chars) |
| `NODE_ENV` | `development` o `production` |
| `ADMIN_SEED_PASSWORD` | Contraseña del usuario administrador semilla |
| `USER_SEED_PASSWORD` | Contraseña del usuario normal semilla |

> **Importante:** El archivo `.env` no se sube al repositorio. Cada entorno debe generarlo localmente.  
> Cualquier secreto previamente expuesto en el historial de git debe rotarse antes de desplegar en producción.

---

## Generar documentación Swagger

```bash
cd backend
node swagger.js
```

El archivo `swagger-output.json` se genera en `backend/`. No se incluye en el repositorio.

---

## Comandos útiles

```bash
# Ver logs del backend
docker logs -f mercadolibre_backend

# Ver logs del frontend
docker logs -f mercadolibre_frontend

# Verificar usuario del proceso backend (debe ser 'node', no 'root')
docker exec mercadolibre_backend whoami

# Verificar puertos expuestos
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (borra datos de BD)
docker compose down -v
```

---

## Arquitectura de despliegue

```
  [Navegador]
      |
      | HTTP :8080
      v
  +-----------+         +-----------+         +-----------+
  | Frontend  | ------> |  Backend  | ------> |  MySQL 8  |
  | ASP.NET   | HTTP    | Node.js   | TCP     | (interno) |
  | :8080     | :3000   | :3000     | :3306   |           |
  +-----------+         +-----------+         +-----------+
     Docker               Docker               Docker
  (restart: unless-stopped en los tres servicios)
```

**Proxy inverso recomendado para producción:** Nginx o Traefik enfrente de `frontend:8080`,  
con TLS terminado en el proxy. El backend **no** debe exponerse directamente al exterior.

**Firewall recomendado:** permitir solo puertos 80/443 desde internet; 3000 y 3307 solo accesibles internamente.

---

## Pruebas de seguridad y funcionalidad

El directorio [`docs/pruebas/`](docs/pruebas/) contiene el script `ejecutar_pruebas.sh` que automatiza las 7 pruebas requeridas por la rúbrica:

```bash
# Con los servicios Docker levantados:
bash docs/pruebas/ejecutar_pruebas.sh
```

Pruebas cubiertas:
1. Validación de entradas en la API (sin cliente)
2. Secciones privadas — acceso sin token y con rol incorrecto
3. Error sin caída del servidor ni stack trace expuesto
4. Rate limiting en login (bloqueo al intento 11)
5. Refresco automático del JWT (`Set-Authorization`)
6. Docker no-root (`whoami = node`) y política de reinicio automática
7. Puertos expuestos (`netstat` / `docker port`)

---

## Hallazgos de seguridad

Ver [`VULNERABILIDADES.md`](VULNERABILIDADES.md) para el reporte completo de los 16 hallazgos originales (mitigados) y los 6 hallazgos residuales con su estado actual.

Ver [`PLAN-DE-ACCION.md`](PLAN-DE-ACCION.md) para la matriz de priorización y checklist de validación.

---

## Estructura del proyecto

```
ps-proyecto-final/
├── backend/                    API REST Node.js
│   ├── config/                 Configuración Sequelize y claims JWT
│   ├── controllers/            Lógica de negocio por recurso
│   ├── middlewares/            Auth, bitácora, errores, uploads
│   ├── migrations/             Migraciones de base de datos
│   ├── models/                 Modelos Sequelize
│   ├── routes/                 Definición de rutas y middleware por endpoint
│   ├── seeders/                Datos iniciales
│   ├── services/               Servicio JWT
│   └── index.js                Punto de entrada
├── frontend/                   ASP.NET Core MVC
│   ├── Controllers/            Controladores MVC
│   ├── Models/                 Modelos de vista
│   ├── Services/               Clientes HTTP para el API
│   ├── Views/                  Vistas Razor
│   └── Program.cs              Configuración de la aplicación
├── docs/                       Documentación y evidencias
│   └── pruebas/                Scripts de prueba
├── docker-compose.yml
├── .env.example
├── VULNERABILIDADES.md
└── PLAN-DE-ACCION.md
```
