const express = require("express");
const router = express.Router();

const alunoController = require("../controllers/alunoController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");

router.post("/", authFirebase, verificarPrimeiroAcesso, alunoController.cadastrar);
router.get("/", authFirebase, verificarPrimeiroAcesso, alunoController.listar);
router.get("/:id", authFirebase, verificarPrimeiroAcesso, alunoController.buscarPorId);
router.put("/:id", authFirebase, verificarPrimeiroAcesso, alunoController.atualizar);
router.delete("/:id", authFirebase, verificarPrimeiroAcesso, alunoController.deletar);

module.exports = router;