const usuarioModel = require('../models/usuarioModel');
    
async function verificarPrimeiroAcesso(req, res, next) {
    const { uid } = req.user;

    try {
        const usuario = await usuarioModel.buscarPorFirebaseUID(uid);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado.",
            });
        }

        if (usuario.primeiro_acesso) {
            return res.status(403).json({
                sucesso: false,
                mensagem:
                    "É necessário trocar a senha temporária antes de continuar.",
                primeiroAcesso: true,
            });
        }

        return next();
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao verificar status de primeiro acesso.",
        });
    }
}

module.exports = verificarPrimeiroAcesso;