const aulaModel = require("../models/aulaModel");

const STATUS_VALIDOS = ["agendada", "realizada", "cancelada"];

async function cadastrar(req, res) {
    const { professor_idprofessor, aluno_idaluno, sala, data_aula, duracao_minutos } = req.body;

    if (!professor_idprofessor || !aluno_idaluno || !data_aula) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Professor, aluno e data/hora da aula são obrigatórios.",
        });
    }

    if (sala !== undefined && !aulaModel.SALAS_VALIDAS.includes(Number(sala))) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Sala inválida. Salas disponíveis: ${aulaModel.SALAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const idaula = await aulaModel.cadastrar({
            professor_idprofessor,
            aluno_idaluno,
            sala,
            data_aula,
            duracao_minutos,
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: "Aula cadastrada com sucesso!",
            idaula,
        });
    } catch (error) {
        console.error("Erro ao cadastrar aula:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar aula.",
        });
    }
}

async function listar(req, res) {
    try {
        const aulas = await aulaModel.buscarTodas();

        return res.status(200).json({
            sucesso: true,
            aulas,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar aulas.",
        });
    }
}

async function moverStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Status inválido. Use um de: ${STATUS_VALIDOS.join(", ")}.`,
        });
    }

    try {
        const aula = await aulaModel.buscarPorId(id);

        if (!aula) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aula não encontrada.",
            });
        }

        await aulaModel.atualizarStatus(id, status);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Status da aula atualizado com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar status da aula.",
        });
    }
}

async function atualizar(req, res) {
    const { id } = req.params;
    const { sala } = req.body;

    if (sala !== undefined && !aulaModel.SALAS_VALIDAS.includes(Number(sala))) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Sala inválida. Salas disponíveis: ${aulaModel.SALAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const aula = await aulaModel.buscarPorId(id);

        if (!aula) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aula não encontrada.",
            });
        }

        await aulaModel.atualizar(id, req.body);

        const aulaAtualizada = await aulaModel.buscarPorId(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aula atualizada com sucesso!",
            aula: aulaAtualizada,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar aula.",
        });
    }
}

async function deletar(req, res) {
    const { id } = req.params;

    try {
        const aula = await aulaModel.buscarPorId(id);

        if (!aula) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aula não encontrada.",
            });
        }

        await aulaModel.excluir(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aula excluída com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir aula.",
        });
    }
}

module.exports = {
    cadastrar,
    listar,
    moverStatus,
    atualizar,
    deletar,
};