const express = require("express");
const router = express.Router();

const paginaCardapioController = require("../controllers/paginaCardapioController");
const verificarSessao = require("../middleware/verificarSessao");
const uploadCardapio = require("../config/multerCardapio");

router.use(verificarSessao);

// Wrapper para tratamento de erros de upload
function tratarUpload(req, res, next) {
    uploadCardapio.single("imagem")(req, res, function (err) {
        if (err) {
            console.error("Erro no upload da foto do cardápio:", err);
            return res.redirect("/paginas/cardapio?erro=" + encodeURIComponent(err.message || "Erro no envio da imagem."));
        }
        next();
    });
}

const { ehAdmin } = require("../utils/admin");

// Middleware de autorização para ações administrativas
function exigirAdmin(req, res, next) {
    const usuario = req.session?.usuario || res.locals?.usuario || req.user;
    if (!usuario || !ehAdmin(usuario)) {
        return res.status(403).send("Acesso negado. Apenas administradores podem modificar o cardápio.");
    }
    next();
}

// Visualização da tabela e gestão do cardápio
router.get("/", paginaCardapioController.paginaCardapio);

// Ações do formulário (Restritas a Administradores e Owner)
router.post("/criar", exigirAdmin, tratarUpload, paginaCardapioController.criarItem);
router.post("/editar/:id", exigirAdmin, tratarUpload, paginaCardapioController.atualizarItem);
router.post("/status/:id", exigirAdmin, paginaCardapioController.alternarStatus);
router.post("/excluir/:id", exigirAdmin, paginaCardapioController.excluirItem);

module.exports = router;
