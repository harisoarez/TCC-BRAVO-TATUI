const express = require("express");
const router = express.Router();

const aulaController = require("../controllers/aulaController");
const authMiddleware = require("../middleware/authMiddleware");
const verificarAdmin = require("../middleware/verificarAdmin");

// Leitura pública/geral: todos os usuários (alunos, professores e visitantes) podem ver a grade
router.get("/", aulaController.listar);

// Ações restritas: apenas administradores podem criar, editar, alterar status e excluir aulas
router.post("/", authMiddleware, verificarAdmin, aulaController.cadastrar);
router.patch("/:id/status", authMiddleware, verificarAdmin, aulaController.moverStatus);
router.put("/:id", authMiddleware, verificarAdmin, aulaController.atualizar);
router.delete("/:id", authMiddleware, verificarAdmin, aulaController.deletar);

module.exports = router;