const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authFirebase = require("../middleware/authFirebase");
const verificarPrimeiroAcesso = require("../middleware/verificarPrimeiroAcesso");
const verificarAdmin = require("../middleware/verificarAdmin");

router.get("/", authFirebase, verificarPrimeiroAcesso, verificarAdmin, dashboardController.resumo);

module.exports = router;