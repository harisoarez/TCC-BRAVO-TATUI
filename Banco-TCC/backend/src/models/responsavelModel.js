const pool = require("../config/database");

async function criarOuBuscarPorEmailResponsavel(conexao, dadosResponsavel) {
  const { nome, telefone, email } = dadosResponsavel;

  if (email) {
    const [existentes] = await conexao.query(
      `SELECT idResponsavel FROM responsavel_legal WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existentes[0]) {
      return existentes[0].idResponsavel;
    }
  }

  const [resultado] = await conexao.query(
    `INSERT INTO responsavel_legal (nome, telefone, email) VALUES (?, ?, ?)`,
    [nome, telefone, email]
  );

  return resultado.insertId;
}

async function buscarPorIdResponsavel(idResponsavel) {
  const [linhas] = await pool.query(
    `SELECT idResponsavel, nome, telefone, email
       FROM responsavel_legal
      WHERE idResponsavel = ?
      LIMIT 1`,
    [idResponsavel]
  );

  return linhas[0] || null;
}

async function vincularAluno(conexao, dadosVinculo) {
  const { aluno_idaluno, idResponsavel, parentesco, responsavel_principal } = dadosVinculo;

  await conexao.query(
    `INSERT INTO aluno_responsavel
      (aluno_idaluno, responsavel_legal_idResponsavel, parentesco, responsavel_principal)
     VALUES (?, ?, ?, ?)`,
    [aluno_idaluno, idResponsavel, parentesco, responsavel_principal ? 1 : 0]
  );
}

async function buscarTodos() {
  const [linhas] = await pool.query(
    `SELECT idResponsavel, nome, telefone, email FROM responsavel_legal ORDER BY nome ASC`
  );

  return linhas;
}

async function atualizar(idResponsavel, dados) {
  const camposPermitidos = ["nome", "telefone", "email"];

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

  valores.push(idResponsavel);

  const [resultado] = await pool.query(
    `UPDATE responsavel_legal SET ${campos.join(", ")} WHERE idResponsavel = ?`,
    valores
  );

  return resultado.affectedRows > 0;
}

async function excluir(idResponsavel) {
  const [resultado] = await pool.query(
    `DELETE FROM responsavel_legal WHERE idResponsavel = ?`,
    [idResponsavel]
  );

  return resultado.affectedRows > 0;
}

module.exports = {
  criarOuBuscarPorEmailResponsavel,
  buscarPorIdResponsavel,
  buscarTodos,
  atualizar,
  excluir,
  vincularAluno,
};