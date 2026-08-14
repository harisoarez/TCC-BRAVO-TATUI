const express = require("express");
const router = express.Router();

const professorController = require("../controllers/professorController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");

router.post("/", authFirebase, verificarPrimeiroAcesso, professorController.cadastrar);
router.get("/", authFirebase, verificarPrimeiroAcesso, professorController.listar);
router.get("/:id", authFirebase, verificarPrimeiroAcesso, professorController.buscarPorId);
router.put("/:id", authFirebase, verificarPrimeiroAcesso, professorController.atualizar);
router.delete("/:id", authFirebase, verificarPrimeiroAcesso, professorController.deletar);

module.exports = router;