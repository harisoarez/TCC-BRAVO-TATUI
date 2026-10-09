// ================================================================
// COFFEE BRAVO - CONTROLE DINÂMICO DO CARDÁPIO & CRUD ADMIN
// ================================================================

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    let todosItens = [];
    let categoriaAtiva = "Todos";
    let termoBusca = "";
    let usuarioLogado = null;
    let isAdmin = false;

    // Decodifica JWT localmente
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

    // Identifica se o usuário atual é Administrador ou Owner
    function checarPermissoesAdmin() {
        const token = localStorage.getItem("authToken");
        let u = null;
        try {
            const uStr = localStorage.getItem("usuario");
            if (uStr) u = JSON.parse(uStr);
        } catch (e) {}

        const payload = decodificarToken(token);
        const tipo = (payload?.tipo_usuario || u?.tipo_usuario || u?.tipo || "").toLowerCase();

        usuarioLogado = {
            id: payload?.id_usuario || u?.id_usuario || u?.id,
            nome: payload?.nome || u?.nome || "Usuário",
            tipo: tipo,
            token: token,
        };

        isAdmin = tipo === "admin" || tipo === "owner";

        const toolbar = document.getElementById("adminToolbar");
        if (toolbar) {
            if (isAdmin) {
                toolbar.style.display = "flex";
                const linkPainel = document.getElementById("btnAdminIrPainel");
                if (linkPainel && token) {
                    linkPainel.href = `${API_BASE}/paginas/cardapio?token=${encodeURIComponent(token)}`;
                }
            } else {
                toolbar.style.display = "none";
            }
        }
    }

    // Carrega dados da API do cardápio
    async function carregarCardapio() {
        const grid = document.getElementById("gridProdutos");
        if (!grid) return;

        grid.innerHTML = `
            <div class="estado-vazio">
                <h3>☕ Carregando delícias do Coffee Bravo...</h3>
                <p>Buscando os produtos mais recentes.</p>
            </div>
        `;

        try {
            const resp = await fetch(`${API_BASE}/api/cardapio`);
            const dados = await resp.json();

            if (dados.sucesso && Array.isArray(dados.itens)) {
                todosItens = dados.itens;
                construirAbasCategorias();
                renderizarProdutos();
            } else {
                grid.innerHTML = `
                    <div class="estado-vazio">
                        <h3>Ops! Ocorreu um problema ao carregar o cardápio.</h3>
                        <p>${dados.mensagem || 'Tente novamente em instantes.'}</p>
                    </div>
                `;
            }
        } catch (erro) {
            console.error("Erro ao consultar cardápio:", erro);
            grid.innerHTML = `
                <div class="estado-vazio">
                    <h3>Não foi possível conectar ao servidor.</h3>
                    <p>Verifique se o backend está em execução na porta 3000.</p>
                </div>
            `;
        }
    }

    // Constrói as abas de categoria dinamicamente
    function construirAbasCategorias() {
        const container = document.getElementById("categoriasTabs");
        if (!container) return;

        // Categorias fixas recomendadas + outras que existam nos itens
        const categoriasSet = new Set(["Todos", "Cafés", "Bebidas Geladas", "Salgados & Lanches", "Doces & Sobremesas", "Combos"]);
        todosItens.forEach((item) => {
            if (item.categoria) categoriasSet.add(item.categoria);
        });

        const categoriasLista = Array.from(categoriasSet);

        container.innerHTML = categoriasLista
            .map((cat) => {
                const ativaClass = cat === categoriaAtiva ? "ativo" : "";
                return `<button type="button" class="categoria-tab-btn ${ativaClass}" data-categoria="${cat}">${cat}</button>`;
            })
            .join("");

        // Atualiza também o <select> do modal de cadastro/edição
        const selModal = document.getElementById("modalCampoCategoria");
        if (selModal) {
            const opcoes = ["Cafés", "Bebidas Geladas", "Salgados & Lanches", "Doces & Sobremesas", "Combos"];
            todosItens.forEach((i) => {
                if (i.categoria && !opcoes.includes(i.categoria)) opcoes.push(i.categoria);
            });

            selModal.innerHTML = `
                ${opcoes.map((c) => `<option value="${c}">${c}</option>`).join("")}
                <option value="__nova__">+ Outra / Criar Nova Categoria</option>
            `;
        }

        // Event listener para as abas
        container.querySelectorAll(".categoria-tab-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                container.querySelectorAll(".categoria-tab-btn").forEach((b) => b.classList.remove("ativo"));
                this.classList.add("ativo");
                categoriaAtiva = this.getAttribute("data-categoria");
                renderizarProdutos();
            });
        });
    }

    // Renderiza os produtos filtrados na tela
    function renderizarProdutos() {
        const grid = document.getElementById("gridProdutos");
        const contador = document.getElementById("contadorTotalItens");
        if (!grid) return;

        const buscaClean = termoBusca.toLowerCase().trim();

        const filtrados = todosItens.filter((item) => {
            const matchCategoria = categoriaAtiva === "Todos" || item.categoria === categoriaAtiva;
            const matchBusca =
                !buscaClean ||
                (item.nome && item.nome.toLowerCase().includes(buscaClean)) ||
                (item.descricao && item.descricao.toLowerCase().includes(buscaClean)) ||
                (item.categoria && item.categoria.toLowerCase().includes(buscaClean));

            return matchCategoria && matchBusca;
        });

        if (contador) {
            contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'item exibido' : 'itens exibidos'}`;
        }

        if (filtrados.length === 0) {
            grid.innerHTML = `
                <div class="estado-vazio">
                    <h3>Nenhum item encontrado</h3>
                    <p>Não encontramos produtos com os critérios de busca selecionados.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtrados
            .map((item) => {
                const precoFormatado = Number(item.preco).toFixed(2).replace(".", ",");
                const estaDisponivel = item.disponivel === 1 || item.disponivel === true;
                const estaDestaque = item.destaque === 1 || item.destaque === true;

                const imagemHtml = item.imagem_url
                    ? `<img src="${item.imagem_url}" alt="${item.nome}" loading="lazy">`
                    : `<div class="produto-imagem-placeholder">☕</div>`;

                const badgeDestaqueHtml = estaDestaque
                    ? `<span class="badge-destaque">★ Destaque</span>`
                    : "";

                const badgeStatusHtml = `<span class="badge-status ${estaDisponivel ? 'disponivel' : 'esgotado'}">${estaDisponivel ? 'Disponível' : 'Esgotado'}</span>`;

                // Botões de administração exibidos se o usuário for Admin ou Owner
                const adminAcoesHtml = isAdmin
                    ? `
                    <div class="admin-card-acoes">
                        <button type="button" class="btn-card-admin btn-card-editar" onclick="window.abrirModalPublicEditar(${item.id_item})">
                            Editar
                        </button>
                        <button type="button" class="btn-card-admin btn-card-status ${estaDisponivel ? '' : 'esgot'}" onclick="window.alternarStatusPublic(${item.id_item}, ${estaDisponivel ? 0 : 1})">
                            ${estaDisponivel ? 'Marcar Esgotado' : 'Marcar Disponível'}
                        </button>
                        <button type="button" class="btn-card-admin btn-card-excluir" onclick="window.confirmarExclusaoPublic(${item.id_item}, '${item.nome.replace(/'/g, "\\'")}')">
                            Excluir
                        </button>
                    </div>
                `
                    : "";

                return `
                    <div class="produto-card ${estaDisponivel ? '' : 'esgotado'}" id="card-item-${item.id_item}">
                        <div class="produto-imagem-box">
                            ${imagemHtml}
                            ${badgeDestaqueHtml}
                            ${badgeStatusHtml}
                        </div>
                        <div class="produto-info">
                            <span class="produto-categoria-tag">${item.categoria}</span>
                            <h3 class="produto-nome">${item.nome}</h3>
                            <p class="produto-descricao">${item.descricao || "Sem descrição disponível."}</p>
                            <div class="produto-rodape">
                                <div class="produto-preco">
                                    <span class="produto-preco-prefixo">R$</span>${precoFormatado}
                                </div>
                                <a href="https://wa.me/5515996257683?text=${encodeURIComponent('Olá! Gostaria de pedir no Coffee Bravo: ' + item.nome)}" target="_blank" class="btn-pedir-whats" title="Pedir no WhatsApp">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <span>Pedir</span>
                                </a>
                            </div>
                        </div>
                        ${adminAcoesHtml}
                    </div>
                `;
            })
            .join("");
    }

    // Configura os ouvintes de busca e modais
    function configurarEventos() {
        const inputBusca = document.getElementById("campoBuscaCardapio");
        if (inputBusca) {
            inputBusca.addEventListener("input", function (e) {
                termoBusca = e.target.value;
                renderizarProdutos();
            });
        }

        // Categoria nova no modal
        const selCat = document.getElementById("modalCampoCategoria");
        const boxNova = document.getElementById("modalBoxNovaCategoria");
        if (selCat && boxNova) {
            selCat.addEventListener("change", function () {
                if (this.value === "__nova__") {
                    boxNova.style.display = "block";
                    const inputNova = document.getElementById("modalCampoNovaCategoria");
                    if (inputNova) inputNova.focus();
                } else {
                    boxNova.style.display = "none";
                }
            });
        }

        // Formulário de Criar/Editar
        const form = document.getElementById("formCardapioPublic");
        if (form) {
            form.addEventListener("submit", processarSalvarItem);
        }
    }

    // ============================================================
    // AÇÕES DO ADMIN (CRUD)
    // ============================================================

    window.abrirModalPublicNovo = function () {
        const modal = document.getElementById("modalPublicItem");
        const form = document.getElementById("formCardapioPublic");
        if (!modal || !form) return;

        form.reset();
        document.getElementById("modalTituloPublic").textContent = "Adicionar Produto ao Cardápio";
        document.getElementById("modalItemId").value = "";
        document.getElementById("modalCampoDisponivel").checked = true;
        document.getElementById("modalCampoDestaque").checked = false;
        document.getElementById("modalBoxNovaCategoria").style.display = "none";

        modal.style.display = "flex";
    };

    window.abrirModalPublicEditar = function (id) {
        const item = todosItens.find((i) => i.id_item === id);
        if (!item) return;

        const modal = document.getElementById("modalPublicItem");
        const form = document.getElementById("formCardapioPublic");
        if (!modal || !form) return;

        form.reset();
        document.getElementById("modalTituloPublic").textContent = "Editar Produto: " + item.nome;
        document.getElementById("modalItemId").value = item.id_item;
        document.getElementById("modalCampoNome").value = item.nome;
        document.getElementById("modalCampoPreco").value = Number(item.preco).toFixed(2);
        document.getElementById("modalCampoDescricao").value = item.descricao || "";
        document.getElementById("modalCampoUrl").value = item.imagem_url || "";
        document.getElementById("modalCampoDisponivel").checked = Boolean(item.disponivel);
        document.getElementById("modalCampoDestaque").checked = Boolean(item.destaque);

        const selCat = document.getElementById("modalCampoCategoria");
        let encontrou = false;
        for (let i = 0; i < selCat.options.length; i++) {
            if (selCat.options[i].value === item.categoria) {
                selCat.selectedIndex = i;
                encontrou = true;
                break;
            }
        }
        if (!encontrou) {
            selCat.value = "__nova__";
            document.getElementById("modalBoxNovaCategoria").style.display = "block";
            document.getElementById("modalCampoNovaCategoria").value = item.categoria;
        } else {
            document.getElementById("modalBoxNovaCategoria").style.display = "none";
        }

        modal.style.display = "flex";
    };

    window.fecharModalPublicItem = function () {
        const modal = document.getElementById("modalPublicItem");
        if (modal) modal.style.display = "none";
    };

    async function processarSalvarItem(e) {
        e.preventDefault();
        const btn = document.getElementById("btnModalSalvar");
        const id = document.getElementById("modalItemId").value;
        const isEdicao = Boolean(id);

        btn.disabled = true;
        btn.textContent = isEdicao ? "Atualizando..." : "Salvando...";

        const formData = new FormData(this);

        // Se categoria for nova, ajustar
        const catSelect = document.getElementById("modalCampoCategoria").value;
        if (catSelect === "__nova__") {
            const catNova = document.getElementById("modalCampoNovaCategoria").value.trim();
            formData.set("categoria", catNova || "Cafés");
        }

        const token = usuarioLogado?.token || localStorage.getItem("authToken");

        try {
            const url = isEdicao ? `${API_BASE}/api/cardapio/${id}` : `${API_BASE}/api/cardapio`;
            const metodo = isEdicao ? "PUT" : "POST";

            const resp = await fetch(url, {
                method: metodo,
                headers: token ? { Authorization: "Bearer " + token } : {},
                body: formData,
            });

            const dados = await resp.json();

            if (dados.sucesso) {
                alert("✓ " + (dados.mensagem || "Operação realizada com sucesso!"));
                fecharModalPublicItem();
                await carregarCardapio();
            } else {
                alert("Erro: " + (dados.mensagem || "Não foi possível salvar o item."));
            }
        } catch (erro) {
            console.error("Erro ao salvar produto:", erro);
            alert("Erro de conexão ao salvar o produto.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Salvar Produto";
        }
    }

    window.alternarStatusPublic = async function (id, novoStatus) {
        const token = usuarioLogado?.token || localStorage.getItem("authToken");
        try {
            const resp = await fetch(`${API_BASE}/api/cardapio/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: "Bearer " + token } : {}),
                },
                body: JSON.stringify({ disponivel: novoStatus }),
            });

            const dados = await resp.json();
            if (dados.sucesso) {
                const item = todosItens.find((i) => i.id_item === id);
                if (item) {
                    item.disponivel = dados.disponivel;
                    renderizarProdutos();
                }
            } else {
                alert("Erro ao alterar disponibilidade: " + (dados.mensagem || ""));
            }
        } catch (e) {
            alert("Erro de comunicação com o servidor.");
        }
    };

    window.confirmarExclusaoPublic = function (id, nome) {
        const modal = document.getElementById("modalPublicExclusao");
        if (!modal) return;
        document.getElementById("textoPublicExclusao").innerHTML = `Deseja remover <strong>"${nome}"</strong> do cardápio?`;
        document.getElementById("btnConfirmarExclusaoPublic").onclick = () => executarExclusaoPublic(id);
        modal.style.display = "flex";
    };

    window.fecharModalPublicExclusao = function () {
        const modal = document.getElementById("modalPublicExclusao");
        if (modal) modal.style.display = "none";
    };

    async function executarExclusaoPublic(id) {
        const token = usuarioLogado?.token || localStorage.getItem("authToken");
        const btn = document.getElementById("btnConfirmarExclusaoPublic");
        btn.disabled = true;
        btn.textContent = "Excluindo...";

        try {
            const resp = await fetch(`${API_BASE}/api/cardapio/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: "Bearer " + token } : {},
            });
            const dados = await resp.json();

            if (dados.sucesso) {
                fecharModalPublicExclusao();
                todosItens = todosItens.filter((i) => i.id_item !== id);
                renderizarProdutos();
            } else {
                alert("Erro ao excluir: " + (dados.mensagem || ""));
            }
        } catch (e) {
            alert("Erro de comunicação ao excluir item.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Sim, Excluir";
        }
    }

    // Inicialização da página
    function iniciar() {
        checarPermissoesAdmin();
        configurarEventos();
        carregarCardapio();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
