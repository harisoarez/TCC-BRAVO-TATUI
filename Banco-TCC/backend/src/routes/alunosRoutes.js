const express = require("express");
const router = express.Router();

const alunoController = require("../controllers/alunoController");
const authMiddleware = require("../middleware/authMiddleware");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

router.get("/", authMiddleware, verificarPrimeiroAcesso, alunoController.listar);
router.get("/:id", authMiddleware, verificarPrimeiroAcesso, alunoController.buscarPorId);
router.post("/", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, alunoController.cadastrar);
router.put("/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, alunoController.atualizar);
router.delete("/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, alunoController.deletar);

module.exports = router;