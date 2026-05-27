const router = require('express').Router()
const carrito = require('../controllers/carrito.controller')
const Authorize = require('../middlewares/auth.middleware')

// GET: api/carrito
router.get('/', Authorize('Usuario'), carrito.getAll)

// POST: api/carrito
router.post('/', Authorize('Usuario'), carrito.carritoItemValidator, carrito.add)

// POST: api/carrito/checkout
router.post('/checkout', Authorize('Usuario'), carrito.checkout)

// PUT: api/carrito/:id
router.put('/:id', Authorize('Usuario'), carrito.update)

// DELETE: api/carrito/:id
router.delete('/:id', Authorize('Usuario'), carrito.remove)

module.exports = router
