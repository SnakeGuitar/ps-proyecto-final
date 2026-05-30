const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// V-07: Filtro con Error tipado (no string) para consistencia con el error handler
// Verifica MIME y extensión declarados (primera línea de defensa)
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/jpeg") && file.originalname.toLowerCase().endsWith(".jpg")) {
        cb(null, true);
    } else {
        const err = new Error("Solo se permiten imagenes con extension JPG.");
        err.statusCode = 400;
        cb(err, false);
    }
};

// V-17: Valida los magic bytes del archivo ya guardado en disco.
// El filtro anterior solo verifica headers controlados por el cliente;
// esta función verifica el contenido real del archivo (FF D8 FF = JPEG).
const validateMagicBytes = (req, res, next) => {
    if (!req.file) return next();

    const JPEG_MAGIC = [0xFF, 0xD8, 0xFF];
    try {
        const absolutePath = path.resolve(req.file.path);
        const buf = fs.readFileSync(absolutePath).slice(0, 3);
        const isJpeg = buf.length >= 3 && JPEG_MAGIC.every((byte, i) => buf[i] === byte);
        if (!isJpeg) {
            fs.unlinkSync(absolutePath); // eliminar archivo no válido del disco
            const err = new Error("El archivo no es una imagen JPEG válida.");
            err.statusCode = 400;
            return next(err);
        }
    } catch (e) {
        // Si no se puede leer el archivo, rechazar por seguridad
        try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch {}
        const err = new Error("No se pudo validar el archivo subido.");
        err.statusCode = 500;
        return next(err);
    }
    next();
};

// se configura el almacenamiento para los archivos subidos
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    // V-11: Nombre aleatorio para evitar path traversal y colisiones
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
        cb(null, uniqueName);
    },
});

// Se crea la instancia de multer
// V-07: Limite de 5 MB para prevenir DoS por agotamiento de disco
var uploadFile = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
module.exports = { uploadFile, validateMagicBytes };
