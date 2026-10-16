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
        const { gerarHtmlAcessoRestrito } = require("../utils/renderAcessoRestrito");
        return res.status(403).send(
            gerarHtmlAcessoRestrito({
                tipo: "permissao_insuficiente",
                usuario: req.session?.usuario,
                titulo: "Acesso Restrito",
                subtitulo: "Permissão de Administração Requerida",
                mensagem: "O agendamento e cadastro de aulas é restrito a Administradores e ao Owner.",
                urlLogin: "/site/login.html",
                urlInicio: "/site/index.html",
            })
        );
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