const app = require("../../app");
const http = require("http");
const pool = require("../config/database");

const server = http.createServer(app);
server.listen(3002, async () => {
    try {
        console.log("Servidor de teste iniciado na porta 3002");
        const post = async (path, body, token) => {
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = "Bearer " + token;
            const res = await fetch("http://localhost:3002" + path, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            return { status: res.status, data: await res.json() };
        };

        console.log("\n--- TESTE 1: Login do Owner ---");
        const loginOwner = await post("/api/login", {
            email: "owner@institutobravo.com.br",
            senha: "D@hl1a_P1nn@t4!"
        });
        console.log("Status:", loginOwner.status, "Tipo:", loginOwner.data.usuario?.tipo_usuario);
        if (loginOwner.status !== 200 || loginOwner.data.usuario?.tipo_usuario !== "owner") {
            throw new Error("Falha no login do Owner");
        }

        console.log("\n--- TESTE 2: Login do Admin ---");
        const loginAdmin = await post("/api/login", {
            email: "admin@institutobravo.com.br",
            senha: "admin123"
        });
        console.log("Status:", loginAdmin.status, "Tipo:", loginAdmin.data.usuario?.tipo_usuario);

        console.log("\n--- TESTE 3: Admin tentando criar Admin (esperado 403) ---");
        const adminTentaAdmin = await post("/api/usuarios/criar-conta", {
            nome: "Tentativa Admin",
            email: "tentativa_admin@teste.com",
            senha: "SenhaValida1!",
            tipo_usuario: "admin"
        }, loginAdmin.data.token);
        console.log("Status:", adminTentaAdmin.status, "Mensagem:", adminTentaAdmin.data.mensagem);
        if (adminTentaAdmin.status !== 403) {
            throw new Error("Admin conseguiu criar admin indevidamente");
        }

        console.log("\n--- TESTE 4: Admin criando conta Normal (esperado 201) ---");
        const adminCriaNormal = await post("/api/usuarios/criar-conta", {
            nome: "Aluno Normal Criado",
            email: "aluno_normal_teste@teste.com",
            senha: "SenhaValida1!",
            tipo_usuario: "normal"
        }, loginAdmin.data.token);
        console.log("Status:", adminCriaNormal.status, "Tipo:", adminCriaNormal.data.usuario?.tipo_usuario);
        if (adminCriaNormal.status !== 201) {
            throw new Error("Falha ao criar conta normal como Admin");
        }

        console.log("\n--- TESTE 5: Owner criando conta Admin (esperado 201) ---");
        const ownerCriaAdmin = await post("/api/usuarios/criar-conta", {
            nome: "Novo Admin Criado Por Owner",
            email: "novo_admin_owner@teste.com",
            senha: "SenhaValida1!",
            tipo_usuario: "admin"
        }, loginOwner.data.token);
        console.log("Status:", ownerCriaAdmin.status, "Tipo:", ownerCriaAdmin.data.usuario?.tipo_usuario);
        if (ownerCriaAdmin.status !== 201) {
            throw new Error("Falha ao criar conta admin como Owner");
        }

        console.log("\n--- TESTE 6: Primeiro Acesso e Validação de Senha (8 a 20 chars) ---");
        const loginNovoAluno = await post("/api/login", {
            email: "aluno_normal_teste@teste.com",
            senha: "SenhaValida1!"
        });
        console.log("Login novo aluno:", loginNovoAluno.status, "Primeiro acesso:", loginNovoAluno.data.usuario?.primeiroAcesso);

        const testeSenhaCurta = await post("/api/login/primeiro-acesso", {
            novaSenha: "123",
            confirmarSenha: "123"
        }, loginNovoAluno.data.token);
        console.log("Senha < 8 chars -> Status:", testeSenhaCurta.status, "Mensagem:", testeSenhaCurta.data.mensagem);
        if (testeSenhaCurta.status !== 400) throw new Error("Senha com menos de 8 caracteres foi aceita!");

        const testeSenhaLonga = await post("/api/login/primeiro-acesso", {
            novaSenha: "123456789012345678901", // 21 chars
            confirmarSenha: "123456789012345678901"
        }, loginNovoAluno.data.token);
        console.log("Senha > 20 chars -> Status:", testeSenhaLonga.status, "Mensagem:", testeSenhaLonga.data.mensagem);
        if (testeSenhaLonga.status !== 400) throw new Error("Senha com mais de 20 caracteres foi aceita!");

        const testeSenhaValida = await post("/api/login/primeiro-acesso", {
            novaSenha: "NovaSenha123!", // 13 chars
            confirmarSenha: "NovaSenha123!"
        }, loginNovoAluno.data.token);
        console.log("Senha válida (13 chars) -> Status:", testeSenhaValida.status, "Mensagem:", testeSenhaValida.data.mensagem);
        if (testeSenhaValida.status !== 200) throw new Error("Senha válida foi rejeitada!");

        console.log("\n--- TESTE 7: Limpeza de dados de teste ---");
        const u1 = adminCriaNormal.data.usuario?.id_usuario;
        const u2 = ownerCriaAdmin.data.usuario?.id_usuario;
        if (u1) await pool.query("DELETE FROM aluno WHERE usuario_login_id = ?", [u1]);
        if (u2) await pool.query("DELETE FROM aluno WHERE usuario_login_id = ?", [u2]);
        await pool.query("DELETE FROM usuario_login WHERE email IN ('aluno_normal_teste@teste.com', 'novo_admin_owner@teste.com')");
        console.log("Limpeza concluída com sucesso!");

        console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
        server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ ERRO NO TESTE:", err);
        server.close();
        process.exit(1);
    }
});
