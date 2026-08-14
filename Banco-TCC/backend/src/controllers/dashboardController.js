const dashboardModel = require("../models/dashboardModel");

async function resumo(req, res) {
    try {
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

        return res.status(200).json({
            sucesso: true,
            resumo: {
                totalAlunos,
                totalProfessores,
                aulasHoje,
                proximasAulas,
                recebimentosPendentes,
                pagamentosPendentes,
                aniversariantes,
            },
        });
    } catch (error) {
        console.error("Erro ao montar dashboard:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao carregar dashboard.",
        });
    }
}

module.exports = { resumo };