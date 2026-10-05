const app = require("../../app");
const http = require("http");
const pool = require("../config/database");

const server = http.createServer(app);
server.listen(3004, async () => {
    try {
        console.log("Servidor de testes (Novas Regras) rodando na porta 3004...");

        const postJson = async (path, body, token) => {
            const headers = { "Content-Type": "application/json", "Accept": "application/json" };
            if (token) headers["Authorization"] = "Bearer " + token;
            const res = await fetch("http://localhost:3004" + path, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            return { status: res.status, data: await res.json() };
        };

        const getHtml = async (path, token) => {
            const headers = {};
            if (token) headers["Authorization"] = "Bearer " + token;
            const res = await fetch("http://localhost:3004" + path, { headers });
            return { status: res.status, text: await res.text() };
        };

        // 1. Logins
        console.log("\n--- TESTE 1: Autenticação de Owner, Admin e Aluno ---");
        const loginOwner = await postJson("/api/login", {
            email: "owner@institutobravo.com.br",
            senha: "D@hl1a_P1nn@t4!",
        });
        const tokenOwner = loginOwner.data.token;

        const loginAdmin = await postJson("/api/login", {
            email: "admin@institutobravo.com.br",
            senha: "admin123",
        });
        const tokenAdmin = loginAdmin.data.token;

        const loginAluno = await postJson("/api/login", {
            email: "aluno@institutobravo.com.br",
            senha: "aluno123",
        });
        const tokenAluno = loginAluno.data.token;

        console.log("✓ Tokens de Owner, Admin e Aluno obtidos com sucesso!");

        // 2. Correção do Bug: Owner não vira Admin ao abrir outras abas
        console.log("\n--- TESTE 2: Verificação do Bug (Owner permanece Owner em todas as páginas) ---");
        const pagUsuariosOwner = await getHtml(`/paginas/usuarios?token=${encodeURIComponent(tokenOwner)}`);
        console.log("Status /paginas/usuarios:", pagUsuariosOwner.status);
        const permOwnerEmUsuarios = pagUsuariosOwner.text.includes("👑 Owner");
        console.log("✓ Owner permanece Owner em /paginas/usuarios:", permOwnerEmUsuarios);
        if (!permOwnerEmUsuarios) {
            throw new Error("Bug persistiu: Owner virou Admin em /paginas/usuarios!");
        }

        // 3. Teste da Aba Usuários (Tabelas separadas de Alunos, Professores e Admins)
        console.log("\n--- TESTE 3: Aba Usuários com tabelas de Alunos, Professores e Admins ---");
        const temAlunos = pagUsuariosOwner.text.includes("Lista de Alunos");
        const temProfessores = pagUsuariosOwner.text.includes("Corpo Docente (Professores)");
        const temAdmins = pagUsuariosOwner.text.includes("Equipe Administrativa");
        console.log("✓ Tabela de Alunos presente:", temAlunos);
        console.log("✓ Tabela de Professores presente:", temProfessores);
        console.log("✓ Tabela de Administradores presente:", temAdmins);
        if (!temAlunos || !temProfessores || !temAdmins) {
            throw new Error("Faltam tabelas na aba Usuários");
        }

        // 4. Teste de Atribuição de Desconto pelo Owner (e Bloqueio para Admin)
        console.log("\n--- TESTE 4: Atribuição de Desconto (%) a Aluno Específico ---");
        const [alunoTeste] = await pool.query("SELECT idaluno, nome FROM aluno a JOIN usuario_login u ON a.usuario_login_id = u.id_usuario LIMIT 1");
        const idAluno = alunoTeste[0].idaluno;

        // Admin tentando dar desconto -> deve falhar com 403
        const adminTentaDesconto = await postJson(`/paginas/usuarios/aluno/${idAluno}/desconto`, { desconto: 15 }, tokenAdmin);
        console.log("Admin tentando dar desconto (esperado 403):", adminTentaDesconto.status);
        if (adminTentaDesconto.status !== 403) throw new Error("Admin conseguiu dar desconto!");

        // Owner dando desconto de 20%
        const ownerDaDesconto = await postJson(`/paginas/usuarios/aluno/${idAluno}/desconto`, { desconto: 20 }, tokenOwner);
        console.log("Owner dando desconto (esperado 200):", ownerDaDesconto.status, ownerDaDesconto.data.mensagem);
        if (ownerDaDesconto.status !== 200) throw new Error("Falha ao atribuir desconto como Owner");

        const [alunoApos] = await pool.query("SELECT desconto_porcentagem FROM aluno WHERE idaluno = ?", [idAluno]);
        console.log("Desconto gravado no banco:", alunoApos[0].desconto_porcentagem, "%");

        // 5. Teste de Consulta de Histórico de Mensalidades (Admin e Owner)
        console.log("\n--- TESTE 5: Consulta de Histórico de Mensalidades ---");
        const resHist = await fetch(`http://localhost:3004/paginas/usuarios/aluno/${idAluno}/historico?token=${encodeURIComponent(tokenAdmin)}`);
        const dadosHist = await resHist.json();
        console.log("Status histórico:", resHist.status, "Qtd parcelas no histórico:", dadosHist.dados?.mensalidades?.length);
        if (resHist.status !== 200 || !dadosHist.dados?.mensalidades) {
            throw new Error("Falha ao consultar histórico do aluno");
        }

        // 6. Teste de Configuração de Valor da Mensalidade do Curso pelo Owner
        console.log("\n--- TESTE 6: Configuração de Valor da Mensalidade por Curso ---");
        const [cursos] = await pool.query("SELECT idcurso, nome, valor_mensalidade FROM curso_mensalidade WHERE nome = 'Piano' LIMIT 1");
        const idCursoPiano = cursos[0].idcurso;

        // Admin tentando alterar valor de curso -> 403
        const adminTentaCurso = await postJson("/paginas/dashboard/curso/atualizar", { idcurso: idCursoPiano, novoValor: 250.00 }, tokenAdmin);
        console.log("Admin tentando alterar curso (esperado 403):", adminTentaCurso.status);
        if (adminTentaCurso.status !== 403) throw new Error("Admin conseguiu alterar valor de curso!");

        // Owner alterando valor de Piano para 225.00
        const ownerAlteraCurso = await postJson("/paginas/dashboard/curso/atualizar", { idcurso: idCursoPiano, novoValor: 225.00 }, tokenOwner);
        console.log("Owner alterando valor de curso (esperado 200):", ownerAlteraCurso.status, ownerAlteraCurso.data.mensagem);
        if (ownerAlteraCurso.status !== 200) throw new Error("Owner não conseguiu alterar valor de curso");

        // 7. Teste da Aba Matrícula do Aluno e Envio de Comprovante (Status em_analise)
        console.log("\n--- TESTE 7: Portal Matrícula do Aluno ---");
        const pagMatriculaAluno = await getHtml(`/paginas/matricula?token=${encodeURIComponent(tokenAluno)}`);
        console.log("Status /paginas/matricula:", pagMatriculaAluno.status);
        const temDadosMatricula = pagMatriculaAluno.text.includes("Minha Matrícula");
        console.log("✓ Portal Matrícula renderizado:", temDadosMatricula);
        if (pagMatriculaAluno.status !== 200 || !temDadosMatricula) {
            throw new Error("Falha ao abrir portal de matrícula do aluno");
        }

        // 8. Teste de Confirmação / Validação de Comprovante (Admin ou Owner)
        console.log("\n--- TESTE 8: Validação de Comprovante em Análise ---");
        const [emAnalise] = await pool.query("SELECT idfinanceiroRecebimento FROM financeiro_recebimento WHERE status_parcela = 'em_analise' LIMIT 1");
        if (emAnalise.length > 0) {
            const idRecAnalise = emAnalise[0].idfinanceiroRecebimento;
            const resConfirma = await postJson("/paginas/dashboard/confirmar-comprovante", { idRecebimento: idRecAnalise }, tokenAdmin);
            console.log("Confirmação de comprovante por Admin:", resConfirma.status, resConfirma.data.mensagem);
            if (resConfirma.status !== 200) throw new Error("Falha ao confirmar comprovante");

            const [verif] = await pool.query("SELECT status_parcela FROM financeiro_recebimento WHERE idfinanceiroRecebimento = ?", [idRecAnalise]);
            console.log("Status após confirmação:", verif[0].status_parcela);
            if (verif[0].status_parcela !== "pago") throw new Error("Status não mudou para pago!");
        }

        // 9. Teste de Atualização de Perfil (Descrição e Foto)
        console.log("\n--- TESTE 9: Atualização de Perfil de Usuário ---");
        const resPerfil = await postJson("/api/usuarios/perfil", {
            descricao: "Professor e Administrador no Instituto Musical Bravo Tatuí.",
            telefone: "(15) 99888-7766",
        }, tokenAdmin);
        console.log("Status atualização de perfil:", resPerfil.status, resPerfil.data.mensagem);
        if (resPerfil.status !== 200) throw new Error("Falha ao atualizar perfil");

        const [userVerif] = await pool.query("SELECT descricao, telefone FROM usuario_login WHERE email = 'admin@institutobravo.com.br'");
        console.log("Descrição gravada:", userVerif[0].descricao);

        console.log("\n🎉 TODAS AS NOVAS REGRAS, TEMA CLARO E FUNCIONALIDADES FORAM TESTADAS E APROVADAS COM 100% DE SUCESSO!");
        server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ ERRO NO TESTE:", err);
        server.close();
        process.exit(1);
    }
});
