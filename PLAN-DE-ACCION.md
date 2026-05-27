# Plan de Accion - Seguridad y Mitigacion

**Fecha de revision:** 2026-05-27  
**Estado base:** los 16 hallazgos originales ya fueron mitigados en el working tree actual. El plan se actualiza para reflejar trabajo pendiente real y validaciones de cierre.

## 1. Resumen Ejecutivo

El documento anterior trataba las 16 vulnerabilidades originales como pendientes. Ese estado ya no coincide con el codigo actual. La revision confirma que los controles principales fueron implementados: whitelisting de campos, validacion de entradas, rate limiting, Helmet, control de algoritmo JWT, limite de uploads, nombres aleatorios de archivo, secretos externalizados, Docker no-root, Swagger condicionado por entorno y passwords seed parametrizadas.

El trabajo restante se concentra en seis puntos: ordenar autorizacion antes de Multer, resolver advisories npm, decidir si los archivos deben ser publicos, alinear la configuracion de produccion, ocultar el JWT en el perfil y fijar flags de cookie para produccion.

## 2. Matriz Actual de Priorizacion

| ID | Vulnerabilidad / riesgo | Severidad | Estado | Esfuerzo | Prioridad |
|----|--------------------------|-----------|--------|----------|-----------|
| R-01 | Upload antes de autorizacion | Alta | **Completado** | Bajo | 1 - Inmediata |
| R-02 | Advisories npm en dependencias productivas | Alta | Pendiente | Medio | 1 - Inmediata |
| R-03 | Descarga publica de archivos por ID incremental | Media | **Aceptado (documentado)** | Medio | 2 - Corto plazo |
| R-04 | Configuracion `production` no alineada con Docker | Media | **Completado** | Bajo | 2 - Corto plazo |
| R-05 | JWT visible en perfil | Baja | **Completado** | Bajo | 3 - Hardening |
| R-06 | Flags de cookie no explicitados | Baja | **Completado** | Bajo | 3 - Hardening |

## 3. Acciones Completadas de la Auditoria Original

| ID | Accion | Estado |
|----|--------|--------|
| V-01 | Corregir Mass Assignment en usuarios | Completado |
| V-02 | Corregir Mass Assignment en categorias | Completado |
| V-03 | Corregir Mass Assignment en productos | Completado |
| V-04 | Validar ruta en descarga de archivos | Completado |
| V-05 | Externalizar secretos en Docker Compose | Completado en working tree |
| V-06 | Agregar rate limiting al login | Completado |
| V-07 | Limitar tamano de uploads | Completado |
| V-08 | No devolver stack trace al cliente | Completado |
| V-09 | Fijar algoritmo JWT | Completado |
| V-10 | Validar login y usuarios | Completado |
| V-11 | Usar nombres aleatorios para archivos | Completado |
| V-12 | Agregar Helmet | Completado |
| V-13 | Agregar `return` en `auth.tiempo` | Completado |
| V-14 | Ejecutar backend Docker como usuario no-root | Completado |
| V-15 | Ocultar Swagger en produccion | Completado, depende de R-04 |
| V-16 | Parametrizar passwords seed | Completado |

## 4. Plan de Implementacion Pendiente

### Fase 1: Cierre Inmediato

1. **R-01 - Reordenar middleware de archivos.**  
   Cambiar `backend/routes/archivos.routes.js` para ejecutar `Authorize('Administrador')` antes de `upload.single("file")`.

   ```javascript
   router.post('/', Authorize('Administrador'), upload.single("file"), archivos.create)
   router.put('/:id', Authorize('Administrador'), upload.single("file"), archivos.update)
   ```

2. **R-02 - Resolver advisories npm.**  
   Revisar `bcrypt`, `@mapbox/node-pre-gyp`, `tar`, `sequelize` y `uuid`. Probar una actualizacion controlada de paquetes y repetir:

   ```bash
   npm audit --omit=dev
   npm test
   ```

   Nota: `npm audit` puede sugerir cambios mayores o downgrades no deseables; validar compatibilidad antes de aceptar fixes automaticos.

### Fase 2: Decisiones de Seguridad Funcional

3. **R-03 - Definir modelo de acceso para archivos.**  
   Si las imagenes son publicas, documentar el riesgo aceptado y considerar IDs no enumerables. Si no son publicas, proteger `GET /api/archivos/:id` con `Authorize('Usuario,Administrador')` y ajustar el frontend para servir imagenes con token.

4. **R-04 - Alinear variables de entorno de produccion.**  
   Opcion recomendada: usar `DB_*` tambien en `production` dentro de `backend/config/config.js`.

   ```javascript
   production: {
       username: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_DATABASE,
       host: process.env.DB_HOST,
       port: process.env.DB_PORT,
       dialect: 'mysql'
   }
   ```

### Fase 3: Hardening del Frontend

5. **R-05 - Ocultar JWT completo del perfil.**  
   Eliminar `Jwt = User.FindFirstValue("jwt")!` del modelo visible o no renderizarlo en `frontend/Views/Perfil/Index.cshtml`.

6. **R-06 - Fijar flags de cookie.**  
   En `frontend/Program.cs`, declarar explicitamente:

   ```csharp
   options.Cookie.HttpOnly = true;
   options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
   options.Cookie.SameSite = SameSiteMode.Lax;
   ```

## 5. Checklist de Validacion

### Validaciones de Controles Ya Implementados

- [ ] Enviar campos extra a `PUT /api/usuarios/:email`; verificar que solo cambian `nombre` y `rolid`.
- [ ] Enviar `protegida:false` a `PUT /api/categorias/:id`; verificar que `protegida` no cambia.
- [ ] Enviar `id:999` a `PUT /api/productos/:id`; verificar que el ID no cambia.
- [ ] Insertar un registro `archivo` con `nombre='../../.env'`; `GET /api/archivos/:id` debe responder 403.
- [ ] Provocar error backend; la respuesta no debe contener `stack`.
- [ ] Hacer 11 intentos de login fallidos; el intento 11 debe recibir 429.
- [ ] Subir JPG mayor a 5 MB; debe rechazarse.
- [ ] Enviar token con algoritmo distinto a HS256; debe rechazarse.
- [ ] Ejecutar `docker exec mercadolibre_backend whoami`; debe responder `node`.
- [ ] Con `NODE_ENV=production`, `/swagger` no debe montarse.

### Validaciones de Pendientes

- [ ] R-01: Hacer `POST /api/archivos` sin token con un JPG valido; no debe quedar archivo nuevo en `uploads/`.
- [ ] R-02: `npm audit --omit=dev` debe quedar sin vulnerabilidades altas.
- [ ] R-03: Confirmar y documentar si `GET /api/archivos/:id` es publico por diseno.
- [ ] R-04: Levantar backend con `NODE_ENV=production`; migraciones, seeders y API deben conectar correctamente a MySQL.
- [ ] R-05: La pantalla de perfil no debe mostrar el JWT completo.
- [ ] R-06: En produccion, la cookie `.frontendnet` debe incluir `HttpOnly`, `Secure` y `SameSite`.

## 6. Criterio de Cierre

El sistema puede considerarse alineado con los documentos de seguridad cuando:

- Los seis hallazgos pendientes esten corregidos o aceptados formalmente.
- `npm audit --omit=dev` no tenga vulnerabilidades altas explotables en produccion.
- El sistema se haya probado con `NODE_ENV=production`.
- El README o documento operativo indique que `.env` debe generarse localmente y que cualquier secreto previamente expuesto debe rotarse.

## 7. Alineacion con Rubrica del Proyecto Final

La rubrica adjunta en Eminus evalua 50 puntos. El estado actual del proyecto frente a los 10 criterios es:

| Criterio | Maximo | Estado actual estimado | Evidencia / brecha principal |
|----------|--------|------------------------|------------------------------|
| 1. Sustento metodologico | 4 pts | Bajo / no evidenciado | En el repo no se encontro documento Word con metodologia ni fases de desarrollo claramente descritas. |
| 2. Artefacto: Modelado de amenazas | 4 pts | Parcial indirecto / no evidenciado como artefacto | `VULNERABILIDADES.md` identifica riesgos, pero no sustituye un modelado de amenazas completo por componentes, actores, flujos y mitigaciones. |
| 3. Caracteristicas en API REST | 3 pts | Bueno / excelente tecnico | Backend Express separado por rutas, controladores, modelos, metodos HTTP y Swagger. Hay pendientes de hardening, pero REST esta bien cubierto. |
| 4. Caracteristicas en Cliente web | 3 pts | Bueno | ASP.NET MVC usa controladores, modelos, vistas, servicios HTTP y handlers de JWT. Se comunica con API REST. Falta evidencia de mantener estado ante reinicio del API. |
| 5. Uso de servidores | 4 pts | Suficiente en repo / no excelente sin despliegue | Docker Compose separa frontend, backend y BD; no hay evidencia de 3 equipos reales, proxy inverso de produccion, servicios del sistema ni firewall. |
| 6. Funcionalidad | 8 pts | **Completo** | Roles, auth, CRUD, archivos, carrito con checkout, pedidos (listado y detalle). Toda la funcionalidad solicitada implementada. |
| 7. Seguridad | 3 pts | Bueno, casi excelente | Hay validacion, auth, roles, JWT, cookies, bitacora, logs, rate limit, Helmet y no-root en backend. R-01, R-03, R-05, R-06 y R-02 impiden defender "sin huecos de acceso". |
| 8. Pruebas solicitadas | 7 pts | Pendiente de evidencia | Falta ejecutar/documentar las 7 pruebas: validacion cliente, validacion API, secciones privadas, error sin caida, reinicio automatico, refresco JWT, netstat. |
| 9. Entrega oportuna | 8 pts | No evaluable desde codigo | Depende de entrega en Eminus antes del 02/jun/2026 13:00. |
| 10. ZIP, scripts, configuracion y cuentas | 6 pts | Parcial | Hay codigo, Docker Compose y `.env.example`; faltan ZIP final, documento Word, TXT de cuentas y README mas operativo para evaluador. |

### Estimacion cualitativa

Con el estado actual del repo, el proyecto se ve fuerte en API, cliente web y seguridad base, pero pierde terreno en documentacion formal, modelado de amenazas, despliegue productivo, evidencia de pruebas y funcionalidad incompleta de carrito/pedidos.

### Evidencia recomendada para Seguridad

- Captura o salida de validacion frontend rechazando entradas invalidas.
- Captura o salida de API rechazando entradas invalidas sin usar el cliente.
- Prueba de rutas privadas sin token y con rol incorrecto.
- Prueba de error forzado confirmando que el API responde sin caerse y sin exponer stack trace.
- Prueba de refresco de JWT con header `Set-Authorization`.
- Evidencia de `docker exec mercadolibre_backend whoami` devolviendo `node`.
- Evidencia de `npm audit --omit=dev` despues de resolver R-02 o justificacion tecnica si se acepta riesgo residual.
- Evidencia de bitacora y log de errores.

### Ajustes prioritarios para maximizar el criterio 7

1. Corregir R-01 para que ninguna subida ocurra antes de autenticar y autorizar.
2. Corregir R-05 para no mostrar JWT completo en la pantalla de perfil.
3. Corregir R-06 para declarar flags de cookie explicitamente.
4. Alinear R-04 y probar `NODE_ENV=production`; esto tambien respalda que Swagger no se exponga.
5. Decidir R-03: documentar archivos como publicos por diseno o proteger el endpoint.

### Pendientes para otros criterios de la rubrica

- **Criterios 1 y 2:** crear `EquipoNo_ProyectoFinal.docx` con metodologia de desarrollo y modelado de amenazas. El modelado debe cubrir frontend, backend, base de datos, autenticacion, autorizacion, uploads, bitacora, despliegue y secretos.
- **Criterio 5:** documentar o implementar el despliegue de produccion: equipos/servidores, proxy inverso, ejecucion como servicios, firewall y puertos expuestos.
- **Criterio 6:** completar o justificar carrito de compras y listado de pedidos. Actualmente `CarritoController` y su vista muestran 0 elementos, y no se observo modulo de pedidos.
- **Criterio 8:** preparar una carpeta de evidencias con capturas o salidas de consola de las 7 pruebas solicitadas.
- **Criterio 10:** preparar ZIP de codigo, documento Word, TXT de cuentas de acceso y README con pasos reproducibles de instalacion, ejecucion y prueba.
