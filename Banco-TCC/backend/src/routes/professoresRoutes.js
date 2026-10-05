const express = require("express");
const router = express.Router();

const professorController = require("../controllers/professorController");
const authMiddleware = require("../middleware/authMiddleware");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

// Listagem e consulta de professores
router.get("/", professorController.listar);
router.get("/:id", professorController.buscarPorId);

// Apenas administradores podem cadastrar, alterar e remover professores
router.post("/", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, professorController.cadastrar);
router.put("/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, professorController.atualizar);
router.delete("/:id", authMiddleware, verificarPrimeiroAcesso, verificarAdmin, professorController.deletar);

module.exports = router;