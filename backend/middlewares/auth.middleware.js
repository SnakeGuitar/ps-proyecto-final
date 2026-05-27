const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const ClaimTypes = require('../config/claimtypes')
const { GeneraToken } = require('../services/jwttoken.service')

const Authorize = (rol) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.header('Authorization')
            const error = new Error('Acceso denegado');
            error.statusCode = 401;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(error);
            }

            // Obtiene el token de la solicitud
            const token = authHeader.split(' ')[1]
            // V-09: Especificar algoritmo explicitamente para prevenir confusion de algoritmo
            const decodedToken = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] })

            // Verifica si el rol esta autorizado
            if (rol.split(",").indexOf(decodedToken[ClaimTypes.Role]) == -1)
                return next(error);

            // Si tiene acceso, se permite continuar con el método y se obtienen los datos del usuario
            req.decodedToken = decodedToken

            // Código para enviar un nuevo token
            var minutosRestantes = (decodedToken.exp - (new Date().getTime() / 1000)) / 60;
            //Si quedan 5 minutos, le mandamos un nuevo token
            if (minutosRestantes < 5) {
                var nuevoToken = GeneraToken(decodedToken[ClaimTypes.Name], decodedToken[ClaimTypes.GivenName], decodedToken[ClaimTypes.Role])
                res.header("Set-Authorization", nuevoToken)
            }

            // Continua con el método
            next()
        } catch (error) {
            error.statusCode = 401
            next(error)
        }
    }
}

module.exports = Authorize
