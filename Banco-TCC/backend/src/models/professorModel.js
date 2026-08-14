const pool = require("../config/database");

async function cadastrar(conexao, dadosProfessor) {
    const { CNPJ, CPF, usuario_login_id } = dadosProfessor;

    const [resultado] = await conexao.query(
        `INSERT INTO professor (CNPJ, CPF, usuario_login_id) VALUES (?, ?, ?)`,
        [CNPJ, CPF, usuario_login_id]
    );

    return resultado.insertId;
}

async function buscarTodos() {
    const [linhas] = await pool.query(
        `SELECT p.idprofessor, p.CNPJ, p.CPF, p.usuario_login_id,
                u.id_usuario, u.nome, u.email, u.telefone, u.tipo_instrumento,
                u.autorizacao_imagem, u.foto_url, u.data_cadastro, u.ultimo_acesso
           FROM professor p
           JOIN usuario_login u ON u.id_usuario = p.usuario_login_id
          ORDER BY u.nome ASC`
    );

    return linhas;
}

async function buscarPorId(idprofessor) {
    const [linhas] = await pool.query(
        `SELECT p.idprofessor, p.CNPJ, p.CPF,
                u.id_usuario, u.firebase_uid, u.tipo_usuario, u.email, u.nome, u.telefone,
                u.tipo_instrumento, u.autorizacao_imagem, u.foto_url,
                u.data_cadastro, u.ultimo_acesso, u.primeiro_acesso
           FROM professor p
           JOIN usuario_login u ON u.id_usuario = p.usuario_login_id
          WHERE p.idprofessor = ?
          LIMIT 1`,
        [idprofessor]
    );

    return linhas[0] || null;
}

async function atualizar(conexao, idprofessor, dados) {
    const camposPermitidos = ["CPF", "CNPJ"];

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

    valores.push(idprofessor);

    const [resultado] = await conexao.query(
        `UPDATE professor SET ${campos.join(", ")} WHERE idprofessor = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function buscarUsuarioLoginId(idprofessor) {
    const [linhas] = await pool.query(
        `SELECT usuario_login_id FROM professor WHERE idprofessor = ? LIMIT 1`,
        [idprofessor]
    );

    return linhas[0] ? linhas[0].usuario_login_id : null;
}

async function removerDependencias(conexao, idprofessor) {
    await conexao.query(`DELETE FROM aula WHERE professor_idprofessor = ?`, [idprofessor]);
    await conexao.query(`DELETE FROM financeiro_pagamento WHERE professor_idprofessor = ?`, [idprofessor]);
}

async function excluir(conexao, idprofessor) {
    const [resultado] = await conexao.query(
        `DELETE FROM professor WHERE idprofessor = ?`,
        [idprofessor]
    );

    return resultado.affectedRows > 0;
}

async function buscarPorUsuarioLoginId(usuario_login_id) {
    const [linhas] = await pool.query(
        `SELECT idprofessor FROM professor WHERE usuario_login_id = ? LIMIT 1`,
        [usuario_login_id]
    );

    return linhas[0] || null;
}

module.exports = {
    cadastrar,
    buscarTodos,
    buscarPorId,
    atualizar,
    buscarUsuarioLoginId,
    buscarPorUsuarioLoginId,
    removerDependencias,
    excluir,
};