const pool = require("../config/database");

const STATUS_VALIDOS = ["pendente", "pago", "atrasado"];
const FORMAS_VALIDAS = ["pix", "cartao", "boleto", "dinheiro"];

async function cadastrarRecebimento(dados) {
    const { data_vencimento, valor, aluno_idaluno, forma_pagamento } = dados;

    const [resultado] = await pool.query(
        `INSERT INTO financeiro_recebimento
          (data_vencimento, valor, status_parcela, forma_pagamento, aluno_idaluno)
         VALUES (?, ?, 'pendente', ?, ?)`,
        [data_vencimento, valor, forma_pagamento || null, aluno_idaluno]
    );

    return resultado.insertId;
}

async function buscarRecebimentos() {
    const [linhas] = await pool.query(
        `SELECT fr.idfinanceiroRecebimento, fr.data_vencimento, fr.data_pagamento,
                fr.valor, fr.status_parcela, fr.forma_pagamento,
                a.idaluno, u.nome AS aluno_nome
           FROM financeiro_recebimento fr
           JOIN aluno a ON a.idaluno = fr.aluno_idaluno
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
          ORDER BY fr.data_vencimento DESC`
    );

    return linhas;
}

async function buscarRecebimentosPorAluno(aluno_idaluno) {
    const [linhas] = await pool.query(
        `SELECT idfinanceiroRecebimento, data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento
           FROM financeiro_recebimento
          WHERE aluno_idaluno = ?
          ORDER BY data_vencimento DESC`,
        [aluno_idaluno]
    );

    return linhas;
}

async function marcarRecebimentoComoPago(idfinanceiroRecebimento, forma_pagamento) {
    const [resultado] = await pool.query(
        `UPDATE financeiro_recebimento
            SET status_parcela = 'pago', data_pagamento = NOW(), forma_pagamento = ?
          WHERE idfinanceiroRecebimento = ?`,
        [forma_pagamento || null, idfinanceiroRecebimento]
    );

    return resultado.affectedRows > 0;
}

async function excluirRecebimento(idfinanceiroRecebimento) {
    const [resultado] = await pool.query(
        `DELETE FROM financeiro_recebimento WHERE idfinanceiroRecebimento = ?`,
        [idfinanceiroRecebimento]
    );

    return resultado.affectedRows > 0;
}

async function cadastrarPagamento(dados) {
    const { data_vencimento, valor, professor_idprofessor, forma_pagamento } = dados;

    const [resultado] = await pool.query(
        `INSERT INTO financeiro_pagamento
          (data_vencimento, valor, status_parcela, forma_pagamento, professor_idprofessor)
         VALUES (?, ?, 'pendente', ?, ?)`,
        [data_vencimento, valor, forma_pagamento || null, professor_idprofessor]
    );

    return resultado.insertId;
}

async function buscarPagamentos() {
    const [linhas] = await pool.query(
        `SELECT fp.idfinanceiroPagamento, fp.data_vencimento, fp.data_pagamento,
                fp.valor, fp.status_parcela, fp.forma_pagamento,
                p.idprofessor, u.nome AS professor_nome
           FROM financeiro_pagamento fp
           JOIN professor p ON p.idprofessor = fp.professor_idprofessor
           JOIN usuario_login u ON u.id_usuario = p.usuario_login_id
          ORDER BY fp.data_vencimento DESC`
    );

    return linhas;
}

async function buscarPagamentosPorProfessor(professor_idprofessor) {
    const [linhas] = await pool.query(
        `SELECT idfinanceiroPagamento, data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento
           FROM financeiro_pagamento
          WHERE professor_idprofessor = ?
          ORDER BY data_vencimento DESC`,
        [professor_idprofessor]
    );

    return linhas;
}

async function marcarPagamentoComoPago(idfinanceiroPagamento, forma_pagamento) {
    const [resultado] = await pool.query(
        `UPDATE financeiro_pagamento
            SET status_parcela = 'pago', data_pagamento = CURDATE(), forma_pagamento = ?
          WHERE idfinanceiroPagamento = ?`,
        [forma_pagamento || null, idfinanceiroPagamento]
    );

    return resultado.affectedRows > 0;
}

async function excluirPagamento(idfinanceiroPagamento) {
    const [resultado] = await pool.query(
        `DELETE FROM financeiro_pagamento WHERE idfinanceiroPagamento = ?`,
        [idfinanceiroPagamento]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    STATUS_VALIDOS,
    FORMAS_VALIDAS,
    cadastrarRecebimento,
    buscarRecebimentos,
    buscarRecebimentosPorAluno,
    marcarRecebimentoComoPago,
    excluirRecebimento,
    cadastrarPagamento,
    buscarPagamentos,
    buscarPagamentosPorProfessor,
    marcarPagamentoComoPago,
    excluirPagamento,
};