const dashboardModel = require("../models/dashboardModel");

async function paginaListarUsuarios(req, res) {
    const usuario = req.session?.usuario;
    const tipo = (usuario?.tipo_usuario || "").toLowerCase();

    if (tipo !== "admin" && tipo !== "owner") {
        return res.status(403).send("Acesso restrito à administração.");
    }

    const isOwner = tipo === "owner";

    const [administradores, professores, alunos, cursos] = await Promise.all([
        dashboardModel.listarAdministradores(),
        dashboardModel.listarProfessores(),
        dashboardModel.listarAlunosCompletos(),
        dashboardModel.listarCursos(),
    ]);

    res.render("usuarios/index", {
        titulo: "Gestão de Usuários",
        usuario,
        isOwner,
        administradores,
        professores,
        alunos,
        cursos,
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
        const { curso } = req.body;

        if (!curso) {
            return res.status(400).json({ sucesso: false, mensagem: "O nome do curso é obrigatório." });
        }

        await dashboardModel.atualizarCursoAluno(idaluno, curso);

        return res.json({
            sucesso: true,
            mensagem: `Matrícula do aluno atualizada para o curso de ${curso} com sucesso!`,
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
        const { especialidade } = req.body;

        if (!especialidade) {
            return res.status(400).json({ sucesso: false, mensagem: "A especialidade é obrigatória." });
        }

        await dashboardModel.atualizarEspecialidadeProfessor(idprofessor, especialidade);

        return res.json({
            sucesso: true,
            mensagem: `Especialidade do professor atualizada para ${especialidade} com sucesso!`,
        });
    } catch (err) {
        console.error("Erro ao alterar especialidade do professor:", err);
        return res.status(500).json({ sucesso: false, mensagem: err.message || "Erro ao alterar especialidade." });
    }
}

module.exports = {
    paginaListarUsuarios,
    atribuirDesconto,
    obterHistoricoAluno,
    alterarCursoAluno,
    alterarEspecialidadeProfessor,
};
