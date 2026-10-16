const jwt = require("jsonwebtoken");

function verificarSessao(req, res, next) {
    const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";

    // 1. Se foi enviado token via Query Param (?token=...)
    const tokenQuery = req.query.token;
    if (tokenQuery) {
        try {
            const decodificado = jwt.verify(tokenQuery, segredo, { algorithms: ["HS256"] });
            if (decodificado && decodificado.acao !== "reset_senha") {
                if (!req.session) req.session = {};
                req.session.usuario = decodificado;
                req.user = decodificado;
                res.locals.usuario = decodificado;
                return next();
            }
        } catch (erro) {
            // Token inválido na query
        }
    }

    // 2. Se foi enviado token via cabeçalho Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        try {
            const decodificado = jwt.verify(token, segredo, { algorithms: ["HS256"] });
            if (decodificado && decodificado.acao !== "reset_senha") {
                if (!req.session) req.session = {};
                req.session.usuario = decodificado;
                req.user = decodificado;
                res.locals.usuario = decodificado;
                return next();
            }
        } catch (erro) {
            // Token inválido no header
        }
    }

    // 3. Se já existir sessão ativa via express-session
    if (req.session && req.session.usuario) {
        req.user = req.session.usuario;
        res.locals.usuario = req.session.usuario;
        return next();
    }

    // 4. Caso não autenticado (ou simulação de teste via query param)
    const ehRequisicaoApi = req.method !== "GET" || req.xhr || req.headers.accept?.includes("application/json");
    if (!ehRequisicaoApi && req.accepts("html")) {
        const { gerarHtmlAcessoRestrito } = require("../utils/renderAcessoRestrito");
        const ehCalendario = (req.originalUrl || req.url || "").includes("calendario");
        return res.status(401).send(
            gerarHtmlAcessoRestrito({
                titulo: "Acesso Restrito",
                subtitulo: "Identificação Necessária",
                mensagem: ehCalendario
                    ? "O Calendário Acadêmico e a grade de aulas do Instituto Musical Bravo Tatuí são de acesso exclusivo para alunos, professores e administradores cadastrados. Por favor, faça login para continuar."
                    : "Para acessar este recurso ou painel administrativo do Instituto Musical Bravo Tatuí, é necessário efetuar login no sistema.",
                urlLogin: "/site/login.html",
                urlInicio: "/site/index.html",
            })
        );
    }

    return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso não autorizado. Por favor, faça login.",
    });
}

module.exports = verificarSessao;
