const dashboardModel = require("../models/dashboardModel");

async function paginaDashboard(req, res) {
    const usuario = req.session?.usuario;
    const tipo = (usuario?.tipo_usuario || "").toLowerCase();

    if (tipo !== "admin" && tipo !== "owner") {
        return res.status(403).send("Acesso restrito à administração.");
    }

    const isOwner = tipo === "owner";

    // 1. Dados comuns (visíveis para Admin e Owner)
    const [
        totalAlunos,
        totalProfessores,
        aniversariantes,
        mensalidadesDados,
        cursos,
    ] = await Promise.all([
        dashboardModel.contarAlunos(),
        dashboardModel.contarProfessores(),
        dashboardModel.aniversariantesDoMes(),
        dashboardModel.listarMensalidadesAlunos(),
        dashboardModel.listarCursos(),
    ]);

    // 2. Dados financeiros e gráficos (EXCLUSIVOS DO OWNER)
    let resumoFinanceiro = null;
    let dadosGraficos = null;

    if (isOwner) {
        [resumoFinanceiro, dadosGraficos] = await Promise.all([
            dashboardModel.obterResumoFinanceiroOwner(),
            dashboardModel.obterDadosGraficosOwner(),
        ]);
    }

    res.render("dashboard/index", {
        titulo: "Dashboard Geral & Indicadores",
        usuario,
        isOwner,
        totalAlunos,
        totalProfessores,
        aniversariantes,
        cursos,
        mensalidades: mensalidadesDados.todas,
        mensalidadesPendentes: mensalidadesDados.pendentes,
        mensalidadesEmAnalise: mensalidadesDados.emAnalise,
        mensalidadesPagas: mensalidadesDados.pagos,
        mensalidadesVencidas: mensalidadesDados.vencidos,
        totaisMensalidades: mensalidadesDados.totais,
        resumoFinanceiro,
        dadosGraficos,
    });
}

// Atualizar valor da mensalidade de um curso (EXCLUSIVO OWNER)
async function atualizarValorCurso(req, res) {
    try {
        const usuario = req.session?.usuario;
        if (!usuario || usuario.tipo_usuario !== "owner") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas o Owner tem permissão para alterar os valores de mensalidade dos cursos.",
            });
        }

        const { idcurso, novoValor } = req.body;
        if (!idcurso || !novoValor) {
            return res.status(400).json({ sucesso: false, mensagem: "ID do curso e novo valor são obrigatórios." });
        }

        await dashboardModel.atualizarValorCurso(idcurso, novoValor);

        return res.json({
            sucesso: true,
            mensagem: "Valor da mensalidade do curso atualizado com sucesso!",
        });
    } catch (err) {
        console.error("Erro ao atualizar valor do curso:", err);
        return res.status(500).json({ sucesso: false, mensagem: err.message || "Erro no servidor ao atualizar curso." });
    }
}

// Confirmar comprovante / validar mensalidade (Admin e Owner)
async function confirmarComprovante(req, res) {
    try {
        const usuario = req.session?.usuario;
        const tipo = (usuario?.tipo_usuario || "").toLowerCase();

        if (tipo !== "admin" && tipo !== "owner") {
            return res.status(403).json({ sucesso: false, mensagem: "Acesso não autorizado." });
        }

        const { idRecebimento } = req.body;
        if (!idRecebimento) {
            return res.status(400).json({ sucesso: false, mensagem: "ID do recebimento é obrigatório." });
        }

        const ok = await dashboardModel.confirmarPagamentoComprovante(idRecebimento);

        if (ok) {
            return res.json({
                sucesso: true,
                mensagem: "Pagamento validado e mensalidade confirmada com sucesso!",
            });
        } else {
            return res.status(400).json({ sucesso: false, mensagem: "Não foi possível validar o comprovante." });
        }
    } catch (err) {
        console.error("Erro ao confirmar comprovante:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao validar comprovante." });
    }
}

async function registrarPagamento(req, res) {
    try {
        const usuario = req.session?.usuario;
        const tipo = (usuario?.tipo_usuario || "").toLowerCase();

        if (tipo !== "admin" && tipo !== "owner") {
            return res.status(403).json({ sucesso: false, mensagem: "Acesso não autorizado." });
        }

        const { idRecebimento, dataPagamento, formaPagamento } = req.body;

        if (!idRecebimento) {
            return res.status(400).json({ sucesso: false, mensagem: "ID do recebimento é obrigatório." });
        }

        let comprovanteUrl = null;
        if (req.file) {
            comprovanteUrl = `/uploads/comprovantes/${req.file.filename}`;
        }

        const sucesso = await dashboardModel.registrarPagamento({
            idRecebimento,
            dataPagamento: dataPagamento || new Date().toISOString().split("T")[0],
            formaPagamento: formaPagamento || "pix",
            comprovanteUrl,
        });

        if (sucesso) {
            return res.json({
                sucesso: true,
                mensagem: "Pagamento registrado e comprovante anexado com sucesso!",
                comprovanteUrl,
            });
        } else {
            return res.status(400).json({ sucesso: false, mensagem: "Não foi possível registrar o pagamento." });
        }
    } catch (err) {
        console.error("Erro ao registrar pagamento:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor ao registrar pagamento." });
    }
}

module.exports = {
    paginaDashboard,
    atualizarValorCurso,
    confirmarComprovante,
    registrarPagamento,
};