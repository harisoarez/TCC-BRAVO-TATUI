const aulaModel = require("../models/aulaModel");
const alunoModel = require("../models/alunoModel");
const professorModel = require("../models/professorModel");

async function paginaKanban(req, res) {
    const aulas = await aulaModel.buscarTodas();
    const tipo = req.session?.usuario?.tipo_usuario;
    const souAdmin = tipo === "admin" || tipo === "owner";

    res.render("aulas/kanban", { titulo: "Aulas", aulas, souAdmin });
}

async function paginaFormCadastro(req, res) {
    const tipo = req.session?.usuario?.tipo_usuario;
    if (tipo !== "admin" && tipo !== "owner") {
        return res.status(403).send("Acesso restrito à administração.");
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