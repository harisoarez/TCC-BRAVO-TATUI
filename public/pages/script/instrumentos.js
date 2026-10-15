// Aulas e Instrumentos - Instituto Bravo Tatuí

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";
    const CACHE_KEY = "bravo_instrumentos_aulas_cache";

    const containerCards = document.getElementById("cards");

    let instrumentosCache = [];

    // Fallback de contingência caso o servidor/banco esteja temporariamente inacessível
    const FALLBACK_INSTRUMENTOS = [
        { id_instrumento: 1, nome: "Piano", categoria: "Teclas & Harmonia", valor_mensalidade: 225, imagem_url: "../images/piano.png" },
        { id_instrumento: 2, nome: "Violino", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/violino.png" },
        { id_instrumento: 3, nome: "Violoncelo", categoria: "Cordas de Arco & Harpa", valor_mensalidade: 195, imagem_url: "../images/violoncelo.png" },
        { id_instrumento: 7, nome: "Flauta Transversal", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 180, imagem_url: "../images/flauta.png" },
        { id_instrumento: 8, nome: "Saxofone", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 195, imagem_url: "../images/saxofone.png" },
        { id_instrumento: 9, nome: "Clarinete", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 185, imagem_url: "../images/clarinete.png" },
        { id_instrumento: 10, nome: "Trompete", categoria: "Sopros (Metais & Madeiras)", valor_mensalidade: 195, imagem_url: "../images/trompete.png" },
        { id_instrumento: 14, nome: "Percussão Sinfônica", categoria: "Percussão & Ritmo", valor_mensalidade: 210, imagem_url: "../images/Bateria.png" }
    ];

    // Subtítulos refinados inspirados na tradição musical do conservatório
    function obterSubtituloInstrumento(inst) {
        const nome = (inst.nome || "").toLowerCase();

        if (nome.includes("violino") || nome.includes("viola") || nome.includes("violoncelo") || nome.includes("contrabaixo")) {
            return "CORDAS CLÁSSICAS • TRADIÇÃO & TÉCNICA";
        }
        if (nome.includes("piano")) {
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

    // Formatação de mensalidade base
    function formatarPreco(inst) {
        let preco = Number(inst.valor_mensalidade);
        if (!preco || isNaN(preco) || preco <= 0) {
            const nome = (inst.nome || "").toLowerCase();
            if (nome.includes("piano")) preco = 225;
            else if (nome.includes("flauta") || nome.includes("violão") || nome.includes("ukulelê")) preco = 180;
            else if (nome.includes("clarinete")) preco = 185;
            else if (nome.includes("voz") || nome.includes("canto") || nome.includes("bateria")) preco = 220;
            else if (nome.includes("percussão")) preco = 210;
            else preco = 195;
        }

        return `R$ ${Math.round(preco).toLocaleString("pt-BR")}`;
    }

    // 1. Tenta renderizar imediatamente a partir do cache da sessão (0ms) se disponível
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                instrumentosCache = parsed;
                renderizarCards(parsed);
            }
        }
    } catch (e) {
        console.warn("Não foi possível ler cache da sessão:", e);
    }

    // 2. Busca os dados atualizados na API (stale-while-revalidate)
    async function carregarInstrumentos() {
        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos?aulas=1&ativo=1`);
            const dados = await resp.json();

            if (dados.sucesso && Array.isArray(dados.dados) && dados.dados.length > 0) {
                const novosDados = dados.dados;
                const mudou = JSON.stringify(novosDados) !== JSON.stringify(instrumentosCache);
                if (mudou || instrumentosCache.length === 0) {
                    instrumentosCache = novosDados;
                    try {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify(instrumentosCache));
                    } catch (e) {}
                    renderizarCards(instrumentosCache);
                }
            } else if (instrumentosCache.length === 0) {
                renderizarCards([]);
            }
        } catch (erro) {
            console.warn("Erro ao buscar catálogo de instrumentos na API:", erro);
            if (instrumentosCache.length === 0) {
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
            let img = inst.imagem_url;
            if (!img) {
                img = "../images/exemplo_bravo.jpg";
            } else if (img.startsWith("/uploads/")) {
                img = `${API_BASE}${img}`;
            }

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
