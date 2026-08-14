const aulaModel = require("../models/aulaModel");
const alunoModel = require("../models/alunoModel");
const professorModel = require("../models/professorModel");

async function paginaKanban(req, res) {
    const aulas = await aulaModel.buscarTodas();
    const souAdmin = req.session.usuario.tipo_usuario === "admin";

    res.render("aulas/kanban", { titulo: "Aulas", aulas, souAdmin });
}

async function paginaFormCadastro(req, res) {
    if (req.session.usuario.tipo_usuario !== "admin") {
        return res.status(403).send("Acesso restrito ao administrador.");
    }

    const alunos = await alunoModel.buscarTodos();
    const professores = await professorModel.buscarTodos();

    res.render("aulas/form", {
        titulo: "Nova Aula",
        alunos,
        professores,
        salas: [1, 2, 3, 4],
    });
}

module.exports = {
    paginaKanban,
    paginaFormCadastro,
};