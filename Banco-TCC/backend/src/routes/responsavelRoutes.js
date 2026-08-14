const express = require("express");
const router = express.Router();

const responsavelController = require("../controllers/responsavelController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

router.use(authFirebase, verificarPrimeiroAcesso, verificarAdmin);

router.post("/", responsavelController.cadastrar);
router.get("/", responsavelController.listar);
router.get("/:id", responsavelController.buscarPorId);
router.put("/:id", responsavelController.atualizar);
router.delete("/:id", responsavelController.excluir);

router.post("/:id/vincular", responsavelController.vincularAluno);
router.delete("/:id/vincular/:idaluno", responsavelController.desvincularAluno);

module.exports = router;