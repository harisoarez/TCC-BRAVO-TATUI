const dashboardModel = require("../models/dashboardModel");

async function paginaDashboard(req, res) {
    if (req.session.usuario.tipo_usuario !== "admin") {
        return res.status(403).send("Acesso restrito ao administrador.");
    }

    const [
        totalAlunos,
        totalProfessores,
        aulasHoje,
        proximasAulas,
        recebimentosPendentes,
        pagamentosPendentes,
        aniversariantes,
    ] = await Promise.all([
        dashboardModel.contarAlunos(),
        dashboardModel.contarProfessores(),
        dashboardModel.contarAulasHoje(),
        dashboardModel.proximasAulas(5),
        dashboardModel.totalRecebimentosPendentes(),
        dashboardModel.totalPagamentosPendentes(),
        dashboardModel.aniversariantesDoMes(),
    ]);

    res.render("dashboard/index", {
        titulo: "Dashboard",
        totalAlunos,
        totalProfessores,
        aulasHoje,
        proximasAulas,
        recebimentosPendentes,
        pagamentosPendentes,
        aniversariantes,
    });
}

module.exports = { paginaDashboard };