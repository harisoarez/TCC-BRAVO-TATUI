const { auth } = require("../config/firebase");
const authService = require('../services/authService');

async function login(req, res) {
    try {
        const firebaseUid = req.user.uid;
        const usuario = await authService.login(firebaseUid);

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || 'Erro ao realizar login.'
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

    if (novaSenha.length < 6) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "A nova senha deve ter pelo menos 6 caracteres.",
        });
    }

    if (novaSenha !== confirmarSenha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "As senhas não coincidem.",
        });
    }

    try {
        const firebaseUid = req.user.uid;
        await authService.trocarSenhaPrimeiroAcesso(firebaseUid, novaSenha);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Senha atualizada com sucesso!",
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || "Erro ao trocar a senha."
        });
    }
}

async function logout(req, res) {
    try {
        const firebaseUid = req.user.uid;
        await authService.logout(firebaseUid);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso!",
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            sucesso: false,
            mensagem: error.message || "Erro ao realizar logout."
        });
    }
}

async function solicitarRecuperacaoSenha(req, res) {
    const { emailAluno } = req.body;

    if (!emailAluno) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe o email do aluno para a recuperação da senha.",
        });
    }

    try {
        await authService.solicitarRecuperacaoSenha(emailAluno);
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
    solicitarRecuperacaoSenha
};