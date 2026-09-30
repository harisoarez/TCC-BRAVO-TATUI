// Estado do Calendário
let dataAtual = new Date();
let dataSelecionada = new Date();
const usuarioAtivo = { tipo: 'admin' }; // 'admin' ou 'aluno'

// Base de testes usando 'titulo' ao invés de 'aluno'
let aulas = [
    { id: 1, titulo: "Aula de Teoria Musical", professor: "Mariana", instrumento: "Violão", sala: 2, data: "2026-09-09", hora: "11:00", tipo: "reposicao", observacoes: "" },
    { id: 2, titulo: "Prática de Escalas", professor: "Carlos", instrumento: "Piano", sala: 1, data: "2026-09-15", hora: "14:00", tipo: "cancelada", observacoes: "Falta do professor." },
    { id: 3, titulo: "Iniciação à Bateria", professor: "Carlos", instrumento: "Bateria", sala: 3, data: "2026-09-29", hora: "09:00", tipo: "normal", observacoes: "" }
];

document.addEventListener("DOMContentLoaded", () => {
    // Configura Botão Agendar Aula para Admin
    if (usuarioAtivo.tipo === 'admin') {
        const btnNova = document.getElementById("btnNovaAula");
        btnNova.classList.remove("oculto");
        btnNova.addEventListener("click", abrirNovoAgendamento);
    }

    // Configura Botões de Navegação
    document.getElementById("btnAnterior").addEventListener("click", () => { dataAtual.setMonth(dataAtual.getMonth() - 1); renderizarCalendario(); });
    document.getElementById("btnProximo").addEventListener("click", () => { dataAtual.setMonth(dataAtual.getMonth() + 1); renderizarCalendario(); });
    
    // Configura Submit do Form
    document.getElementById("formAula").addEventListener("submit", salvarAula);
    
    // Configura Botão da Lixeira
    document.getElementById("btnLixeira").addEventListener("click", () => {
        fecharModal('modalFormulario');
        document.getElementById('modalExcluir').classList.remove('oculto');
    });

    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
});

// ================= RENDERIZAÇÃO =================
function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    
    document.getElementById("mesAtual").textContent = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    
    const grade = document.getElementById("gradeAtual");
    let htmlDias = '';

    for (let i = 0; i < primeiroDia; i++) htmlDias += `<div class="dia outro-mes"></div>`;

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const aulasDoDia = aulas.filter(a => a.data === dataFormatada);
        const isSelecionado = dataFormatada === formatarData(dataSelecionada) ? 'selecionado' : '';
        
        const htmlAulas = aulasDoDia.slice(0, 3).map(aula => 
            `<div class="mini-aula ${aula.tipo}" onclick="abrirResumo(${aula.id}, event)">${aula.hora} - ${aula.titulo}</div>`
        ).join('');

        htmlDias += `
            <div class="dia ${isSelecionado}" onclick="selecionarDia('${dataFormatada}')">
                <span class="numero-dia">${dia}</span>
                ${htmlAulas}
                ${aulasDoDia.length > 3 ? `<div class="mini-aula">... mais</div>` : ''}
            </div>
        `;
    }
    grade.innerHTML = htmlDias;
}

function renderizarAgendaDia(dataObj) {
    const dataStr = formatarData(dataObj);
    const aulasDoDia = aulas.filter(a => a.data === dataStr);
    
    document.getElementById("textoDataSelecionada").textContent = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    const agenda = document.getElementById("agendaDia");
    if (aulasDoDia.length === 0) {
        agenda.innerHTML = `<p style="font-size: 13px; color: #999;">Nenhuma aula programada.</p>`;
        return;
    }

    agenda.innerHTML = aulasDoDia.map(aula => `
        <div class="evento-card ${aula.tipo}" onclick="abrirResumo(${aula.id}, null)">
            <strong>${aula.hora} - ${aula.titulo}</strong>
            <span>${aula.instrumento} | Sala ${aula.sala} | Prof: ${aula.professor}</span>
        </div>
    `).join('');
}

function selecionarDia(dataStr) {
    const partes = dataStr.split('-');
    dataSelecionada = new Date(partes[0], partes[1] - 1, partes[2]);
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// ================= MODAIS E FORMULÁRIO =================
function fecharModal(id) {
    document.getElementById(id).classList.add("oculto");
}

// 1. Resumo da Aula (Adiciona ícone Lápis SVG se for admin)
function abrirResumo(id, evento) {
    if (evento) evento.stopPropagation();
    const aula = aulas.find(a => a.id === id);
    
    // Ícone de Lápis Minimalista
    const iconeLapis = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    
    document.getElementById("acoesResumo").innerHTML = usuarioAtivo.tipo === 'admin' 
        ? `<button onclick="abrirEdicao(${aula.id})" class="btn-icon" title="Editar Aula">${iconeLapis}</button>` 
        : '';
        
    document.getElementById("detalhesAulaConteudo").innerHTML = `
        <p><strong>Título:</strong> ${aula.titulo}</p>
        <p><strong>Instrumento:</strong> ${aula.instrumento}</p>
        <p><strong>Professor:</strong> ${aula.professor}</p>
        <p><strong>Data/Hora:</strong> ${aula.data.split('-').reverse().join('/')} às ${aula.hora}</p>
        <p><strong>Sala:</strong> ${aula.sala}</p>
        <p><strong>Tipo:</strong> <span style="text-transform: capitalize;">${aula.tipo}</span></p>
        <p><strong>Observações:</strong> ${aula.observacoes || "Nenhuma."}</p>
    `;
    
    document.getElementById("modalResumo").classList.remove("oculto");
}

// 2. Novo Agendamento
function abrirNovoAgendamento() {
    document.getElementById("formAula").reset();
    document.getElementById("aulaId").value = "";
    document.getElementById("formData").value = formatarData(dataSelecionada);
    document.getElementById("tituloModalForm").textContent = "Agendar Nova Aula";
    document.getElementById("btnLixeira").classList.add("oculto"); // Esconde Lixeira criando nova aula
    
    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 3. Edição
function abrirEdicao(id) {
    fecharModal("modalResumo");
    const aula = aulas.find(a => a.id === id);
    
    document.getElementById("aulaId").value = aula.id;
    document.getElementById("formTitulo").value = aula.titulo;
    document.getElementById("formProfessor").value = aula.professor;
    document.getElementById("formInstrumento").value = aula.instrumento;
    document.getElementById("formData").value = aula.data;
    document.getElementById("formHora").value = aula.hora;
    document.getElementById("formSala").value = aula.sala;
    document.getElementById("formTipo").value = aula.tipo;
    document.getElementById("formObs").value = aula.observacoes;
    
    document.getElementById("tituloModalForm").textContent = "Editar Aula";
    document.getElementById("btnLixeira").classList.remove("oculto"); // Mostra Lixeira ao editar
    
    document.getElementById("modalFormulario").classList.remove("oculto");
}

// 4. Salvar (Criação e Edição)
function salvarAula(e) {
    e.preventDefault();
    const idAtual = document.getElementById("aulaId").value;
    
    const dadosForm = {
        titulo: document.getElementById("formTitulo").value,
        professor: document.getElementById("formProfessor").value,
        instrumento: document.getElementById("formInstrumento").value,
        data: document.getElementById("formData").value,
        hora: document.getElementById("formHora").value,
        sala: parseInt(document.getElementById("formSala").value),
        tipo: document.getElementById("formTipo").value,
        observacoes: document.getElementById("formObs").value
    };

    if (idAtual) { // Editando
        const index = aulas.findIndex(a => a.id == idAtual);
        aulas[index] = { id: parseInt(idAtual), ...dadosForm };
    } else { // Criando novo
        const novoId = aulas.length ? Math.max(...aulas.map(a => a.id)) + 1 : 1;
        aulas.push({ id: novoId, ...dadosForm });
    }

    fecharModal("modalFormulario");
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// 5. Exclusão Dinâmica
function processarExclusao(acao) {
    const idParaExcluir = document.getElementById("aulaId").value;
    if (!idParaExcluir) return;

    const certeza = confirm("Tem certeza que deseja aplicar esta alteração?");
    if (!certeza) return;

    if (acao === 'cancelar') {
        // Apenas marca como cancelada
        const index = aulas.findIndex(a => a.id == idParaExcluir);
        aulas[index].tipo = 'cancelada';
    } else if (acao === 'apagar') {
        // Exclui do Array completamente
        aulas = aulas.filter(a => a.id != idParaExcluir);
    }

    fecharModal("modalExcluir");
    renderizarCalendario();
    renderizarAgendaDia(dataSelecionada);
}

// ================= UTILIDADES =================
function formatarData(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}