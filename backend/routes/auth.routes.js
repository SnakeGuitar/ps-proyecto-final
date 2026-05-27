const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const Authorize = require('../middlewares/auth.middleware')
const rateLimit = require('express-rate-limit')

// V-06: Limitar intentos de login a 10 por IP cada 15 minutos (anti fuerza bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { mensaje: 'Demasiados intentos de inicio de sesion. Intente de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// POST: api/auth
router.post('/', loginLimiter, auth.loginValidator, auth.login)

// GET: api/auth/tiempo
router.get('/tiempo', Authorize('Usuario,Administrador'), auth.tiempo)

module.exports = router
