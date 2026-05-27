const fs = require("fs");
const requestIp = require('request-ip');
const ClaimTypes = require('../config/claimtypes')

const errorHandler = (err, req, res, next) => {
    let mensaje = 'No se ha podido procesar la petición. Inténtelo nuevamente más tarde.'
    const statusCode = err.statusCode || 500
    // Obtiene la IP de la petición
    const ip = requestIp.getClientIp(req)

    // Se obtiene el mail del usuario actual
    let email = "Anónimo"
    if (req.decodedToken) {
        email = req.decodedToken[ClaimTypes.Name];
    }
    // V-08: Registrar stack completo SOLO en el servidor, nunca enviarlo al cliente
    fs.appendFile('log/log.txt', new Date() + ` - ${statusCode} - ${ip} - ${email} - ${(err.message || mensaje)} - ${err.stack}\n`, err => {
        if (err) {
            console.error(err);
        }
    });

    // En desarrollo se muestra el mensaje de error pero nunca el stack trace
    if (process.env.NODE_ENV === 'development') {
        mensaje = err.message || mensaje
    }

    res.status(statusCode).json({
        status: statusCode,
        mensaje: mensaje
    })
}

module.exports = errorHandler
