const express = require("express");
const router = express.Router();

const instrumentoController = require("../controllers/instrumentoController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadInstrumento = require("../config/multerInstrumento");
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
            mensagem: "Apenas administradores podem modificar os instrumentos."
        });
    }

    next();
}

// Wrapper para tratamento de upload de imagem
function tratarUploadImagem(req, res, next) {
    uploadInstrumento.single("imagem")(req, res, function (err) {
        if (err) {
            console.error("Erro no upload de foto do instrumento:", err);
            return res.status(400).json({
                sucesso: false,
                mensagem: err.message || "Erro no processamento da imagem enviada."
            });
        }
        next();
    });
}

// Rotas administrativas (Admin e Owner)
router.get("/estatisticas", authMiddleware, exigirAdminOuOwner, instrumentoController.obterEstatisticas);

// Rotas públicas
router.get("/", instrumentoController.listar);
router.get("/categorias", instrumentoController.listarCategorias);

// Obter detalhes de um instrumento por ID
router.get("/item/:id", instrumentoController.obterPorId);
router.get("/:id", instrumentoController.obterPorId);

// Criar novo instrumento
router.post("/", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, instrumentoController.criar);

// Atualizar instrumento existente
router.put("/:id", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, instrumentoController.atualizar);
router.post("/:id", authMiddleware, exigirAdminOuOwner, tratarUploadImagem, instrumentoController.atualizar);

// Alternar status (ativo, aulas, eventos)
router.patch("/:id/status", authMiddleware, exigirAdminOuOwner, instrumentoController.alternarStatus);

// Excluir instrumento
router.delete("/:id", authMiddleware, exigirAdminOuOwner, instrumentoController.excluir);

module.exports = router;
