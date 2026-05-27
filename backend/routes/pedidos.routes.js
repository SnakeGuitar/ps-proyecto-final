const router = require('express').Router()
const pedidos = require('../controllers/pedidos.controller')
const Authorize = require('../middlewares/auth.middleware')

// GET: api/pedidos
router.get('/', Authorize('Usuario,Administrador'), pedidos.getAll)

// GET: api/pedidos/:id
router.get('/:id', Authorize('Usuario,Administrador'), pedidos.get)

module.exports = router
