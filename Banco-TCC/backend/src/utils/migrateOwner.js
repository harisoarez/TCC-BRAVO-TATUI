const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function migrate() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true,
    });

    console.log("Conectado ao MySQL.");

    // 1. Atualizar ENUM tipo_usuario
    await conn.query(`
        ALTER TABLE usuario_login 
        MODIFY COLUMN tipo_usuario ENUM('owner', 'admin', 'normal', 'aluno', 'professor') NOT NULL DEFAULT 'normal'
    `);
    console.log("ENUM tipo_usuario atualizado para incluir owner e normal.");

    // 2. Adicionar coluna cpf em usuario_login se não existir
    const [cols] = await conn.query("SHOW COLUMNS FROM usuario_login LIKE 'cpf'");
    if (cols.length === 0) {
        await conn.query("ALTER TABLE usuario_login ADD COLUMN cpf VARCHAR(14) NULL AFTER telefone");
        console.log("Coluna cpf adicionada em usuario_login.");
    } else {
        console.log("Coluna cpf já existe em usuario_login.");
    }

    // 3. Criar ou atualizar o usuário Owner
    const senhaHash = await bcrypt.hash("D@hl1a_P1nn@t4!", 10);
    const [owners] = await conn.query("SELECT id_usuario FROM usuario_login WHERE email = ?", [
        "owner@institutobravo.com.br",
    ]);

    if (owners.length === 0) {
        await conn.query(
            `INSERT INTO usuario_login (senha, tipo_usuario, email, nome, telefone, primeiro_acesso, data_cadastro)
             VALUES (?, 'owner', 'owner@institutobravo.com.br', 'Owner', '15999990000', 0, NOW())`,
            [senhaHash]
        );
        console.log("✅ Usuário Owner criado: owner@institutobravo.com.br / D@hl1a_P1nn@t4!");
    } else {
        await conn.query(
            `UPDATE usuario_login 
             SET senha = ?, tipo_usuario = 'owner', nome = 'Owner', primeiro_acesso = 0 
             WHERE email = ?`,
            [senhaHash, "owner@institutobravo.com.br"]
        );
        console.log("✅ Usuário Owner atualizado com sucesso.");
    }

    await conn.end();
}

migrate()
    .then(() => console.log("Migração concluída com sucesso."))
    .catch((err) => {
        console.error("Erro na migração:", err);
        process.exit(1);
    });
