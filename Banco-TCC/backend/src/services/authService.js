const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");
const { enviarEmailRecuperacaoSenha } = require("./emailService");

const JWT_SECRET = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";

async function login(email, senha) {
    if (!email || !senha) {
        const erro = new Error("Email e senha são obrigatórios.");
        erro.status = 400;
        throw erro;
    }

    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
        const erro = new Error("Email ou senha incorretos.");
        erro.status = 401;
        throw erro;
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
        const erro = new Error("Email ou senha incorretos.");
        erro.status = 401;
        throw erro;
    }

    await usuarioModel.atualizarUltimoAcesso(usuario.id_usuario);

    const payload = {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nome: usuario.nome,
        tipo_usuario: usuario.tipo_usuario,
        primeiro_acesso: Boolean(usuario.primeiro_acesso),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    const { senha: _, ...dadosUsuario } = usuario;

    return {
        token,
        usuario: {
            ...dadosUsuario,
            primeiroAcesso: Boolean(usuario.primeiro_acesso),
        },
    };
}

async function trocarSenhaPrimeiroAcesso(idUsuario, novaSenha) {
    const usuario = await usuarioModel.buscarPorId(idUsuario);

    if (!usuario) {
        const erro = new Error("Usuário não encontrado no sistema.");
        erro.status = 404;
        throw erro;
    }

    if (!usuario.primeiro_acesso) {
        const erro = new Error("Este usuário já concluiu o primeiro acesso.");
        erro.status = 400;
        throw erro;
    }

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);
    await usuarioModel.atualizarSenha(idUsuario, hashNovaSenha);

    return true;
}

async function logout(idUsuario) {
    return true;
}

async function solicitarRecuperacaoSenha(email) {
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
        // Ignora emails não cadastrados para não expor informações do sistema
        return;
    }

    const resetToken = jwt.sign(
        { id_usuario: usuario.id_usuario, email: usuario.email, acao: "reset_senha" },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    const baseUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const link = `${baseUrl}/recuperar-senha?token=${resetToken}`;

    try {
        await enviarEmailRecuperacaoSenha(email, usuario.nome, link);
    } catch (err) {
        console.error("Falha ao enviar email de recuperação:", err.message);
    }
}

module.exports = {
    login,
    trocarSenhaPrimeiroAcesso,
    logout,
    solicitarRecuperacaoSenha,
};