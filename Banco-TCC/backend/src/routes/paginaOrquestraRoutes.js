const express = require("express");
const router = express.Router();

const paginaOrquestraController = require("../controllers/paginaOrquestraController");
const verificarSessao = require("../middleware/verificarSessao");
const { ehAdmin } = require("../utils/admin");

router.use(verificarSessao);

function exigirAdmin(req, res, next) {
    const usuario = req.session?.usuario || res.locals?.usuario || req.user;
    if (!usuario || !ehAdmin(usuario)) {
        const { gerarHtmlAcessoRestrito } = require("../utils/renderAcessoRestrito");
        return res.status(403).send(
            gerarHtmlAcessoRestrito({
                tipo: "permissao_insuficiente",
                usuario,
                titulo: "Acesso Restrito",
                subtitulo: "Permissão de Administração Requerida",
                mensagem: "Apenas administradores e o Owner podem gerenciar a Orquestra.",
                urlLogin: "/site/login.html",
                urlInicio: "/site/orquestra.html",
            })
        );
    }
    next();
}

// Visualização do painel da orquestra
router.get("/", paginaOrquestraController.paginaOrquestra);

// Ações do formulário administrativo
router.post("/salvar", exigirAdmin, paginaOrquestraController.salvarConteudo);
router.post("/videos/criar", exigirAdmin, paginaOrquestraController.criarVideo);
router.post("/videos/editar/:id", exigirAdmin, paginaOrquestraController.atualizarVideo);
router.post("/videos/excluir/:id", exigirAdmin, paginaOrquestraController.excluirVideo);

module.exports = router;
