const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middleware/authMiddleware");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

// Todas as rotas de usuários exigem autenticação e primeiro acesso concluído
router.use(authMiddleware, verificarPrimeiroAcesso);

// Criar conta (Owner e Admin têm regras no controller)
router.post("/criar-conta", verificarAdmin, usuarioController.criarConta);

// Listar contas para administração
router.get("/", verificarAdmin, usuarioController.listarContas);

// Alterar cargo (exclusivo do Owner)
router.patch("/:id/cargo", verificarAdmin, usuarioController.alterarCargo);

// Deletar conta (Owner pode deletar qualquer um exceto ele mesmo; Admin só normais)
router.delete("/:id", verificarAdmin, usuarioController.deletarConta);

// Atualizar perfil (foto e descrição - acessível a qualquer usuário autenticado)
const uploadPerfil = require("../config/multerPerfil");
router.post(
    "/perfil",
    (req, res, next) => {
        uploadPerfil.single("foto")(req, res, function (err) {
            if (err) {
                console.error("Erro no upload da foto de perfil:", err);
                return res.status(400).json({ sucesso: false, mensagem: err.message || "Erro no processamento da imagem." });
            }
            next();
        });
    },
    usuarioController.atualizarPerfil
);

module.exports = router;
