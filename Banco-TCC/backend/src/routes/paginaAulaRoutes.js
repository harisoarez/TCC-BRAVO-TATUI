const express = require("express");
const router = express.Router();

const paginaAulaController = require("../controllers/paginaAulaController");
const verificarSessao = require("../middleware/verificarSessao");

router.use(verificarSessao);

router.get("/", paginaAulaController.paginaKanban);
router.get("/novo", paginaAulaController.paginaFormCadastro);

module.exports = router;