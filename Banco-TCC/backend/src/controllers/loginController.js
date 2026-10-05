const authService = require("../services/authService");

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe email e senha para entrar.",
            });
        }

        const resultado = await authService.login(email, senha);

        // Se houver sessão configurada, armazena para rotas SSR
        if (req.session) {
            req.session.usuario = resultado.usuario;
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Login realizado com sucesso!",
            token: resultado.token,
            usuario: resultado.usuario,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || "Erro ao realizar login.",
        });
    }
}

async function trocarSenhaPrimeiroAcesso(req, res) {
    const { novaSenha, confirmarSenha } = req.body;

    if (!novaSenha || !confirmarSenha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe a nova senha e a confirmação da senha.",
        });
    }

    if (novaSenha.length < 8 || novaSenha.length > 20) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "A nova senha deve ter no mínimo 8 e no máximo 20 caracteres.",
        });
    }

    if (novaSenha !== confirmarSenha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "As senhas não coincidem.",
        });
    }

    try {
        const idUsuario = req.user.id_usuario;
        await authService.trocarSenhaPrimeiroAcesso(idUsuario, novaSenha);

        if (req.session && req.session.usuario) {
            req.session.usuario.primeiroAcesso = false;
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Senha atualizada com sucesso!",
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || "Erro ao trocar a senha.",
        });
    }
}

async function logout(req, res) {
    try {
        if (req.session) {
            req.session.destroy();
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso!",
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || "Erro ao realizar logout.",
        });
    }
}

async function solicitarRecuperacaoSenha(req, res) {
    const email = req.body.email || req.body.emailAluno;

    if (!email) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe o email para a recuperação da senha.",
        });
    }

    try {
        await authService.solicitarRecuperacaoSenha(email);
    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
    }

    return res.status(200).json({
        sucesso: true,
        mensagem: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.",
    });
}

module.exports = {
    login,
    trocarSenhaPrimeiroAcesso,
    logout,
    solicitarRecuperacaoSenha,
};