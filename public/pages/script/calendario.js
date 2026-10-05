// ================================================================
// Instituto Musical Bravo Tatuí - Calendário Integrado com API & Auth
// ================================================================

const API_BASE = window.location.origin.startsWith("http") ? "" : "http://localhost:3000";

let dataAtual = new Date();
let dataSelecionada = new Date();
let usuarioAtivo = { tipo: "visitante" };
let token = null;
let listaProfessores = [];

// Base de aulas (inicia vazia e carrega do banco de dados via API)
let aulas = [];

// Fallback de aulas caso o servidor/banco esteja offline
const aulasFallback = [
    { id: 1, titulo: "Iniciação ao Piano", professor: "Carlos Eduardo", instrumento: "Piano", sala: 1, data: "2026-10-05", hora: "09:00", tipo: "normal", observacoes: "Módulo 1 - Postura e primeiras notas" },
    { id: 2, titulo: "Prática de Escalas", professor: "Carlos Eduardo", instrumento: "Piano", sala: 2, data: "2026-10-06", hora: "14:00", tipo: "reposicao", observacoes: "Reposição da aula anterior" },
    { id: 3, titulo: "Iniciação à Bateria", professor: "Carlos Eduardo", instrumento: "Bateria", sala: 3, data: "2026-10-05", hora: "16:30", tipo: "normal", observacoes: "Estudo de rítmica básica" }
];

document.addEventListener("DOMContentLoaded", async () => {
    inicializarAutenticacao();
    configurarNavegacao();
    await carregarProfessores();
    await carregarAulas();
});

function isPrivilegiado() {
    return usuarioAtivo && (usuarioAtivo.tipo === "admin" || usuarioAtivo.tipo === "owner");
}

function inicializarAutenticacao() {
    token = localStorage.getItem("authToken");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!token || !usuarioSalvo) {
        alert("Acesso restrito: faça login para acessar o calendário.");
        window.location.href = "./login.html";
        return false;
    }

    try {
        const u = JSON.parse(usuarioSalvo);
        usuarioAtivo = {
            id: u.id_usuario,
            nome: u.nome || "Usuário",
            email: u.email,
            tipo: (u.tipo_usuario || "normal").toLowerCase(),
        };
    } catch (e) {
        alert("Sessão inválida. Faça login novamente.");
        window.location.href = "./login.html";
        return false;
    }

    renderizarAreaUsuario();
    aplicarPermissoesUI();
    return true;
}

function renderizarAreaUsuario() {
    const areaNav = document.getElementById("areaAuthNav");
    const linkAdmin = document.getElementById("linkPainelAdmin");
    const bannerModo = document.getElementById("bannerModo");

    if (!areaNav) return;

    if (usuarioAtivo.tipo !== "visitante") {
        const rotulos = {
            admin: "👑 Administrador",
            professor: "🎻 Professor",
            aluno: "🎓 Aluno",
        };
        const rotulo = rotulos[usuarioAtivo.tipo] || usuarioAtivo.tipo;

        areaNav.innerHTML = `
            <span class="badge-usuario ${usuarioAtivo.tipo}">
                ${rotulo}: <strong>${usuarioAtivo.nome.split(" ")[0]}</strong>
            </span>
            <button type="button" class="btn-nav-auth btn-nav-sair" onclick="fazerLogout()">Sair</button>
        `;

        if (usuarioAtivo.tipo === "admin" && linkAdmin) {
            linkAdmin.classList.remove("oculto");
        }
    } else {
        areaNav.innerHTML = `
            <a href="./login.html" class="btn-nav-auth">Entrar / Login</a>
        `;
        if (linkAdmin) linkAdmin.classList.add("oculto");
    }

    // Banner informativo de Permissões
    if (bannerModo) {
        bannerModo.classList.remove("oculto");
        if (isPrivilegiado()) {
            const rotulo = usuarioAtivo.tipo === "owner" ? "👑 Modo Owner (Proprietário)" : "⭐ Modo Administrador";
            bannerModo.innerHTML = `
                <span><strong>${rotulo}:</strong> Você tem permissão total para agendar, editar e cancelar aulas.</span>
            `;
            bannerModo.style.background = "#fefce8";
            bannerModo.style.borderColor = "#fef08a";
            bannerModo.style.color = "#854d0e";
        } else {
            bannerModo.innerHTML = `
                <span>👁️ <strong>Modo de Visualização:</strong> Você está visualizando a grade de aulas em modo somente leitura. Apenas a administração pode agendar ou alterar horários.</span>
            `;
            bannerModo.style.background = "#eff6ff";
            bannerModo.style.borderColor = "#bfdbfe";
            bannerModo.style.color = "#1e40af";
        }
    }
}

function aplicarPermissoesUI() {
    const btnNova = document.getElementById("btnNovaAula");
    if (!btnNova) return;

    if (isPrivilegiado()) {
        btnNova.classList.remove("oculto");
        btnNova.onclick = abrirNovoAgendamento;
    } else {
        btnNova.classList.add("oculto");
    }
}

function fazerLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    alert("Você saiu da sua conta.");
    window.location.reload();
}

// ================= CARREGAMENTO DE DADOS DA API =================
async function carregarProfessores() {
    const selectProf = document.getElementById("formProfessor");
    if (!selectProf) return;

    try {
        const resp = await fetch(`${API_BASE}/api/professores`);
        const dados = await resp.json();

        if (dados.sucesso && Array.isArray(dados.professores) && dados.professores.length > 0) {
            listaProfessores = dados.professores;
            selectProf.innerHTML = `
                <option value="">Selecione um professor</option>
                ${listaProfessores.map(p => `
                    <option value="${p.idprofessor}">${p.nome} (${p.tipo_instrumento || "Geral"})</option>
                `).join("")}
            `;
            return;
        }
    } catch (e) {
        console.warn("API de professores indisponível no momento.");
    }

    // Fallback padrão se não houver professores cadastrados
    selectProf.innerHTML = `
        <option value="1">Prof. Carlos Eduardo (Piano)</option>
        <option value="2">Prof. Mariana (Violão/Canto)</option>
    `;
}

async function carregarAulas() {
    try {
        const resp = await fetch(`${API_BASE}/api/aulas`);
        const dados = await resp.json();

        if (dados.sucesso && Array.isArray(dados.aulas)) {
            aulas = dados.aulas;
        } else {
            aulas = aulasFallback;
        }
    } catch (e) {
        console.warn("API de aulas indisponível, usando dados locais de demonstração:", e.message);
        aulas = aulasFallback;
    }

    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// ================= CONFIGURAÇÃO DE NAVEGAÇÃO =================
function configurarNavegacao() {
    document.getElementById("btnAnterior").addEventListener("click", () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });

    document.getElementById("btnProximo").addEventListener("click", () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });

    document.getElementById("formAula").addEventListener("submit", salvarAula);

    document.getElementById("btnLixeira").addEventListener("click", () => {
        if (usuarioAtivo.tipo !== "admin") return;
        fecharModal("modalFormulario");
        document.getElementById("modalExcluir").classList.remove("oculto");
    });
}

// ================= RENDERIZAÇÃO DO CALENDÁRIO =================
function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const nomeMes = new Date(ano, mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    document.getElementById("mesAtual").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const grade = document.getElementById("gradeAtual");
    let htmlDias = "";

    for (let i = 0; i < primeiroDia; i++) {
        htmlDias += `<div class="dia outro-mes"></div>`;
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataFormatada = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        const aulasDoDia = aulas.filter(a => a.data === dataFormatada);
        const isSelecionado = dataFormatada === formatarData(dataSelecionada) ? "selecionado" : "";

        const htmlAulas = aulasDoDia.slice(0, 3).map(aula =>
            `<div class="mini-aula ${aula.tipo}" onclick="abrirResumo(${aula.id}, event)">${aula.hora || ""} ${aula.titulo}</div>`
        ).join("");

        htmlDias += `
            <div class="dia ${isSelecionado}" onclick="selecionarDia('${dataFormatada}')">
                <span class="numero-dia">${dia}</span>
                ${htmlAulas}
                ${aulasDoDia.length > 3 ? `<div class="mini-aula">... mais ${aulasDoDia.length - 3}</div>` : ""}
            </div>
        `;
    }

    grade.innerHTML = htmlDias;
}

function renderizarAgendaDia(dataObj) {
    const dataStr = formatarData(dataObj);
    const aulasDoDia = aulas.filter(a => a.data === dataStr);

    document.getElementById("textoDataSelecionada").textContent = dataObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const agenda = document.getElementById("agendaDia");
    if (aulasDoDia.length === 0) {
        agenda.innerHTML = `<p style="font-size: 13px; color: #999; padding: 10px 0;">Nenhuma aula programada para este dia.</p>`;
        return;
    }

    agenda.innerHTML = aulasDoDia.map(aula => `
        <div class="evento-card ${aula.tipo}" onclick="abrirResumo(${aula.id}, null)">
            <strong>${aula.hora || ""} - ${aula.titulo}</strong>
            <span>${aula.instrumento} | Sala ${aula.sala} | Prof: ${aula.professor || "A definir"}</span>
        </div>
    `).join("");
}

function selecionarDia(dataStr) {
    const partes = dataStr.split("-");
    dataSelecionada = new Date(partes[0], partes[1] - 1, partes[2]);
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// ================= MODAIS E FORMULÁRIO =================
function fecharModal(id) {
    document.getElementById(id).classList.add("oculto");
}

// 1. Resumo da Aula (Somente exibe lápis se for ADMIN)
function abrirResumo(id, evento) {
    if (evento) evento.stopPropagation();
    const aula = aulas.find(a => a.id === id);
    if (!aula) return;

    const iconeLapis = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;

    const acoesResumo = document.getElementById("acoesResumo");
    if (acoesResumo) {
        acoesResumo.innerHTML = isPrivilegiado()
            ? `<button onclick="abrirEdicao(${aula.id})" class="btn-icon" title="Editar Aula">${iconeLapis}</button>`
            : "";
    }

    const dataFormatadaBR = aula.data ? aula.data.split("-").reverse().join("/") : "";

    document.getElementById("detalhesAulaConteudo").innerHTML = `
        <p><strong>Título:</strong> ${aula.titulo}</p>
        <p><strong>Instrumento:</strong> ${aula.instrumento}</p>
        <p><strong>Professor:</strong> ${aula.professor || "A definir"}</p>
        <p><strong>Data/Hora:</strong> ${dataFormatadaBR} às ${aula.hora || ""}</p>
        <p><strong>Sala:</strong> Sala ${aula.sala}</p>
        <p><strong>Status:</strong> <span style="text-transform: capitalize; font-weight:600;">${aula.tipo}</span></p>
        <p><strong>Observações:</strong> ${aula.observacoes || "Nenhuma observação registrada."}</p>
    `;

    document.getElementById("modalResumo").classList.remove("oculto");
}

// 2. Novo Agendamento (Apenas Admin e Owner)
function abrirNovoAgendamento() {
    if (!isPrivilegiado()) {
        alert("Apenas administradores podem agendar aulas.");
        return;
    }

    document.getElementById("formAula").reset();
    document.getElementById("aulaId").value = "";
    document.getElementById("formData").value = formatarData(dataSelecionada);
    document.getElementById("tituloModalForm").textContent = "Agendar Nova Aula";
    document.getElementById("btnLixeira").classList.add("oculto");

    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 3. Edição de Aula (Apenas Admin e Owner)
function abrirEdicao(id) {
    if (!isPrivilegiado()) {
        alert("Apenas administradores podem editar aulas.");
        return;
    }

    fecharModal("modalResumo");
    const aula = aulas.find(a => a.id === id);
    if (!aula) return;

    document.getElementById("aulaId").value = aula.id;
    document.getElementById("formTitulo").value = aula.titulo;
    document.getElementById("formInstrumento").value = aula.instrumento;
    document.getElementById("formData").value = aula.data;
    document.getElementById("formHora").value = aula.hora;
    document.getElementById("formSala").value = aula.sala;
    document.getElementById("formTipo").value = aula.tipo;
    document.getElementById("formObs").value = aula.observacoes || "";

    const selectProf = document.getElementById("formProfessor");
    if (selectProf) {
        if (aula.professor_idprofessor) {
            selectProf.value = aula.professor_idprofessor;
        } else {
            // Tenta selecionar pelo nome
            for (let opt of selectProf.options) {
                if (opt.text.toLowerCase().includes(String(aula.professor).toLowerCase())) {
                    selectProf.value = opt.value;
                    break;
                }
            }
        }
    }

    document.getElementById("tituloModalForm").textContent = "Editar Aula";
    document.getElementById("btnLixeira").classList.remove("oculto");

    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 4. Salvar Aula via API (Criação e Edição - Apenas Admin e Owner)
async function salvarAula(e) {
    e.preventDefault();

    if (!isPrivilegiado()) {
        alert("Ação não permitida: apenas administradores podem salvar agendamentos.");
        return;
    }

    const idAtual = document.getElementById("aulaId").value;
    const selectProf = document.getElementById("formProfessor");
    const profId = selectProf ? selectProf.value : "1";
    const profNome = selectProf && selectProf.selectedIndex >= 0 ? selectProf.options[selectProf.selectedIndex].text.split("(")[0].trim() : "Professor";

    const dadosForm = {
        titulo: document.getElementById("formTitulo").value.trim(),
        instrumento: document.getElementById("formInstrumento").value.trim(),
        professor_idprofessor: profId,
        professor: profNome,
        data: document.getElementById("formData").value,
        hora: document.getElementById("formHora").value,
        sala: parseInt(document.getElementById("formSala").value, 10),
        tipo: document.getElementById("formTipo").value,
        observacoes: document.getElementById("formObs").value.trim(),
    };

    const url = idAtual ? `${API_BASE}/api/aulas/${idAtual}` : `${API_BASE}/api/aulas`;
    const metodo = idAtual ? "PUT" : "POST";

    try {
        const resp = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dadosForm),
        });

        const retorno = await resp.json();

        if (retorno.sucesso) {
            fecharModal("modalFormulario");
            await carregarAulas();
            alert(idAtual ? "Aula atualizada com sucesso!" : "Aula agendada com sucesso!");
        } else {
            alert(retorno.mensagem || "Não foi possível salvar a aula.");
        }
    } catch (err) {
        // Fallback local se o backend não responder
        console.warn("Falha de rede ao salvar na API. Atualizando localmente:", err.message);
        if (idAtual) {
            const idx = aulas.findIndex(a => a.id == idAtual);
            if (idx >= 0) aulas[idx] = { id: parseInt(idAtual, 10), ...dadosForm };
        } else {
            const novoId = aulas.length ? Math.max(...aulas.map(a => a.id)) + 1 : 1;
            aulas.push({ id: novoId, ...dadosForm });
        }
        fecharModal("modalFormulario");
        renderizarCalendario();
        renderizarAgendaDia(dataSelecionada);
    }
}

// 5. Exclusão e Cancelamento Dinâmicos via API (Apenas Admin e Owner)
async function processarExclusao(acao) {
    if (!isPrivilegiado()) {
        alert("Ação restrita a administradores.");
        return;
    }

    const idParaExcluir = document.getElementById("aulaId").value;
    if (!idParaExcluir) return;

    if (!confirm("Tem certeza que deseja aplicar esta alteração?")) return;

    try {
        if (acao === "cancelar") {
            const resp = await fetch(`${API_BASE}/api/aulas/${idParaExcluir}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "cancelada" }),
            });
            const res = await resp.json();
            if (res.sucesso) {
                alert("Aula marcada como cancelada!");
            }
        } else if (acao === "apagar") {
            const resp = await fetch(`${API_BASE}/api/aulas/${idParaExcluir}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const res = await resp.json();
            if (res.sucesso) {
                alert("Aula excluída definitivamente!");
            }
        }
    } catch (e) {
        console.warn("Falha ao comunicar exclusão com o servidor. Aplicando localmente:", e.message);
        if (acao === "cancelar") {
            const idx = aulas.findIndex(a => a.id == idParaExcluir);
            if (idx >= 0) aulas[idx].tipo = "cancelada";
        } else if (acao === "apagar") {
            aulas = aulas.filter(a => a.id != idParaExcluir);
        }
    }

    fecharModal("modalExcluir");
    await carregarAulas();
}

// ================= UTILIDADES =================
function formatarData(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}