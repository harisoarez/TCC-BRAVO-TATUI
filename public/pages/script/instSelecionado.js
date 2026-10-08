// ================================================================
// INSTITUTO MUSICAL BRAVO TATUÍ - INSTRUMENTO SELECIONADO
// Carregamento dinâmico dos dados do instrumento via API
// ================================================================

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    const elTitulo = document.querySelector(".div3 h1");
    const elDescricao = document.querySelector(".div3 p");
    const elImagem = document.querySelector(".div1 img");

    async function carregarDetalhes() {
        if (!idParam) return; // Mantém o conteúdo estático inicial se não houver id

        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos/item/${idParam}`);
            const dados = await resp.json();

            if (dados.sucesso && dados.dados) {
                const inst = dados.dados;

                document.title = `${inst.nome} | Instituto Bravo Tatuí`;

                if (elTitulo) {
                    elTitulo.textContent = inst.nome;
                }

                if (elDescricao) {
                    elDescricao.textContent = inst.descricao || "Descrição em atualização pela coordenação pedagógica.";
                }

                if (elImagem && inst.imagem_url) {
                    let img = inst.imagem_url;
                    if (img.startsWith("/uploads/")) {
                        img = `${API_BASE}${img}`;
                    }
                    elImagem.src = img;
                    elImagem.alt = `Foto do instrumento ${inst.nome}`;
                }
            }
        } catch (erro) {
            console.warn("Falha ao carregar detalhes dinâmicos do instrumento:", erro);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", carregarDetalhes);
    } else {
        carregarDetalhes();
    }
})();
