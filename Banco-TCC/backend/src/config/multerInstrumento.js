const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads/instrumentos");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "inst-" + uniqueSuffix + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp|jfif|gif/;
    const extname = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimetype = tiposPermitidos.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Apenas arquivos de imagem (JPG, PNG, WEBP, GIF) são permitidos para fotos de instrumentos."));
    }
};

const uploadInstrumento = multer({
    storage: storage,
    limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
    fileFilter: fileFilter,
});

module.exports = uploadInstrumento;
