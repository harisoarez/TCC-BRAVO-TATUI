const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

require("./src/config/database");
require("./src/config/firebase");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "instituto-bravo-secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
    })
);

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(express.static("src/public"));

const loginRoutes = require("./src/routes/loginRoutes");
app.use("/api", loginRoutes);

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


const professorRoutes = require("./src/routes/professorRoutes"); 
app.use("/paginas/professores", professorRoutes);

const paginaAulaRoutes = require("./src/routes/paginaAulaRoutes");
app.use("/paginas/aulas", paginaAulaRoutes);

const paginaDashboardRoutes = require("./src/routes/paginaDashboardRoutes");
app.use("/paginas/dashboard", paginaDashboardRoutes);


app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: "Rota não encontrada.",
    });
});

app.use((erro, req, res, next) => {
    console.error(erro);
    res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor.",
    });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});

module.exports = app;