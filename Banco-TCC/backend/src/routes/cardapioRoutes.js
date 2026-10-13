const express = require("express");
const router = express.Router();

const cardapioController = require("../controllers/cardapioController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadCardapio = require("../config/multerCardapio");
const { ehAdmin } = require("../utils/admin");

// Middleware para validar se o usuário é Admin ou Owner
function exigirAdminOuOwner(req, res, next) {
    const usuario = req.user || (req.session && req.session.usuario);
    if (!usuario) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Acesso não autorizado. Por favor, faça login como Administrador."
        });
    }

    if (!ehAdmin(usuario)) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Apenas administradores podem modificar o cardápio."
        });
    }

    next();
}

// Wrapper para tratamento de erros do Multer
function tratarUploadImagem(req, res, next) {
    uploadCardapio.single("imagem")(req, res, function (err) {
        if (err) {
            console.error("Erro no upload de imagem do cardápio:", err);
            return res.status(400).json({
                sucesso: false,
                mensagem: err.message || "Erro no processamento da imagem enviada."
            });
        }
        next();
    });
}

// Rotas públicas
router.get("/", cardapioController.listar);
router.get("/categorias", cardapioController.listarCategorias);
router.get("/item/:id", cardapioController.obterPorId);

// Rotas administrativas (Admin e Owner)
router.get("/estatisticas", authMiddleware, exigirAdminOuOwner, cardapioController.obterEstatisticas);

// Criar novo item no cardápio
router.post("/", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, cardapioController.criar);

// Atualizar item existente no cardápio
router.put("/:id", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, cardapioController.atualizar);
router.post("/:id", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, cardapioController.atualizar);

// Alternar status de disponibilidade (disponível / esgotado)
router.patch("/:id/status", authMiddleware, exigirAdminOuOwner, cardapioController.alternarStatus);

// Excluir item do cardápio
router.delete("/:id", authMiddleware, exigirAdminOuOwner, cardapioController.excluir);

module.exports = router;
