 // criar conexao com o mysql

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
.then(connection => {
  console.log('✅ MySQL conectado');
  connection.release();
})
.catch(err => {
  const detalhe = err.code || (err.errors && err.errors[0]?.code) || err.message || err;
  if (detalhe === 'ECONNREFUSED') {
    console.error('❌ Erro MySQL: Conexão recusada (ECONNREFUSED) na porta 3306. Verifique se o serviço do MySQL (ou XAMPP/Wamp) está ativo.');
  } else {
    console.error('❌ Erro MySQL:', detalhe);
  }
});

module.exports = pool;