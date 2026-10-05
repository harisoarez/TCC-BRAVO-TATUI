// Detecta a URL base da API (se aberto via file:// aponta para localhost:3000)
const API_BASE = window.location.origin.startsWith("http") ? "" : "http://localhost:3000";

let tokenTemporario = null;

function exibirFeedback(mensagem, tipo = "erro") {
    const feedback = document.getElementById("mensagemFeedback");
    feedback.textContent = mensagem;
    feedback.className = `mensagem-feedback ${tipo}`;
}

function preencherDemo(perfil) {
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    if (perfil === "owner") {
        emailInput.value = "owner@institutobravo.com.br";
        senhaInput.value = "D@hl1a_P1nn@t4!";
    } else if (perfil === "admin") {
        emailInput.value = "admin@institutobravo.com.br";
        senhaInput.value = "admin123";
    } else if (perfil === "aluno") {
        emailInput.value = "aluno@institutobravo.com.br";
        senhaInput.value = "aluno123";
    } else if (perfil === "professor") {
        emailInput.value = "professor@institutobravo.com.br";
        senhaInput.value = "prof123";
    }
}

document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const btn = document.getElementById("btnSubmitLogin");

    btn.disabled = true;
    btn.textContent = "Entrando...";

    try {
        const resposta = await fetch(`${API_BASE}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            localStorage.setItem("authToken", dados.token);
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));

            if (dados.usuario.primeiroAcesso) {
                tokenTemporario = dados.token;
                document.getElementById("modalPrimeiroAcesso").classList.remove("oculto");
            } else {
                exibirFeedback("Login realizado com sucesso! Redirecionando...", "sucesso");
                setTimeout(() => {
                    window.location.href = "./calendario.html";
                }, 1000);
            }
        } else {
            exibirFeedback(dados.mensagem || "Credenciais inválidas.");
        }
    } catch (erro) {
        exibirFeedback("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
    }
});

// Modal Primeiro Acesso
document.getElementById("formPrimeiroAcesso").addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (novaSenha.length < 8 || novaSenha.length > 20) {
        alert("A nova senha deve ter no mínimo 8 e no máximo 20 caracteres.");
        return;
    }

    if (novaSenha !== confirmarSenha) {
        alert("As senhas informadas não coincidem.");
        return;
    }

    try {
        const token = tokenTemporario || localStorage.getItem("authToken");
        const resp = await fetch(`${API_BASE}/api/login/primeiro-acesso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ novaSenha, confirmarSenha }),
        });

        const dados = await resp.json();

        if (dados.sucesso) {
            alert("Senha alterada com sucesso! Você será redirecionado para o calendário.");
            window.location.href = "./calendario.html";
        } else {
            alert(dados.mensagem || "Erro ao alterar senha.");
        }
    } catch (e) {
        alert("Erro ao comunicar com o servidor.");
    }
});

// Modal Recuperação de Senha
function abrirRecuperarSenha(e) {
    e.preventDefault();
    document.getElementById("modalRecuperar").classList.remove("oculto");
}

function fecharModalRecuperar() {
    document.getElementById("modalRecuperar").classList.add("oculto");
}

document.getElementById("formRecuperar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailRecuperar").value.trim();

    try {
        const resp = await fetch(`${API_BASE}/api/login/recuperar-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const dados = await resp.json();
        alert(dados.mensagem || "Se o e-mail estiver cadastrado, as instruções foram enviadas.");
        fecharModalRecuperar();
    } catch (e) {
        alert("Erro ao solicitar recuperação de senha.");
    }
});
