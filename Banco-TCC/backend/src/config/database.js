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
const dbPass = process.env.DB_PASS !== undefined ? String(process.env.DB_PASS) : '12345678';
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
let createdDbFallback = false;

// Senhas candidatas para recuperação automática entre Laragon, XAMPP e diferentes PCs
const candidatePasswords = [...new Set([dbPass, '12345678', '', '1234', '277353', 'root'].filter(p => typeof p === 'string'))];
let candidateIndex = 0;
let switchingPromise = null;

// Função inteligente de execução com recuperação automática para Laragon / PC da Escola / PC Pessoal
async function executeSmart(prop, args) {
  if (switchingPromise) {
    await switchingPromise;
  }

  try {
    return await currentPool[prop](...args);
  } catch (err) {
    const code = err.code || (err.errors && err.errors[0]?.code) || '';

    // 1. Senha rejeitada (Ex: Laragon usa senha vazia '', PC pessoal usa '1234' ou '12345678')
    if (code === 'ER_ACCESS_DENIED_ERROR') {
      if (!switchingPromise) {
        switchingPromise = (async () => {
          while (candidateIndex < candidatePasswords.length - 1) {
            candidateIndex++;
            const novaSenha = candidatePasswords[candidateIndex];
            console.log(`[MySQL] Alternando credencial para ambiente Laragon/Local (senha '${novaSenha ? novaSenha : 'vazia'}')...`);
            const novoPool = mysql.createPool({ ...poolConfig, password: novaSenha });
            try {
              const conn = await novoPool.getConnection();
              conn.release();
              poolConfig.password = novaSenha;
              currentPool = novoPool;
              console.log('[MySQL] Conexão restabelecida com sucesso!');
              return;
            } catch (retryErr) {
              await novoPool.end().catch(() => {});
              if (retryErr.code !== 'ER_ACCESS_DENIED_ERROR') {
                throw retryErr;
              }
            }
          }
          console.error(`[MySQL] Erro: Acesso negado para o usuário '${dbUser}'. Verifique a senha configurada no arquivo .env.`);
        })().finally(() => {
          switchingPromise = null;
        });
      }

      await switchingPromise;
      return await currentPool[prop](...args);
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

    // Diagnóstico claro se o Laragon/MySQL estiver desligado
    if (code === 'ECONNREFUSED') {
      console.error('\n=============================================================');
      console.error('[MySQL] ERRO: Conexão recusada na porta 3306 (ECONNREFUSED).');
      console.error('-> Verifique se o LARAGON ou o serviço MySQL está ativo.');
      console.error('=============================================================\n');
    }

    throw err;
  }
}

// Smart Pool: Compatibilidade total automática entre PC pessoal (senha 12345678 / 1234)
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
