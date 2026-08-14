const pool = require("../config/database");
const { auth } = require("../config/firebase");
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
    let firebaseUidCriado = null;

    try {
        const senhaTemporaria = gerarSenhaTemporaria();

        const usuarioFirebase = await auth.createUser({
            email,
            password: senhaTemporaria,
            displayName: nome,
        });
        firebaseUidCriado = usuarioFirebase.uid;

        await conexao.beginTransaction();

        const idUsuario = await usuarioModel.inserir(conexao, {
            firebase_uid: firebaseUidCriado,
            tipo_usuario: "professor",
            email,
            nome,
            telefone,
            tipo_instrumento,
            autorizacao_imagem,
            foto_url,
        });

        const idProfessor = await professorModel.cadastrar(conexao, {
            CPF,
            CNPJ,
            usuario_login_id: idUsuario,
        });

        await conexao.commit();

        await enviarEmailCadastroProfessor(email, nome, senhaTemporaria);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Professor cadastrado com sucesso!",
            idProfessor,
        });
    } catch (error) {
        await conexao.rollback();

        if (firebaseUidCriado) {
            try {
                await auth.deleteUser(firebaseUidCriado);
            } catch (erroFirebase) {
                console.error(
                    `Falha ao reverter usuário Firebase órfão (uid: ${firebaseUidCriado}):`,
                    erroFirebase
                );
            }
        }

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

/**
 * Não permite alterar e-mail aqui: é a identidade do usuário no
 * Firebase Authentication. Se o corpo enviar "email", é ignorado.
 */
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

        const firebaseUidParaRemover = professorExistente.firebase_uid;

        await conexao.beginTransaction();

        await professorModel.removerDependencias(conexao, id);
        await professorModel.excluir(conexao, id);
        await usuarioModel.excluir(conexao, professorExistente.id_usuario);

        await conexao.commit();

        try {
            await auth.deleteUser(firebaseUidParaRemover);
        } catch (erroFirebase) {
            console.error(
                `Professor ${id} removido do banco, mas falhou ao remover do Firebase (uid: ${firebaseUidParaRemover}):`,
                erroFirebase
            );
        }

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