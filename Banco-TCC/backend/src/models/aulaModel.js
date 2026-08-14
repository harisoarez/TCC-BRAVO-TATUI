const pool = require("../config/database");

const SALAS_VALIDAS = [1, 2, 3, 4];

const CAMPOS_SELECT = `
    a.idaula, a.sala, a.data_aula, a.status, a.duracao_minutos,
    p.idprofessor, up.nome AS professor_nome,
    al.idaluno, ua.nome AS aluno_nome, ua.tipo_instrumento AS instrumento
`;

const JOINS = `
    FROM aula a
    JOIN professor p ON p.idprofessor = a.professor_idprofessor
    JOIN usuario_login up ON up.id_usuario = p.usuario_login_id
    JOIN aluno al ON al.idaluno = a.aluno_idaluno
    JOIN usuario_login ua ON ua.id_usuario = al.usuario_login_id
`;

async function cadastrar(dadosAula) {
    const { professor_idprofessor, aluno_idaluno, sala, data_aula, duracao_minutos } = dadosAula;

    const [resultado] = await pool.query(
        `INSERT INTO aula
          (professor_idprofessor, aluno_idaluno, sala, data_aula, status, duracao_minutos)
         VALUES (?, ?, ?, ?, 'agendada', ?)`,
        [professor_idprofessor, aluno_idaluno, sala, data_aula, duracao_minutos || 60]
    );

    return resultado.insertId;
}

async function buscarTodas() {
    const [linhas] = await pool.query(`SELECT ${CAMPOS_SELECT} ${JOINS} ORDER BY a.data_aula ASC`);
    return linhas;
}

async function buscarPorId(idaula) {
    const [linhas] = await pool.query(
        `SELECT ${CAMPOS_SELECT} ${JOINS} WHERE a.idaula = ? LIMIT 1`,
        [idaula]
    );

    return linhas[0] || null;
}

async function atualizarStatus(idaula, novoStatus) {
    const [resultado] = await pool.query(
        `UPDATE aula SET status = ? WHERE idaula = ?`,
        [novoStatus, idaula]
    );

    return resultado.affectedRows > 0;
}

async function atualizar(idaula, dados) {
    const camposPermitidos = [
        "professor_idprofessor",
        "aluno_idaluno",
        "sala",
        "data_aula",
        "duracao_minutos",
    ];

    const campos = [];
    const valores = [];

    for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) {
            campos.push(`${campo} = ?`);
            valores.push(dados[campo]);
        }
    }

    if (campos.length === 0) {
        return false;
    }

    valores.push(idaula);

    const [resultado] = await pool.query(
        `UPDATE aula SET ${campos.join(", ")} WHERE idaula = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function excluir(idaula) {
    const [resultado] = await pool.query(`DELETE FROM aula WHERE idaula = ?`, [idaula]);
    return resultado.affectedRows > 0;
}

module.exports = {
    SALAS_VALIDAS,
    cadastrar,
    buscarTodas,
    buscarPorId,
    atualizarStatus,
    atualizar,
    excluir,
};