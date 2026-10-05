const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const usuarioModel = require("../models/usuarioModel");
const professorModel = require("../models/professorModel");
const gerarSenhaTemporaria = require("../utils/gerarSenha");
const { enviarEmailCadastroProfessor } = require("../services/emailService");

async function cadastrar(req, res) {
    const {
        nome,
        email,
        telefone,
        tipo_instrumento,
        autorizacao_imagem,
        foto_url,
        CPF,
        CNPJ,
    } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Nome e email são obrigatórios.",
        });
    }

    const conexao = await pool.getConnection();

    try {
        const usuarioExistente = await usuarioModel.buscarPorEmail(email);
        if (usuarioExistente) {
            conexao.release();
            return res.status(409).json({
                sucesso: false,
                mensagem: "Já existe um usuário cadastrado com este e-mail.",
            });
        }

        const senhaTemporaria = gerarSenhaTemporaria();
        const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

        await conexao.beginTransaction();

        const idUsuario = await usuarioModel.inserir(conexao, {
            senha: senhaHash,
            tipo_usuario: "professor",
            email,
            nome,
            telefone,
            tipo_instrumento,
            autorizacao_imagem,
            foto_url,
            primeiro_acesso: 1,
        });

        const idProfessor = await professorModel.cadastrar(conexao, {
            CPF,
            CNPJ,
            usuario_login_id: idUsuario,
        });

        await conexao.commit();

        try {
            await enviarEmailCadastroProfessor(email, nome, senhaTemporaria);
        } catch (emailErr) {
            console.error("Aviso: Falha ao enviar e-mail de boas-vindas para o professor:", emailErr.message);
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: "Professor cadastrado com sucesso!",
            idProfessor,
            senhaTemporaria, // Facilitador em ambiente de desenvolvimento/testes
        });
    } catch (error) {
        await conexao.rollback();
        console.error("Erro ao cadastrar professor:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar professor.",
        });
    } finally {
        conexao.release();
    }
}

async function listar(req, res) {
    try {
        const professores = await professorModel.buscarTodos();

        return res.status(200).json({
            sucesso: true,
            professores,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar professores.",
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const professor = await professorModel.buscarPorId(id);

        if (!professor) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Professor não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            professor,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar professor.",
        });
    }
}

async function atualizar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const professorExistente = await professorModel.buscarPorId(id);

        if (!professorExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Professor não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await usuarioModel.atualizar(conexao, professorExistente.id_usuario, req.body);
        await professorModel.atualizar(conexao, id, req.body);

        await conexao.commit();

        const professorAtualizado = await professorModel.buscarPorId(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Professor atualizado com sucesso!",
            professor: professorAtualizado,
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar professor.",
        });
    } finally {
        conexao.release();
    }
}

async function deletar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const professorExistente = await professorModel.buscarPorId(id);

        if (!professorExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Professor não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await professorModel.removerDependencias(conexao, id);
        await professorModel.excluir(conexao, id);
        await usuarioModel.excluir(conexao, professorExistente.id_usuario);

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Professor excluído com sucesso!",
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir professor.",
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
    deletar,
};