const express = require("express");
const router = express.Router();

const paginaDashboardController = require("../controllers/paginaDashboardController");
const verificarSessao = require("../middleware/verificarSessao");

router.use(verificarSessao);

router.get("/", paginaDashboardController.paginaDashboard);

module.exports = router;