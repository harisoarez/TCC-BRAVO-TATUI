const express = require("express");
const router = express.Router();

const aulaController = require("../controllers/aulaController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

router.get("/", authFirebase, verificarPrimeiroAcesso, aulaController.listar);

router.post("/", authFirebase, verificarPrimeiroAcesso, verificarAdmin, aulaController.cadastrar);
router.patch("/:id/status", authFirebase, verificarPrimeiroAcesso, verificarAdmin, aulaController.moverStatus);
router.put("/:id", authFirebase, verificarPrimeiroAcesso, verificarAdmin, aulaController.atualizar);
router.delete("/:id", authFirebase, verificarPrimeiroAcesso, verificarAdmin, aulaController.deletar);

module.exports = router;