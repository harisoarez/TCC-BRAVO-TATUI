// ================================================================
// INSTITUTO MUSICAL BRAVO TATUÍ - AULAS NO IMBT (INSTRUMENTOS)
// Carregamento dinâmico do acervo cadastrado no CRUD
// ================================================================

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    const containerCards = document.getElementById("cards");
    const inputBusca = document.querySelector("#search input");

    let instrumentosCache = [];

    async function carregarInstrumentos() {
        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos?aulas=1&ativo=1`);
            const dados = await resp.json();

            if (dados.sucesso && Array.isArray(dados.dados) && dados.dados.length > 0) {
                instrumentosCache = dados.dados;
                renderizarCards(instrumentosCache);
            }
        } catch (erro) {
            console.warn("Usando catálogo padrão de instrumentos (fallback offline):", erro);
        }
    }

    function renderizarCards(lista) {
        if (!containerCards) return;

        if (lista.length === 0) {
            containerCards.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8; font-family: 'inter', sans-serif;">
                    <p style="font-size: 16px;">Nenhum instrumento encontrado para a sua pesquisa.</p>
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

            return `
                <div class="card" onclick="window.location.href='./instSelecionado.html?id=${inst.id_instrumento}'" style="cursor: pointer;" title="Clique para saber mais sobre as aulas de ${inst.nome}">
                    <div class="imagem">
                        <img src="${img}" alt="${inst.nome}" onerror="this.onerror=null; this.src='../images/exemplo_bravo.jpg';">
                    </div>
                    <div class="conteudo">
                        <h3>${inst.nome}</h3>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Filtro de busca em tempo real
    if (inputBusca) {
        inputBusca.addEventListener("input", function (e) {
            const termo = e.target.value.toLowerCase().trim();
            if (!termo) {
                renderizarCards(instrumentosCache);
                return;
            }

            const filtrados = instrumentosCache.filter(inst => {
                const nome = (inst.nome || "").toLowerCase();
                const cat = (inst.categoria || "").toLowerCase();
                const desc = (inst.descricao || "").toLowerCase();
                return nome.includes(termo) || cat.includes(termo) || desc.includes(termo);
            });

            renderizarCards(filtrados);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", carregarInstrumentos);
    } else {
        carregarInstrumentos();
    }
})();
