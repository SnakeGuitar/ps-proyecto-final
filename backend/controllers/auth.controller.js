const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { usuario, rol, Sequelize } = require('../models')
const { GeneraToken, TiempoRestanteToken } = require('../services/jwttoken.service')
const { body, validationResult } = require('express-validator')

// V-20: Hash dummy para timing attack protection.
// bcrypt.compare siempre corre (exista o no el usuario) para igualar tiempos
// de respuesta y evitar enumeración de emails por diferencia de latencia.
const DUMMY_HASH = bcrypt.hashSync('dummy_timing_protection_placeholder', 10)

let self = {}

// V-10: Validadores para el login
self.loginValidator = [
    body('email', 'El email no es valido').isEmail().normalizeEmail(),
    body('password', 'La contrasena es obligatoria').not().isEmpty(),
]

// POST: api/auth
self.login = async function (req, res, next) {
    // V-10: Validar entradas antes de consultar la BD
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errores: errors.array() })

    const { email, password } = req.body

    try {
        let data = await usuario.findOne({
            where: { email: email },
            raw: true,
            attributes: ['id', 'email', 'nombre', 'passwordhash', [Sequelize.col('rol.nombre'), 'rol']],
            include: { model: rol, attributes: [] }
        })

        // V-20: Siempre ejecutar bcrypt.compare para igualar tiempos de respuesta
        // (previene timing attack para enumeración de usuarios)
        const hash = data?.passwordhash ?? DUMMY_HASH
        const passwordMatch = await bcrypt.compare(password, hash)
        if (!data || !passwordMatch)
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' })

        // Utilizamos los nombres de Claims estandar
        const token = GeneraToken(data.email, data.nombre, data.rol)

        // Bitacora
        req.bitacora("usuario.login", data.email)

        res.status(200).json({
            email: data.email,
            nombre: data.nombre,
            rol: data.rol,
            jwt: token
        })
    } catch (error) {
        next(error)
    }
}

// V-10: Validadores para el registro
self.registroValidator = [
    body('email', 'El email no es valido').isEmail().normalizeEmail(),
    body('password', 'La contrasena debe tener al menos 8 caracteres').isLength({ min: 8 }),
    body('nombre', 'El nombre es obligatorio').not().isEmpty().trim().escape(),
]

// POST: api/auth/registro
self.registro = async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errores: errors.array() })

    const { email, password, nombre } = req.body

    try {
        const existe = await usuario.findOne({ where: { email } })
        if (existe)
            return res.status(409).json({ mensaje: 'El correo ya está registrado.' })

        const rolUsuario = await rol.findOne({ where: { nombre: 'Usuario' } })
        if (!rolUsuario)
            return res.status(500).json({ mensaje: 'Rol de usuario no encontrado.' })

        const data = await usuario.create({
            id: crypto.randomUUID(),
            email,
            passwordhash: await bcrypt.hash(password, 10),
            nombre,
            rolid: rolUsuario.id
        })

        req.bitacora('usuario.registro', data.email)

        res.status(201).json({
            email: data.email,
            nombre: data.nombre,
            rol: rolUsuario.nombre
        })
    } catch (error) {
        next(error)
    }
}

// GET: api/auth/tiempo
self.tiempo = async function (req, res) {
    const tiempo = TiempoRestanteToken(req)
    // V-13: Agregar return para evitar enviar dos respuestas (ERR_HTTP_HEADERS_SENT)
    if (tiempo == null)
        return res.status(404).send()

    res.status(200).send(tiempo)
}

module.exports = self
