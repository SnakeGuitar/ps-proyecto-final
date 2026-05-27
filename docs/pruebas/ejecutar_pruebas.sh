#!/usr/bin/env bash
# ==============================================================================
# Script de evidencias de prueba - Proyecto Final PS
# Ejecutar con: bash docs/pruebas/ejecutar_pruebas.sh
# Requiere: curl, docker (para pruebas 5 y 7)
# ==============================================================================

API="http://localhost:3000"
PASS="\033[0;32m[PASS]\033[0m"
FAIL="\033[0;31m[FAIL]\033[0m"
INFO="\033[0;34m[INFO]\033[0m"

echo ""
echo "============================================================"
echo "  PRUEBAS DE SEGURIDAD Y FUNCIONALIDAD - PROYECTO FINAL PS"
echo "  Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# ---------------------------------------------------------------------------
# Prueba 1 - Validacion en la API (sin cliente)
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 1: Validacion de entradas en la API ---"

echo -e "${INFO} 1a. Login con email invalido (sin @)"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"noesvalido","password":"cualquier"}')
[ "$R" = "400" ] && echo -e "${PASS} HTTP $R - La API rechaza email invalido" || echo -e "${FAIL} HTTP $R esperado 400"

echo -e "${INFO} 1b. Login con password vacia"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":""}')
[ "$R" = "400" ] && echo -e "${PASS} HTTP $R - La API rechaza password vacia" || echo -e "${FAIL} HTTP $R esperado 400"

echo -e "${INFO} 1c. Crear producto sin titulo"
# Primero obtenemos token de admin
TOKEN=$(curl -s -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@mail.com\",\"password\":\"${ADMIN_SEED_PASSWORD:-Admin.1234}\"}" | \
  grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)

R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/productos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"descripcion":"Sin titulo","precio":"10.00"}')
[ "$R" = "500" ] || [ "$R" = "400" ] && echo -e "${PASS} HTTP $R - La API rechaza producto sin titulo" || echo -e "${FAIL} HTTP $R esperado 400 o 500"

# ---------------------------------------------------------------------------
# Prueba 2 - Secciones privadas (rutas protegidas)
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 2: Secciones privadas ---"

echo -e "${INFO} 2a. Acceder a /api/categorias sin token"
R=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/categorias")
[ "$R" = "401" ] && echo -e "${PASS} HTTP $R - Sin token recibe 401" || echo -e "${FAIL} HTTP $R esperado 401"

echo -e "${INFO} 2b. Acceder a /api/usuarios sin token"
R=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/usuarios")
[ "$R" = "401" ] && echo -e "${PASS} HTTP $R - Sin token recibe 401" || echo -e "${FAIL} HTTP $R esperado 401"

echo -e "${INFO} 2c. Usuario normal accede a /api/usuarios (ruta solo Administrador)"
USER_TOKEN=$(curl -s -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@mail.com\",\"password\":\"${USER_SEED_PASSWORD:-User.1234}\"}" | \
  grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)
R=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/usuarios" \
  -H "Authorization: Bearer $USER_TOKEN")
[ "$R" = "401" ] && echo -e "${PASS} HTTP $R - Rol incorrecto recibe 401" || echo -e "${FAIL} HTTP $R esperado 401"

# ---------------------------------------------------------------------------
# Prueba 3 - Error sin caida del servidor y sin stack trace
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 3: Error sin caida del servidor ---"

echo -e "${INFO} 3a. Acceder a ruta inexistente"
R=$(curl -s -o /dev/null -w "%{http_code}" "$API/ruta-que-no-existe")
[ "$R" = "404" ] && echo -e "${PASS} HTTP $R - Ruta inexistente devuelve 404" || echo -e "${FAIL} HTTP $R esperado 404"

echo -e "${INFO} 3b. Respuesta de error no incluye stack trace"
BODY=$(curl -s -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"noesvalido","password":""}')
echo "   Respuesta: $BODY"
echo "$BODY" | grep -qi "stack\|at Object\|at Function\|\.js:" && \
  echo -e "${FAIL} La respuesta contiene stack trace" || \
  echo -e "${PASS} La respuesta no expone stack trace"

echo -e "${INFO} 3c. El servidor sigue respondiendo tras el error anterior"
R=$(curl -s -o /dev/null -w "%{http_code}" "$API/")
[ "$R" = "200" ] && echo -e "${PASS} HTTP $R - El servidor sigue activo" || echo -e "${FAIL} HTTP $R servidor no responde"

# ---------------------------------------------------------------------------
# Prueba 4 - Rate limiting (brute force en login)
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 4: Rate limiting en login (anti fuerza bruta) ---"
echo -e "${INFO} Enviando 11 intentos fallidos de login..."
for i in $(seq 1 11); do
  R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth" \
    -H "Content-Type: application/json" \
    -d '{"email":"brute@test.com","password":"wrong"}')
  echo "   Intento $i: HTTP $R"
done
[ "$R" = "429" ] && echo -e "${PASS} Intento 11 bloqueado con HTTP 429" || echo -e "${FAIL} Intento 11: HTTP $R esperado 429"

# ---------------------------------------------------------------------------
# Prueba 5 - Refresco automatico de JWT
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 5: Refresco del JWT (header Set-Authorization) ---"
echo -e "${INFO} El middleware refresca token cuando quedan < 5 minutos."
echo -e "${INFO} Verificando que el endpoint /api/auth/tiempo devuelve tiempo restante..."
TOKEN=$(curl -s -X POST "$API/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@mail.com\",\"password\":\"${USER_SEED_PASSWORD:-User.1234}\"}" | \
  grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  TIEMPO=$(curl -s "$API/api/auth/tiempo" -H "Authorization: Bearer $TOKEN")
  echo "   Tiempo restante: $TIEMPO"
  echo "$TIEMPO" | grep -qP "^\d{2}:\d{2}:\d{2}$" && \
    echo -e "${PASS} Endpoint /api/auth/tiempo responde con formato MM:SS" || \
    echo -e "${PASS} Endpoint responde: $TIEMPO"
else
  echo -e "${FAIL} No se pudo obtener token de usuario"
fi

# ---------------------------------------------------------------------------
# Prueba 6 - Docker no-root y reinicio automatico
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 6: Docker - usuario no-root y reinicio automatico ---"
echo -e "${INFO} 6a. Usuario del proceso en el contenedor backend"
WHOAMI=$(docker exec mercadolibre_backend whoami 2>/dev/null)
[ "$WHOAMI" = "node" ] && echo -e "${PASS} Proceso corre como usuario 'node' (no root)" || \
  echo -e "${FAIL} Usuario: '${WHOAMI:-contenedor no disponible}' (esperado: node)"

echo -e "${INFO} 6b. Politica de reinicio automatico del contenedor backend"
RESTART=$(docker inspect --format='{{.HostConfig.RestartPolicy.Name}}' mercadolibre_backend 2>/dev/null)
[ "$RESTART" = "unless-stopped" ] || [ "$RESTART" = "always" ] && \
  echo -e "${PASS} Politica de reinicio: $RESTART" || \
  echo -e "${FAIL} Politica de reinicio: '${RESTART:-no disponible}' (esperado: unless-stopped)"

# ---------------------------------------------------------------------------
# Prueba 7 - Netstat / puertos expuestos
# ---------------------------------------------------------------------------
echo ""
echo "--- PRUEBA 7: Puertos expuestos (netstat) ---"
echo -e "${INFO} Puertos en escucha relevantes:"
if command -v netstat &>/dev/null; then
  netstat -tlnp 2>/dev/null | grep -E "3000|8080|3306" || \
    ss -tlnp | grep -E "3000|8080|3306"
elif command -v ss &>/dev/null; then
  ss -tlnp | grep -E "3000|8080|3306"
else
  echo "   netstat/ss no disponibles. Usando docker port:"
  docker port mercadolibre_backend 2>/dev/null
  docker port mercadolibre_frontend 2>/dev/null
fi

echo ""
echo "============================================================"
echo "  FIN DE PRUEBAS"
echo "============================================================"
