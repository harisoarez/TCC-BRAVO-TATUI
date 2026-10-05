const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        try {
            const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
            const usuarioDecodificado = jwt.verify(token, segredo);
            req.user = usuarioDecodificado;
            return next();
        } catch (erro) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Token inválido ou expirado.",
            });
        }
    }

    // Se não veio Bearer header, autenticar via sessão ativa do Express
    if (req.session && req.session.usuario) {
        req.user = req.session.usuario;
        return next();
    }

    return res.status(401).json({
        sucesso: false,
        mensagem: "Token de autenticação não informado ou sessão expirada.",
    });
}

module.exports = authMiddleware;
