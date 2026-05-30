const router = require('express').Router()
const archivos = require('../controllers/archivos.controller')
const Authorize = require('../middlewares/auth.middleware')
const { uploadFile, validateMagicBytes } = require("../middlewares/upload.middleware")

// GET: api/archivos
router.get('/', Authorize('Administrador'), archivos.getAll)

// GET: api/archivos/5
router.get('/:id', archivos.get)

// GET: api/archivos/5/detalle
router.get('/:id/detalle', Authorize('Administrador'), archivos.getDetalle)

// POST: api/archivos
// R-01: Authorize antes de upload para no guardar archivos de solicitudes no autenticadas
// V-17: validateMagicBytes verifica contenido real del archivo tras el guardado
router.post('/', Authorize('Administrador'), uploadFile.single("file"), validateMagicBytes, archivos.create)

// PUT: api/archivos/5
router.put('/:id', Authorize('Administrador'), uploadFile.single("file"), validateMagicBytes, archivos.update)

// DELETE: api/archivos/5
router.delete('/:id', Authorize('Administrador'), archivos.delete)

module.exports = router
