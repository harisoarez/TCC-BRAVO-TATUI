const express = require("express");
const router = express.Router();

const paginaProfessorController = require("../controllers/paginaProfessorController");
const verificarSessao = require("../middleware/verificarSessao");

router.use(verificarSessao);

// Regra Rígida do Usuário: Administradores só podem ver o Dashboard. As outras abas são exclusivas do Owner!
router.use((req, res, next) => {
    const tipo = (req.session?.usuario?.tipo_usuario || "").toLowerCase();
    if (tipo !== "owner") {
        const { gerarHtmlAcessoRestrito } = require("../utils/renderAcessoRestrito");
        return res.status(403).send(
            gerarHtmlAcessoRestrito({
                tipo: "permissao_insuficiente",
                usuario: req.session?.usuario,
                titulo: "Acesso Exclusivo ao Owner",
                subtitulo: "Permissão de Proprietário Requerida",
                mensagem: "Esta seção é de gerenciamento exclusivo do <strong>Proprietário (Owner)</strong> do Instituto Musical Bravo Tatuí. Administradores possuem acesso apenas ao Dashboard e gestão de mensalidades.",
                urlLogin: "/site/login.html",
                urlInicio: "/paginas/dashboard",
            })
        );
    }
    next();
});

router.get("/", paginaProfessorController.paginaListar);
router.get("/novo", paginaProfessorController.paginaFormCadastro);
router.get("/:id/editar", paginaProfessorController.paginaFormEdicao);

module.exports = router;
