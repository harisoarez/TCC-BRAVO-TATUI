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

// Visualização da tabela e gestão do cardápio
router.get("/", paginaCardapioController.paginaCardapio);

// Ações do formulário
router.post("/criar", tratarUpload, paginaCardapioController.criarItem);
router.post("/editar/:id", tratarUpload, paginaCardapioController.atualizarItem);
router.post("/status/:id", paginaCardapioController.alternarStatus);
router.post("/excluir/:id", paginaCardapioController.excluirItem);

module.exports = router;
