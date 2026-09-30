const express = require("express");
const router = express.Router();
const aulaController = require("../controllers/aulaController");

router.get("/", aulaController.listar);
router.post("/", aulaController.cadastrar);
router.patch("/:id/status", aulaController.moverStatus);
router.put("/:id", aulaController.atualizar);
router.delete("/:id", aulaController.deletar);

module.exports = router;