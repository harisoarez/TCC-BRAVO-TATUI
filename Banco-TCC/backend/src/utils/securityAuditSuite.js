const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const pool = require("../config/database");

const PORT = 3005;
const server = http.createServer(app);

const request = async (method, path, options = {}) => {
    const { body, token, headers = {} } = options;
    const reqHeaders = { ...headers };
    if (body) reqHeaders["Content-Type"] = "application/json";
    if (token) reqHeaders["Authorization"] = "Bearer " + token;

    const res = await fetch(`http://localhost:${PORT}${path}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            data = await res.json();
        } catch (e) {
            data = null;
        }
    } else {
        data = await res.text();
    }

    return {
        status: res.status,
        headers: res.headers,
        data,
    };
};

server.listen(PORT, async () => {
    console.log(`\n===============================================================`);
    console.log(`SUÍTE DE TESTES AUTOMATIZADOS DE SEGURANÇA (AUDIT & HARDENING)`);
    console.log(`Porta de Testes: ${PORT}`);
    console.log(`===============================================================\n`);

    let falhas = 0;
    let sucessos = 0;

    const assertTest = (nome, condicao, detalhe = "") => {
        if (condicao) {
            console.log(`  [PASS] ${nome}`);
            sucessos++;
        } else {
            console.error(`  [FAIL] ${nome} ${detalhe ? "(" + detalhe + ")" : ""}`);
            falhas++;
        }
    };

    try {
        // Obter tokens legítimos para os testes
        console.log("--- FASE 0: Autenticação de Teste ---");
        const loginOwner = await request("POST", "/api/login", {
            body: { email: "owner@institutobravo.com.br", senha: "D@hl1a_P1nn@t4!" },
        });
        const tokenOwner = loginOwner.data?.token;

        const loginAdmin = await request("POST", "/api/login", {
            body: { email: "admin@institutobravo.com.br", senha: "admin123" },
        });
        const tokenAdmin = loginAdmin.data?.token;

        const loginAluno = await request("POST", "/api/login", {
            body: { email: "aluno@institutobravo.com.br", senha: "aluno123" },
        });
        const tokenAluno = loginAluno.data?.token;

        assertTest("Login do Owner com credenciais válidas", loginOwner.status === 200 && !!tokenOwner);
        assertTest("Login do Admin com credenciais válidas", loginAdmin.status === 200 && !!tokenAdmin);
        assertTest("Login do Aluno com credenciais válidas", loginAluno.status === 200 && !!tokenAluno);

        // =========================================================================
        // TESTE 1: Barreira de Autenticação para Rotas Protegidas (Sem Token / 401)
        // =========================================================================
        console.log("\n--- FASE 1: Proteção contra Acesso Não Autenticado (401) ---");
        const resNoAuth1 = await request("GET", "/api/usuarios");
        assertTest("GET /api/usuarios sem token é bloqueado", resNoAuth1.status === 401, `Status: ${resNoAuth1.status}`);

        const resNoAuth2 = await request("POST", "/api/usuarios/criar-conta", { body: { nome: "X" } });
        assertTest("POST /api/usuarios/criar-conta sem token é bloqueado", resNoAuth2.status === 401, `Status: ${resNoAuth2.status}`);

        const resNoAuth3 = await request("GET", "/api/alunos");
        assertTest("GET /api/alunos sem token é bloqueado", resNoAuth3.status === 401, `Status: ${resNoAuth3.status}`);

        const resNoAuth4 = await request("GET", "/paginas/dashboard");
        assertTest("GET /paginas/dashboard sem sessão/token é bloqueado", resNoAuth4.status === 401, `Status: ${resNoAuth4.status}`);

        const resNoAuth5 = await request("GET", "/uploads/comprovantes/inexistente.pdf");
        assertTest("GET /uploads/comprovantes/:arquivo sem token é bloqueado", resNoAuth5.status === 401, `Status: ${resNoAuth5.status}`);

        // =========================================================================
        // TESTE 2: Autorização e Escalação de Privilégios (BOLA / IDOR / 403)
        // =========================================================================
        console.log("\n--- FASE 2: Controle de Acesso Baseado em Papéis e Privilégios (403) ---");
        const resAlunoUsers = await request("GET", "/api/usuarios", { token: tokenAluno });
        assertTest("Aluno tentando listar todos os usuários da base é bloqueado", resAlunoUsers.status === 403, `Status: ${resAlunoUsers.status}`);

        const resAlunoAlunos = await request("GET", "/api/alunos", { token: tokenAluno });
        assertTest("Aluno tentando listar todos os alunos é bloqueado", resAlunoAlunos.status === 403, `Status: ${resAlunoAlunos.status}`);

        const resAlunoCurso = await request("POST", "/paginas/dashboard/curso/atualizar", {
            token: tokenAluno,
            body: { idcurso: 1, novoValor: 50 },
        });
        assertTest("Aluno tentando alterar valor de mensalidade de curso é bloqueado", resAlunoCurso.status === 403, `Status: ${resAlunoCurso.status}`);

        const resAlunoDesconto = await request("POST", "/paginas/usuarios/aluno/1/desconto", {
            token: tokenAluno,
            body: { desconto: 100 },
        });
        assertTest("Aluno tentando conceder desconto financeiro a si mesmo é bloqueado", resAlunoDesconto.status === 403, `Status: ${resAlunoDesconto.status}`);

        const resAdminDesconto = await request("POST", "/paginas/usuarios/aluno/1/desconto", {
            token: tokenAdmin,
            body: { desconto: 50 },
        });
        assertTest("Administrador comum tentando conceder desconto (exclusivo Owner) é bloqueado", resAdminDesconto.status === 403, `Status: ${resAdminDesconto.status}`);

        const resAdminCurso = await request("POST", "/paginas/dashboard/curso/atualizar", {
            token: tokenAdmin,
            body: { idcurso: 1, novoValor: 100 },
        });
        assertTest("Administrador comum tentando alterar valor de curso (exclusivo Owner) é bloqueado", resAdminCurso.status === 403, `Status: ${resAdminCurso.status}`);

        const resAdminCriaAdmin = await request("POST", "/api/usuarios/criar-conta", {
            token: tokenAdmin,
            body: { nome: "Novo Admin", email: "novo_admin@teste.com", senha: "SenhaForte123!", tipo_usuario: "admin" },
        });
        assertTest("Administrador tentando criar outro Administrador é bloqueado", resAdminCriaAdmin.status === 403, `Status: ${resAdminCriaAdmin.status}`);

        // =========================================================================
        // TESTE 3: Blindagem contra Desvio de Token de Recuperação de Senha
        // =========================================================================
        console.log("\n--- FASE 3: Proteção contra Abuso de Token de Redefinição de Senha ---");
        const segredo = process.env.JWT_SECRET || "instituto-bravo-segredo-jwt-2026";
        const resetToken = jwt.sign(
            { id_usuario: 1, email: "owner@institutobravo.com.br", acao: "reset_senha" },
            segredo,
            { expiresIn: "1h", algorithm: "HS256" }
        );

        const resResetHeader = await request("GET", "/api/usuarios", { token: resetToken });
        assertTest("Token de reset_senha enviado no Header Authorization é rejeitado na API", resResetHeader.status === 401, `Status: ${resResetHeader.status}`);

        const resResetQuery = await request("GET", `/paginas/dashboard?token=${encodeURIComponent(resetToken)}`);
        assertTest("Token de reset_senha enviado como query param não concede sessão de Dashboard", resResetQuery.status === 401, `Status: ${resResetQuery.status}`);

        const resResetComprovante = await request("GET", `/uploads/comprovantes/inexistente.pdf?token=${encodeURIComponent(resetToken)}`);
        assertTest("Token de reset_senha não concede acesso a comprovantes financeiros", resResetComprovante.status === 401, `Status: ${resResetComprovante.status}`);

        // =========================================================================
        // TESTE 4: Proteção LGPD na Exposição Pública de Professores
        // =========================================================================
        console.log("\n--- FASE 4: Conformidade LGPD (Sanitização em Endpoints Públicos) ---");
        const resProfPublico = await request("GET", "/api/professores");
        assertTest("GET /api/professores público retorna status 200", resProfPublico.status === 200);

        const professoresPublicos = resProfPublico.data?.professores || [];
        const temDadosSensiveis = professoresPublicos.some(p => p.CPF || p.CNPJ || p.telefone || p.email);
        assertTest("Nenhum dado pessoal sensível (CPF, CNPJ, Telefone, Email) exposto publicamente", !temDadosSensiveis);

        const resProfAdmin = await request("GET", "/api/professores", { token: tokenAdmin });
        const professoresAdmin = resProfAdmin.data?.professores || [];
        const adminVeDados = professoresAdmin.length > 0 && professoresAdmin.some(p => p.CPF !== undefined || p.email !== undefined);
        assertTest("Administrador autenticado tem acesso aos dados cadastrais necessários", adminVeDados);

        // =========================================================================
        // TESTE 5: Proteção de Arquivos Sensíveis e Vazamento de Código Fonte
        // =========================================================================
        console.log("\n--- FASE 5: Proteção de Arquivos e Código Fonte (Path Traversal / Source Leak) ---");
        const resViewLeak = await request("GET", "/views/dashboard/index.ejs");
        assertTest("Acesso direto a templates EJS (/views/...) é bloqueado (404 Not Found)", resViewLeak.status === 404, `Status: ${resViewLeak.status}`);

        const resTraversal = await request("GET", "/uploads/comprovantes/..%2f..%2f..%2fpackage.json");
        assertTest("Tentativa de Path Traversal em /uploads/comprovantes é bloqueada", resTraversal.status !== 200, `Status: ${resTraversal.status}`);

        // =========================================================================
        // TESTE 6: Cabeçalhos HTTP de Segurança (Helmet)
        // =========================================================================
        console.log("\n--- FASE 6: Cabeçalhos HTTP de Segurança (Helmet) ---");
        const resHeaders = await request("GET", "/api/professores");
        const xContentType = resHeaders.headers.get("x-content-type-options");
        const xFrame = resHeaders.headers.get("x-frame-options");
        const xDownload = resHeaders.headers.get("x-download-options");

        assertTest("Header X-Content-Type-Options: nosniff ativo", xContentType === "nosniff", `Valor: ${xContentType}`);
        assertTest("Header X-Frame-Options: SAMEORIGIN ativo", xFrame === "SAMEORIGIN", `Valor: ${xFrame}`);
        assertTest("Header X-Download-Options: noopen ativo", xDownload === "noopen", `Valor: ${xDownload}`);

        // =========================================================================
        // TESTE 7: Validação de Entrada (CPF e E-mail Inválidos)
        // =========================================================================
        console.log("\n--- FASE 7: Validação Rigorosa de Entrada de Dados ---");
        const resCpfInvalido = await request("POST", "/api/alunos", {
            token: tokenAdmin,
            body: {
                nome: "Aluno Invalido",
                email: "aluno_valido@teste.com",
                cpf: "111.111.111-11", // CPF falso / inválido pelos dígitos verificadores
                telefone: "15999998888",
            },
        });
        assertTest("Cadastro de Aluno com CPF inválido é rejeitado com status 400", resCpfInvalido.status === 400, `Status: ${resCpfInvalido.status}`);

        const resEmailInvalido = await request("POST", "/api/alunos", {
            token: tokenAdmin,
            body: {
                nome: "Aluno Invalido",
                email: "email-sem-formato-valido",
                cpf: "00000000000",
                telefone: "15999998888",
            },
        });
        assertTest("Cadastro de Aluno com Email inválido é rejeitado com status 400", resEmailInvalido.status === 400, `Status: ${resEmailInvalido.status}`);

        // =========================================================================
        // TESTE 8: Rate Limiting na Recuperação de Senha
        // =========================================================================
        console.log("\n--- FASE 8: Rate Limiting contra Ataques de Força Bruta / Abuso de SMTP ---");
        let bloqueouRateLimit = false;
        for (let i = 1; i <= 7; i++) {
            const resLimiter = await request("POST", "/api/login/recuperar-senha", {
                body: { email: "usuario_teste@institutobravo.com.br" },
            });
            if (resLimiter.status === 429) {
                bloqueouRateLimit = true;
                break;
            }
        }
        assertTest("Múltiplas requisições em /api/login/recuperar-senha acionam Rate Limiting (429)", bloqueouRateLimit);

        // =========================================================================
        // RESUMO FINAL
        // =========================================================================
        console.log(`\n===============================================================`);
        console.log(`RESULTADO FINAL DA SUÍTE DE SEGURANÇA:`);
        console.log(`✓ Testes Aprovados: ${sucessos}`);
        console.log(`✗ Testes Falhos:    ${falhas}`);
        console.log(`Taxa de Sucesso:    ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);
        console.log(`===============================================================\n`);

        if (falhas > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error("Erro fatal durante a execução dos testes de segurança:", err);
        process.exit(1);
    } finally {
        server.close();
    }
});
