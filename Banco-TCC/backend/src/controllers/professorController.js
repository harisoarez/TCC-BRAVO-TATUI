const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const usuarioModel = require("../models/usuarioModel");
const professorModel = require("../models/professorModel");
const gerarSenhaTemporaria = require("../utils/gerarSenha");
const { enviarEmailCadastroProfessor } = require("../services/emailService");
const { ehAdmin } = require("../utils/admin");
const { validarCPF, validarCNPJ, validarEmail, validarTelefone } = require("../utils/validators");

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

    if (!validarEmail(email)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "E-mail inválido.",
        });
    }

    if (CPF && !validarCPF(CPF)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "CPF informado é inválido.",
        });
    }

    if (CNPJ && !validarCNPJ(CNPJ)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "CNPJ informado é inválido.",
        });
    }

    if (telefone && !validarTelefone(telefone)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Telefone informado é inválido.",
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

        const entradaEsp = req.body.especialidades || req.body.especialidade || tipo_instrumento;
        let espFinal = "Geral";
        if (Array.isArray(entradaEsp)) {
            espFinal = entradaEsp.filter(Boolean).map(e => String(e).trim()).join(", ");
        } else if (typeof entradaEsp === "string" && entradaEsp.trim() !== "") {
            espFinal = entradaEsp.trim();
        }

        const idUsuario = await usuarioModel.inserir(conexao, {
            senha: senhaHash,
            tipo_usuario: "professor",
            email,
            nome,
            telefone,
            tipo_instrumento: espFinal,
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
            mensagem: "Professor cadastrado com sucesso! As credenciais de acesso foram enviadas por e-mail.",
            idProfessor,
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

function obterUsuarioRequisicao(req) {
    if (req.user) return req.user;
    if (req.session?.usuario) return req.session.usuario;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.replace("Bearer ", "").trim();
        try {
            const jwt = require("jsonwebtoken");
            const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
            const decodificado = jwt.verify(token, segredo, { algorithms: ["HS256"] });
            if (decodificado && decodificado.acao !== "reset_senha") {
                return decodificado;
            }
        } catch (e) {}
    }
    return null;
}

async function listar(req, res) {
    try {
        const professores = await professorModel.buscarTodos();
        const usuarioLogado = obterUsuarioRequisicao(req);
        const isAdmin = ehAdmin(usuarioLogado);

        // Se for admin ou owner, retorna os dados completos para gestão interna
        if (isAdmin) {
            return res.status(200).json({
                sucesso: true,
                professores,
            });
        }

        // Se for acesso público ou de aluno, sanitiza para proteger dados pessoais (LGPD)
        const professoresPublicos = professores.map((p) => ({
            idprofessor: p.idprofessor,
            nome: p.nome,
            tipo_instrumento: p.tipo_instrumento,
            foto_url: p.foto_url,
            autorizacao_imagem: p.autorizacao_imagem,
        }));

        return res.status(200).json({
            sucesso: true,
            professores: professoresPublicos,
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

        const usuarioLogado = obterUsuarioRequisicao(req);
        const isAdmin = ehAdmin(usuarioLogado);
        const ehProprioProfessor = usuarioLogado && professor.usuario_login_id === usuarioLogado.id_usuario;

        if (isAdmin || ehProprioProfessor) {
            return res.status(200).json({
                sucesso: true,
                professor,
            });
        }

        // Dados públicos seguros
        return res.status(200).json({
            sucesso: true,
            professor: {
                idprofessor: professor.idprofessor,
                nome: professor.nome,
                tipo_instrumento: professor.tipo_instrumento,
                foto_url: professor.foto_url,
            },
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

        const entradaEsp = req.body.especialidades || req.body.especialidade || req.body.tipo_instrumento;
        let espFinal = undefined;
        if (entradaEsp !== undefined) {
            if (Array.isArray(entradaEsp)) {
                espFinal = entradaEsp.filter(Boolean).map(e => String(e).trim()).join(", ");
            } else if (typeof entradaEsp === "string") {
                espFinal = entradaEsp.trim();
            }
        }

        const dadosUsuario = { ...req.body };
        if (espFinal !== undefined) {
            dadosUsuario.tipo_instrumento = espFinal;
        }

        await usuarioModel.atualizar(conexao, professorExistente.id_usuario, dadosUsuario);
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