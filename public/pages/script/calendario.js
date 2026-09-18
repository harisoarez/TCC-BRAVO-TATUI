let dataAtual = new Date();
let dataSelecionada = new Date();

let aulaSelecionada = null;


// Enquanto não temos o banco de dados,
// as aulas ficam aqui para teste.

let aulas = [
    {
        id: 1,
        nome: "Aula de teoria musical",
        professores: ["Carlos", "Mariana"],
        instrumentos: ["Piano", "Teoria Musical"],
        sala: 1,
        data: "2026-09-09",
        hora: "09:00",
        duracao: 60,
        tipo: "normal",
        observacoes: "..."
    },

    {
        id: 2,
        aluno: "Maria Oliveira",
        professor: "Mariana",
        instrumento: "Violão",
        sala: 2,
        data: "2026-09-09",
        hora: "11:00",
        duracao: 60,
        tipo: "reposicao",
        observacoes: "Reposição da aula anterior."
    },

    {
        id: 3,
        aluno: "Pedro Santos",
        professor: "Carlos",
        instrumento: "Piano",
        sala: 1,
        data: "2026-09-15",
        hora: "14:00",
        duracao: 60,
        tipo: "cancelada",
        observacoes: "Aula cancelada."
    }
];

const modalAgendar = document.getElementById("modalAgendar");
const modalResumo = document.getElementById("modalResumo");
const formAula = document.getElementById("formAula");

document.addEventListener("DOMContentLoaded", function () {

    configurarBotoes();

    atualizarCalendarios();

    selecionarDia(new Date());

    verificarAdmin();

});

function configurarBotoes() {

    document
        .getElementById("btnNovaAula")
        .addEventListener("click", abrirAgendamento);

    document
        .getElementById("btnFecharAgendamento")
        .addEventListener("click", fecharAgendamento);

    document
        .getElementById("btnCancelarAgendamento")
        .addEventListener("click", fecharAgendamento);

    document
        .getElementById("btnFecharResumo")
        .addEventListener("click", fecharResumo);

    document
        .getElementById("btnFecharResumo2")
        .addEventListener("click", fecharResumo);

    document
        .getElementById("btnEditarAula")
        .addEventListener("click", editarAula);

    document
        .getElementById("btnAnterior")
        .addEventListener("click", mesAnterior);

    document
        .getElementById("btnProximo")
        .addEventListener("click", mesProximo);

    document
        .getElementById("btnHoje")
        .addEventListener("click", irParaHoje);

    document
        .getElementById("filtroProfessor")
        .addEventListener("change", atualizarCalendarios);

    document
        .getElementById("filtroTipo")
        .addEventListener("change", atualizarCalendarios);

    formAula.addEventListener("submit", salvarAula);


    modalAgendar.addEventListener("click", function (e) {

        if (e.target === modalAgendar) {
            fecharAgendamento();
        }

    });


    modalResumo.addEventListener("click", function (e) {

        if (e.target === modalResumo) {
            fecharResumo();
        }

    });

}

function verificarAdmin() {

    const usuario = {
        tipo: "admin"
    };

    if (usuario.tipo !== "admin") {
        document.getElementById("botoesAdmin").style.display = "none";
    }

}

function atualizarCalendarios() {

    const mes = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        1
    );

    const proximo = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth() + 1,
        1
    );

    document.getElementById("tituloMes").textContent =
        nomeMes(mes);

    document.getElementById("mesAtual").textContent =
        nomeMes(mes);

    document.getElementById("mesProximo").textContent =
        nomeMes(proximo);


    criarCalendario(
        mes,
        document.getElementById("gradeAtual"),
        "contadorAtual"
    );

    criarCalendario(
        proximo,
        document.getElementById("gradeProximo"),
        "contadorProximo"
    );

}

function criarCalendario(mes, grade, contador) {

    grade.innerHTML = "";


    const primeiroDia = new Date(
        mes.getFullYear(),
        mes.getMonth(),
        1
    );

    const ultimoDia = new Date(
        mes.getFullYear(),
        mes.getMonth() + 1,
        0
    );

    for (let i = primeiroDia.getDay() - 1; i >= 0; i--) {

        const dia = new Date(
            mes.getFullYear(),
            mes.getMonth(),
            -i
        );

        criarDia(grade, dia, true);

    }

    for (let i = 1; i <= ultimoDia.getDate(); i++) {

        const dia = new Date(
            mes.getFullYear(),
            mes.getMonth(),
            i
        );

        criarDia(grade, dia, false);

    }

    const total = grade.children.length;

    const faltam = (7 - (total % 7)) % 7;


    for (let i = 1; i <= faltam; i++) {

        const dia = new Date(
            mes.getFullYear(),
            mes.getMonth() + 1,
            i
        );

        criarDia(grade, dia, true);

    }

    const quantidade = aulasDoMes(mes).length;

    document.getElementById(contador).textContent =
        quantidade + (quantidade === 1 ? " aula" : " aulas");

}

function criarDia(grade, data, outroMes) {

    const div = document.createElement("div");

    div.className = "dia";


    if (outroMes) {
        div.classList.add("outro-mes");
    }


    if (mesmaData(data, new Date())) {
        div.classList.add("hoje");
    }


    if (mesmaData(data, dataSelecionada)) {
        div.classList.add("selecionado");
    }


    const numero = document.createElement("div");

    numero.className = "numero-dia";
    numero.textContent = data.getDate();

    div.appendChild(numero);


    const aulasDoDia = pegarAulasDoDia(data);


    aulasDoDia.slice(0, 3).forEach(function (aula) {

        const mini = document.createElement("div");

        mini.className = "mini-aula " + aula.tipo;


        const hora = document.createElement("span");

        hora.className = "mini-hora";
        hora.textContent = aula.hora;


        const aluno = document.createElement("span");

        aluno.className = "mini-aluno";
        aluno.textContent = aula.aluno;


        mini.appendChild(hora);
        mini.appendChild(aluno);


        mini.addEventListener("click", function (e) {

            e.stopPropagation();

            abrirResumo(aula);

        });


        div.appendChild(mini);

    });


    div.addEventListener("click", function () {
        selecionarDia(data);
    });


    grade.appendChild(div);

}

function selecionarDia(data) {

    dataSelecionada = new Date(data);

    atualizarCalendarios();

    atualizarAgenda();

}

function atualizarAgenda() {

    const data = formatarData(dataSelecionada);

    const aulasDoDia = pegarAulasDoDia(dataSelecionada);


    document.getElementById("tituloAgenda").textContent =
        dataSelecionada.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });


    document.getElementById("subtituloAgenda").textContent =
        aulasDoDia.length === 0
            ? "Nenhuma aula agendada para este dia."
            : "Aulas agendadas para este dia.";


    const agenda = document.getElementById("agendaDia");

    agenda.innerHTML = "";


    for (let hora = 7; hora <= 18; hora++) {

        const linha = document.createElement("div");

        linha.className = "linha-horario";


        const horaTexto = document.createElement("div");

        horaTexto.className = "hora";

        horaTexto.textContent =
            String(hora).padStart(2, "0") + ":00";


        const slot = document.createElement("div");

        slot.className = "slot";


        aulasDoDia.forEach(function (aula) {

            const inicio = minutos(aula.hora);

            const fim = inicio + aula.duracao;

            const horaInicio = hora * 60;
            const horaFim = horaInicio + 60;


            if (
                inicio < horaFim &&
                fim > horaInicio
            ) {

                const elemento = criarAula(aula);

                slot.appendChild(elemento);

            }

        });


        linha.appendChild(horaTexto);
        linha.appendChild(slot);

        agenda.appendChild(linha);

    }

}

function criarAula(aula) {

    const div = document.createElement("div");

    div.className = "aula " + aula.tipo;


    const nome = document.createElement("strong");

    nome.textContent = aula.aluno;


    const detalhes = document.createElement("span");

    detalhes.textContent =
        aula.instrumento +
        " · Sala " +
        aula.sala +
        " · " +
        aula.hora +
        " · " +
        aula.duracao +
        " min";

    div.appendChild(nome);
    div.appendChild(detalhes);


    div.addEventListener("click", function () {
        abrirResumo(aula);
    });

    return div;

}

function abrirResumo(aula) {

    aulaSelecionada = aula;


    document.getElementById("resumoTitulo").textContent =
        aula.instrumento;


    document.getElementById("resumoAluno").textContent =
        aula.aluno;

    document.getElementById("resumoProfessor").textContent =
        aula.professor;

    document.getElementById("resumoInstrumento").textContent =
        aula.instrumento;

    document.getElementById("resumoSala").textContent =
        "Sala " + aula.sala;

    document.getElementById("resumoData").textContent =
        dataBonita(aula.data);

    document.getElementById("resumoHorario").textContent =
        aula.hora;

    document.getElementById("resumoDuracao").textContent =
        aula.duracao + " minutos";

    document.getElementById("resumoTipo").textContent =
        nomeTipo(aula.tipo);

    document.getElementById("resumoObservacoes").textContent =
        aula.observacoes || "Nenhuma observação.";


    modalResumo.classList.remove("oculto");

}

function fecharResumo() {

    modalResumo.classList.add("oculto");

    aulaSelecionada = null;

}


function abrirAgendamento() {

    formAula.reset();

    document.getElementById("dataAula").value =
        formatarData(dataSelecionada);

    document.getElementById("duracao").value = "60";
    document.getElementById("tipoAula").value = "normal";

    document
        .getElementById("mensagemConflito")
        .classList.remove("exibir");


    delete formAula.dataset.editando;

    modalAgendar.classList.remove("oculto");

}

function fecharAgendamento() {

    modalAgendar.classList.add("oculto");

}

function editarAula() {

    if (!aulaSelecionada) {
        return;
    }


    const aula = aulaSelecionada;


    fecharResumo();


    document.getElementById("aluno").value =
        aula.aluno;

    document.getElementById("professor").value =
        aula.professor;

    document.getElementById("instrumento").value =
        aula.instrumento;

    document.getElementById("sala").value =
        aula.sala;

    document.getElementById("dataAula").value =
        aula.data;

    document.getElementById("horaAula").value =
        aula.hora;

    document.getElementById("duracao").value =
        aula.duracao;

    document.getElementById("tipoAula").value =
        aula.tipo;

    document.getElementById("observacoes").value =
        aula.observacoes || "";


    formAula.dataset.editando = aula.id;

    modalAgendar.classList.remove("oculto");

}

function salvarAula(e) {

    e.preventDefault();


    const id = formAula.dataset.editando;


    const novaAula = {

        id: id
            ? Number(id)
            : proximoId(),

        aluno: document.getElementById("aluno").value,

        professor: document.getElementById("professor").value,

        instrumento:
            document.getElementById("instrumento").value,

        sala:
            Number(document.getElementById("sala").value),

        data:
            document.getElementById("dataAula").value,

        hora:
            document.getElementById("horaAula").value,

        duracao:
            Number(document.getElementById("duracao").value),

        tipo:
            document.getElementById("tipoAula").value,

        observacoes:
            document.getElementById("observacoes").value

    };

    if (salaOcupada(novaAula)) {

        document
            .getElementById("mensagemConflito")
            .classList.add("exibir");

        return;

    }

    if (id) {

        const indice = aulas.findIndex(function (aula) {
            return aula.id === Number(id);
        });


        if (indice !== -1) {
            aulas[indice] = novaAula;
        }

        mostrarToast("Aula alterada.");

    } else {

        aulas.push(novaAula);

        mostrarToast("Aula agendada.");

    }

    delete formAula.dataset.editando;

    fecharAgendamento();

    atualizarCalendarios();

    selecionarDia(converterData(novaAula.data));

}

function salaOcupada(novaAula) {

    return aulas.some(function (aula) {

        if (aula.id === novaAula.id) {
            return false;
        }

        if (aula.tipo === "cancelada") {
            return false;
        }

        if (aula.data !== novaAula.data) {
            return false;
        }

        if (aula.sala !== novaAula.sala) {
            return false;
        }


        const inicio1 = minutos(aula.hora);
        const fim1 = inicio1 + aula.duracao;

        const inicio2 = minutos(novaAula.hora);
        const fim2 = inicio2 + novaAula.duracao;


        return (
            inicio1 < fim2 &&
            inicio2 < fim1
        );

    });

}

function mesAnterior() {

    dataAtual.setMonth(dataAtual.getMonth() - 1);

    atualizarCalendarios();

}


function mesProximo() {

    dataAtual.setMonth(dataAtual.getMonth() + 1);

    atualizarCalendarios();

}


function irParaHoje() {

    const hoje = new Date();

    dataAtual = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );

    selecionarDia(hoje);

}

function pegarAulasFiltradas() {

    const professor =
        document.getElementById("filtroProfessor").value;

    const tipo =
        document.getElementById("filtroTipo").value;


    return aulas.filter(function (aula) {

        const professorOk =
            professor === "todos" ||
            aula.professor === professor;

        const tipoOk =
            tipo === "todos" ||
            aula.tipo === tipo;


        return professorOk && tipoOk;

    });

}

function pegarAulasDoDia(data) {

    const dataTexto =
        typeof data === "string"
            ? data
            : formatarData(data);


    return pegarAulasFiltradas().filter(function (aula) {
        return aula.data === dataTexto;
    });

}

function aulasDoMes(mes) {

    return pegarAulasFiltradas().filter(function (aula) {

        const data = converterData(aula.data);

        return (
            data.getFullYear() === mes.getFullYear() &&
            data.getMonth() === mes.getMonth()
        );

    });

}

function minutos(hora) {

    const partes = hora.split(":");

    return (
        Number(partes[0]) * 60 +
        Number(partes[1])
    );

}

function formatarData(data) {

    return (
        data.getFullYear() +
        "-" +
        String(data.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(data.getDate()).padStart(2, "0")
    );

}

function converterData(data) {

    const partes = data.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}

function dataBonita(data) {

    return converterData(data).toLocaleDateString(
        "pt-BR"
    );

}

function mesmaData(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}

function nomeMes(data) {

    return data.toLocaleDateString(
        "pt-BR",
        {
            month: "long",
            year: "numeric"
        }
    );

}

function nomeTipo(tipo) {

    if (tipo === "normal") {
        return "Aula normal";
    }

    if (tipo === "reposicao") {
        return "Reposição";
    }

    if (tipo === "cancelada") {
        return "Cancelada";
    }

    return tipo;

}

function proximoId() {

    if (aulas.length === 0) {
        return 1;
    }

    return Math.max(
        ...aulas.map(function (aula) {
            return aula.id;
        })
    ) + 1;

}

function mostrarToast(texto) {

    const toast =
        document.getElementById("toast");

    toast.textContent = texto;

    toast.classList.add("exibir");


    setTimeout(function () {

        toast.classList.remove("exibir");

    }, 2000);

}