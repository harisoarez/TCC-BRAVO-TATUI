const pool = require("../config/database");


async function listarPorAluno(aluno_idaluno) {
    const [linhas] = await pool.query(
        `SELECT r.idResponsavel, r.nome, r.telefone, r.email,
                ar.parentesco, ar.responsavel_principal
           FROM aluno_responsavel ar
           JOIN responsavel_legal r ON r.idResponsavel = ar.responsavel_legal_idResponsavel
          WHERE ar.aluno_idaluno = ?`,
        [aluno_idaluno]
    );

    return linhas;
}

async function listarAlunosPorResponsavel(responsavel_idResponsavel) {
    const [linhas] = await pool.query(
        `SELECT a.idaluno, u.nome AS aluno_nome,
                ar.parentesco, ar.responsavel_principal
           FROM aluno_responsavel ar
           JOIN aluno a ON a.idaluno = ar.aluno_idaluno
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
          WHERE ar.responsavel_legal_idResponsavel = ?`,
        [responsavel_idResponsavel]
    );

    return linhas;
}


async function adicionar(conexao, dadosVinculo) {
    const { aluno_idaluno, responsavel_legal_idResponsavel, parentesco, responsavel_principal } = dadosVinculo;

    await conexao.query(
        `INSERT INTO aluno_responsavel
          (aluno_idaluno, responsavel_legal_idResponsavel, parentesco, responsavel_principal)
         VALUES (?, ?, ?, ?)`,
        [aluno_idaluno, responsavel_legal_idResponsavel, parentesco, responsavel_principal ? 1 : 0]
    );
}

async function atualizar(conexao, aluno_idaluno, responsavel_idResponsavel, dados) {
    const camposPermitidos = ["parentesco", "responsavel_principal"];

    const campos = [];
    const valores = [];

    for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) {
            campos.push(`${campo} = ?`);
            valores.push(campo === "responsavel_principal" ? (dados[campo] ? 1 : 0) : dados[campo]);
        }
    }

    if (campos.length === 0) {
        return false;
    }

    valores.push(aluno_idaluno, responsavel_idResponsavel);

    const [resultado] = await conexao.query(
        `UPDATE aluno_responsavel
            SET ${campos.join(", ")}
          WHERE aluno_idaluno = ? AND responsavel_legal_idResponsavel = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function remover(conexao, aluno_idaluno, responsavel_idResponsavel) {
    const [resultado] = await conexao.query(
        `DELETE FROM aluno_responsavel
          WHERE aluno_idaluno = ? AND responsavel_legal_idResponsavel = ?`,
        [aluno_idaluno, responsavel_idResponsavel]
    );

    return resultado.affectedRows > 0;
}

async function removerTodosDoAluno(conexao, aluno_idaluno) {
    await conexao.query(
        `DELETE FROM aluno_responsavel WHERE aluno_idaluno = ?`,
        [aluno_idaluno]
    );
}

module.exports = {
    listarPorAluno,
    listarAlunosPorResponsavel,
    adicionar,
    atualizar,
    remover,
    removerTodosDoAluno,
};