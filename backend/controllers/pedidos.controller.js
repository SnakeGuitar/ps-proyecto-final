const { pedido, pedido_item } = require('../models')
const ClaimTypes = require('../config/claimtypes')

let self = {}

// GET: api/pedidos
self.getAll = async function (req, res, next) {
    try {
        const email = req.decodedToken[ClaimTypes.Name]
        const rol = req.decodedToken[ClaimTypes.Role]

        // Administrador ve todos los pedidos; Usuario ve solo los suyos
        const where = rol === 'Administrador' ? {} : { usuarioemail: email }

        let data = await pedido.findAll({
            where,
            attributes: [['id', 'pedidoId'], 'usuarioemail', 'total', 'estado', 'createdAt'],
            order: [['id', 'DESC']]
        })
        return res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

// GET: api/pedidos/:id
self.get = async function (req, res, next) {
    try {
        const email = req.decodedToken[ClaimTypes.Name]
        const rol = req.decodedToken[ClaimTypes.Role]
        const id = req.params.id

        let data = await pedido.findByPk(id, {
            attributes: [['id', 'pedidoId'], 'usuarioemail', 'total', 'estado', 'createdAt'],
            include: {
                model: pedido_item,
                as: 'items',
                attributes: [['id', 'pedidoItemId'], 'productoid', 'titulo', 'precio', 'cantidad']
            }
        })

        if (!data) return res.status(404).send()

        // Usuario solo puede ver sus propios pedidos
        if (rol !== 'Administrador' && data.usuarioemail !== email)
            return res.status(403).send()

        return res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

module.exports = self
