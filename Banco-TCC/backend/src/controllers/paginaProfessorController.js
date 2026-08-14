const professorModel = require("../models/professorModel");

async function paginaListar(req, res) {
    const professores = await professorModel.buscarTodos();
    res.render("professores/listar", { titulo: "Professores", professores });
}

function paginaFormCadastro(req, res) {
    res.render("professores/form", { titulo: "Novo Professor", professor: null });
}

async function paginaFormEdicao(req, res) {
    const { id } = req.params;
    const professor = await professorModel.buscarPorId(id);

    if (!professor) {
        return res.status(404).send("Professor não encontrado.");
    }

    res.render("professores/form", { titulo: "Editar Professor", professor });
}

module.exports = {
    paginaListar,
    paginaFormCadastro,
    paginaFormEdicao,
};