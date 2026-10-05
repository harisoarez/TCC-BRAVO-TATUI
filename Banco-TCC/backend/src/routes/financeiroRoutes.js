const express = require("express");
const router = express.Router();

const financeiroController = require("../controllers/financeiroController");
const authMiddleware = require("../middleware/authMiddleware");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

// Contas a receber (Alunos)
router.post("/recebimentos", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.cadastrarRecebimento);
router.get("/recebimentos", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.listarRecebimentos);
router.get("/recebimentos/meus", authMiddleware, verificarPrimeiroAcesso, financeiroController.listarMeusRecebimentos);
router.patch("/recebimentos/:id/pagar", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.marcarRecebimentoComoPago);
router.delete("/recebimentos/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.excluirRecebimento);

// Contas a pagar (Professores)
router.post("/pagamentos", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.cadastrarPagamento);
router.get("/pagamentos", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.listarPagamentos);
router.get("/pagamentos/meus", authMiddleware, verificarPrimeiroAcesso, financeiroController.listarMeusPagamentos);
router.patch("/pagamentos/:id/pagar", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.marcarPagamentoComoPago);
router.delete("/pagamentos/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, financeiroController.excluirPagamento);

module.exports = router;