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

    // Mapa oficial das imagens da página de instrumentos
    const IMAGENS_INSTRUMENTOS_PAGINA = {
        "1": "../images/piano.png",
        "2": "../images/violino.png",
        "3": "../images/violoncelo.png",
        "4": "../images/viola-arco.png",
        "5": "../images/contra-acustico.png",
        "6": "../images/flauta.png",
        "7": "../images/saxofone.png",
        "8": "../images/clarinete.png",
        "9": "../images/trompete.png",
        "10": "../images/Bateria.png"
    };

    function resolverImagemInstrumento(id, nome, imagemCadastrada) {
        if (imagemCadastrada && imagemCadastrada.startsWith("/uploads/")) {
            return `${API_BASE}${imagemCadastrada}`;
        }
        if (imagemCadastrada && (imagemCadastrada.startsWith("../images/") || imagemCadastrada.startsWith("http://") || imagemCadastrada.startsWith("https://")) && !imagemCadastrada.includes("instSelecionado.png")) {
            return imagemCadastrada;
        }
        if (id && IMAGENS_INSTRUMENTOS_PAGINA[String(id)]) {
            return IMAGENS_INSTRUMENTOS_PAGINA[String(id)];
        }
        const n = (nome || "").toLowerCase();
        if (n.includes("piano") || n.includes("teclado")) return "../images/piano.png";
        if (n.includes("violino")) return "../images/violino.png";
        if (n.includes("violoncelo") || n.includes("cello")) return "../images/violoncelo.png";
        if (n.includes("viola")) return "../images/viola-arco.png";
        if (n.includes("contra")) return "../images/contra-acustico.png";
        if (n.includes("flauta")) return "../images/flauta.png";
        if (n.includes("sax")) return "../images/saxofone.png";
        if (n.includes("clarinete")) return "../images/clarinete.png";
        if (n.includes("trompete")) return "../images/trompete.png";
        if (n.includes("bateria") || n.includes("percussão")) return "../images/Bateria.png";
        return "../images/exemplo_bravo.jpg";
    }

    const CATALOGO_PADRAO = {
        "1": {
            id_instrumento: 1,
            nome: "Piano",
            categoria: "Teclas & Harmonia",
            imagem_url: "../images/piano.png",
            descricao: "O piano é um instrumento de teclado fascinante e completo, essencial para o desenvolvimento da percepção harmônica e rítmica. No IMBT, oferecemos formação completa desde os primeiros acordes até a técnica avançada clássica e popular."
        },
        "2": {
            id_instrumento: 2,
            nome: "Violino",
            categoria: "Cordas de Arco & Harpa",
            imagem_url: "../images/violino.png",
            descricao: "O violino é o líder melódico da família das cordas, dono de um timbre aveludado, expressivo e brilhante. Nossos professores trabalham postura, afinação pura, técnica de arco e repertório clássico e contemporâneo."
        },
        "3": {
            id_instrumento: 3,
            nome: "Violoncelo",
            categoria: "Cordas de Arco & Harpa",
            imagem_url: "../images/violoncelo.png",
            descricao: "Com graves profundos e ressonância emocional incomparável, o violoncelo emociona pela sua semelhança com a voz humana. Aulas com metodologia direcionada à afinação, leitura musical e prática de câmara."
        },
        "4": {
            id_instrumento: 4,
            nome: "Viola de Arco",
            categoria: "Cordas de Arco & Harpa",
            imagem_url: "../images/viola-arco.png",
            descricao: "A alma intermediária do quarteto de cordas. Possui timbre nobre, caloroso e levemente nostálgico, fundamental para orquestras e música de câmara."
        },
        "5": {
            id_instrumento: 5,
            nome: "Contrabaixo Acústico",
            categoria: "Cordas de Arco & Harpa",
            imagem_url: "../images/contra-acustico.png",
            descricao: "O gigante das cordas acústicas. Fornece sustentação harmônica e condução rítmica tanto na música sinfônica quanto no jazz e na MPB."
        },
        "6": {
            id_instrumento: 6,
            nome: "Flauta Transversal",
            categoria: "Sopros (Metais & Madeiras)",
            imagem_url: "../images/flauta.png",
            descricao: "Instrumento de sopro de sonoridade lírica, doce e ágil. Desenvolve o controle de respiração, embocadura e expressividade melódica."
        },
        "7": {
            id_instrumento: 7,
            nome: "Saxofone",
            categoria: "Sopros (Metais & Madeiras)",
            imagem_url: "../images/saxofone.png",
            descricao: "Extremamente versátil, o saxofone brilha no jazz, no pop, na música clássica e em celebrações ao ar livre com solos cativantes e envolventes."
        },
        "8": {
            id_instrumento: 8,
            nome: "Clarinete",
            categoria: "Sopros (Metais & Madeiras)",
            imagem_url: "../images/clarinete.png",
            descricao: "Com uma das maiores extensões de notas entre os instrumentos de sopro, o clarinete entrega desde graves aveludados até agudos cheios de brilho."
        },
        "9": {
            id_instrumento: 9,
            nome: "Trompete",
            categoria: "Sopros (Metais & Madeiras)",
            imagem_url: "../images/trompete.png",
            descricao: "O brilho triunfal da família dos metais. Ideal para fanfarras de casamento, marchas clássicas solenes e solos vibrantes."
        },
        "10": {
            id_instrumento: 10,
            nome: "Bateria",
            categoria: "Percussão & Ritmo",
            imagem_url: "../images/Bateria.png",
            descricao: "O coração rítmico da música contemporânea. Aulas focadas em coordenação motora, precisão de tempo, grooves e dinâmica musical."
        }
    };

    // Estado da Aplicação
    const idInicial = idParam || "1";
    const instInicial = CATALOGO_PADRAO[String(idInicial)] || CATALOGO_PADRAO["1"];
    let instrumentoAtual = { ...instInicial };
    let descricaoOriginal = instrumentoAtual.descricao;
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
        const padrao = CATALOGO_PADRAO[String(idFinal)] || {
            id_instrumento: idFinal,
            nome: "Instrumento Musical",
            categoria: "Aulas & Formações",
            imagem_url: "../images/exemplo_bravo.jpg",
            descricao: "Carregando informações e detalhes do instrumento no Instituto Bravo Tatuí..."
        };

        // Pré-carregamento imediato via catálogo padrão (0ms) para evitar qualquer flash
        instrumentoAtual = { ...padrao };
        descricaoOriginal = instrumentoAtual.descricao;
        renderizarInstrumentoNaTela();

        // Tenta enriquecer via cache da sessão se disponível
        try {
            const cachedList = sessionStorage.getItem("bravo_instrumentos_aulas_cache");
            if (cachedList) {
                const parsed = JSON.parse(cachedList);
                const achei = parsed.find(i => String(i.id_instrumento) === String(idFinal));
                if (achei) {
                    instrumentoAtual = {
                        id_instrumento: achei.id_instrumento,
                        nome: achei.nome || padrao.nome,
                        categoria: achei.categoria || padrao.categoria,
                        icone: achei.icone || "",
                        descricao: (achei.descricao && achei.descricao.trim()) ? achei.descricao : padrao.descricao,
                        imagem_url: resolverImagemInstrumento(achei.id_instrumento, achei.nome, achei.imagem_url)
                    };
                    descricaoOriginal = instrumentoAtual.descricao;
                    renderizarInstrumentoNaTela();
                }
            }
        } catch (e) {}

        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos/item/${idFinal}`);
            const dados = await resp.json();

            if (dados.sucesso && dados.dados) {
                const inst = dados.dados;
                instrumentoAtual = {
                    id_instrumento: inst.id_instrumento,
                    nome: inst.nome || padrao.nome,
                    categoria: inst.categoria || padrao.categoria,
                    icone: inst.icone || "",
                    descricao: (inst.descricao && inst.descricao.trim()) ? inst.descricao : `Aulas e formação de ${inst.nome} no Instituto Bravo Tatuí. Metodologia pedagógica e prática instrumental completa.`,
                    imagem_url: resolverImagemInstrumento(inst.id_instrumento, inst.nome, inst.imagem_url)
                };
                descricaoOriginal = instrumentoAtual.descricao;

                renderizarInstrumentoNaTela();
            } else {
                instrumentoAtual = { ...padrao };
                descricaoOriginal = instrumentoAtual.descricao;
                renderizarInstrumentoNaTela();
            }
        } catch (erro) {
            console.warn("Usando catálogo estático oficial do Instituto Bravo:", erro);
            instrumentoAtual = { ...padrao };
            descricaoOriginal = instrumentoAtual.descricao;
            renderizarInstrumentoNaTela();
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

        if (elImagem) {
            const imgSrc = resolverImagemInstrumento(instrumentoAtual.id_instrumento, instrumentoAtual.nome, instrumentoAtual.imagem_url);
            elImagem.src = imgSrc;
            elImagem.alt = `Foto do instrumento ${instrumentoAtual.nome}`;
            elImagem.onerror = function () {
                this.onerror = null;
                this.src = "../images/exemplo_bravo.jpg";
            };
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
