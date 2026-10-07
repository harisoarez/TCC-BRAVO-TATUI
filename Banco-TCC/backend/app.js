const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

// Inicializa a conexão com o MySQL
require("./src/config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "instituto-bravo-session-secret-2026",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
    })
);

app.use((req, res, next) => {
    if (req.query?.token) {
        try {
            const jwt = require("jsonwebtoken");
            const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
            const decodificado = jwt.verify(req.query.token, segredo);
            if (!req.session) req.session = {};
            req.session.usuario = decodificado;
        } catch (e) {}
    }
    res.locals.usuario = req.session?.usuario || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Servir arquivos estáticos do painel administrativo (CSS, imagens)
app.use(express.static(path.join(__dirname, "src/public")));
app.use("/views", express.static(path.join(__dirname, "src/views")));

// Servir páginas e mídias do frontend institucional da pasta public na raiz
app.use(express.static(path.join(__dirname, "../../public/pages")));
app.use("/site", express.static(path.join(__dirname, "../../public/pages/html")));
app.use("/public", express.static(path.join(__dirname, "../../public")));

// Atalhos para páginas institucionais
app.get("/", (req, res) => {
    res.redirect("/site/index.html");
});
app.get("/login", (req, res) => {
    res.redirect("/site/login.html");
});
app.get("/calendario", (req, res) => {
    res.redirect("/site/calendario.html");
});
app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(() => {});
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/site/login.html");
});

// Rotas da API REST
const loginRoutes = require("./src/routes/loginRoutes");
app.use("/api", loginRoutes);

const usuarioRoutes = require("./src/routes/usuarioRoutes");
app.use("/api/usuarios", usuarioRoutes);

const alunosRoutes = require("./src/routes/alunosRoutes");
app.use("/api/alunos", alunosRoutes);

const professoresRoutes = require("./src/routes/professoresRoutes");
app.use("/api/professores", professoresRoutes);

const aulaRoutes = require("./src/routes/aulaRoutes");
app.use("/api/aulas", aulaRoutes);

const financeiroRoutes = require("./src/routes/financeiroRoutes");
app.use("/api/financeiro", financeiroRoutes);

const responsavelRoutes = require("./src/routes/responsavelRoutes");
app.use("/api/responsaveis", responsavelRoutes);

const dashboardRoutes = require("./src/routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Rotas das páginas do sistema administrativo (SSR EJS)
const professorRoutes = require("./src/routes/professorRoutes"); 
app.use("/paginas/professores", professorRoutes);

const paginaAulaRoutes = require("./src/routes/paginaAulaRoutes");
app.use("/paginas/aulas", paginaAulaRoutes);

const paginaDashboardRoutes = require("./src/routes/paginaDashboardRoutes");
app.use("/paginas/dashboard", paginaDashboardRoutes);

const paginaUsuarioRoutes = require("./src/routes/paginaUsuarioRoutes");
app.use("/paginas/usuarios", paginaUsuarioRoutes);

const paginaMatriculaRoutes = require("./src/routes/paginaMatriculaRoutes");
app.use("/paginas/matricula", paginaMatriculaRoutes);

// Rota de status da API
app.get("/api", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "API Instituto Bravo conectada e operando normalmente!",
    });
});

// Middleware para tratamento de 404
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: "Rota não encontrada.",
    });
});

// Middleware global de tratamento de erros
app.use((erro, req, res, next) => {
    console.error("Erro interno:", erro);
    res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.message || "Erro interno do servidor.",
    });
});

const PORTA = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORTA, () => {
        console.log(`Servidor rodando em http://localhost:${PORTA}`);
    });
}

module.exports = app;