const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const usuarioModel = require("../models/usuarioModel");
const alunoModel = require("../models/alunoModel");
const responsavelModel = require("../models/responsavelModel");
const gerarSenhaTemporaria = require("../utils/gerarSenha");
const { enviarEmailCadastrado } = require("../services/emailService");

function calcularIdade(data_nascimento) {
    const hoje = new Date();
    const nascimento = new Date(data_nascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversarioEsteAno =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aindaNaoFezAniversarioEsteAno) {
        idade--;
    }

    return idade;
}

function validarResponsaveis(responsaveis, menorDeIdade) {
    if (menorDeIdade && (!Array.isArray(responsaveis) || responsaveis.length === 0)) {
        return "Aluno menor de idade: é obrigatório informar ao menos um responsável legal.";
    }

    if (!responsaveis) {
        return null;
    }

    if (!Array.isArray(responsaveis)) {
        return "O campo 'responsaveis' deve ser uma lista.";
    }

    for (const responsavel of responsaveis) {
        if (!responsavel.nome || !responsavel.telefone || !responsavel.email || !responsavel.parentesco) {
            return "Cada responsável precisa de nome, telefone, email e parentesco.";
        }
    }

    return null;
}

async function cadastrar(req, res) {
    const {
        nome,
        email,
        telefone,
        tipo_instrumento,
        autorizacao_imagem,
        foto_url,
        CPF,
        endereco_rua,
        endereco_numero,
        endereco_bairro,
        endereco_cidade,
        endereco_cep,
        data_nascimento,
        responsaveis,
    } = req.body;

    if (!nome || !email || !data_nascimento) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Nome, email e data de nascimento são obrigatórios.",
        });
    }

    const menorDeIdade = calcularIdade(data_nascimento) < 18;

    const erroValidacao = validarResponsaveis(responsaveis, menorDeIdade);
    if (erroValidacao) {
        return res.status(400).json({
            sucesso: false,
            mensagem: erroValidacao,
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
            tipo_usuario: "aluno",
            email,
            nome,
            telefone,
            tipo_instrumento,
            autorizacao_imagem,
            foto_url,
            primeiro_acesso: 1,
        });

        const idAluno = await alunoModel.cadastrar(conexao, {
            CPF,
            endereco_rua,
            endereco_numero,
            endereco_bairro,
            endereco_cidade,
            endereco_cep,
            data_nascimento,
            usuario_login_id: idUsuario,
        });

        if (Array.isArray(responsaveis)) {
            for (const dadosResponsavel of responsaveis) {
                const idResponsavel = await responsavelModel.criarOuBuscarPorEmailResponsavel(
                    conexao,
                    dadosResponsavel
                );

                await responsavelModel.vincularAluno(conexao, {
                    aluno_idaluno: idAluno,
                    idResponsavel,
                    parentesco: dadosResponsavel.parentesco,
                    responsavel_principal: dadosResponsavel.responsavel_principal ?? false,
                });
            }
        }

        await conexao.commit();

        try {
            await enviarEmailCadastrado(email, nome, senhaTemporaria);
        } catch (emailErr) {
            console.error("Aviso: Falha ao enviar e-mail de boas-vindas com senha temporária:", emailErr.message);
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: "Aluno cadastrado com sucesso!",
            idAluno,
            menorDeIdade,
            senhaTemporaria, // Facilitador em ambiente de desenvolvimento/testes
        });
    } catch (error) {
        await conexao.rollback();
        console.error("Erro ao cadastrar aluno:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar aluno.",
        });
    } finally {
        conexao.release();
    }
}

async function listar(req, res) {
    try {
        const alunos = await alunoModel.buscarTodos();

        return res.status(200).json({
            sucesso: true,
            alunos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar alunos.",
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const aluno = await alunoModel.buscarPorId(id);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            aluno,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar aluno.",
        });
    }
}

async function atualizar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const alunoExistente = await alunoModel.buscarPorId(id);

        if (!alunoExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await usuarioModel.atualizar(conexao, alunoExistente.id_usuario, req.body);
        await alunoModel.atualizar(conexao, id, req.body);

        await conexao.commit();

        const alunoAtualizado = await alunoModel.buscarPorId(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aluno atualizado com sucesso!",
            aluno: alunoAtualizado,
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar aluno.",
        });
    } finally {
        conexao.release();
    }
}

async function deletar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const alunoExistente = await alunoModel.buscarPorId(id);

        if (!alunoExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await alunoModel.removerDependencias(conexao, id);
        await alunoModel.excluir(conexao, id);
        await usuarioModel.excluir(conexao, alunoExistente.id_usuario);

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aluno excluído com sucesso!",
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir aluno.",
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