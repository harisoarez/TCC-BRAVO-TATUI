const express = require("express");
const router = express.Router();

const paginaUsuarioController = require("../controllers/paginaUsuarioController");
const verificarSessao = require("../middleware/verificarSessao");

router.use(verificarSessao);

router.get("/", paginaUsuarioController.paginaListarUsuarios);
router.post("/aluno/:idaluno/desconto", paginaUsuarioController.atribuirDesconto);
router.post("/aluno/:idaluno/curso", paginaUsuarioController.alterarCursoAluno);
router.get("/aluno/:idaluno/historico", paginaUsuarioController.obterHistoricoAluno);
router.post("/professor/:idprofessor/especialidade", paginaUsuarioController.alterarEspecialidadeProfessor);

module.exports = router;
