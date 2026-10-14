const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");

// Limiter para tentativas de login (proteção contra força bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 tentativas por IP a cada 15 min
    message: {
        sucesso: false,
        mensagem: "Muitas tentativas de login consecutivas. Por favor, aguarde alguns minutos e tente novamente.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter para recuperação de senha (proteção contra spam de e-mails / DoS)
const recuperacaoLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 solicitações por IP a cada hora
    message: {
        sucesso: false,
        mensagem: "Limite de solicitações de recuperação de senha excedido. Tente novamente mais tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rota pública de login com proteção contra brute-force
router.post("/login", loginLimiter, loginController.login);

// Rota autenticada para troca de senha no primeiro acesso
router.post(
    "/login/primeiro-acesso",
    authMiddleware,
    loginController.trocarSenhaPrimeiroAcesso
);

// Rota de logout irrestrita (destrói sessão e limpa cookies)
router.all("/logout", loginController.logout);

// Rota de solicitação de recuperação de senha protegida contra spam
router.post("/login/recuperar-senha", recuperacaoLimiter, loginController.solicitarRecuperacaoSenha);

module.exports = router;