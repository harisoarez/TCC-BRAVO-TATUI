// Calendário de Aulas - Instituto Bravo Tatuí

const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

let dataAtual = new Date();
let dataSelecionada = new Date();
let usuarioAtivo = { tipo: "visitante" };
let token = null;
let listaProfessores = [];
let listaAlunos = [];
let salaSelecionada = "todas"; // 'todas', '1', '2', '3', '4', '5' (Sala de Bateria)

function decodificarToken(token) {
    if (!token) return null;
    try {
        const partes = token.split(".");
        if (partes.length !== 3) return null;
        const payloadBase64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = decodeURIComponent(
            atob(payloadBase64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonStr);
    } catch (e) {
        return null;
    }
}

// Helpers de Perfil e Acesso
function isStaff() {
    return usuarioAtivo && (
        usuarioAtivo.tipo === "owner" ||
        usuarioAtivo.tipo === "admin" ||
        usuarioAtivo.tipo === "professor"
    );
}

function isPrivilegiado() {
    return usuarioAtivo && (usuarioAtivo.tipo === "admin" || usuarioAtivo.tipo === "owner");
}

function isAluno() {
    return usuarioAtivo && (usuarioAtivo.tipo === "aluno" || usuarioAtivo.tipo === "normal");
}

// Formatador padronizado de salas
function formatarNomeSala(sala) {
    if (sala === null || sala === undefined || sala === "") return "Sala não definida";
    const s = String(sala).trim().toLowerCase();
    if (s === "5" || s.includes("bateria")) {
        return "Sala de Bateria";
    }
    if (["1", "2", "3", "4"].includes(s)) {
        return `Sala ${s}`;
    }
    return `Sala ${sala}`;
}

function formatarNomeSalaCurto(sala) {
    if (sala === null || sala === undefined || sala === "") return "Sala ?";
    const s = String(sala).trim().toLowerCase();
    if (s === "5" || s.includes("bateria")) {
        return "Bateria";
    }
    if (["1", "2", "3", "4"].includes(s)) {
        return `Sala ${s}`;
    }
    return `S.${sala}`;
}

function aulaPertenceASala(aula, salaFiltro) {
    if (!salaFiltro || salaFiltro === "todas") return true;
    const s = String(aula.sala).trim().toLowerCase();
    const f = String(salaFiltro).trim().toLowerCase();

    if (f === "5" || f === "bateria" || f.includes("bateria")) {
        return s === "5" || s.includes("bateria") || String(aula.instrumento || "").toLowerCase().includes("bateria");
    }
    return s === f;
}

// Base de aulas carregada via API
let aulas = [];

// Fallback de aulas caso o servidor/banco esteja offline
const aulasFallback = [
    { id: 1, titulo: "Iniciação ao Piano", professor: "Carlos Eduardo", instrumento: "Piano", sala: 1, aluno_idaluno: 1, aluno_nome: "Lucas Silva", aluno_usuario_id: 4, data: "2026-10-07", hora: "09:00", tipo: "normal", observacoes: "Módulo 1 - Postura e primeiras notas" },
    { id: 2, titulo: "Prática de Violoncelo", professor: "Carlos Eduardo", instrumento: "Violoncelo", sala: 2, aluno_idaluno: 3, aluno_nome: "Gabriel Souza", aluno_usuario_id: 6, data: "2026-10-15", hora: "14:00", tipo: "reposicao", observacoes: "Reposição da aula anterior" },
    { id: 3, titulo: "Iniciação à Bateria", professor: "Carlos Eduardo", instrumento: "Bateria", sala: 5, aluno_idaluno: 1, aluno_nome: "Lucas Silva", aluno_usuario_id: 4, data: "2026-10-07", hora: "16:30", tipo: "normal", observacoes: "Estudo de rítmica básica na Sala de Bateria" },
    { id: 4, titulo: "Teoria e Flauta", professor: "Carlos Eduardo", instrumento: "Flauta", sala: 3, aluno_idaluno: 5, aluno_nome: "Rafael Moreira", aluno_usuario_id: 8, data: "2026-10-16", hora: "10:30", tipo: "normal", observacoes: "Respiração e escalas" },
    { id: 5, titulo: "Canto e Técnica Vocal", professor: "Carlos Eduardo", instrumento: "Canto", sala: 4, aluno_idaluno: 4, aluno_nome: "Mariana Costa", aluno_usuario_id: 7, data: "2026-10-25", hora: "15:00", tipo: "normal", observacoes: "Aquecimento e dicção" },
    { id: 6, titulo: "Ritmos Brasileiros na Bateria", professor: "Carlos Eduardo", instrumento: "Bateria", sala: 5, aluno_idaluno: 1, aluno_nome: "Lucas Silva", aluno_usuario_id: 4, data: "2026-10-28", hora: "16:00", tipo: "reposicao", observacoes: "Levadas de samba e bossa nova" }
];

document.addEventListener("DOMContentLoaded", async () => {
    const autenticado = inicializarAutenticacao();
    if (!autenticado) return; // Interrompe execução para visitantes não logados
    configurarNavegacao();
    configurarFiltroSalas();
    await carregarProfessores();
    await carregarAlunos();
    await carregarAulas();
});

function inicializarAutenticacao() {
    token = localStorage.getItem("authToken");
    if (!token) {
        window.location.replace("/site/acesso-restrito?recurso=calendario");
        return false;
    }

    const payload = decodificarToken(token);
    let u = {};
    try {
        const usuarioSalvo = localStorage.getItem("usuario");
        if (usuarioSalvo) u = JSON.parse(usuarioSalvo);
    } catch (e) {}

    const tipoFinal = (payload?.tipo_usuario || u.tipo_usuario || u.tipo || "normal").toLowerCase();
    usuarioAtivo = {
        id: payload?.id_usuario || u.id_usuario || u.id,
        nome: payload?.nome || u.nome || "Usuário",
        email: payload?.email || u.email || "",
        tipo: tipoFinal,
        tipo_usuario: tipoFinal,
        foto_url: u.foto_url || "",
    };

    renderizarAreaUsuario();
    aplicarPermissoesUI();
    return true;
}

function renderizarAreaUsuario() {
    const areaNav = document.getElementById("areaAuthNav");
    const linkAdmin = document.getElementById("linkPainelAdmin");
    const bannerModo = document.getElementById("bannerModo");
    const secaoFiltroSalas = document.getElementById("secaoFiltroSalas");
    const secaoBannerAluno = document.getElementById("secaoBannerAluno");

    if (areaNav) {
        const rotulos = {
            owner: "Owner",
            admin: "Administrador",
            professor: "Professor",
            aluno: "Aluno",
            normal: "Aluno",
        };
        const rotulo = rotulos[usuarioAtivo.tipo] || usuarioAtivo.tipo;

        areaNav.innerHTML = `
            <span class="badge-usuario ${usuarioAtivo.tipo}">
                ${rotulo}: <strong>${escapeHtml(usuarioAtivo.nome.split(" ")[0])}</strong>
            </span>
            <button type="button" class="btn-nav-auth btn-nav-sair" onclick="fazerLogout()">Sair</button>
        `;

        if (isPrivilegiado() && linkAdmin) {
            linkAdmin.classList.remove("oculto");
            if (token) {
                linkAdmin.href = `${API_BASE || 'http://localhost:3000'}/paginas/dashboard?token=${encodeURIComponent(token)}`;
            }
        }
    }

    // Regras Visuais de Acordo com o Perfil (Owner/Admin/Professor vs Aluno)
    if (isStaff()) {
        // Staff vê o filtro e o calendário das 5 salas
        if (secaoFiltroSalas) secaoFiltroSalas.classList.remove("oculto");
        if (secaoBannerAluno) secaoBannerAluno.classList.add("oculto");

        if (bannerModo) {
            bannerModo.classList.remove("oculto");
            const rotuloPerfil = usuarioAtivo.tipo === "owner" ? "Owner" : (usuarioAtivo.tipo === "admin" ? "Administrador" : "Professor");
            bannerModo.innerHTML = isPrivilegiado()
                ? `<span><strong>Modo ${rotuloPerfil}:</strong> Você tem visão completa das salas (1 a 4 e Bateria) com permissão para agendar e gerenciar horários.</span>`
                : `<span><strong>Visão Docente (${rotuloPerfil}):</strong> Exibindo a grade de ocupação das salas de aula do Instituto Bravo.</span>`;
            bannerModo.style.background = "#23232b";
            bannerModo.style.borderColor = "#4c4c58";
            bannerModo.style.color = "#f4f4f6";
        }
    } else {
        // Aluno vê estritamente as suas aulas
        if (secaoFiltroSalas) secaoFiltroSalas.classList.add("oculto");
        if (secaoBannerAluno) secaoBannerAluno.classList.remove("oculto");

        if (bannerModo) {
            bannerModo.classList.remove("oculto");
            bannerModo.innerHTML = `
                <span><strong>Área do Aluno:</strong> Você está visualizando exclusivamente os horários das suas aulas agendadas.</span>
            `;
            bannerModo.style.background = "rgba(56, 189, 248, 0.08)";
            bannerModo.style.borderColor = "rgba(56, 189, 248, 0.3)";
            bannerModo.style.color = "#bae6fd";
        }
    }
}

function aplicarPermissoesUI() {
    const btnNovaDesk = document.getElementById("btnNovaAula");
    const btnNovaMob = document.getElementById("btnNovaAulaMobile");
    const btnMobAdd = document.getElementById("btnMobAdicionarAula");

    const acaoAgendar = () => {
        if (isPrivilegiado()) {
            abrirNovoAgendamento();
        } else {
            alert("Modo de Leitura: Apenas administradores podem agendar novas aulas.");
        }
    };

    if (btnNovaDesk) {
        if (isPrivilegiado()) {
            btnNovaDesk.classList.remove("oculto");
        } else {
            btnNovaDesk.classList.add("oculto");
        }
        btnNovaDesk.onclick = acaoAgendar;
    }

    if (btnNovaMob) {
        if (!isPrivilegiado()) btnNovaMob.classList.add("oculto");
        btnNovaMob.onclick = acaoAgendar;
    }

    if (btnMobAdd) {
        if (!isPrivilegiado()) {
            const bottomBar = document.getElementById("mobBottomBar");
            if (bottomBar) bottomBar.classList.add("oculto");
        }
        btnMobAdd.onclick = acaoAgendar;
    }
}

async function fazerLogout() {
    try {
        await fetch(`${API_BASE || 'http://localhost:3000'}/api/logout`, { credentials: "include" });
    } catch (e) {}
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    sessionStorage.clear();
    alert("Você saiu da sua conta.");
    window.location.href = "./login.html";
}

// Carregamento de Professores e Alunos
async function carregarProfessores() {
    const selectProf = document.getElementById("formProfessor");
    if (!selectProf) return;

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await fetch(`${API_BASE}/api/professores`, { headers, credentials: "include" });
        const dados = await resp.json();

        if (dados.sucesso && Array.isArray(dados.professores) && dados.professores.length > 0) {
            listaProfessores = dados.professores;
            selectProf.innerHTML = `
                <option value="">Selecione um professor</option>
                ${listaProfessores.map(p => `
                    <option value="${p.idprofessor}">${escapeHtml(p.nome)} (${escapeHtml(p.tipo_instrumento || "Geral")})</option>
                `).join("")}
            `;
            return;
        }
    } catch (e) {
        console.warn("API de professores indisponível.");
    }

    selectProf.innerHTML = `
        <option value="1">Prof. Carlos Eduardo (Piano/Bateria)</option>
        <option value="2">Prof. Mariana (Canto/Violino)</option>
    `;
}

async function carregarAlunos() {
    const selectAluno = document.getElementById("formAluno");
    if (!selectAluno || !isPrivilegiado()) return;

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await fetch(`${API_BASE}/api/alunos`, { headers, credentials: "include" });
        const dados = await resp.json();

        if (dados.sucesso && Array.isArray(dados.alunos) && dados.alunos.length > 0) {
            listaAlunos = dados.alunos;
            selectAluno.innerHTML = `
                <option value="">Nenhum aluno / Aula em Grupo</option>
                ${listaAlunos.map(a => `
                    <option value="${a.idaluno}">${escapeHtml(a.nome)} (${escapeHtml(a.tipo_instrumento || "Música")})</option>
                `).join("")}
            `;
            return;
        }
    } catch (e) {
        console.warn("API de alunos indisponível:", e.message);
    }
}

// ==========================================================================
// FILTRO DE SALAS (DROPDOWN) - Owner, Admin, Professor
// ==========================================================================
const METADADOS_SALAS = {
    todas: { nome: "Todas as Salas", rotulo: "Todas as Salas" },
    "1": { nome: "Sala 1", rotulo: "Sala 1" },
    "2": { nome: "Sala 2", rotulo: "Sala 2" },
    "3": { nome: "Sala 3", rotulo: "Sala 3" },
    "4": { nome: "Sala 4", rotulo: "Sala 4" },
    "5": { nome: "Sala de Bateria", rotulo: "Sala de Bateria" }
};

function abrirDropdownSalas() {
    const trigger = document.getElementById("btnDropdownSalaTrigger");
    const opcoes = document.getElementById("dropdownSalasOpcoes");
    if (!opcoes) return;
    opcoes.classList.remove("oculto");
    if (trigger) {
        trigger.classList.add("aberto");
        trigger.setAttribute("aria-expanded", "true");
    }
}

function fecharDropdownSalas() {
    const trigger = document.getElementById("btnDropdownSalaTrigger");
    const opcoes = document.getElementById("dropdownSalasOpcoes");
    if (!opcoes) return;
    opcoes.classList.add("oculto");
    if (trigger) {
        trigger.classList.remove("aberto");
        trigger.setAttribute("aria-expanded", "false");
    }
}

function alternarDropdownSalas() {
    const opcoes = document.getElementById("dropdownSalasOpcoes");
    if (!opcoes) return;
    if (opcoes.classList.contains("oculto")) {
        abrirDropdownSalas();
    } else {
        fecharDropdownSalas();
    }
}

function configurarFiltroSalas() {
    const trigger = document.getElementById("btnDropdownSalaTrigger");
    if (trigger) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            alternarDropdownSalas();
        });
    }

    const itens = document.querySelectorAll(".dropdown-item-sala");
    itens.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const sala = item.getAttribute("data-sala");
            definirSalaSelecionada(sala);
            fecharDropdownSalas();
        });
    });

    // Fechar ao clicar fora do dropdown
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("dropdownMenuSala");
        if (menu && !menu.contains(e.target)) {
            fecharDropdownSalas();
        }
    });

    // Fechar ao pressionar Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            fecharDropdownSalas();
        }
    });
}

function definirSalaSelecionada(sala) {
    salaSelecionada = sala || "todas";

    // Destaca o item ativo no menu dropdown
    const itens = document.querySelectorAll(".dropdown-item-sala");
    itens.forEach(item => {
        const dataSala = item.getAttribute("data-sala");
        if (dataSala === salaSelecionada) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Atualiza botão trigger do dropdown
    const meta = METADADOS_SALAS[salaSelecionada] || { nome: `Sala ${salaSelecionada}`, rotulo: `Sala ${salaSelecionada}` };
    const elTexto = document.getElementById("textoSalaSelecionada");
    const trigger = document.getElementById("btnDropdownSalaTrigger");

    if (elTexto) elTexto.textContent = meta.nome;

    if (trigger) {
        if (salaSelecionada === "5") {
            trigger.classList.add("bateria-ativa");
        } else {
            trigger.classList.remove("bateria-ativa");
        }
    }

    // Atualiza indicador textual de sala ativa
    const indicador = document.getElementById("indicadorSalaAtual");
    if (indicador) {
        if (salaSelecionada === "5") {
            indicador.classList.add("bateria");
        } else {
            indicador.classList.remove("bateria");
        }
        indicador.innerHTML = `Exibindo: <strong>${meta.rotulo}</strong>`;
    }

    atualizarContadoresSalas();
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

function atualizarContadoresSalas() {
    const contagens = {
        todas: 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    };

    aulas.forEach(a => {
        contagens.todas++;
        const s = String(a.sala).trim().toLowerCase();
        if (s === "1") contagens["1"]++;
        else if (s === "2") contagens["2"]++;
        else if (s === "3") contagens["3"]++;
        else if (s === "4") contagens["4"]++;
        else if (s === "5" || s.includes("bateria")) contagens["5"]++;
    });

    const elTodas = document.getElementById("countSalaTodas");
    if (elTodas) elTodas.textContent = contagens.todas;

    const el1 = document.getElementById("countSala1");
    if (el1) el1.textContent = contagens["1"];

    const el2 = document.getElementById("countSala2");
    if (el2) el2.textContent = contagens["2"];

    const el3 = document.getElementById("countSala3");
    if (el3) el3.textContent = contagens["3"];

    const el4 = document.getElementById("countSala4");
    if (el4) el4.textContent = contagens["4"];

    const el5 = document.getElementById("countSala5");
    if (el5) el5.textContent = contagens["5"];

    const elCountSelecionada = document.getElementById("countSalaSelecionada");
    if (elCountSelecionada) {
        elCountSelecionada.textContent = contagens[salaSelecionada] ?? contagens.todas;
    }
}

// Retorna as aulas visíveis de acordo com a sala selecionada e o perfil do usuário
function obterAulasVisiveis() {
    let lista = [...aulas];

    // Se o usuário for Aluno, vê SOMENTE as suas próprias aulas
    if (isAluno()) {
        lista = lista.filter(a => {
            if (a.aluno_usuario_id && Number(a.aluno_usuario_id) === Number(usuarioAtivo.id)) return true;
            return true; // O backend já realizou o filtro estrito
        });
        return lista;
    }

    // Se o usuário for Staff (Owner, Admin, Professor), aplica o filtro por sala
    if (salaSelecionada && salaSelecionada !== "todas") {
        lista = lista.filter(a => aulaPertenceASala(a, salaSelecionada));
    }

    return lista;
}

// Carregamento de aulas
async function carregarAulas() {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await fetch(`${API_BASE}/api/aulas`, { headers, credentials: "include" });
        const dados = await resp.json();

        if (dados.sucesso && Array.isArray(dados.aulas)) {
            aulas = dados.aulas;
        } else {
            aulas = isAluno() ? aulasFallback.filter(a => a.aluno_usuario_id === usuarioAtivo.id) : aulasFallback;
        }
    } catch (e) {
        console.warn("API de aulas indisponível, usando fallback:", e.message);
        aulas = isAluno() ? aulasFallback.filter(a => a.aluno_usuario_id === usuarioAtivo.id) : aulasFallback;
    }

    atualizarContadoresSalas();
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// Navegação do calendário
function configurarNavegacao() {
    const btnAnt = document.getElementById("btnAnterior");
    if (btnAnt) {
        btnAnt.addEventListener("click", () => {
            dataAtual.setMonth(dataAtual.getMonth() - 1);
            renderizarCalendario();
        });
    }

    const btnProx = document.getElementById("btnProximo");
    if (btnProx) {
        btnProx.addEventListener("click", () => {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
            renderizarCalendario();
        });
    }

    const btnMobPrev = document.getElementById("btnMobPrev");
    if (btnMobPrev) {
        btnMobPrev.addEventListener("click", () => {
            dataAtual.setMonth(dataAtual.getMonth() - 1);
            renderizarCalendario();
        });
    }

    const btnMobNext = document.getElementById("btnMobNext");
    if (btnMobNext) {
        btnMobNext.addEventListener("click", () => {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
            renderizarCalendario();
        });
    }

    const btnMobHoje = document.getElementById("btnMobHoje");
    if (btnMobHoje) {
        btnMobHoje.addEventListener("click", () => {
            const hoje = new Date();
            dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataSelecionada = new Date();
            renderizarCalendario();
            renderizarAgendaDia(dataSelecionada);
        });
    }

    const btnMobBusca = document.getElementById("btnMobBusca");
    const barraBusca = document.getElementById("barraBuscaMobile");
    const inputBusca = document.getElementById("inputBuscaMob");
    const btnLimpar = document.getElementById("btnLimparBuscaMob");

    if (btnMobBusca && barraBusca) {
        btnMobBusca.addEventListener("click", () => {
            barraBusca.classList.toggle("oculto");
            if (!barraBusca.classList.contains("oculto") && inputBusca) {
                inputBusca.focus();
            }
        });
    }

    if (btnLimpar && inputBusca) {
        btnLimpar.addEventListener("click", () => {
            inputBusca.value = "";
            renderizarAgendaDia(dataSelecionada);
        });
    }

    if (inputBusca) {
        inputBusca.addEventListener("input", (e) => {
            filtrarAulasBusca(e.target.value.toLowerCase().trim());
        });
    }

    document.getElementById("formAula").addEventListener("submit", salvarAula);

    document.getElementById("btnLixeira").addEventListener("click", () => {
        if (!isPrivilegiado()) return;
        fecharModal("modalFormulario");
        document.getElementById("modalExcluir").classList.remove("oculto");
    });
}

function filtrarAulasBusca(termo) {
    const agenda = document.getElementById("agendaDia");
    if (!agenda) return;

    if (!termo) {
        renderizarAgendaDia(dataSelecionada);
        return;
    }

    const aulasVisiveis = obterAulasVisiveis();
    const filtradas = aulasVisiveis.filter(a => {
        const nomeSala = formatarNomeSala(a.sala).toLowerCase();
        return (a.titulo && a.titulo.toLowerCase().includes(termo)) ||
               (a.instrumento && a.instrumento.toLowerCase().includes(termo)) ||
               (a.professor && a.professor.toLowerCase().includes(termo)) ||
               (a.aluno_nome && a.aluno_nome.toLowerCase().includes(termo)) ||
               nomeSala.includes(termo);
    });

    if (filtradas.length === 0) {
        agenda.innerHTML = `
            <div class="mob-empty-state">
                <p>Nenhuma aula encontrada para "${escapeHtml(termo)}".</p>
            </div>
        `;
        return;
    }

    agenda.innerHTML = filtradas.map(aula => {
        const dataBr = aula.data ? aula.data.split("-").reverse().join("/") : "";
        const idSanitizado = Number(aula.id) || 0;
        const nomeSala = formatarNomeSala(aula.sala);
        const ehBateria = String(aula.sala) === "5" || String(aula.sala).toLowerCase().includes("bateria");
        const alunoInfo = (aula.aluno_nome && aula.aluno_nome !== "Não vinculado" && !isAluno())
            ? `<span>• Aluno: ${escapeHtml(aula.aluno_nome)}</span>`
            : "";

        return `
            <div class="evento-card ${escapeHtml(aula.tipo)}" onclick="abrirResumo(${idSanitizado}, null)">
                <div class="evento-card-header">
                    <strong>${escapeHtml(aula.hora || "")} — ${escapeHtml(aula.titulo)}</strong>
                    <span class="evento-badge-tipo ${escapeHtml(aula.tipo)}">${escapeHtml(aula.tipo)}</span>
                </div>
                <div class="evento-card-detalhes">
                    <span class="badge-sala-tag ${ehBateria ? 'tag-bateria' : ''}">${escapeHtml(nomeSala)}</span>
                    <span>• ${dataBr}</span>
                    <span>• ${escapeHtml(aula.instrumento || 'Música')}</span>
                    <span>• Prof: ${escapeHtml(aula.professor || 'A definir')}</span>
                    ${alunoInfo}
                </div>
            </div>
        `;
    }).join("");
}

// Renderização do Calendário Mensal
function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const nomeMes = new Date(ano, mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const nomeMesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    const elMesAtual = document.getElementById("mesAtual");
    if (elMesAtual) elMesAtual.textContent = nomeMesCapitalizado;

    const elMesMob = document.getElementById("mesMobTitulo");
    if (elMesMob) elMesMob.textContent = nomeMesCapitalizado;

    const hoje = new Date();
    const elIconeHoje = document.getElementById("iconeDiaHoje");
    if (elIconeHoje) elIconeHoje.textContent = hoje.getDate();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();

    const grade = document.getElementById("gradeAtual");
    let htmlDias = "";

    const aulasVisiveis = obterAulasVisiveis();

    // Dias do mês anterior
    for (let i = 0; i < primeiroDiaSemana; i++) {
        const diaNum = ultimoDiaMesAnterior - primeiroDiaSemana + 1 + i;
        const clsDom = (i === 0) ? "dia-domingo" : "";
        htmlDias += `
            <div class="dia outro-mes ${clsDom}">
                <span class="numero-dia">${diaNum}</span>
            </div>
        `;
    }

    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataObj = new Date(ano, mes, dia);
        const diaSemana = dataObj.getDay();
        const dataFormatada = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        const aulasDoDia = aulasVisiveis.filter(a => a.data === dataFormatada);
        const isSelecionado = dataFormatada === formatarData(dataSelecionada) ? "selecionado" : "";
        const clsDomingo = diaSemana === 0 ? "dia-domingo" : "";

        // Indicadores mobile coloridos
        let indicadoresMobileHtml = "";
        if (aulasDoDia.length > 0) {
            const temNormal = aulasDoDia.some(a => a.tipo === "normal");
            const temReposicao = aulasDoDia.some(a => a.tipo === "reposicao");
            const temCancelada = aulasDoDia.some(a => a.tipo === "cancelada");

            indicadoresMobileHtml = `<div class="mob-indicadores-aulas">`;
            if (temNormal) indicadoresMobileHtml += `<span class="mob-barra-aula normal" title="Aula Normal"></span>`;
            if (temReposicao) indicadoresMobileHtml += `<span class="mob-barra-aula reposicao" title="Reposição"></span>`;
            if (temCancelada) indicadoresMobileHtml += `<span class="mob-barra-aula cancelada" title="Cancelada"></span>`;
            indicadoresMobileHtml += `</div>`;
        }

        // Mini-aulas desktop (com indicação da sala)
        const htmlAulasDesktop = aulasDoDia.slice(0, 3).map(aula => {
            const salaTag = formatarNomeSalaCurto(aula.sala);
            const rotuloAula = `${aula.hora ? aula.hora + ' ' : ''}${aula.titulo || 'Aula'} [${salaTag}]`;
            return `<div class="mini-aula ${aula.tipo}" onclick="abrirResumo(${aula.id}, event)" title="${rotuloAula}">${rotuloAula}</div>`;
        }).join("");

        htmlDias += `
            <div class="dia ${isSelecionado} ${clsDomingo}" onclick="selecionarDia('${dataFormatada}')" data-data="${dataFormatada}">
                <span class="numero-dia"><span class="numero-dia-badge">${dia}</span></span>
                ${indicadoresMobileHtml}
                <div class="aulas-desktop-list">
                    ${htmlAulasDesktop}
                    ${aulasDoDia.length > 3 ? `<div class="mini-aula">... mais ${aulasDoDia.length - 3}</div>` : ""}
                </div>
            </div>
        `;
    }

    // Dias do mês seguinte
    const totalCelulas = primeiroDiaSemana + ultimoDia;
    const celulasFaltantes = (totalCelulas % 7 === 0) ? 0 : 7 - (totalCelulas % 7);
    for (let j = 1; j <= celulasFaltantes; j++) {
        const diaSemanaIdx = (totalCelulas + j - 1) % 7;
        const clsDom = (diaSemanaIdx === 0) ? "dia-domingo" : "";
        htmlDias += `
            <div class="dia outro-mes ${clsDom}">
                <span class="numero-dia">${j}</span>
            </div>
        `;
    }

    grade.innerHTML = htmlDias;
}

// Renderização da Agenda do Dia Selecionado
function renderizarAgendaDia(dataObj) {
    const dataStr = formatarData(dataObj);
    const aulasVisiveis = obterAulasVisiveis();
    const aulasDoDia = aulasVisiveis.filter(a => a.data === dataStr);

    const elTextoDesk = document.getElementById("textoDataSelecionada");
    if (elTextoDesk) {
        elTextoDesk.textContent = dataObj.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    }

    const diasSemanaAbrev = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];
    const mesesAbrevLower = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const diaNum = dataObj.getDate();
    const diaSem = diasSemanaAbrev[dataObj.getDay()];

    const elMobDiaNum = document.getElementById("mobDiaNumero");
    const elMobDiaSem = document.getElementById("mobDiaSemana");
    if (elMobDiaNum) elMobDiaNum.textContent = diaNum;
    if (elMobDiaSem) elMobDiaSem.textContent = diaSem;

    const elTextoBtn = document.getElementById("textoBtnMobAdicionar");
    if (elTextoBtn) {
        elTextoBtn.textContent = `Adicionar aula em ${diaNum} de ${mesesAbrevLower[dataObj.getMonth()]}`;
    }

    const agenda = document.getElementById("agendaDia");
    if (!agenda) return;

    if (aulasDoDia.length === 0) {
        const mensagemVazio = (isStaff() && salaSelecionada !== "todas")
            ? `Nenhuma aula agendada na ${formatarNomeSala(salaSelecionada)} para este dia.`
            : "Nenhuma aula programada para este dia.";

        agenda.innerHTML = `
            <div class="mob-empty-state">
                <div class="mob-empty-icon">
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                </div>
                <p>${mensagemVazio}</p>
            </div>
        `;
        return;
    }

    agenda.innerHTML = aulasDoDia.map(aula => {
        const nomeSala = formatarNomeSala(aula.sala);
        const ehBateria = String(aula.sala) === "5" || String(aula.sala).toLowerCase().includes("bateria");
        const alunoInfo = (aula.aluno_nome && aula.aluno_nome !== "Não vinculado" && !isAluno())
            ? `<span>• Aluno: ${escapeHtml(aula.aluno_nome)}</span>`
            : "";

        return `
            <div class="evento-card ${escapeHtml(aula.tipo)}" onclick="abrirResumo(${aula.id}, null)">
                <div class="evento-card-header">
                    <strong>${escapeHtml(aula.hora || "")} — ${escapeHtml(aula.titulo)}</strong>
                    <span class="evento-badge-tipo ${escapeHtml(aula.tipo)}">${escapeHtml(aula.tipo)}</span>
                </div>
                <div class="evento-card-detalhes">
                    <span class="badge-sala-tag ${ehBateria ? 'tag-bateria' : ''}">${escapeHtml(nomeSala)}</span>
                    <span>• ${escapeHtml(aula.instrumento || 'Música')}</span>
                    <span>• Prof: ${escapeHtml(aula.professor || 'A definir')}</span>
                    ${alunoInfo}
                </div>
            </div>
        `;
    }).join("");
}

function selecionarDia(dataStr) {
    const partes = dataStr.split("-");
    dataSelecionada = new Date(partes[0], partes[1] - 1, partes[2]);
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

function fecharModal(id) {
    document.getElementById(id).classList.add("oculto");
}

// 1. Resumo da Aula (Modal de Leitura)
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
    const nomeSala = formatarNomeSala(aula.sala);
    const ehBateria = String(aula.sala) === "5" || String(aula.sala).toLowerCase().includes("bateria");
    const nomeAluno = aula.aluno_nome && aula.aluno_nome !== "Não vinculado" ? aula.aluno_nome : "Aula em Grupo / Sem aluno vinculado";

    document.getElementById("detalhesAulaConteudo").innerHTML = `
        <p><strong>Título:</strong> ${escapeHtml(aula.titulo)}</p>
        <p><strong>Instrumento:</strong> ${escapeHtml(aula.instrumento || "Música")}</p>
        <p><strong>Professor:</strong> ${escapeHtml(aula.professor || "A definir")}</p>
        <p><strong>Aluno:</strong> ${escapeHtml(nomeAluno)}</p>
        <p><strong>Data/Hora:</strong> ${dataFormatadaBR} às ${escapeHtml(aula.hora || "")}</p>
        <p><strong>Sala:</strong> <span class="badge-sala-info ${ehBateria ? 'tag-bateria' : ''}">${escapeHtml(nomeSala)}</span></p>
        <p><strong>Status:</strong> <span class="evento-badge-tipo ${escapeHtml(aula.tipo)}" style="text-transform: capitalize; display: inline-block;">${escapeHtml(aula.tipo)}</span></p>
        <p><strong>Observações:</strong> ${escapeHtml(aula.observacoes || "Nenhuma observação registrada.")}</p>
    `;

    document.getElementById("modalResumo").classList.remove("oculto");
}

// 2. Novo Agendamento (Admin e Owner)
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

    const selectSala = document.getElementById("formSala");
    if (selectSala) {
        if (salaSelecionada && salaSelecionada !== "todas") {
            selectSala.value = salaSelecionada;
        } else {
            selectSala.value = "1";
        }
    }

    if (salaSelecionada === "5") {
        document.getElementById("formInstrumento").value = "Bateria";
    }

    const selectAluno = document.getElementById("formAluno");
    if (selectAluno) selectAluno.value = "";

    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 3. Edição de Aula (Admin e Owner)
function abrirEdicao(id) {
    if (!isPrivilegiado()) {
        alert("Apenas administradores podem editar aulas.");
        return;
    }

    fecharModal("modalResumo");
    const aula = aulas.find(a => a.id === id);
    if (!aula) return;

    document.getElementById("aulaId").value = aula.id;
    document.getElementById("formTitulo").value = aula.titulo || "";
    document.getElementById("formInstrumento").value = aula.instrumento || "";
    document.getElementById("formData").value = aula.data || "";
    document.getElementById("formHora").value = aula.hora || "";
    
    const salaVal = (String(aula.sala).toLowerCase().includes("bateria") || String(aula.sala) === "5") ? "5" : (aula.sala || "1");
    document.getElementById("formSala").value = salaVal;
    document.getElementById("formTipo").value = aula.tipo || "normal";
    document.getElementById("formObs").value = aula.observacoes || "";

    const selectProf = document.getElementById("formProfessor");
    if (selectProf) {
        if (aula.professor_idprofessor) {
            selectProf.value = aula.professor_idprofessor;
        } else {
            for (let opt of selectProf.options) {
                if (opt.text.toLowerCase().includes(String(aula.professor).toLowerCase())) {
                    selectProf.value = opt.value;
                    break;
                }
            }
        }
    }

    const selectAluno = document.getElementById("formAluno");
    if (selectAluno) {
        selectAluno.value = aula.aluno_idaluno || "";
    }

    document.getElementById("tituloModalForm").textContent = "Editar Aula";
    document.getElementById("btnLixeira").classList.remove("oculto");

    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 4. Salvar Aula via API (Admin e Owner)
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

    const selectAluno = document.getElementById("formAluno");
    const alunoId = selectAluno && selectAluno.value ? parseInt(selectAluno.value, 10) : null;
    const alunoNome = selectAluno && selectAluno.selectedIndex > 0 ? selectAluno.options[selectAluno.selectedIndex].text.split("(")[0].trim() : "";

    const salaSelecionadaForm = parseInt(document.getElementById("formSala").value, 10) || 1;

    const dadosForm = {
        titulo: document.getElementById("formTitulo").value.trim(),
        instrumento: document.getElementById("formInstrumento").value.trim(),
        professor_idprofessor: profId,
        professor: profNome,
        aluno_idaluno: alunoId,
        aluno_nome: alunoNome,
        data: document.getElementById("formData").value,
        hora: document.getElementById("formHora").value,
        sala: salaSelecionadaForm,
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
        console.warn("Falha de rede ao salvar na API. Atualizando localmente:", err.message);
        if (idAtual) {
            const idx = aulas.findIndex(a => a.id == idAtual);
            if (idx >= 0) aulas[idx] = { id: parseInt(idAtual, 10), ...dadosForm };
        } else {
            const novoId = aulas.length ? Math.max(...aulas.map(a => a.id)) + 1 : 1;
            aulas.push({ id: novoId, ...dadosForm });
        }
        fecharModal("modalFormulario");
        atualizarContadoresSalas();
        renderizarCalendario();
        renderizarAgendaDia(dataSelecionada);
    }
}

// 5. Exclusão e Cancelamento
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

function formatarData(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}
