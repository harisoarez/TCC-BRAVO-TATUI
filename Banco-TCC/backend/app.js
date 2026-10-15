const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Inicializa a conexão com o MySQL
require("./src/config/database");

const app = express();

// Cabeçalhos de segurança HTTP com Helmet
app.use(
    helmet({
        contentSecurityPolicy: false, // Permite scripts do Chart.js e templates EJS inline
        crossOriginEmbedderPolicy: false,
    })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "instituto-bravo-session-secret-2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 8, // 8 horas
            secure: process.env.NODE_ENV === "production",
        },
    })
);

app.use((req, res, next) => {
    if (req.query?.token) {
        try {
            const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
            const decodificado = jwt.verify(req.query.token, segredo, { algorithms: ["HS256"] });
            // Previne que tokens com propósito específico (como reset_senha) sejam usados como sessão de login
            if (decodificado && decodificado.acao !== "reset_senha") {
                if (!req.session) req.session = {};
                req.session.usuario = decodificado;
            }
        } catch (e) {}
    }
    res.locals.usuario = req.session?.usuario || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Rota autenticada e protegida para comprovantes financeiros (IDOR & Privacidade LGPD)
app.get("/uploads/comprovantes/:arquivo", async (req, res) => {
    const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
    let usuario = req.session?.usuario || res.locals?.usuario;

    if (!usuario) {
        const token = (req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
            ? req.headers.authorization.replace("Bearer ", "").trim()
            : req.query?.token;
        if (token) {
            try {
                const dec = jwt.verify(token, segredo, { algorithms: ["HS256"] });
                if (dec && dec.acao !== "reset_senha") usuario = dec;
            } catch (e) {}
        }
    }

    if (!usuario) {
        return res.status(401).send("Acesso restrito. Faça login para visualizar o comprovante.");
    }

    const nomeArquivo = path.basename(req.params.arquivo);
    const caminhoArquivo = path.join(__dirname, "src/public/uploads/comprovantes", nomeArquivo);

    if (!fs.existsSync(caminhoArquivo)) {
        return res.status(404).send("Comprovante não encontrado.");
    }

    const { ehAdmin } = require("./src/utils/admin");
    if (ehAdmin(usuario)) {
        return res.sendFile(caminhoArquivo);
    }

    try {
        const pool = require("./src/config/database");
        const [pertence] = await pool.query(
            `SELECT r.idfinanceiroRecebimento 
               FROM financeiro_recebimento r
               JOIN aluno a ON a.idaluno = r.aluno_idaluno
              WHERE r.comprovante_url LIKE ? AND a.usuario_login_id = ?
              LIMIT 1`,
            [`%${nomeArquivo}%`, usuario.id_usuario]
        );

        if (pertence.length > 0) {
            return res.sendFile(caminhoArquivo);
        }
    } catch (dbErr) {
        console.error("Erro ao validar acesso ao comprovante:", dbErr);
    }

    return res.status(403).send("Acesso não autorizado para visualizar este comprovante.");
});

// Servir arquivos estáticos do painel administrativo (CSS, imagens públicas)
app.use(express.static(path.join(__dirname, "src/public")));

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
app.get("/cardapio", (req, res) => {
    res.redirect("/site/cardapio.html");
});
app.get("/orquestra", (req, res) => {
    res.redirect("/site/orquestra.html");
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

const cardapioRoutes = require("./src/routes/cardapioRoutes");
app.use("/api/cardapio", cardapioRoutes);

const instrumentoRoutes = require("./src/routes/instrumentoRoutes");
app.use("/api/instrumentos", instrumentoRoutes);

const orquestraRoutes = require("./src/routes/orquestraRoutes");
app.use("/api/orquestra", orquestraRoutes);

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

const paginaCardapioRoutes = require("./src/routes/paginaCardapioRoutes");
app.use("/paginas/cardapio", paginaCardapioRoutes);

const paginaInstrumentoRoutes = require("./src/routes/paginaInstrumentoRoutes");
app.use("/paginas/instrumentos", paginaInstrumentoRoutes);

const paginaOrquestraRoutes = require("./src/routes/paginaOrquestraRoutes");
app.use("/paginas/orquestra", paginaOrquestraRoutes);

// Inicializa tabela do cardápio e itens padrão se necessário
const cardapioModel = require("./src/models/cardapioModel");
cardapioModel.garantirTabela().catch((err) => console.error("Erro ao inicializar cardápio:", err));

// Inicializa tabela de instrumentos e acervo padrão se necessário
const instrumentoModel = require("./src/models/instrumentoModel");
instrumentoModel.garantirTabela().catch((err) => console.error("Erro ao inicializar instrumentos:", err));

// Inicializa tabelas da orquestra e conteúdo padrão se necessário
const orquestraModel = require("./src/models/orquestraModel");
orquestraModel.garantirTabela().catch((err) => console.error("Erro ao inicializar orquestra:", err));

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
    const mensagem = process.env.NODE_ENV === "production"
        ? "Erro interno do servidor."
        : (erro.message || "Erro interno do servidor.");
    res.status(erro.status || 500).json({
        sucesso: false,
        mensagem,
    });
});

const PORTA = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORTA, () => {
        console.log(`Servidor rodando em http://localhost:${PORTA}`);
    });
}

module.exports = app;