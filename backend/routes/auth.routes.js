const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const Authorize = require('../middlewares/auth.middleware')
const rateLimit = require('express-rate-limit')

// V-06: Limitar intentos de login a 10 por email cada 15 minutos (anti fuerza bruta)
// V-19: keyGenerator usa el email del body en lugar de la IP para evitar que en Docker
//        todos los usuarios del frontend compartan la misma ventana de bloqueo.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.body?.email?.toLowerCase().trim() || req.ip,
    message: { mensaje: 'Demasiados intentos de inicio de sesion. Intente de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// POST: api/auth
router.post('/', loginLimiter, auth.loginValidator, auth.login)

// POST: api/auth/registro
router.post('/registro', auth.registroValidator, auth.registro)

// GET: api/auth/tiempo
router.get('/tiempo', Authorize('Usuario,Administrador'), auth.tiempo)

module.exports = router
