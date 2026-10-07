const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");

// Rota pública de login (retorna JWT e dados do usuário)
router.post("/login", loginController.login);

// Rota autenticada para troca de senha no primeiro acesso
router.post(
    "/login/primeiro-acesso",
    authMiddleware,
    loginController.trocarSenhaPrimeiroAcesso
);

// Rota de logout irrestrita (destrói sessão e limpa cookies)
router.all("/logout", loginController.logout);

// Rota de solicitação de recuperação de senha
router.post("/login/recuperar-senha", loginController.solicitarRecuperacaoSenha);

module.exports = router;