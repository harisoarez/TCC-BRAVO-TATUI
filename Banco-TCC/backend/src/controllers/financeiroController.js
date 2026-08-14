const financeiroModel = require("../models/financeiroModel");
const usuarioModel = require("../models/usuarioModel");
const alunoModel = require("../models/alunoModel");
const professorModel = require("../models/professorModel");

async function cadastrarRecebimento(req, res) {
    const { data_vencimento, valor, aluno_idaluno, forma_pagamento } = req.body;

    if (!data_vencimento || !valor || !aluno_idaluno) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Data de vencimento, valor e aluno são obrigatórios.",
        });
    }

    if (forma_pagamento && !financeiroModel.FORMAS_VALIDAS.includes(forma_pagamento)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Forma de pagamento inválida. Use uma de: ${financeiroModel.FORMAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const id = await financeiroModel.cadastrarRecebimento({
            data_vencimento,
            valor,
            aluno_idaluno,
            forma_pagamento,
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: "Recebimento cadastrado com sucesso!",
            id,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar recebimento.",
        });
    }
}

async function listarRecebimentos(req, res) {
    try {
        const recebimentos = await financeiroModel.buscarRecebimentos();

        return res.status(200).json({
            sucesso: true,
            recebimentos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar recebimentos.",
        });
    }
}

async function listarMeusRecebimentos(req, res) {
    try {
        const usuario = await usuarioModel.buscarPorFirebaseUID(req.user.uid);

        if (!usuario || usuario.tipo_usuario !== "aluno") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas alunos podem ver seus próprios recebimentos.",
            });
        }

        const aluno = await alunoModel.buscarPorUsuarioLoginId(usuario.id_usuario);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Registro de aluno não encontrado.",
            });
        }

        const recebimentos = await financeiroModel.buscarRecebimentosPorAluno(aluno.idaluno);

        return res.status(200).json({
            sucesso: true,
            recebimentos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar seus recebimentos.",
        });
    }
}

async function marcarRecebimentoComoPago(req, res) {
    const { id } = req.params;
    const { forma_pagamento } = req.body;

    if (forma_pagamento && !financeiroModel.FORMAS_VALIDAS.includes(forma_pagamento)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Forma de pagamento inválida. Use uma de: ${financeiroModel.FORMAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const atualizado = await financeiroModel.marcarRecebimentoComoPago(id, forma_pagamento);

        if (!atualizado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Recebimento não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Recebimento marcado como pago!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao marcar recebimento como pago.",
        });
    }
}

async function excluirRecebimento(req, res) {
    const { id } = req.params;

    try {
        const excluido = await financeiroModel.excluirRecebimento(id);

        if (!excluido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Recebimento não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Recebimento excluído com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir recebimento.",
        });
    }
}

async function cadastrarPagamento(req, res) {
    const { data_vencimento, valor, professor_idprofessor, forma_pagamento } = req.body;

    if (!data_vencimento || !valor || !professor_idprofessor) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Data de vencimento, valor e professor são obrigatórios.",
        });
    }

    if (forma_pagamento && !financeiroModel.FORMAS_VALIDAS.includes(forma_pagamento)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Forma de pagamento inválida. Use uma de: ${financeiroModel.FORMAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const id = await financeiroModel.cadastrarPagamento({
            data_vencimento,
            valor,
            professor_idprofessor,
            forma_pagamento,
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: "Pagamento cadastrado com sucesso!",
            id,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar pagamento.",
        });
    }
}

async function listarPagamentos(req, res) {
    try {
        const pagamentos = await financeiroModel.buscarPagamentos();

        return res.status(200).json({
            sucesso: true,
            pagamentos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar pagamentos.",
        });
    }
}

async function listarMeusPagamentos(req, res) {
    try {
        const usuario = await usuarioModel.buscarPorFirebaseUID(req.user.uid);

        if (!usuario || usuario.tipo_usuario !== "professor") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas professores podem ver seus próprios pagamentos.",
            });
        }

        const professor = await professorModel.buscarPorUsuarioLoginId(usuario.id_usuario);

        if (!professor) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Registro de professor não encontrado.",
            });
        }

        const pagamentos = await financeiroModel.buscarPagamentosPorProfessor(professor.idprofessor);

        return res.status(200).json({
            sucesso: true,
            pagamentos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar seus pagamentos.",
        });
    }
}

async function marcarPagamentoComoPago(req, res) {
    const { id } = req.params;
    const { forma_pagamento } = req.body;

    if (forma_pagamento && !financeiroModel.FORMAS_VALIDAS.includes(forma_pagamento)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Forma de pagamento inválida. Use uma de: ${financeiroModel.FORMAS_VALIDAS.join(", ")}.`,
        });
    }

    try {
        const atualizado = await financeiroModel.marcarPagamentoComoPago(id, forma_pagamento);

        if (!atualizado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pagamento não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Pagamento marcado como pago!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao marcar pagamento como pago.",
        });
    }
}

async function excluirPagamento(req, res) {
    const { id } = req.params;

    try {
        const excluido = await financeiroModel.excluirPagamento(id);

        if (!excluido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pagamento não encontrado.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Pagamento excluído com sucesso!",
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir pagamento.",
        });
    }
}

module.exports = {
    cadastrarRecebimento,
    listarRecebimentos,
    listarMeusRecebimentos,
    marcarRecebimentoComoPago,
    excluirRecebimento,
    cadastrarPagamento,
    listarPagamentos,
    listarMeusPagamentos,
    marcarPagamentoComoPago,
    excluirPagamento,
};