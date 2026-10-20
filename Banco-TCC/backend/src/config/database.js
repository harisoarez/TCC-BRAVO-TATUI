// Criar conexão com o MySQL

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Carrega .env do backend ou da raiz do projeto
const envBackend = path.resolve(__dirname, '../../.env');
const envRoot = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(envBackend)) {
  require('dotenv').config({ path: envBackend });
}
if (fs.existsSync(envRoot)) {
  require('dotenv').config({ path: envRoot });
}
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'instituto_bravo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('MySQL conectado com sucesso!');
    connection.release();
  })
  .catch(err => {
    const detalhe = err.code || (err.errors && err.errors[0]?.code) || err.message || err;
    if (detalhe === 'ECONNREFUSED') {
      console.error('Erro MySQL: Conexão recusada (ECONNREFUSED) na porta 3306. Verifique se o serviço do MySQL (ou XAMPP/Wamp) está ativo.');
    } else {
      console.error('Erro MySQL:', detalhe);
    }
  });

module.exports = pool;
