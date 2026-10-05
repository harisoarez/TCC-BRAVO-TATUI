const express = require("express");
const router = express.Router();

const paginaMatriculaController = require("../controllers/paginaMatriculaController");
const verificarSessao = require("../middleware/verificarSessao");
const uploadComprovante = require("../config/multerUpload");

router.use(verificarSessao);

router.get("/", paginaMatriculaController.paginaMatricula);
router.post(
    "/enviar-comprovante",
    (req, res, next) => {
        uploadComprovante.single("comprovante")(req, res, function (err) {
            if (err) {
                console.error("Erro no upload do comprovante (matrícula):", err);
                return res.status(400).json({ sucesso: false, mensagem: err.message || "Erro no processamento do comprovante." });
            }
            next();
        });
    },
    paginaMatriculaController.enviarComprovante
);

module.exports = router;
