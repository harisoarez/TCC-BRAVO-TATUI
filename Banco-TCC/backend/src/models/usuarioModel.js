const pool = require("../config/database");

async function inserir(conexao, dadosUsuario) {
    const {
        senha,
        tipo_usuario,
        email,
        nome,
        telefone,
        tipo_instrumento,
        autorizacao_imagem,
        foto_url,
        primeiro_acesso = 1,
    } = dadosUsuario;

    const db = conexao || pool;

    const [resultado] = await db.query(
        `INSERT INTO usuario_login(
            senha,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL, ?)`,
        [
            senha,
            tipo_usuario,
            email,
            nome,
            telefone || null,
            tipo_instrumento || null,
            autorizacao_imagem ? 1 : 0,
            foto_url || null,
            primeiro_acesso ? 1 : 0,
        ]
    );

    return resultado.insertId;
}

async function buscarPorEmail(email) {
    const [linhas] = await pool.query(
        `SELECT id_usuario, 
            senha,
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

async function buscarPorId(id_usuario) {
    const [linhas] = await pool.query(
        `SELECT id_usuario,
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

async function atualizarSenha(id_usuario, novaSenhaHash) {
    const [resultado] = await pool.query(
        `UPDATE usuario_login 
         SET senha = ?, primeiro_acesso = 0 
         WHERE id_usuario = ?`,
        [novaSenhaHash, id_usuario]
    );

    return resultado.affectedRows > 0;
}

async function atualizarUltimoAcesso(id_usuario) {
    await pool.query(
        `UPDATE usuario_login SET ultimo_acesso = NOW() WHERE id_usuario = ?`,
        [id_usuario]
    );
}

async function marcarPrimeiroAcessoConcluido(id_usuario) {
    const [resultado] = await pool.query(
        `UPDATE usuario_login 
        SET primeiro_acesso = 0 WHERE id_usuario = ?`,
        [id_usuario]
    );

    return resultado.affectedRows > 0;
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
    const db = conexao || pool;

    const [resultado] = await db.query(
        `UPDATE usuario_login 
        SET ${campos.join(", ")} 
        WHERE id_usuario = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function excluir(conexao, id_usuario) {
    const db = conexao || pool;
    const [resultado] = await db.query(
        `DELETE FROM usuario_login 
        WHERE id_usuario = ?`,
        [id_usuario]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    inserir,
    buscarPorEmail,
    buscarPorId,
    atualizarSenha,
    atualizar,
    excluir,
    atualizarUltimoAcesso,
    marcarPrimeiroAcessoConcluido,
};