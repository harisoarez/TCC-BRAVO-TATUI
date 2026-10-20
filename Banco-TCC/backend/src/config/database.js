// Criar conexão com o MySQL

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Carrega .env do backend ou da raiz do projeto
const envBackend = path.resolve(__dirname, '../../.env');
const envRoot = path.resolve(__dirname, '../../../../.env');
const envExample = path.resolve(__dirname, '../../.env.example');

// Se nenhum .env existir (ex: repositório recém-clonado), cria a partir de .env.example
if (!fs.existsSync(envBackend) && !fs.existsSync(envRoot) && fs.existsSync(envExample)) {
  try {
    fs.copyFileSync(envExample, envBackend);
    console.log('[Setup] Arquivo .env criado automaticamente a partir de .env.example');
  } catch (e) {}
}

if (fs.existsSync(envBackend)) {
  require('dotenv').config({ path: envBackend });
}
if (fs.existsSync(envRoot)) {
  require('dotenv').config({ path: envRoot });
}
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS !== undefined ? process.env.DB_PASS : '1234';
const dbName = process.env.DB_NAME || 'instituto_bravo';

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('MySQL conectado com sucesso!');
    connection.release();
  })
  .catch(async err => {
    const detalhe = err.code || (err.errors && err.errors[0]?.code) || err.message || err;
    if (detalhe === 'ECONNREFUSED') {
      console.error('Erro MySQL: Conexão recusada (ECONNREFUSED) na porta 3306. Verifique se o serviço do MySQL (ou XAMPP/Wamp) está ativo.');
    } else if (detalhe === 'ER_BAD_DB_ERROR') {
      console.log(`[MySQL] O banco '${dbName}' ainda não existe. Tentando criar automaticamente...`);
      try {
        const adminConn = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPass });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await adminConn.end();
        console.log(`[MySQL] Banco '${dbName}' criado com sucesso! Reinicie o servidor para conectar.`);
      } catch (createErr) {
        console.error(`Erro ao criar o banco '${dbName}':`, createErr.message);
      }
    } else if (detalhe === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`Erro MySQL: Acesso negado para o usuário '${dbUser}'. Verifique a senha configurada no seu arquivo .env (se usa XAMPP, a senha costuma ser vazia; se usa MySQL Workbench, coloque a senha configurada na instalação).`);
    } else {
      console.error('Erro MySQL:', detalhe);
    }
  });

module.exports = pool;
