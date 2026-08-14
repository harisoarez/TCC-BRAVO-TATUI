const { auth } = require("../config/firebase");

async function authFirebase(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token de autenticação não informado.",
        });
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        const usuarioDecodificado = await auth.verifyIdToken(token);
        req.user = usuarioDecodificado;
        return next();
    } catch (erro) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido ou expirado.",
        });
    }
}

module.exports = authFirebase;