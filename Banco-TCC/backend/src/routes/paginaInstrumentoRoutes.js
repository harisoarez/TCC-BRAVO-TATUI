const express = require("express");
const router = express.Router();

const paginaInstrumentoController = require("../controllers/paginaInstrumentoController");
const verificarSessao = require("../middleware/verificarSessao");
const uploadInstrumento = require("../config/multerInstrumento");

router.use(verificarSessao);

// Wrapper para tratamento de upload no SSR
function tratarUpload(req, res, next) {
    uploadInstrumento.single("imagem")(req, res, function (err) {
        if (err) {
            console.error("Erro no upload da foto do instrumento:", err);
            return res.redirect("/paginas/instrumentos?erro=" + encodeURIComponent(err.message || "Erro no envio da imagem."));
        }
        next();
    });
}

// Visualização da tabela e gestão de instrumentos
router.get("/", paginaInstrumentoController.paginaInstrumentos);

// Ações do formulário
router.post("/criar", tratarUpload, paginaInstrumentoController.criarInstrumento);
router.post("/editar/:id", tratarUpload, paginaInstrumentoController.atualizarInstrumento);
router.post("/status/:id", paginaInstrumentoController.alternarStatus);
router.get("/status/:id", paginaInstrumentoController.alternarStatus);
router.post("/excluir/:id", paginaInstrumentoController.excluirInstrumento);

module.exports = router;
