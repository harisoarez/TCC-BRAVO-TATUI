const express = require("express");
const router = express.Router();

const paginaDashboardController = require("../controllers/paginaDashboardController");
const verificarSessao = require("../middleware/verificarSessao");
const uploadComprovante = require("../config/multerUpload");

router.use(verificarSessao);

router.get("/", paginaDashboardController.paginaDashboard);

router.post(
    "/registrar-pagamento",
    (req, res, next) => {
        uploadComprovante.single("comprovante")(req, res, function (err) {
            if (err) {
                console.error("Erro no upload do comprovante:", err);
                return res.status(400).json({ sucesso: false, mensagem: err.message || "Erro no processamento do comprovante." });
            }
            next();
        });
    },
    paginaDashboardController.registrarPagamento
);

router.post(
    "/curso/atualizar",
    paginaDashboardController.atualizarValorCurso
);

router.post(
    "/confirmar-comprovante",
    paginaDashboardController.confirmarComprovante
);

module.exports = router;