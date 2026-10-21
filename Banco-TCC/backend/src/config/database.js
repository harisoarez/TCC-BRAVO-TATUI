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
let dbPass = process.env.DB_PASS !== '';
const dbName = process.env.DB_NAME || 'instituto_bravo';

let poolConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let currentPool = mysql.createPool(poolConfig);
let switchedFallback = false;
let createdDbFallback = false;

// Função inteligente de execução com recuperação automática para Laragon / PC da Escola
async function executeSmart(prop, args) {
  try {
    return await currentPool[prop](...args);
  } catch (err) {
    const code = err.code || (err.errors && err.errors[0]?.code) || '';

    // 1. Senha rejeitada (Ex: Laragon / XAMPP na escola usa senha vazia '', enquanto PC pessoal usa '1234')
    if (code === 'ER_ACCESS_DENIED_ERROR' && !switchedFallback) {
      switchedFallback = true;
      const novaSenha = poolConfig.password === '' ? '1234' : '';
      console.log(`[MySQL] Alternando credencial para ambiente Laragon/Local (senha '${novaSenha ? '1234' : 'vazia'}')...`);
      poolConfig.password = novaSenha;
      currentPool = mysql.createPool(poolConfig);
      return await executeSmart(prop, args);
    }

    // 2. Banco ainda não criado (ER_BAD_DB_ERROR - PC da escola com Laragon recém-iniciado)
    if (code === 'ER_BAD_DB_ERROR' && !createdDbFallback) {
      createdDbFallback = true;
      console.log(`[MySQL] O banco '${dbName}' ainda não existe no Laragon. Criando automaticamente...`);
      try {
        const adminConn = await mysql.createConnection({
          host: dbHost,
          user: dbUser,
          password: poolConfig.password
        });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await adminConn.end();
        console.log(`[MySQL] Banco '${dbName}' criado com sucesso no Laragon!`);
        currentPool = mysql.createPool(poolConfig);
        return await executeSmart(prop, args);
      } catch (createErr) {
        console.error(`[MySQL] Erro ao criar banco '${dbName}':`, createErr.message);
      }
    }

    // Diagnóstico claro se o Laragon estiver desligado
    if (code === 'ECONNREFUSED') {
      console.error('\n=============================================================');
      console.error('[MySQL] ERRO: Conexão recusada na porta 3306 (ECONNREFUSED).');
      console.error('-> Verifique se o LARAGON está aberto e clique em "Iniciar Tudo" (Start All).');
      console.error('=============================================================\n');
    }

    throw err;
  }
}

// Smart Pool: Compatibilidade total automática entre PC pessoal (senha 1234)
// e computadores da escola / faculdade com Laragon ou XAMPP (senha vazia '')
const smartPool = new Proxy(currentPool, {
  get(target, prop) {
    if (prop === 'query' || prop === 'execute' || prop === 'getConnection') {
      return function(...args) {
        return executeSmart(prop, args);
      };
    }
    return currentPool[prop];
  }
});

// Teste inicial de diagnóstico ao subir o servidor
smartPool.getConnection()
  .then(connection => {
    console.log('MySQL conectado com sucesso!');
    connection.release();
  })
  .catch(err => {
    // Erros já diagnosticados em executeSmart
  });

module.exports = smartPool;
