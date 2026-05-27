const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

// V-07: Filtro con Error tipado (no string) para consistencia con el error handler
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/jpeg") && file.originalname.toLowerCase().endsWith(".jpg")) {
        cb(null, true);
    } else {
        const err = new Error("Solo se permiten imagenes con extension JPG.");
        err.statusCode = 400;
        cb(err, false);
    }
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
module.exports = uploadFile;
