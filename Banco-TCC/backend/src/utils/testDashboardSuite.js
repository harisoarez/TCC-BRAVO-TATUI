const app = require("../../app");
const http = require("http");
const pool = require("../config/database");

const server = http.createServer(app);
server.listen(3003, async () => {
    try {
        console.log("Servidor de teste do Dashboard iniciado na porta 3003...");

        const postJson = async (path, body, token) => {
            const headers = { "Content-Type": "application/json", "Accept": "application/json" };
            if (token) headers["Authorization"] = "Bearer " + token;
            const res = await fetch("http://localhost:3003" + path, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            return { status: res.status, data: await res.json() };
        };

        const getHtml = async (path, token) => {
            const headers = {};
            if (token) headers["Authorization"] = "Bearer " + token;
            const res = await fetch("http://localhost:3003" + path, { headers });
            return { status: res.status, text: await res.text() };
        };

        // 1. Obter tokens de login para Owner e Admin
        console.log("\n--- TESTE 1: Login de Owner e Admin ---");
        const loginOwner = await postJson("/api/login", {
            email: "owner@institutobravo.com.br",
            senha: "D@hl1a_P1nn@t4!",
        });
        const tokenOwner = loginOwner.data.token;
        console.log("Token Owner obtido com sucesso!");

        const loginAdmin = await postJson("/api/login", {
            email: "admin@institutobravo.com.br",
            senha: "admin123",
        });
        const tokenAdmin = loginAdmin.data.token;
        console.log("Token Admin obtido com sucesso!");

        // 2. Testar Dashboard do Owner
        console.log("\n--- TESTE 2: Dashboard do OWNER ---");
        const dashOwner = await getHtml(`/paginas/dashboard?token=${encodeURIComponent(tokenOwner)}`);
        console.log("Status Dashboard Owner:", dashOwner.status);
        if (dashOwner.status !== 200) throw new Error("Falha ao abrir Dashboard como Owner");

        const temModoOwner = dashOwner.text.includes("Modo Owner");
        const temGrafico = dashOwner.text.includes("graficoExecutivoOwner");
        const temSombrinha = dashOwner.text.includes("sombrinha");
        const temAniversariantes = dashOwner.text.includes("Aniversariantes do Mês");
        const temMensalidades = dashOwner.text.includes("Mensalidades dos Alunos");
        const temUsuariosNav = dashOwner.text.includes("Usuários");
        const naoTemQuadroAulas = !dashOwner.text.includes("Quadro de Aulas");
        const temBotaoVoltar = dashOwner.text.includes("Voltar ao Site");

        console.log("✓ Modo Owner exibido:", temModoOwner);
        console.log("✓ Gráfico Executivo presente:", temGrafico);
        console.log("✓ Sombrinha comparativa presente:", temSombrinha);
        console.log("✓ Aniversariantes presentes:", temAniversariantes);
        console.log("✓ Mensalidades presentes:", temMensalidades);
        console.log("✓ Link Usuários visível para Owner:", temUsuariosNav);
        console.log("✓ Quadro de Aulas removido:", naoTemQuadroAulas);
        console.log("✓ Seta / Botão de Voltar presente:", temBotaoVoltar);

        if (!temModoOwner || !temGrafico || !temSombrinha || !temUsuariosNav || !naoTemQuadroAulas || !temBotaoVoltar) {
            throw new Error("Falha na validação dos elementos do Owner");
        }

        // 3. Testar Dashboard do Admin
        console.log("\n--- TESTE 3: Dashboard do ADMINISTRADOR ---");
        const dashAdmin = await getHtml(`/paginas/dashboard?token=${encodeURIComponent(tokenAdmin)}`);
        console.log("Status Dashboard Admin:", dashAdmin.status);
        if (dashAdmin.status !== 200) throw new Error("Falha ao abrir Dashboard como Admin");

        const temModoAdmin = dashAdmin.text.includes("Modo Administrador");
        const graficoOcultadoParaAdmin = !dashAdmin.text.includes("graficoExecutivoOwner");
        const professoresOcultadoParaAdmin = !dashAdmin.text.includes("🎻 Professores");
        const temAniversariantesAdmin = dashAdmin.text.includes("Aniversariantes do Mês");
        const temMensalidadesAdmin = dashAdmin.text.includes("Mensalidades dos Alunos");

        console.log("✓ Modo Admin exibido:", temModoAdmin);
        console.log("✓ Gráfico e somas financeiras ocultados para Admin:", graficoOcultadoParaAdmin);
        console.log("✓ Aba Professores ocultada para Admin:", professoresOcultadoParaAdmin);
        console.log("✓ Aniversariantes visíveis para Admin:", temAniversariantesAdmin);
        console.log("✓ Mensalidades visíveis para Admin:", temMensalidadesAdmin);

        if (!temModoAdmin || !graficoOcultadoParaAdmin || !professoresOcultadoParaAdmin || !temAniversariantesAdmin) {
            throw new Error("Falha no controle de privacidade/permissões do Admin no Dashboard");
        }

        // 4. Testar proteção de rota Professores (Admin barrado 403, Owner liberado 200)
        console.log("\n--- TESTE 4: Restrição de acesso em /paginas/professores ---");
        const profAdmin = await getHtml(`/paginas/professores?token=${encodeURIComponent(tokenAdmin)}`);
        console.log("Admin acessando /paginas/professores -> Status:", profAdmin.status);
        if (profAdmin.status !== 403) throw new Error("Admin conseguiu acessar /paginas/professores indevidamente!");

        const profOwner = await getHtml(`/paginas/professores?token=${encodeURIComponent(tokenOwner)}`);
        console.log("Owner acessando /paginas/professores -> Status:", profOwner.status);
        if (profOwner.status !== 200) throw new Error("Owner foi impedido de acessar /paginas/professores!");

        // 5. Testar redirecionamento de /paginas/aulas para /site/calendario.html
        console.log("\n--- TESTE 5: Redirecionamento de /paginas/aulas ---");
        const resAulas = await fetch("http://localhost:3003/paginas/aulas", { redirect: "manual" });
        console.log("Status redirecionamento /paginas/aulas:", resAulas.status, "Location:", resAulas.headers.get("location"));
        if (resAulas.status !== 302 || !resAulas.headers.get("location").includes("calendario.html")) {
            throw new Error("Redirecionamento de /paginas/aulas falhou!");
        }

        // 6. Testar registro de pagamento de mensalidade
        console.log("\n--- TESTE 6: Registro de pagamento de mensalidade via API ---");
        // Buscar um recebimento pendente
        const [pendentes] = await pool.query(
            "SELECT idfinanceiroRecebimento FROM financeiro_recebimento WHERE status_parcela = 'pendente' LIMIT 1"
        );
        if (pendentes.length > 0) {
            const idPendente = pendentes[0].idfinanceiroRecebimento;
            const resPag = await postJson("/paginas/dashboard/registrar-pagamento", {
                idRecebimento: idPendente,
                dataPagamento: "2026-10-05",
                formaPagamento: "pix",
            }, tokenAdmin);
            console.log("Status registro de pagamento:", resPag.status, "Resposta:", resPag.data);

            const [apos] = await pool.query(
                "SELECT status_parcela, data_pagamento FROM financeiro_recebimento WHERE idfinanceiroRecebimento = ?",
                [idPendente]
            );
            console.log("Status da parcela após registro:", apos[0].status_parcela);
            if (apos[0].status_parcela !== "pago") {
                throw new Error("Status da parcela não foi alterado para 'pago'!");
            }
        }

        console.log("\n🎉 TODOS OS TESTES DO DASHBOARD E PERMISSÕES PASSARAM COM 100% DE SUCESSO!");
        server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ ERRO NO TESTE:", err);
        server.close();
        process.exit(1);
    }
});
