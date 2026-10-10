// Instrumento Selecionado - Instituto Bravo Tatuí

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    // Elementos do DOM - Instrumento
    const elTitulo = document.getElementById("instrumentoTitulo");
    const elCategoriaBadge = document.getElementById("instrumentoCategoriaBadge");
    const elDescricao = document.getElementById("instrumentoDescricao");
    const elImagem = document.getElementById("instrumentoImagem");

    // Elementos do DOM - Professores (Card Inferior)
    const elProfTitulo = document.getElementById("professoresTitulo");
    const elProfTexto = document.getElementById("professoresTexto");
    const elProfDestaques = document.getElementById("professoresDestaques");
    const elBtnAcaoProfessores = document.getElementById("btnAcaoProfessores");

    // Elementos do DOM - Admin
    const elAdminControls = document.getElementById("adminControlsInstrumento");
    const elAdminTopBar = document.getElementById("adminTopBarIndicador");
    const elLinkPainelAdmin = document.getElementById("linkPainelAdmin");
    const elBtnEditarDescricao = document.getElementById("btnEditarDescricao");

    // Elementos do DOM - Modal de Edição
    const elModal = document.getElementById("modalEditarDescricao");
    const elModalCard = document.querySelector(".modal-card-inst");
    const elFormEdicao = document.getElementById("formEditarDescricao");
    const elTextareaDesc = document.getElementById("textareaDescricaoModal");
    const elContadorChars = document.getElementById("contadorCaracteresModal");
    const elModalNomeInst = document.getElementById("modalNomeInstExibicao");
    const elBtnFecharModal = document.getElementById("btnFecharModalDesc");
    const elBtnCancelarEdicao = document.getElementById("btnCancelarEdicao");
    const elBtnRestaurar = document.getElementById("btnRestaurarOriginal");
    const elBtnSalvarDesc = document.getElementById("btnSalvarDescricao");
    const elTextoBtnSalvar = document.getElementById("textoBtnSalvar");
    const elModalFeedback = document.getElementById("modalFeedbackMsg");
    const elToast = document.getElementById("toastNotificacao");

    // Estado da Aplicação
    let instrumentoAtual = {
        id_instrumento: 1,
        nome: "Piano",
        categoria: "Teclas & Harmonia",
        descricao: "",
        imagem_url: ""
    };
    let descricaoOriginal = "";
    let usuarioLogado = null;
    let isAdmin = false;

    // Autenticação e permissões
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

    function checarPermissoesAdmin() {
        const token = localStorage.getItem("authToken");
        let u = null;
        try {
            const uStr = localStorage.getItem("usuario");
            if (uStr) u = JSON.parse(uStr);
        } catch (e) {}

        const payload = decodificarToken(token);
        const tipo = (payload?.tipo_usuario || payload?.tipo || u?.tipo_usuario || u?.tipo || "").toLowerCase();

        usuarioLogado = {
            id: payload?.id_usuario || u?.id_usuario || u?.id,
            nome: payload?.nome || u?.nome || "Usuário",
            tipo: tipo,
            token: token
        };

        isAdmin = (tipo === "admin" || tipo === "owner");

        if (isAdmin) {
            if (elAdminControls) elAdminControls.style.display = "flex";
            if (elAdminTopBar) elAdminTopBar.style.display = "inline-flex";
            if (elLinkPainelAdmin && token) {
                elLinkPainelAdmin.style.display = "inline-flex";
                elLinkPainelAdmin.href = `${API_BASE}/paginas/instrumentos?token=${encodeURIComponent(token)}`;
            }
        } else {
            if (elAdminControls) elAdminControls.style.display = "none";
            if (elAdminTopBar) elAdminTopBar.style.display = "none";
            if (elLinkPainelAdmin) elLinkPainelAdmin.style.display = "none";
        }
    }

    // Carregamento do instrumento
    async function carregarDetalhesInstrumento() {
        // Se idParam estiver ausente, carrega instrumento 1 (Piano por padrão)
        const idFinal = idParam || 1;

        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos/item/${idFinal}`);
            const dados = await resp.json();

            if (dados.sucesso && dados.dados) {
                const inst = dados.dados;
                instrumentoAtual = {
                    id_instrumento: inst.id_instrumento,
                    nome: inst.nome,
                    categoria: inst.categoria,
                    icone: inst.icone,
                    descricao: inst.descricao || "",
                    imagem_url: inst.imagem_url || ""
                };
                descricaoOriginal = instrumentoAtual.descricao;

                renderizarInstrumentoNaTela();
            } else {
                // Fallback caso ID não exista na base
                instrumentoAtual.descricao = (elDescricao && elDescricao.textContent) ? elDescricao.textContent.trim() : "";
                descricaoOriginal = instrumentoAtual.descricao;
            }
        } catch (erro) {
            console.warn("Falha ao carregar detalhes dinâmicos do instrumento, mantendo dados estáticos:", erro);
            instrumentoAtual.descricao = (elDescricao && elDescricao.textContent) ? elDescricao.textContent.trim() : "";
            descricaoOriginal = instrumentoAtual.descricao;
        } finally {
            carregarInformacoesProfessores();
        }
    }

    function renderizarInstrumentoNaTela() {
        document.title = `${instrumentoAtual.nome} | Instituto Bravo Tatuí`;

        if (elTitulo) {
            elTitulo.textContent = instrumentoAtual.nome;
        }

        if (elCategoriaBadge && instrumentoAtual.categoria) {
            elCategoriaBadge.textContent = instrumentoAtual.categoria;
            elCategoriaBadge.style.display = "inline-block";
        }

        if (elDescricao) {
            elDescricao.textContent = instrumentoAtual.descricao || "Descrição em atualização pela coordenação pedagógica do Instituto Bravo Tatuí.";
        }

        if (elImagem && instrumentoAtual.imagem_url) {
            let img = instrumentoAtual.imagem_url;
            if (img.startsWith("/uploads/")) {
                img = `${API_BASE}${img}`;
            }
            elImagem.src = img;
            elImagem.alt = `Foto do instrumento ${instrumentoAtual.nome}`;
        }
    }

    // Informações dos professores
    async function carregarInformacoesProfessores() {
        const nomeInst = instrumentoAtual.nome || "Instrumento";

        if (elProfTitulo) {
            elProfTitulo.textContent = `Informações dos Professores • ${nomeInst}`;
        }

        if (elProfTexto) {
            elProfTexto.textContent = `O corpo docente de ${nomeInst} do Instituto Musical Bravo Tatuí é constituído por mestres, concertistas e educadores de renome com sólida formação superior pelas mais prestigiadas academias musicais do país, como o Conservatório Dramático e Musical Dr. Carlos de Campos de Tatuí, a UNICAMP e a USP. Nossos professores trabalham um currículo pedagógico individualizado e dinâmico, focado no desenvolvimento artístico, técnico e expressivo de cada estudante. O aprendizado integra postura anatômica saudável, afinação e sonoridade refinada, leitura à primeira vista, percepção rítmica e harmônica, além de vivência em prática de câmara e orquestral em salas acusticamente isoladas com instrumentos de alta performance.`;
        }

        if (elBtnAcaoProfessores) {
            const msgWhatsApp = encodeURIComponent(`Olá! Gostaria de falar com a coordenação pedagógica e tirar dúvidas sobre as aulas e professores de ${nomeInst} no Instituto Bravo Tatuí.`);
            elBtnAcaoProfessores.href = `https://wa.me/5515996257683?text=${msgWhatsApp}`;
        }

        // Consulta professores cadastrados no sistema que lecionam o instrumento
        try {
            const resp = await fetch(`${API_BASE}/api/professores`);
            const dados = await resp.json();

            if (dados.sucesso && Array.isArray(dados.professores) && dados.professores.length > 0) {
                const termoInst = nomeInst.toLowerCase();
                const termoCat = (instrumentoAtual.categoria || "").toLowerCase();

                const professoresDoInst = dados.professores.filter((p) => {
                    const tipoInst = (p.tipo_instrumento || "").toLowerCase();
                    return tipoInst.includes(termoInst) || (termoCat && tipoInst.includes(termoCat));
                });

                if (elProfDestaques) {
                    if (professoresDoInst.length > 0) {
                        elProfDestaques.innerHTML = professoresDoInst.map((prof) => `
                            <div class="chip-professor-item" title="Professor(a) de ${prof.tipo_instrumento || nomeInst}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5D696" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>Prof. <strong>${prof.nome}</strong> (${prof.tipo_instrumento || nomeInst})</span>
                            </div>
                        `).join("");
                        elProfDestaques.style.display = "flex";
                    } else {
                        elProfDestaques.style.display = "none";
                    }
                }
            }
        } catch (e) {
            console.warn("Não foi possível carregar a listagem adicional de professores:", e);
        }
    }

    // Edição da descrição do instrumento
    function abrirModalEdicao() {
        if (!isAdmin) {
            exibirToast("Acesso restrito: faça login como administrador.", "erro");
            return;
        }

        if (elModalNomeInst) {
            elModalNomeInst.textContent = instrumentoAtual.nome;
        }

        if (elTextareaDesc) {
            elTextareaDesc.value = instrumentoAtual.descricao || "";
            atualizarContadorCaracteres();
        }

        if (elModalFeedback) {
            elModalFeedback.style.display = "none";
            elModalFeedback.textContent = "";
        }

        if (elModal) {
            elModal.style.display = "flex";
            if (elTextareaDesc) {
                setTimeout(() => elTextareaDesc.focus(), 100);
            }
        }
    }

    function fecharModalEdicao() {
        if (elModal) {
            elModal.style.display = "none";
        }
        if (elModalFeedback) {
            elModalFeedback.style.display = "none";
            elModalFeedback.textContent = "";
        }
    }

    function atualizarContadorCaracteres() {
        if (!elContadorChars || !elTextareaDesc) return;
        const total = elTextareaDesc.value.length;
        elContadorChars.textContent = `${total} caracter${total === 1 ? "" : "es"}`;
    }

    async function salvarEdicaoDescricao(e) {
        e.preventDefault();

        if (!isAdmin) {
            exibirFeedbackModal("Apenas administradores podem modificar o instrumento.", "erro");
            return;
        }

        const novaDescricao = elTextareaDesc.value.trim();

        if (!novaDescricao) {
            exibirFeedbackModal("A descrição não pode ficar em branco.", "erro");
            if (elTextareaDesc) elTextareaDesc.focus();
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            exibirFeedbackModal("Sessão expirada. Faça login novamente.", "erro");
            return;
        }

        // Estado visual de carregamento
        if (elBtnSalvarDesc) elBtnSalvarDesc.disabled = true;
        if (elTextoBtnSalvar) elTextoBtnSalvar.textContent = "Salvando...";

        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos/${instrumentoAtual.id_instrumento}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    descricao: novaDescricao
                })
            });

            const dados = await resp.json();

            if (dados.sucesso) {
                // Atualiza o estado em memória e na interface imediatamente
                instrumentoAtual.descricao = novaDescricao;
                if (elDescricao) {
                    elDescricao.textContent = novaDescricao;
                }

                fecharModalEdicao();
                exibirToast("Descrição do instrumento atualizada com sucesso no banco de dados!", "sucesso");
            } else {
                exibirFeedbackModal(dados.mensagem || "Erro ao salvar alterações no servidor.", "erro");
            }
        } catch (erro) {
            console.error("Erro na requisição PUT de instrumentos:", erro);
            exibirFeedbackModal("Não foi possível conectar ao servidor. Verifique sua conexão.", "erro");
        } finally {
            if (elBtnSalvarDesc) elBtnSalvarDesc.disabled = false;
            if (elTextoBtnSalvar) elTextoBtnSalvar.textContent = "Salvar Alterações";
        }
    }

    function restaurarDescricaoOriginal() {
        if (!elTextareaDesc) return;
        elTextareaDesc.value = descricaoOriginal;
        atualizarContadorCaracteres();
        exibirFeedbackModal("Texto original restaurado no formulário. Clique em Salvar para gravar.", "sucesso");
    }

    function exibirFeedbackModal(mensagem, tipo = "erro") {
        if (!elModalFeedback) return;
        elModalFeedback.textContent = mensagem;
        elModalFeedback.className = `modal-feedback-msg ${tipo}`;
        elModalFeedback.style.display = "block";
    }

    function exibirToast(mensagem, tipo = "sucesso", tempoMs = 4000) {
        if (!elToast) return;
        elToast.textContent = mensagem;
        elToast.className = `toast-notificacao ${tipo}`;
        elToast.style.display = "flex";

        setTimeout(() => {
            elToast.style.display = "none";
        }, tempoMs);
    }

    // Eventos
    function registrarEventos() {
        // Abertura do Modal de Edição (Admin)
        if (elBtnEditarDescricao) {
            elBtnEditarDescricao.addEventListener("click", abrirModalEdicao);
        }

        // Fechamento do Modal
        if (elBtnFecharModal) {
            elBtnFecharModal.addEventListener("click", fecharModalEdicao);
        }
        if (elBtnCancelarEdicao) {
            elBtnCancelarEdicao.addEventListener("click", fecharModalEdicao);
        }

        // Clique fora do card fecha o modal
        if (elModal) {
            elModal.addEventListener("click", function (e) {
                if (e.target === elModal) {
                    fecharModalEdicao();
                }
            });
        }

        // Tecla Escape fecha o modal
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && elModal && elModal.style.display === "flex") {
                fecharModalEdicao();
            }
        });

        // Contador de caracteres em tempo real
        if (elTextareaDesc) {
            elTextareaDesc.addEventListener("input", atualizarContadorCaracteres);
        }

        // Botão Restaurar Original
        if (elBtnRestaurar) {
            elBtnRestaurar.addEventListener("click", restaurarDescricaoOriginal);
        }

        // Submissão do formulário de edição
        if (elFormEdicao) {
            elFormEdicao.addEventListener("submit", salvarEdicaoDescricao);
        }
    }

    // Inicialização da página
    function inicializar() {
        checarPermissoesAdmin();
        registrarEventos();
        carregarDetalhesInstrumento();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar();
    }
})();
