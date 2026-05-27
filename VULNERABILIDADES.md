# Reporte de Vulnerabilidades - Estado Actual

**Proyecto:** Mercado Libre Node - Monorepo (Backend Node.js + Frontend ASP.NET Core)  
**Fecha de auditoria:** 2026-05-27  
**Alcance:** codigo fuente actual del working tree, configuracion Docker, dependencias npm de produccion y documentos de seguridad.

## Resumen Ejecutivo

Los 16 hallazgos documentados originalmente ya no reflejaban el estado actual del codigo. En el working tree revisado, esos 16 puntos aparecen mitigados mediante whitelists de campos, validaciones, rate limiting, Helmet, restriccion de JWT, hardening de uploads, externalizacion de secretos, Docker no-root y restriccion de Swagger.

La auditoria actual no encontro vulnerabilidades criticas activas equivalentes a las originales. Si quedan riesgos residuales y nuevos hallazgos que deben atenderse antes de considerar el sistema cerrado desde seguridad.

## Estado Actual de Hallazgos

| Estado | Critica | Alta | Media | Baja | Total |
|--------|---------|------|-------|------|-------|
| Mitigadas de la auditoria original | 3 | 5 | 5 | 3 | 16 |
| Pendientes actuales | 0 | 2 | 2 | 2 | 6 |

## Hallazgos Pendientes

### R-01 | Upload antes de autorizacion en rutas de archivos

| Campo | Detalle |
|-------|---------|
| **Severidad** | Alta |
| **Archivo** | `backend/routes/archivos.routes.js` |
| **CWE** | CWE-862: Missing Authorization / CWE-400: Uncontrolled Resource Consumption |
| **Endpoints** | `POST /api/archivos`, `PUT /api/archivos/:id` |
| **Estado** | Pendiente |

**Descripcion:**  
Las rutas de subida ejecutan `upload.single("file")` antes de `Authorize('Administrador')`. Esto significa que una solicitud no autenticada puede escribir un archivo temporal en `uploads/` antes de ser rechazada por autorizacion.

**Codigo actual:**

```javascript
router.post('/', upload.single("file"), Authorize('Administrador'), archivos.create)
router.put('/:id', upload.single("file"), Authorize('Administrador'), archivos.update)
```

**Impacto:**  
Aunque Multer ya limita a 5 MB y filtra JPG, un atacante no autenticado puede generar archivos huerfanos y consumir disco con solicitudes repetidas.

**Solucion recomendada:**

```javascript
router.post('/', Authorize('Administrador'), upload.single("file"), archivos.create)
router.put('/:id', Authorize('Administrador'), upload.single("file"), archivos.update)
```

---

### R-02 | Vulnerabilidades en dependencias npm de produccion

| Campo | Detalle |
|-------|---------|
| **Severidad** | Alta |
| **Archivo** | `backend/package-lock.json` |
| **Fuente** | `npm audit --omit=dev` |
| **Estado** | Pendiente |

**Descripcion:**  
`npm audit --omit=dev` reporta 4 vulnerabilidades en dependencias de produccion:

| Paquete | Severidad | Via | Nota |
|---------|-----------|-----|------|
| `tar` | Alta | `@mapbox/node-pre-gyp` | multiples advisories de path traversal / overwrite |
| `@mapbox/node-pre-gyp` | Alta | `tar` | dependencia transitiva |
| `uuid` | Media | `sequelize` | bounds check en versiones afectadas |
| `sequelize` | Media | `uuid` | advisory transitivo |

**Impacto:**  
El riesgo principal esta en dependencias transitivas usadas por paquetes nativos. Debe validarse si el flujo de la aplicacion extrae archivos no confiables; aun asi, el lockfile queda con advisories activos.

**Solucion recomendada:**  
Ejecutar una actualizacion controlada de dependencias, revisar cambios mayores posibles y repetir `npm audit --omit=dev`. No aplicar automaticamente el downgrade sugerido por audit para `sequelize` sin validar compatibilidad.

---

### R-03 | Descarga publica de archivos por ID incremental

| Campo | Detalle |
|-------|---------|
| **Severidad** | Media |
| **Archivo** | `backend/routes/archivos.routes.js`, `backend/models/archivo.js` |
| **CWE** | CWE-639: Authorization Bypass Through User-Controlled Key |
| **Endpoint** | `GET /api/archivos/:id` |
| **Estado** | Pendiente / requiere decision funcional |

**Descripcion:**  
`GET /api/archivos/:id` no requiere autenticacion y los archivos usan `id` entero autoincremental. Si los archivos son imagenes publicas de productos, esto puede ser aceptable. Si el modulo permite subir archivos administrativos o no publicos, cualquier persona puede enumerar y descargar contenidos.

**Codigo actual:**

```javascript
router.get('/:id', archivos.get)
```

**Impacto:**  
Exposicion de archivos por enumeracion (`/api/archivos/1`, `/api/archivos/2`, etc.).

**Opciones de solucion:**

- Mantenerlo publico solo si se declara explicitamente que las imagenes son publicas.
- Requerir `Authorize('Usuario,Administrador')` y ajustar el frontend para enviar token en las solicitudes de imagen.
- Usar identificadores no enumerables para archivos publicos.

---

### R-04 | Configuracion de produccion de Sequelize no coincide con Docker Compose

| Campo | Detalle |
|-------|---------|
| **Severidad** | Media |
| **Archivo** | `backend/config/config.js`, `docker-compose.yml` |
| **CWE** | CWE-16: Configuration |
| **Estado** | Pendiente |

**Descripcion:**  
Docker Compose inyecta `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` y `DB_PORT`. Sin embargo, `backend/config/config.js` usa variables `PROD_DB_*` cuando `NODE_ENV=production`.

**Impacto:**  
El despliegue productivo puede fallar al activar `NODE_ENV=production`, empujando a operar en `development`. Eso reduce la efectividad de controles dependientes del entorno, por ejemplo ocultar Swagger y respuestas menos verbosas.

**Solucion recomendada:**  
Alinear la seccion `production` con las mismas variables `DB_*` o actualizar Docker Compose y `.env.example` para definir `PROD_DB_*`.

---

### R-05 | JWT visible en la pantalla de perfil

| Campo | Detalle |
|-------|---------|
| **Severidad** | Baja |
| **Archivo** | `frontend/Controllers/PerfilController.cs`, `frontend/Views/Perfil/Index.cshtml` |
| **CWE** | CWE-200: Exposure of Sensitive Information |
| **Estado** | Pendiente |

**Descripcion:**  
El frontend reconstruye el modelo de perfil con el claim `jwt` y lo muestra en la vista. Aunque el usuario autenticado ya posee su token, exponerlo visualmente facilita fugas por captura de pantalla, soporte remoto, grabaciones o shoulder surfing.

**Solucion recomendada:**  
No renderizar el JWT completo. Si es necesario diagnosticarlo, mostrar solo un identificador parcial o moverlo a una herramienta de desarrollo no disponible en produccion.

---

### R-06 | Flags de cookie no declarados explicitamente para produccion

| Campo | Detalle |
|-------|---------|
| **Severidad** | Baja |
| **Archivo** | `frontend/Program.cs` |
| **CWE** | CWE-614: Sensitive Cookie in HTTPS Session Without Secure Attribute |
| **Estado** | Pendiente |

**Descripcion:**  
La cookie de autenticacion se configura con nombre, rutas y expiracion, pero no declara explicitamente `HttpOnly`, `SecurePolicy` ni `SameSite`. ASP.NET Core aplica defaults razonables para algunos campos, pero en produccion conviene fijarlos de forma explicita.

**Solucion recomendada:**

```csharp
options.Cookie.HttpOnly = true;
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
options.Cookie.SameSite = SameSiteMode.Lax;
```

## Estado de los 16 Hallazgos Originales

| ID | Hallazgo original | Estado observado en codigo actual | Evidencia |
|----|-------------------|------------------------------------|-----------|
| V-01 | Mass Assignment en usuarios | Mitigado | `usuarios.update` actualiza solo `nombre` y `rolid` |
| V-02 | Mass Assignment en categorias | Mitigado | `categorias.update` actualiza solo `nombre` |
| V-03 | Mass Assignment en productos | Mitigado | `productos.update` actualiza solo `titulo`, `descripcion`, `precio`, `archivoid` |
| V-04 | Path Traversal en descarga | Mitigado parcialmente | `path.resolve` y validacion de directorio en `archivos.get`; ver R-03 para exposicion publica |
| V-05 | Secretos hardcodeados | Mitigado en working tree | `docker-compose.yml` usa variables y `.env` esta ignorado |
| V-06 | Sin rate limiting en login | Mitigado | `express-rate-limit` aplicado a `POST /api/auth` |
| V-07 | Sin limite de subida | Mitigado | Multer limita a 5 MB |
| V-08 | Stack trace expuesto | Mitigado | el error handler registra stack en servidor pero no lo devuelve |
| V-09 | JWT sin algoritmo explicito | Mitigado | `jwt.verify(..., { algorithms: ['HS256'] })` |
| V-10 | Sin validacion login/usuarios | Mitigado | validators en auth y usuarios |
| V-11 | Nombre original preservado | Mitigado | nombre aleatorio con `crypto.randomBytes` |
| V-12 | Sin cabeceras HTTP | Mitigado | `helmet()` en Express |
| V-13 | Missing return en auth.tiempo | Mitigado | `return res.status(404).send()` |
| V-14 | Docker root | Mitigado | `USER node` en Dockerfile |
| V-15 | Swagger expuesto en produccion | Mitigado si `NODE_ENV=production` | Swagger solo se monta fuera de produccion; ver R-04 |
| V-16 | Passwords seed debiles | Mitigado | variables `ADMIN_SEED_PASSWORD` y `USER_SEED_PASSWORD` con fallback mas fuerte |

## Observaciones de Verificacion

- No se encontro `update(req.body)` en controladores.
- No se encontraron secretos reales hardcodeados en `docker-compose.yml`; el archivo usa interpolacion desde `.env`.
- `.env`, `backend/.env`, `uploads/`, `log/`, `node_modules/` y `swagger-output.json` estan ignorados.
- El frontend usa Razor con encoding por defecto; no se observo uso de `Html.Raw`.
- El perfil muestra el JWT completo, lo que se mantiene como hallazgo de baja severidad.
- `npm audit --omit=dev` falla por advisories activos en dependencias de produccion.

