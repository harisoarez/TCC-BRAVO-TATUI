const jwt = require("jsonwebtoken");

function verificarSessao(req, res, next) {
    const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";

    // 1. Se foi enviado token via Query Param (?token=...)
    const tokenQuery = req.query.token;
    if (tokenQuery) {
        try {
            const decodificado = jwt.verify(tokenQuery, segredo);
            if (!req.session) req.session = {};
            req.session.usuario = decodificado;
            res.locals.usuario = decodificado;
            return next();
        } catch (erro) {
            // Token inválido na query
        }
    }

    // 2. Se foi enviado token via cabeçalho Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        try {
            const decodificado = jwt.verify(token, segredo);
            if (!req.session) req.session = {};
            req.session.usuario = decodificado;
            res.locals.usuario = decodificado;
            return next();
        } catch (erro) {
            // Token inválido no header
        }
    }

    // 3. Se já existir sessão ativa via express-session
    if (req.session && req.session.usuario) {
        res.locals.usuario = req.session.usuario;
        return next();
    }

    // 4. Caso não autenticado
    const ehRequisicaoApi = req.method !== "GET" || req.xhr || req.headers.accept?.includes("application/json");
    if (!ehRequisicaoApi && req.accepts("html")) {
        return res.status(401).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 80px; background: #0b0d13; color: #fff; min-height: 100vh; padding: 40px;">
                <h2 style="color: #F5D696; font-size: 24px;">Acesso Restrito - Instituto Bravo Tatuí</h2>
                <p style="color: #94a3b8; font-size: 15px; margin: 15px 0 25px 0;">É necessário realizar login como Administrador ou Owner para acessar o Painel.</p>
                <a href="/site/login.html" style="display: inline-block; padding: 10px 24px; background: #F5D696; color: #0d111b; font-weight: bold; text-decoration: none; border-radius: 6px;">Fazer Login</a>
            </div>
        `);
    }

    return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso não autorizado. Por favor, faça login.",
    });
}

module.exports = verificarSessao;
