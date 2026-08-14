const pool = require("../config/database");

async function cadastrar(connection, dadosAluno) {
    const {
            CPF,
            endereco_rua,
            endereco_numero,
            endereco_bairro,
            endereco_cidade,
            endereco_cep,
            data_nascimento,
            usuario_login_id
        } = dadosAluno;


    const [resultado] = await connection.query(
        `INSERT INTO aluno(
            CPF,
            endereco_rua,
            endereco_numero,
            endereco_bairro,
            endereco_cidade,
            endereco_cep,
            data_nascimento,
            usuario_login_id
        ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            CPF,
            endereco_rua,
            endereco_numero,
            endereco_bairro,
            endereco_cidade,
            endereco_cep,
            data_nascimento,
            usuario_login_id
        ]
    );

    return resultado.insertId;
}

async function buscarTodos() {
    const [linhas] = await pool.query(
        `SELECT a.idaluno, 
        a.CPF, 
        a.endereco_rua, 
        a.endereco_numero, 
        a.endereco_bairro, 
        a.endereco_cidade, 
        a.endereco_cep, 
        a.data_nascimento, 
        a.usuario_login_id,
        u.firebase_uid,
        u.nome,
        u.email,
        u.telefone,
        u.tipo_instrumento,
        u.autorizacao_imagem,
        u.foto_url,
        u.data_cadastro,
        u.ultimo_acesso
        FROM aluno a
        JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
        ORDER BY u.nome ASC`
    );

    return linhas;
}


async function buscarPorId(idaluno) {
    const [linhas] = await pool.query(
        `SELECT a.idaluno, a.CPF, a.endereco_rua, a.endereco_numero, a.endereco_bairro, a.endereco_cidade, a.endereco_cep, a.data_nascimento, 
        u.id_usuario, u.firebase_uid, u.tipo_usuario, u.email, u.nome, u.telefone, u.tipo_instrumento, u.autorizacao_imagem, u.foto_url, u.data_cadastro, u.ultimo_acesso, u.primeiro_acesso
        FROM aluno a
        JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
        WHERE a.idaluno = ?
        LIMIT 1`,
        [idaluno]
    );

    return linhas[0] || null;
}

async function atualizar(conexao, idaluno, dados) {
    const camposPermitidos = [
        'CPF',
        'endereco_rua',
        'endereco_numero',  
        'endereco_bairro',
        'endereco_cidade',
        'endereco_cep',
        'data_nascimento', 
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

    valores.push(idaluno);

    const [resultado] = await conexao.query(
        `UPDATE aluno
        SET ${campos.join(", ")}
        WHERE idaluno = ?`,
        valores
    );

    return resultado.affectedRows > 0;
}

async function buscarUsuarioLoginId(idaluno) {
    const [linhas] = await pool.query(
        `SELECT usuario_login_id
        FROM aluno
        WHERE idaluno = ?
        LIMIT 1`,
        [idaluno]
    );

    return linhas[0] ? linhas[0].usuario_login_id : null;
}

async function removerDependencias(conexao, idaluno) {
    await conexao.query(`DELETE FROM aula WHERE aluno_idaluno = ?`, [idaluno]);
    await conexao.query(
        `DELETE FROM financeiro_recebimento WHERE aluno_idaluno = ?`,
        [idaluno]
    );
    await conexao.query(
        `DELETE FROM aluno_responsavel WHERE aluno_idaluno = ?`,
        [idaluno]
    );
}

async function excluir(conexao, idaluno) {
    const [resultado] = await conexao.query(
        `DELETE FROM aluno WHERE idaluno = ?`,
        [idaluno]
    );

    return resultado.affectedRows > 0;
}

async function buscarPorUsuarioLoginId(usuario_login_id) {
    const [linhas] = await pool.query(
        `SELECT idaluno FROM aluno WHERE usuario_login_id = ? LIMIT 1`,
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
    excluir
}