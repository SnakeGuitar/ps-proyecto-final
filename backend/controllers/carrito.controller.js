const { carrito_item, pedido, pedido_item, producto, sequelize } = require('../models')
const { body, validationResult } = require('express-validator')
const ClaimTypes = require('../config/claimtypes')

let self = {}

self.carritoItemValidator = [
    body('productoid', 'El campo {0} es obligatorio').not().isEmpty().isInt({ min: 1 }),
    body('cantidad', 'El campo {0} debe ser un entero mayor a 0').optional().isInt({ min: 1 }),
]

// GET: api/carrito
self.getAll = async function (req, res, next) {
    try {
        const email = req.decodedToken[ClaimTypes.Name]
        let data = await carrito_item.findAll({
            where: { usuarioemail: email },
            attributes: [['id', 'carritoItemId'], 'productoid', 'cantidad', 'precio'],
            include: {
                model: producto,
                attributes: [['id', 'productoId'], 'titulo', 'archivoid']
            }
        })
        return res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

// POST: api/carrito
self.add = async function (req, res, next) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw new Error(JSON.stringify(errors))

        const email = req.decodedToken[ClaimTypes.Name]
        const { productoid, cantidad } = req.body
        const cant = cantidad || 1

        // Verifica que el producto exista
        const prod = await producto.findByPk(productoid)
        if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' })

        // Si ya existe en el carrito, incrementa cantidad
        let item = await carrito_item.findOne({ where: { usuarioemail: email, productoid } })
        if (item) {
            item.cantidad += cant
            await item.save()
        } else {
            item = await carrito_item.create({
                usuarioemail: email,
                productoid,
                cantidad: cant,
                precio: prod.precio
            })
        }
        req.bitacora('carrito.agregar', `${email}:${productoid}`)
        return res.status(201).json(item)
    } catch (error) {
        next(error)
    }
}

// PUT: api/carrito/:id
self.update = async function (req, res, next) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw new Error(JSON.stringify(errors))

        const email = req.decodedToken[ClaimTypes.Name]
        const id = req.params.id
        const { cantidad } = req.body

        if (!cantidad || cantidad < 1)
            return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' })

        const item = await carrito_item.findOne({ where: { id, usuarioemail: email } })
        if (!item) return res.status(404).send()

        item.cantidad = cantidad
        await item.save()
        req.bitacora('carrito.actualizar', `${email}:${id}`)
        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

// DELETE: api/carrito/:id
self.remove = async function (req, res, next) {
    try {
        const email = req.decodedToken[ClaimTypes.Name]
        const id = req.params.id
        const deleted = await carrito_item.destroy({ where: { id, usuarioemail: email } })
        if (deleted === 0) return res.status(404).send()
        req.bitacora('carrito.eliminar', `${email}:${id}`)
        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

// POST: api/carrito/checkout
self.checkout = async function (req, res, next) {
    const t = await sequelize.transaction()
    try {
        const email = req.decodedToken[ClaimTypes.Name]
        const items = await carrito_item.findAll({
            where: { usuarioemail: email },
            include: { model: producto, attributes: ['titulo', 'precio'] }
        })

        if (items.length === 0)
            return res.status(400).json({ mensaje: 'El carrito esta vacio' })

        const total = items.reduce((sum, i) => sum + parseFloat(i.precio) * i.cantidad, 0)

        const nuevoPedido = await pedido.create({
            usuarioemail: email,
            total: total.toFixed(2),
            estado: 'pendiente'
        }, { transaction: t })

        const pedidoItems = items.map(i => ({
            pedidoid: nuevoPedido.id,
            productoid: i.productoid,
            titulo: i.producto.titulo,
            precio: i.precio,
            cantidad: i.cantidad
        }))
        await pedido_item.bulkCreate(pedidoItems, { transaction: t })
        await carrito_item.destroy({ where: { usuarioemail: email }, transaction: t })

        await t.commit()
        req.bitacora('carrito.checkout', `${email}:pedido:${nuevoPedido.id}`)
        return res.status(201).json({ pedidoId: nuevoPedido.id, total: nuevoPedido.total })
    } catch (error) {
        await t.rollback()
        next(error)
    }
}

module.exports = self
