const express = require("express");
const router = express.Router();

const financeiroController = require("../controllers/financeiroController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

router.post("/recebimentos", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.cadastrarRecebimento);
router.get("/recebimentos", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.listarRecebimentos);
router.get("/recebimentos/meus", authFirebase, verificarPrimeiroAcesso, financeiroController.listarMeusRecebimentos);
router.patch("/recebimentos/:id/pagar", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.marcarRecebimentoComoPago);
router.delete("/recebimentos/:id", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.excluirRecebimento);

router.post("/pagamentos", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.cadastrarPagamento);
router.get("/pagamentos", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.listarPagamentos);
router.get("/pagamentos/meus", authFirebase, verificarPrimeiroAcesso, financeiroController.listarMeusPagamentos);
router.patch("/pagamentos/:id/pagar", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.marcarPagamentoComoPago);
router.delete("/pagamentos/:id", authFirebase, verificarPrimeiroAcesso, verificarAdmin, financeiroController.excluirPagamento);

module.exports = router;