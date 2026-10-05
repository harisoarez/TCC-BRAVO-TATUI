const pool = require("../config/database");
const bcrypt = require("bcryptjs");

async function seedDashboard() {
    try {
        console.log("Seeding dados realistas do Dashboard (Alunos, Aniversários, Mensalidades e Histórico)...");

        const senhaPadrao = await bcrypt.hash("aluno123", 10);

        // Lista de alunos para enriquecer a base
        const novosAlunos = [
            { nome: "Beatriz Albuquerque", email: "beatriz.albuquerque@email.com", tel: "(15) 99811-2233", cpf: "12345678901", data_nasc: "2006-10-08", data_cad: "2026-05-10" },
            { nome: "Gabriel Souza", email: "gabriel.souza@email.com", tel: "(15) 99722-3344", cpf: "23456789012", data_nasc: "2004-10-22", data_cad: "2026-06-14" },
            { nome: "Mariana Costa", email: "mariana.costa@email.com", tel: "(15) 99633-4455", cpf: "34567890123", data_nasc: "2007-10-15", data_cad: "2026-07-02" },
            { nome: "Rafael Moreira", email: "rafael.moreira@email.com", tel: "(15) 99544-5566", cpf: "45678901234", data_nasc: "2003-05-03", data_cad: "2026-08-19" },
            { nome: "Juliana Mendes", email: "juliana.mendes@email.com", tel: "(15) 99455-6677", cpf: "56789012345", data_nasc: "2005-10-29", data_cad: "2026-09-05" },
            { nome: "Matheus Lima", email: "matheus.lima@email.com", tel: "(15) 99366-7788", cpf: "67890123456", data_nasc: "2002-02-18", data_cad: "2026-09-22" },
            { nome: "Sophia Guimarães", email: "sophia.guimaraes@email.com", tel: "(15) 99277-8899", cpf: "78901234567", data_nasc: "2006-11-11", data_cad: "2026-10-01" },
        ];

        for (const al of novosAlunos) {
            const [existente] = await pool.query("SELECT id_usuario FROM usuario_login WHERE email = ?", [al.email]);
            let idUsuario;
            if (existente.length === 0) {
                const [resU] = await pool.query(
                    `INSERT INTO usuario_login (nome, email, telefone, cpf, senha, tipo_usuario, primeiro_acesso, data_cadastro)
                     VALUES (?, ?, ?, ?, ?, 'aluno', 0, ?)`,
                    [al.nome, al.email, al.tel, al.cpf, senhaPadrao, al.data_cad]
                );
                idUsuario = resU.insertId;
                await pool.query(
                    `INSERT INTO aluno (CPF, data_nascimento, usuario_login_id)
                     VALUES (?, ?, ?)`,
                    [al.cpf, al.data_nasc, idUsuario]
                );
                console.log(`Aluno criado: ${al.nome}`);
            }
        }

        // Buscar todos os alunos cadastrados
        const [alunosBanco] = await pool.query("SELECT idaluno, usuario_login_id FROM aluno ORDER BY idaluno ASC");

        // Limpar mensalidades antigas para consistência dos testes se estiver vazio ou recriar
        const [mensalidadesAtuais] = await pool.query("SELECT COUNT(*) as qtd FROM financeiro_recebimento");
        if (mensalidadesAtuais[0].qtd === 0) {
            console.log("Inserindo mensalidades de teste do Mês Passado (Setembro 2026) e Mês Atual (Outubro 2026)...");

            // Mensalidades de Setembro 2026 (Mês Passado - Pagas, compondo a "sombrinha")
            const mensalidadesSetembro = [
                { idAluno: alunosBanco[0]?.idaluno, valor: 180.00, venc: "2026-09-05", pag: "2026-09-04 10:30:00", forma: "pix" },
                { idAluno: alunosBanco[1]?.idaluno, valor: 210.00, venc: "2026-09-10", pag: "2026-09-09 14:15:00", forma: "cartao" },
                { idAluno: alunosBanco[2]?.idaluno, valor: 195.00, venc: "2026-09-15", pag: "2026-09-15 11:00:00", forma: "pix" },
                { idAluno: alunosBanco[3]?.idaluno, valor: 220.00, venc: "2026-09-20", pag: "2026-09-19 16:45:00", forma: "boleto" },
                { idAluno: alunosBanco[4]?.idaluno, valor: 180.00, venc: "2026-09-25", pag: "2026-09-24 09:20:00", forma: "dinheiro" },
                { idAluno: alunosBanco[5]?.idaluno, valor: 190.00, venc: "2026-09-28", pag: "2026-09-28 17:10:00", forma: "pix" },
            ];

            for (const m of mensalidadesSetembro) {
                if (m.idAluno) {
                    await pool.query(
                        `INSERT INTO financeiro_recebimento 
                        (data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento, mes_referencia, aluno_idaluno)
                        VALUES (?, ?, ?, 'pago', ?, '09/2026', ?)`,
                        [m.venc, m.pag, m.valor, m.forma, m.idAluno]
                    );
                }
            }

            // Mensalidades de Outubro 2026 (Mês Atual - Pagas, Pendentes e Vencidas)
            const mensalidadesOutubro = [
                // Pagos
                { idAluno: alunosBanco[0]?.idaluno, valor: 180.00, venc: "2026-10-05", pag: "2026-10-04 11:20:00", status: "pago", forma: "pix", comprovante: "/uploads/comprovantes/exemplo_comprovante_1.png" },
                { idAluno: alunosBanco[2]?.idaluno, valor: 220.00, venc: "2026-10-05", pag: "2026-10-05 15:40:00", status: "pago", forma: "cartao", comprovante: "/uploads/comprovantes/exemplo_comprovante_2.png" },
                { idAluno: alunosBanco[5]?.idaluno, valor: 195.00, venc: "2026-10-07", pag: "2026-10-06 09:10:00", status: "pago", forma: "dinheiro", comprovante: null },
                // Pendentes (precisam pagar)
                { idAluno: alunosBanco[1]?.idaluno, valor: 210.00, venc: "2026-10-15", pag: null, status: "pendente", forma: null, comprovante: null },
                { idAluno: alunosBanco[6]?.idaluno, valor: 180.00, venc: "2026-10-25", pag: null, status: "pendente", forma: null, comprovante: null },
                // Vencidos (atrasados)
                { idAluno: alunosBanco[3]?.idaluno, valor: 190.00, venc: "2026-10-01", pag: null, status: "atrasado", forma: null, comprovante: null },
                { idAluno: alunosBanco[4]?.idaluno, valor: 180.00, venc: "2026-10-03", pag: null, status: "atrasado", forma: null, comprovante: null },
            ];

            for (const m of mensalidadesOutubro) {
                if (m.idAluno) {
                    await pool.query(
                        `INSERT INTO financeiro_recebimento 
                        (data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento, comprovante_url, mes_referencia, aluno_idaluno)
                        VALUES (?, ?, ?, ?, ?, ?, '10/2026', ?)`,
                        [m.venc, m.pag, m.valor, m.status, m.forma, m.comprovante, m.idAluno]
                    );
                }
            }

            console.log("✓ Mensalidades inseridas com sucesso!");
        }

        console.log("Seeding concluído!");
        process.exit(0);
    } catch (err) {
        console.error("Erro no seed do dashboard:", err);
        process.exit(1);
    }
}

seedDashboard();
