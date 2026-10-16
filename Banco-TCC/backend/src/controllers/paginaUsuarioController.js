const dashboardModel = require("../models/dashboardModel");
const instrumentoModel = require("../models/instrumentoModel");
const usuarioController = require("./usuarioController");

async function paginaListarUsuarios(req, res) {
    const usuario = req.session?.usuario;
    const tipo = (usuario?.tipo_usuario || "").toLowerCase();

    if (tipo !== "admin" && tipo !== "owner") {
        const { gerarHtmlAcessoRestrito } = require("../utils/renderAcessoRestrito");
        return res.status(403).send(
            gerarHtmlAcessoRestrito({
                tipo: "permissao_insuficiente",
                usuario,
                titulo: "Acesso Restrito",
                subtitulo: "Permissão de Administração Requerida",
                mensagem: "A gestão de usuários e cadastros é restrita a Administradores e ao Owner.",
                urlLogin: "/site/login.html",
                urlInicio: "/site/index.html",
            })
        );
    }

    const isOwner = tipo === "owner";

    const [administradores, professores, alunos, cursos, instrumentos] = await Promise.all([
        dashboardModel.listarAdministradores(),
        dashboardModel.listarProfessores(),
        dashboardModel.listarAlunosCompletos(),
        dashboardModel.listarCursos(),
        instrumentoModel.listarTodos({ ativo: 1 }),
    ]);

    res.render("usuarios/index", {
        titulo: "Gestão de Usuários",
        usuario,
        isOwner,
        administradores,
        professores,
        alunos,
        cursos,
        instrumentos,
    });
}

// Atribuir desconto em porcentagem para um aluno específico (EXCLUSIVO OWNER)
async function atribuirDesconto(req, res) {
    try {
        const usuario = req.session?.usuario;
        if (!usuario || usuario.tipo_usuario !== "owner") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas o Owner tem autorização para conceder ou alterar descontos de alunos.",
            });
        }

        const { idaluno } = req.params;
        const { desconto } = req.body;

        await dashboardModel.atribuirDescontoAluno(idaluno, desconto);

        return res.json({
            sucesso: true,
            mensagem: `Desconto de ${desconto}% aplicado com sucesso ao aluno!`,
        });
    } catch (err) {
        console.error("Erro ao atribuir desconto:", err);
        return res.status(500).json({ sucesso: false, mensagem: err.message || "Erro ao aplicar desconto." });
    }
}

// Histórico de mensalidades do aluno (Admin e Owner)
async function obterHistoricoAluno(req, res) {
    try {
        const usuario = req.session?.usuario;
        const tipo = (usuario?.tipo_usuario || "").toLowerCase();

        if (tipo !== "admin" && tipo !== "owner") {
            return res.status(403).json({ sucesso: false, mensagem: "Acesso restrito." });
        }

        const { idaluno } = req.params;
        const historico = await dashboardModel.obterHistoricoAluno(idaluno);

        return res.json({
            sucesso: true,
            dados: historico,
        });
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar histórico do aluno." });
    }
}

// Alterar curso do aluno (EXCLUSIVO OWNER)
async function alterarCursoAluno(req, res) {
    try {
        const usuario = req.session?.usuario;
        if (!usuario || (usuario.tipo_usuario || '').toLowerCase() !== "owner") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas o Owner tem autorização para alterar o curso de matrícula dos alunos.",
            });
        }

        const { idaluno } = req.params;
        let { curso, cursos } = req.body;

        const entrada = cursos || curso;
        let cursoFinal = "";
        if (Array.isArray(entrada)) {
            cursoFinal = entrada.filter(Boolean).map(c => c.trim()).join(", ");
        } else if (typeof entrada === "string") {
            cursoFinal = entrada.trim();
        }

        if (!cursoFinal) {
            return res.status(400).json({ sucesso: false, mensagem: "Ao menos um curso deve ser selecionado." });
        }

        await dashboardModel.atualizarCursoAluno(idaluno, cursoFinal);

        return res.json({
            sucesso: true,
            mensagem: `Matrícula do aluno atualizada para: ${cursoFinal} com sucesso!`,
            curso: cursoFinal,
        });
    } catch (err) {
        console.error("Erro ao alterar curso do aluno:", err);
        return res.status(500).json({ sucesso: false, mensagem: err.message || "Erro ao alterar curso." });
    }
}

// Alterar especialidade do professor (EXCLUSIVO OWNER)
async function alterarEspecialidadeProfessor(req, res) {
    try {
        const usuario = req.session?.usuario;
        if (!usuario || (usuario.tipo_usuario || '').toLowerCase() !== "owner") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas o Owner tem autorização para alterar as especialidades do corpo docente.",
            });
        }

        const { idprofessor } = req.params;
        let { especialidade, especialidades } = req.body;

        const entrada = especialidades || especialidade;
        let espFinal = "";
        if (Array.isArray(entrada)) {
            espFinal = entrada.filter(Boolean).map(e => e.trim()).join(", ");
        } else if (typeof entrada === "string") {
            espFinal = entrada.trim();
        }

        if (!espFinal) {
            return res.status(400).json({ sucesso: false, mensagem: "Ao menos uma especialidade deve ser selecionada." });
        }

        await dashboardModel.atualizarEspecialidadeProfessor(idprofessor, espFinal);

        return res.json({
            sucesso: true,
            mensagem: `Especialidades do professor atualizadas para: ${espFinal} com sucesso!`,
            especialidade: espFinal,
        });
    } catch (err) {
        console.error("Erro ao alterar especialidade do professor:", err);
        return res.status(500).json({ sucesso: false, mensagem: err.message || "Erro ao alterar especialidade." });
    }
}

// Editar dados completos do usuário (Owner total, Admin para alunos)
async function editarUsuario(req, res) {
    return usuarioController.editarUsuario(req, res);
}

// Excluir conta de usuário (Owner total, Admin para alunos)
async function excluirUsuario(req, res) {
    return usuarioController.deletarConta(req, res);
}

module.exports = {
    paginaListarUsuarios,
    atribuirDesconto,
    obterHistoricoAluno,
    alterarCursoAluno,
    alterarEspecialidadeProfessor,
    editarUsuario,
    excluirUsuario,
};
