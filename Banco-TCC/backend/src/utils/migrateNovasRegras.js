const pool = require("../config/database");

async function migrateNovasRegras() {
    try {
        console.log("Iniciando migração de banco para novas regras (Cursos, Descontos, Status em Análise e Perfil)...");

        // 1. Tabela curso_mensalidade
        await pool.query(`
            CREATE TABLE IF NOT EXISTS curso_mensalidade (
                idcurso INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE,
                valor_mensalidade DECIMAL(10,2) NOT NULL DEFAULT 180.00,
                ativo TINYINT(1) DEFAULT 1
            )
        `);
        console.log("✓ Tabela curso_mensalidade pronta.");

        // Inserir cursos padrão do Instituto Bravo se não existirem
        const cursosPadrao = [
            { nome: "Piano", valor: 210.00 },
            { nome: "Violino", valor: 195.00 },
            { nome: "Bateria", valor: 210.00 },
            { nome: "Canto", valor: 220.00 },
            { nome: "Violão", valor: 180.00 },
            { nome: "Clarinete", valor: 185.00 },
            { nome: "Saxofone", valor: 195.00 },
            { nome: "Flauta", valor: 180.00 },
            { nome: "Teoria Musical", valor: 150.00 },
        ];

        for (const c of cursosPadrao) {
            await pool.query(
                `INSERT INTO curso_mensalidade (nome, valor_mensalidade)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE valor_mensalidade = VALUES(valor_mensalidade)`,
                [c.nome, c.valor]
            );
        }
        console.log("✓ Cursos padrão inseridos/atualizados.");

        // 2. Colunas em aluno (curso e desconto_porcentagem)
        const [colsAlunoCurso] = await pool.query("SHOW COLUMNS FROM aluno LIKE 'curso'");
        if (colsAlunoCurso.length === 0) {
            await pool.query("ALTER TABLE aluno ADD COLUMN curso VARCHAR(100) NULL DEFAULT 'Piano'");
            console.log("✓ Coluna aluno.curso adicionada.");
        }

        const [colsAlunoDesc] = await pool.query("SHOW COLUMNS FROM aluno LIKE 'desconto_porcentagem'");
        if (colsAlunoDesc.length === 0) {
            await pool.query("ALTER TABLE aluno ADD COLUMN desconto_porcentagem DECIMAL(5,2) NOT NULL DEFAULT 0.00");
            console.log("✓ Coluna aluno.desconto_porcentagem adicionada.");
        }

        // 3. Coluna descricao em usuario_login (foto_url já existe)
        const [colsUserDesc] = await pool.query("SHOW COLUMNS FROM usuario_login LIKE 'descricao'");
        if (colsUserDesc.length === 0) {
            await pool.query("ALTER TABLE usuario_login ADD COLUMN descricao TEXT NULL");
            console.log("✓ Coluna usuario_login.descricao adicionada.");
        }

        // 4. Modificar status_parcela em financeiro_recebimento para incluir 'em_analise'
        await pool.query(`
            ALTER TABLE financeiro_recebimento 
            MODIFY COLUMN status_parcela ENUM('pendente', 'em_analise', 'pago', 'atrasado') DEFAULT 'pendente'
        `);
        console.log("✓ status_parcela atualizado com 'em_analise'.");

        // 5. Associar cursos variados aos alunos para testar
        const cursosAtribuir = ["Piano", "Violino", "Bateria", "Canto", "Violão", "Clarinete", "Saxofone", "Flauta"];
        const [alunos] = await pool.query("SELECT idaluno FROM aluno ORDER BY idaluno ASC");
        for (let i = 0; i < alunos.length; i++) {
            const cNome = cursosAtribuir[i % cursosAtribuir.length];
            await pool.query("UPDATE aluno SET curso = ? WHERE idaluno = ?", [cNome, alunos[i].idaluno]);
        }
        console.log("✓ Alunos associados a cursos com sucesso.");

        // 6. Colocar um aluno em 'em_analise' com comprovante para teste de verificação
        if (alunos.length > 2) {
            await pool.query(`
                UPDATE financeiro_recebimento
                SET status_parcela = 'em_analise',
                    comprovante_url = '/uploads/comprovantes/exemplo_comprovante_1.png'
                WHERE aluno_idaluno = ? AND mes_referencia = '10/2026'
                LIMIT 1
            `, [alunos[1].idaluno]);
            console.log("✓ Aluno de teste colocado em status 'em_analise'.");
        }

        console.log("Migração concluída com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro na migração:", err);
        process.exit(1);
    }
}

migrateNovasRegras();
