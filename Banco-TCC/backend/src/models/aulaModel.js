const pool = require("../config/database");

async function buscarTodas() {
    const sql = `
        SELECT 
            a.idaula AS id,
            a.titulo,
            a.instrumento,
            a.professor_idprofessor,
            a.aluno_idaluno,
            COALESCE(u.nome, 'Professor Geral') AS professor,
            COALESCE(ualuno.nome, 'Não vinculado') AS aluno_nome,
            DATE_FORMAT(a.data_aula, '%Y-%m-%d') AS data,
            DATE_FORMAT(a.data_aula, '%H:%i') AS hora,
            a.duracao_minutos AS duracao,
            a.sala,
            a.status AS tipo,
            a.observacoes
        FROM aula a
        LEFT JOIN professor p ON a.professor_idprofessor = p.idprofessor
        LEFT JOIN usuario_login u ON p.usuario_login_id = u.id_usuario
        LEFT JOIN aluno al ON a.aluno_idaluno = al.idaluno
        LEFT JOIN usuario_login ualuno ON al.usuario_login_id = ualuno.id_usuario
        ORDER BY a.data_aula ASC
    `;
    const [linhas] = await pool.query(sql);
    return linhas;
}

async function inserir(dados) {
    const { titulo, instrumento, professor_idprofessor, aluno_idaluno, sala, data_aula, duracao_minutos, status, observacoes } = dados;
    const sql = `
        INSERT INTO aula 
        (titulo, instrumento, professor_idprofessor, aluno_idaluno, sala, data_aula, duracao_minutos, status, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultado] = await pool.query(sql, [
        titulo,
        instrumento,
        professor_idprofessor,
        aluno_idaluno || null,
        sala,
        data_aula,
        duracao_minutos || 60,
        status || 'normal',
        observacoes || null
    ]);
    return resultado.insertId;
}

async function atualizar(id, dados) {
    const { titulo, instrumento, professor_idprofessor, aluno_idaluno, sala, data_aula, status, observacoes } = dados;
    const sql = `
        UPDATE aula 
        SET titulo = ?, instrumento = ?, professor_idprofessor = ?, aluno_idaluno = ?, sala = ?, data_aula = ?, status = ?, observacoes = ?
        WHERE idaula = ?
    `;
    const [resultado] = await pool.query(sql, [
        titulo,
        instrumento,
        professor_idprofessor,
        aluno_idaluno || null,
        sala,
        data_aula,
        status,
        observacoes,
        id
    ]);
    return resultado.affectedRows > 0;
}

async function atualizarStatus(id, status) {
    const sql = `UPDATE aula SET status = ? WHERE idaula = ?`;
    const [resultado] = await pool.query(sql, [status, id]);
    return resultado.affectedRows > 0;
}

async function excluir(id) {
    const sql = `DELETE FROM aula WHERE idaula = ?`;
    const [resultado] = await pool.query(sql, [id]);
    return resultado.affectedRows > 0;
}

module.exports = {
    buscarTodas,
    inserir,
    atualizar,
    atualizarStatus,
    excluir
};