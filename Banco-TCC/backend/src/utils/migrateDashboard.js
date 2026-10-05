const pool = require("../config/database");

async function migrate() {
    try {
        console.log("Iniciando migração do Dashboard e Financeiro...");

        // 1. Verificar e adicionar comprovante_url
        const [colsComprovante] = await pool.query(
            "SHOW COLUMNS FROM financeiro_recebimento LIKE 'comprovante_url'"
        );
        if (colsComprovante.length === 0) {
            await pool.query(
                "ALTER TABLE financeiro_recebimento ADD COLUMN comprovante_url VARCHAR(255) NULL"
            );
            console.log("✓ Coluna comprovante_url adicionada.");
        } else {
            console.log("✓ Coluna comprovante_url já existe.");
        }

        // 2. Verificar e adicionar mes_referencia
        const [colsMes] = await pool.query(
            "SHOW COLUMNS FROM financeiro_recebimento LIKE 'mes_referencia'"
        );
        if (colsMes.length === 0) {
            await pool.query(
                "ALTER TABLE financeiro_recebimento ADD COLUMN mes_referencia VARCHAR(20) NULL"
            );
            console.log("✓ Coluna mes_referencia adicionada.");
        } else {
            console.log("✓ Coluna mes_referencia já existe.");
        }

        console.log("Migração concluída com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro na migração:", err);
        process.exit(1);
    }
}

migrate();
