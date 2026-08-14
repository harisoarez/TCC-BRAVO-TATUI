const pool = require("../config/database");

async function contarAlunos() {
    const [linhas] = await pool.query(`SELECT COUNT(*) AS total FROM aluno`);
    return linhas[0].total;
}

async function contarProfessores() {
    const [linhas] = await pool.query(`SELECT COUNT(*) AS total FROM professor`);
    return linhas[0].total;
}

async function contarAulasHoje() {
    const [linhas] = await pool.query(
        `SELECT COUNT(*) AS total FROM aula WHERE DATE(data_aula) = CURDATE() AND status != 'cancelada'`
    );
    return linhas[0].total;
}

async function proximasAulas(limite = 5) {
    const [linhas] = await pool.query(
        `SELECT a.idaula, a.data_aula, a.sala, ua.nome AS aluno_nome, up.nome AS professor_nome
           FROM aula a
           JOIN aluno al ON al.idaluno = a.aluno_idaluno
           JOIN usuario_login ua ON ua.id_usuario = al.usuario_login_id
           JOIN professor p ON p.idprofessor = a.professor_idprofessor
           JOIN usuario_login up ON up.id_usuario = p.usuario_login_id
          WHERE a.data_aula >= NOW() AND a.status = 'agendada'
          ORDER BY a.data_aula ASC
          LIMIT ?`,
        [limite]
    );
    return linhas;
}

async function totalRecebimentosPendentes() {
    const [linhas] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS quantidade
           FROM financeiro_recebimento
          WHERE status_parcela IN ('pendente', 'atrasado')`
    );
    return linhas[0];
}

async function totalPagamentosPendentes() {
    const [linhas] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS quantidade
           FROM financeiro_pagamento
          WHERE status_parcela IN ('pendente', 'atrasado')`
    );
    return linhas[0];
}

async function aniversariantesDoMes() {
    const [linhas] = await pool.query(
        `SELECT u.nome, a.data_nascimento
           FROM aluno a
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
          WHERE MONTH(a.data_nascimento) = MONTH(CURDATE())
          ORDER BY DAY(a.data_nascimento) ASC`
    );
    return linhas;
}

module.exports = {
    contarAlunos,
    contarProfessores,
    contarAulasHoje,
    proximasAulas,
    totalRecebimentosPendentes,
    totalPagamentosPendentes,
    aniversariantesDoMes,
};