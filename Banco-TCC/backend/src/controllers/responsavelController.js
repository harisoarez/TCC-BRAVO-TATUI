const pool = require("../config/database");
const responsavelModel = require("../models/responsavelModel");
const alunoResponsavelModel = require("../models/alunoResponsavelModel");

async function cadastrar(req, res) {
    const { nome, telefone, email, aluno_idaluno, parentesco, responsavel_principal } = req.body;

    if (!nome || !telefone || !email) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Nome, telefone e email do responsável são obrigatórios.",
        });
    }

    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const idResponsavel = await responsavelModel.criarOuBuscarPorEmailResponsavel(conexao, {
            nome,
            telefone,
            email,
        });

        if (aluno_idaluno) {
            if (!parentesco) {
                await conexao.rollback();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Para vincular a um aluno, informe o parentesco.",
                });
            }

            await alunoResponsavelModel.adicionar(conexao, {
                aluno_idaluno,
                responsavel_legal_idResponsavel: idResponsavel,
                parentesco,
                responsavel_principal: responsavel_principal ?? false,
            });
        }

        await conexao.commit();

        return res.status(201).json({
            sucesso: true,
            mensagem: "Responsável cadastrado com sucesso!",
            idResponsavel,
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar responsável.",
        });
    } finally {
        conexao.release();
    }
}

async function listar(req, res) {
    try {
        const responsaveis = await responsavelModel.buscarTodos();

        return res.status(200).json({
            sucesso: true,
            responsaveis,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar responsáveis.",
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const responsavel = await responsavelModel.buscarPorIdResponsavel(id);

        if (!responsavel) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Responsável não encontrado.",
            });
        }

        const alunosVinculados = await alunoResponsavelModel.listarAlunosPorResponsavel(id);

        return res.status(200).json({
            sucesso: true,
            responsavel: { ...responsavel, alunos: alunosVinculados },
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar responsável.",
        });
    }
}

async function atualizar(req, res) {
    const { id } = req.params;

    try {
        const responsavel = await responsavelModel.buscarPorIdResponsavel(id);

        if (!responsavel) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Responsável não encontrado.",
            });
        }

        await responsavelModel.atualizar(id, req.body);

        const responsavelAtualizado = await responsavelModel.buscarPorIdResponsavel(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Responsável atualizado com sucesso!",
            responsavel: responsavelAtualizado,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar responsável.",
        });
    }
}

async function excluir(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const responsavel = await responsavelModel.buscarPorIdResponsavel(id);

        if (!responsavel) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Responsável não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await conexao.query(
            `DELETE FROM aluno_responsavel WHERE responsavel_legal_idResponsavel = ?`,
            [id]
        );
        await conexao.query(`DELETE FROM responsavel_legal WHERE idResponsavel = ?`, [id]);

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Responsável excluído com sucesso!",
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir responsável.",
        });
    } finally {
        conexao.release();
    }
}

async function vincularAluno(req, res) {
    const { id } = req.params; // idResponsavel
    const { aluno_idaluno, parentesco, responsavel_principal } = req.body;

    if (!aluno_idaluno || !parentesco) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe aluno_idaluno e parentesco.",
        });
    }

    const conexao = await pool.getConnection();

    try {
        await alunoResponsavelModel.adicionar(conexao, {
            aluno_idaluno,
            responsavel_legal_idResponsavel: id,
            parentesco,
            responsavel_principal: responsavel_principal ?? false,
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: "Responsável vinculado ao aluno com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao vincular responsável ao aluno.",
        });
    } finally {
        conexao.release();
    }
}

async function desvincularAluno(req, res) {
    const { id, idaluno } = req.params;
    const conexao = await pool.getConnection();

    try {
        const removido = await alunoResponsavelModel.remover(conexao, idaluno, id);

        if (!removido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Vínculo não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Vínculo removido com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao remover vínculo.",
        });
    } finally {
        conexao.release();
    }
}

module.exports = {
    cadastrar,
    listar,
    buscarPorId,
    atualizar,
    excluir,
    vincularAluno,
    desvincularAluno,
};