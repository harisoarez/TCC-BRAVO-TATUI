// Aulas e Instrumentos - Instituto Bravo Tatuí

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";
    const CACHE_KEY = "bravo_instrumentos_aulas_cache";

    const containerCards = document.getElementById("cards");
    if (!containerCards) return;

    let instrumentosCache = [];

    // Fallback de contingência caso o servidor/banco esteja temporariamente inacessível
    const FALLBACK_INSTRUMENTOS = [
        { id_instrumento: 1, nome: "Piano", categoria: "Teclas & Harmonia", valor_mensalidade: 225, imagem_url: "../images/piano.png" },
        { id_instrumento: 2, nome: "Violino", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/violino.png" },
        { id_instrumento: 3, nome: "Violoncelo", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/violoncelo.png" },
        { id_instrumento: 4, nome: "Viola de Arco", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/viola-arco.png" },
        { id_instrumento: 5, nome: "Contrabaixo Acústico", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/contra-acustico.png" },
        { id_instrumento: 6, nome: "Flauta Transversal", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 180, imagem_url: "../images/flauta.png" },
        { id_instrumento: 7, nome: "Saxofone", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 195, imagem_url: "../images/saxofone.png" },
        { id_instrumento: 8, nome: "Clarinete", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 185, imagem_url: "../images/clarinete.png" },
        { id_instrumento: 9, nome: "Trompete", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 195, imagem_url: "../images/trompete.png" },
        { id_instrumento: 10, nome: "Bateria", categoria: "Percussão & Ritmo", valor_mensalidade: 220, imagem_url: "../images/Bateria.png" }
    ];

    // Subtítulos refinados inspirados na tradição musical do conservatório
    function obterSubtituloInstrumento(inst) {
        const nome = (inst.nome || "").toLowerCase();

        if (nome.includes("violino") || nome.includes("viola") || nome.includes("violoncelo") || nome.includes("contrabaixo")) {
            return "CORDAS CLÁSSICAS • TRADIÇÃO & TÉCNICA";
        }
        if (nome.includes("piano") || nome.includes("teclado")) {
            return "TECLAS & HARMONIA • FORMAÇÃO COMPLETA";
        }
        if (nome.includes("saxofone") || nome.includes("trompete") || nome.includes("trombon") || nome.includes("clarinete") || nome.includes("flauta")) {
            return "SOPROS • EMBOCADURA & SONORIDADE";
        }
        if (nome.includes("bateria") || nome.includes("percussão") || nome.includes("cajon")) {
            return "RITMO & GROOVE • PRÁTICA DE CONJUNTO";
        }
        if (nome.includes("violão") || nome.includes("guitarra") || nome.includes("ukulelê") || nome.includes("acordeon")) {
            return "HARMONIA & ACORDES • REPERTÓRIO PRÁTICO";
        }
        if (nome.includes("voz") || nome.includes("canto") || nome.includes("coral")) {
            return "TÉCNICA VOCAL • INTERPRETAÇÃO & AFINAÇÃO";
        }
        return `${(inst.categoria || "AULAS DE MÚSICA").toUpperCase()} • IMBT`;
    }

    // Resolve a imagem do card de forma inteligente
    function resolverImagemCard(inst) {
        let img = inst.imagem_url ? inst.imagem_url.trim() : "";

        // 1. Uploads gerenciados pelo sistema
        if (img.startsWith("/uploads/")) {
            return `${API_BASE}${img}`;
        }

        // 2. Caminhos relativos válidos ou URLs absolutas
        if (img.startsWith("http://") || img.startsWith("https://")) {
            return img;
        }

        if (img.startsWith("/images/")) {
            return `..${img}`;
        }

        if (img.startsWith("../images/") && !img.includes("exemplo_bravo.jpg") && !img.includes("instSelecionado.png")) {
            return img;
        }

        // 3. Se houver um card no HTML estático com imagem configurada manualmente para este ID, preserva
        const cardExistente = containerCards.querySelector(`.card[onclick*="id=${inst.id_instrumento}"] img`);
        if (cardExistente && cardExistente.getAttribute("src")) {
            const srcManual = cardExistente.getAttribute("src").trim();
            if (srcManual && !srcManual.includes("exemplo_bravo.jpg")) {
                return srcManual;
            }
        }

        // 4. Mapeamento inteligente pelo nome do instrumento
        const nome = (inst.nome || "").toLowerCase();
        if (nome.includes("piano") || nome.includes("teclado")) return "../images/piano.png";
        if (nome.includes("violino")) return "../images/violino.png";
        if (nome.includes("violoncelo") || nome.includes("cello")) return "../images/violoncelo.png";
        if (nome.includes("viola")) return "../images/viola-arco.png";
        if (nome.includes("contra")) return "../images/contra-acustico.png";
        if (nome.includes("flauta")) return "../images/flauta.png";
        if (nome.includes("sax")) return "../images/saxofone.png";
        if (nome.includes("clarinete")) return "../images/clarinete.png";
        if (nome.includes("trompete")) return "../images/trompete.png";
        if (nome.includes("bateria") || nome.includes("percussão")) return "../images/Bateria.png";

        return "../images/exemplo_bravo.jpg";
    }

    // 1. Renderiza a partir do cache da sessão se disponível (0ms)
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                instrumentosCache = parsed;
                // Só substitui os cards do HTML se o cache tiver itens válidos
                if (containerCards.querySelector(".card-skeleton")) {
                    renderizarCards(parsed);
                }
            }
        }
    } catch (e) {
        console.warn("Não foi possível ler cache da sessão:", e);
    }

    // 2. Busca os dados atualizados na API em segundo plano (Sincronização com o Painel Admin)
    async function carregarInstrumentos() {
        try {
            // Busca todos os instrumentos ativos cadastrados no banco
            const resp = await fetch(`${API_BASE}/api/instrumentos?ativo=1`);
            const dados = await resp.json();

            if (dados.sucesso && Array.isArray(dados.dados) && dados.dados.length > 0) {
                const novosDados = dados.dados;
                instrumentosCache = novosDados;
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(instrumentosCache));
                } catch (e) {}
                renderizarCards(instrumentosCache);
            } else if (dados.sucesso && Array.isArray(dados.dados) && dados.dados.length === 0) {
                renderizarCards([]);
            }
        } catch (erro) {
            console.warn("API de instrumentos inacessível, mantendo catálogo estático:", erro);
            // Se o container ainda tiver skeletons e a API falhou, usa fallback
            if (containerCards.querySelector(".card-skeleton")) {
                renderizarCards(FALLBACK_INSTRUMENTOS);
            }
        }
    }

    function renderizarCards(lista) {
        if (!containerCards) return;

        if (lista.length === 0) {
            containerCards.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8; font-family: 'inter', sans-serif;">
                    <p style="font-size: 16px;">Nenhum instrumento disponível no momento.</p>
                </div>
            `;
            return;
        }

        containerCards.innerHTML = lista.map(inst => {
            const img = resolverImagemCard(inst);
            const subtitulo = obterSubtituloInstrumento(inst);

            return `
                <div class="card" onclick="window.location.href='./instSelecionado.html?id=${inst.id_instrumento}'" style="cursor: pointer;" title="Clique para saber mais sobre as aulas de ${inst.nome}">
                    <div class="imagem">
                        <img src="${img}" alt="${inst.nome}" onerror="this.onerror=null; this.src='../images/exemplo_bravo.jpg';">
                    </div>
                    <div class="conteudo">
                        <div class="conteudo-topo">
                            <h3 class="card-titulo">${inst.nome}</h3>
                            <span class="card-subtitulo">${subtitulo}</span>
                        </div>
                        <div class="card-link">
                            <span>Ver detalhes</span>
                            <span class="seta-link">→</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    window.carregarInstrumentos = carregarInstrumentos;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", carregarInstrumentos);
    } else {
        carregarInstrumentos();
    }
})();
