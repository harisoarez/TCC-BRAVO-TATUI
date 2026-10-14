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

const { ehAdmin } = require("../utils/admin");

// Middleware de autorização para ações administrativas
function exigirAdmin(req, res, next) {
    const usuario = req.session?.usuario || res.locals?.usuario || req.user;
    if (!usuario || !ehAdmin(usuario)) {
        return res.status(403).send("Acesso negado. Apenas administradores podem modificar instrumentos.");
    }
    next();
}

// Visualização da tabela e gestão de instrumentos
router.get("/", paginaInstrumentoController.paginaInstrumentos);

// Ações do formulário (Restritas a Administradores e Owner)
router.post("/criar", exigirAdmin, tratarUpload, paginaInstrumentoController.criarInstrumento);
router.post("/editar/:id", exigirAdmin, tratarUpload, paginaInstrumentoController.atualizarInstrumento);
router.post("/status/:id", exigirAdmin, paginaInstrumentoController.alternarStatus);
router.post("/excluir/:id", exigirAdmin, paginaInstrumentoController.excluirInstrumento);

module.exports = router;
