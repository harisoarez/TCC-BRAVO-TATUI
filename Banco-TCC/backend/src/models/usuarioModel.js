const pool = require("../config/database");

async function inserir(conexao, dadosUsuario) {
    const {
        firebase_uid,
        tipo_usuario,
        email,
        nome,
        telefone,
        tipo_instrumento,
        autorizacao_imagem,
        foto_url,
    } = dadosUsuario;

    const [resultado] = await conexao.query(
        `INSERT INTO usuario_login(
        firebase_uid, 
        tipo_usuario,
        email, 
        nome, 
        telefone, 
        tipo_instrumento,
       autorizacao_imagem, 
       foto_url, 
       data_cadastro, 
       ultimo_acesso, 
       primeiro_acesso
       )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL, 1)`,

        [
            firebase_uid,
            tipo_usuario,
            email,
            nome,
            telefone,
            tipo_instrumento,
            autorizacao_imagem,
            foto_url,
        ]
    );

    return resultado.insertId;
}

async function buscarPorFirebaseUID(firebase_uid) {
    const [linhas] = await pool.query(
        `SELECT id_usuario, 
        firebase_uid, 
        tipo_usuario, 
        email, 
        nome, 
        telefone,
        tipo_instrumento, 
        autorizacao_imagem, 
        foto_url,
        data_cadastro, 
        ultimo_acesso, 
        primeiro_acesso
        FROM usuario_login
        WHERE firebase_uid = ?
        LIMIT 1`,
        [firebase_uid]
    );

    return linhas[0] || null;
}

async function buscarPorEmail(email) {
    const [linhas] = await pool.query(
        `SELECT id_usuario, 
        firebase_uid, 
        tipo_usuario, 
        email, 
        nome, 
        telefone,
        tipo_instrumento, 
        autorizacao_imagem, 
        foto_url,
        data_cadastro, 
        ultimo_acesso, 
        primeiro_acesso
        FROM usuario_login
        WHERE email = ?
        LIMIT 1`,
        [email]
    );

    return linhas[0] || null;
}

async function atualizarUltimoAcesso(firebase_uid) {
    await pool.query(
        `UPDATE usuario_login SET ultimo_acesso = NOW() WHERE firebase_uid = ?`,
        [firebase_uid]
    );
}

async function marcarPrimeiroAcessoConcluido(firebase_uid) {
    const [resultado] = await pool.query(
        `UPDATE usuario_login 
        SET primeiro_acesso = 0 WHERE firebase_uid = ?`,
        [firebase_uid]
    );

    return resultado.affectedRows > 0;
}

async function buscarPorId(id_usuario) {
    const [linhas] = await pool.query(
        `SELECT id_usuario,
        firebase_uid,
        tipo_usuario,
        email,
        nome,
        telefone,
        tipo_instrumento,
        autorizacao_imagem,
        foto_url,
        data_cadastro,
        ultimo_acesso,
        primeiro_acesso
        FROM usuario_login
        WHERE id_usuario = ?
        LIMIT 1`,
        [id_usuario]
    );

    return linhas[0] || null;
}

async function atualizar(conexao, id_usuario, dados) {
    const camposPermitidos = [
        "nome", 
        "telefone",
        "tipo_instrumento",
        "autorizacao_imagem",
        "foto_url"
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

    valores.push(id_usuario);

    const [resultado] = await conexao.query(
        `UPDATE usuario_login 
        SET ${campos.join(", ")} 
        WHERE id_usuario = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function excluir(conexao, id_usuario) {
    const [resultado] = await conexao.query(
        `DELETE FROM usuario_login 
        WHERE id_usuario = ?`,
        [id_usuario]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    inserir,
    buscarPorFirebaseUID,
    buscarPorEmail,
    buscarPorId,
    atualizar,
    excluir,
    atualizarUltimoAcesso,
    marcarPrimeiroAcessoConcluido,
}