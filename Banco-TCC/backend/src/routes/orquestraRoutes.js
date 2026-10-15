const express = require("express");
const router = express.Router();

const orquestraController = require("../controllers/orquestraController");
const authMiddleware = require("../middleware/authMiddleware");
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
            mensagem: "Apenas administradores podem modificar o conteúdo da Orquestra."
        });
    }

    next();
}

// Rotas públicas
router.get("/", orquestraController.obterDados);
router.get("/videos", orquestraController.listarVideos);

// Rotas restritas (Admin e Owner)
router.put("/", authMiddleware, exigirAdminOuOwner, orquestraController.atualizarConteudo);
router.post("/videos", authMiddleware, exigirAdminOuOwner, orquestraController.criarVideo);
router.put("/videos/:id", authMiddleware, exigirAdminOuOwner, orquestraController.atualizarVideo);
router.delete("/videos/:id", authMiddleware, exigirAdminOuOwner, orquestraController.excluirVideo);

module.exports = router;
