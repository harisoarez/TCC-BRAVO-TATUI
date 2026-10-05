const express = require("express");
const router = express.Router();

const paginaProfessorController = require("../controllers/paginaProfessorController");
const verificarSessao = require("../middleware/verificarSessao");

router.use(verificarSessao);

// Regra Rígida do Usuário: Administradores só podem ver o Dashboard. As outras abas são exclusivas do Owner!
router.use((req, res, next) => {
    const tipo = (req.session?.usuario?.tipo_usuario || "").toLowerCase();
    if (tipo !== "owner") {
        return res.status(403).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background: #0b0d13; color: #fff; min-height: 100vh; padding: 40px;">
                <h2 style="color: #ef4444;">Acesso Restrito ao Owner (Proprietário)</h2>
                <p style="color: #94a3b8; font-size: 15px;">Administradores possuem permissão apenas para o Dashboard e gestão de mensalidades.</p>
                <a href="/paginas/dashboard" style="display: inline-block; margin-top: 20px; padding: 10px 22px; background: #F5D696; color: #0d111b; font-weight: bold; text-decoration: none; border-radius: 6px;">← Voltar ao Dashboard</a>
            </div>
        `);
    }
    next();
});

router.get("/", paginaProfessorController.paginaListar);
router.get("/novo", paginaProfessorController.paginaFormCadastro);
router.get("/:id/editar", paginaProfessorController.paginaFormEdicao);

module.exports = router;
