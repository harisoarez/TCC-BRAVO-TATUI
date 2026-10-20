const fs = require('fs');
const path = require('path');
const pool = require('./database');
const popularBanco = require('../utils/seed');

async function autoInicializarBanco() {
    try {
        console.log("[Banco de Dados] Verificando integridade das tabelas...");
        
        // 1. Executa comandos estruturais de banco.sql
        const sqlPath = path.resolve(__dirname, '../../database/banco.sql');
        if (fs.existsSync(sqlPath)) {
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');
            const comandos = sqlContent
                .replace(/--.*$/gm, '')
                .split(';')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0);

            for (const comando of comandos) {
                // Pula comando USE pois a conexão já está no pool com a database
                if (/^use\s+/i.test(comando) || /^create\s+database/i.test(comando)) {
                    continue;
                }
                try {
                    await pool.query(comando);
                } catch (cmdErr) {
                    // Ignora tabelas que já existem
                    if (!cmdErr.message.includes('already exists')) {
                        // console.warn("Aviso SQL:", cmdErr.message);
                    }
                }
            }
        }

        // 2. Verifica se existem usuários no banco; se vazio, executa o seed inicial automaticamente
        const [usuarios] = await pool.query("SELECT COUNT(*) AS total FROM usuario_login");
        if (usuarios[0].total === 0) {
            console.log("[Banco de Dados] Nenhum usuário encontrado. Executando seed inicial automático...");
            await popularBanco();
            console.log("[Banco de Dados] Contas iniciais criadas com sucesso (Owner, Admin, Professor, Aluno)!");
        } else {
            console.log(`[Banco de Dados] ${usuarios[0].total} usuário(s) ativos encontrados.`);
        }

        console.log("[Banco de Dados] Estrutura verificada com sucesso!");
    } catch (err) {
        console.error("[Banco de Dados] Erro durante a inicialização automática:", err.message);
    }
}

module.exports = autoInicializarBanco;
