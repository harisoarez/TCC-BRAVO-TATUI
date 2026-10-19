// Cardápio - Coffee Bravo

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";
    const STORAGE_CARRINHO_KEY = "coffee_bravo_carrinho_v1";
    const STORAGE_CLIENTE_KEY = "coffee_bravo_cliente_v1";

    let todosItens = [];
    let carrinho = [];
    let categoriaAtiva = "Todos";
    let termoBusca = "";
    let usuarioLogado = null;
    let isAdmin = false;
    let toastTimer = null;

    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

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
                <h3>Carregando delícias do Coffee Bravo...</h3>
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
            console.error("Erro ao carregar cardápio:", erro);
            grid.innerHTML = `
                <div class="estado-vazio">
                    <h3>Não foi possível carregar o cardápio.</h3>
                    <p>Verifique sua conexão ou recarregue a página.</p>
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

                const idSanitizado = Number(item.id_item) || 0;
                const nomeEscapado = escapeHtml(item.nome);
                const categoriaEscapada = escapeHtml(item.categoria);
                const descricaoEscapada = escapeHtml(item.descricao || "Sem descrição disponível.");

                const imagemHtml = item.imagem_url
                    ? `<img src="${encodeURI(item.imagem_url)}" alt="${nomeEscapado}" loading="lazy">`
                    : `<div class="produto-imagem-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg></div>`;

                const badgeDestaqueHtml = (estaDestaque && estaDisponivel)
                    ? `<span class="badge-destaque">Destaque</span>`
                    : "";

                const badgeStatusHtml = !estaDisponivel
                    ? `<span class="badge-status esgotado">Esgotado</span>`
                    : "";

                const qtdNoCarrinho = obterQtdNoCarrinho(idSanitizado);

                const botaoAcaoHtml = estaDisponivel
                    ? (qtdNoCarrinho > 0
                        ? `<div class="card-qtd-controle" id="card-qtd-${idSanitizado}">
                            <button type="button" class="btn-card-qtd-step" onclick="window.alterarQtdCarrinho(${idSanitizado}, -1)" title="Diminuir quantidade" aria-label="Diminuir">−</button>
                            <span class="card-qtd-num">${qtdNoCarrinho}</span>
                            <button type="button" class="btn-card-qtd-step" onclick="window.alterarQtdCarrinho(${idSanitizado}, 1)" title="Aumentar quantidade" aria-label="Aumentar">+</button>
                           </div>`
                        : `<button type="button" class="btn-adicionar-carrinho" onclick="window.adicionarAoCarrinho(${idSanitizado})" title="Adicionar ao carrinho">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Adicionar</span>
                           </button>`
                      )
                    : `<button type="button" class="btn-pedir-whats btn-esgotado" disabled title="Este produto está esgotado no momento e não pode ser adicionado ao carrinho">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                        <span>Esgotado</span>
                       </button>`;

                // Botões de administração exibidos se o usuário for Admin ou Owner
                const adminAcoesHtml = isAdmin
                    ? `
                    <div class="admin-card-acoes">
                        <button type="button" class="btn-card-admin btn-card-editar" onclick="window.abrirModalPublicEditar(${idSanitizado})">
                            Editar
                        </button>
                        <button type="button" class="btn-card-admin btn-card-status ${estaDisponivel ? '' : 'esgot'}" onclick="window.alternarStatusPublic(${idSanitizado}, ${estaDisponivel ? 0 : 1})">
                            ${estaDisponivel ? 'Marcar Esgotado' : 'Marcar Disponível'}
                        </button>
                        <button type="button" class="btn-card-admin btn-card-excluir" onclick="window.confirmarExclusaoPublic(${idSanitizado}, '${nomeEscapado.replace(/'/g, "\\'")}')">
                            Excluir
                        </button>
                    </div>
                `
                    : "";

                return `
                    <div class="produto-card ${estaDisponivel ? '' : 'esgotado'}" id="card-item-${idSanitizado}">
                        <div class="produto-imagem-box">
                            ${imagemHtml}
                            ${badgeDestaqueHtml}
                            ${badgeStatusHtml}
                        </div>
                        <div class="produto-info">
                            <span class="produto-categoria-tag">${categoriaEscapada}</span>
                            <h3 class="produto-nome">${nomeEscapado}</h3>
                            <p class="produto-descricao">${descricaoEscapada}</p>
                            <div class="produto-rodape">
                                <div class="produto-preco">
                                    <span class="produto-preco-prefixo">R$</span>${precoFormatado}
                                </div>
                                ${botaoAcaoHtml}
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

        // Salvar preferências do cliente no carrinho
        const campoNome = document.getElementById("carrinhoNomeCliente");
        const campoObs = document.getElementById("carrinhoObservacoes");
        if (campoNome) {
            campoNome.addEventListener("input", salvarPreferenciasCliente);
        }
        if (campoObs) {
            campoObs.addEventListener("input", salvarPreferenciasCliente);
        }
        document.querySelectorAll('input[name="tipoConsumo"]').forEach((r) => {
            r.addEventListener("change", salvarPreferenciasCliente);
        });

        // Fechar gaveta do carrinho ou modais com tecla ESC
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                window.fecharCarrinho();
                window.fecharModalPublicItem();
                window.fecharModalPublicExclusao();
            }
        });
    }

    // Funções de administração
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
        document.getElementById("textoPublicExclusao").innerHTML = `Deseja remover <strong>"${escapeHtml(nome)}"</strong> do cardápio?`;
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

    // =========================================================================
    // SISTEMA DE CARRINHO — COFFEE BRAVO
    // =========================================================================

    function carregarCarrinhoStorage() {
        try {
            const salvo = localStorage.getItem(STORAGE_CARRINHO_KEY);
            if (salvo) {
                const parsed = JSON.parse(salvo);
                if (Array.isArray(parsed)) {
                    carrinho = parsed;
                }
            }
        } catch (e) {
            carrinho = [];
        }
    }

    function salvarCarrinhoStorage() {
        try {
            localStorage.setItem(STORAGE_CARRINHO_KEY, JSON.stringify(carrinho));
        } catch (e) {}
    }

    function salvarPreferenciasCliente() {
        try {
            const campoNome = document.getElementById("carrinhoNomeCliente");
            const campoObs = document.getElementById("carrinhoObservacoes");
            const radioConsumo = document.querySelector('input[name="tipoConsumo"]:checked');
            localStorage.setItem(
                STORAGE_CLIENTE_KEY,
                JSON.stringify({
                    nome: (campoNome?.value || "").trim(),
                    tipoConsumo: radioConsumo?.value || "No Local",
                    observacoes: (campoObs?.value || "").trim(),
                })
            );
        } catch (e) {}
    }

    function carregarPreferenciasCliente() {
        try {
            const dados = localStorage.getItem(STORAGE_CLIENTE_KEY);
            if (dados) {
                const parsed = JSON.parse(dados);
                const campoNome = document.getElementById("carrinhoNomeCliente");
                if (campoNome && parsed.nome) campoNome.value = parsed.nome;

                const campoObs = document.getElementById("carrinhoObservacoes");
                if (campoObs && parsed.observacoes) campoObs.value = parsed.observacoes;

                if (parsed.tipoConsumo) {
                    const radio = document.querySelector(`input[name="tipoConsumo"][value="${parsed.tipoConsumo}"]`);
                    if (radio) radio.checked = true;
                }
            }
        } catch (e) {}
    }

    function obterQtdNoCarrinho(id) {
        const item = carrinho.find((i) => Number(i.id_item) === Number(id));
        return item ? item.quantidade : 0;
    }

    function calcularTotaisCarrinho() {
        let totalItens = 0;
        let totalPreco = 0;
        carrinho.forEach((item) => {
            totalItens += item.quantidade;
            totalPreco += item.quantidade * Number(item.preco);
        });
        return { totalItens, totalPreco };
    }

    function atualizarUiCarrinho(animarBump = false) {
        const { totalItens, totalPreco } = calcularTotaisCarrinho();
        const totalFormatado = "R$ " + totalPreco.toFixed(2).replace(".", ",");

        // Atualiza botão flutuante no canto inferior
        const badge = document.getElementById("carrinhoBadgeContador");
        const totalPreview = document.getElementById("carrinhoTotalPreco");
        const btnFlutuante = document.getElementById("btnAbrirCarrinho");

        if (badge) {
            badge.textContent = totalItens;
            if (totalItens > 0) {
                badge.classList.add("tem-itens");
            } else {
                badge.classList.remove("tem-itens");
            }
        }

        if (totalPreview) {
            totalPreview.textContent = totalFormatado;
        }

        if (btnFlutuante && animarBump) {
            btnFlutuante.classList.remove("animar-bump");
            void btnFlutuante.offsetWidth;
            btnFlutuante.classList.add("animar-bump");
        }

        // Atualiza cabeçalho e rodapé do drawer/painel
        const subtitulo = document.getElementById("carrinhoQtdSubtitulo");
        if (subtitulo) {
            subtitulo.textContent = `${totalItens} ${totalItens === 1 ? "item selecionado" : "itens selecionados"}`;
        }

        const valorFinal = document.getElementById("carrinhoValorFinal");
        if (valorFinal) {
            valorFinal.textContent = totalFormatado;
        }

        const btnFinalizar = document.getElementById("btnFinalizarPedidoWhats");
        if (btnFinalizar) {
            btnFinalizar.disabled = totalItens === 0;
        }

        renderizarItensPainelCarrinho();
    }

    function atualizarBotaoCard(id) {
        const card = document.getElementById(`card-item-${id}`);
        if (!card) return;
        const rodape = card.querySelector(".produto-rodape");
        if (!rodape) return;

        const item = todosItens.find((i) => Number(i.id_item) === Number(id));
        if (!item) return;

        const estaDisponivel = item.disponivel === 1 || item.disponivel === true;
        const qtd = obterQtdNoCarrinho(id);

        const elementoAntigo = rodape.querySelector(".btn-adicionar-carrinho, .card-qtd-controle, .btn-pedir-whats");
        if (!elementoAntigo) return;

        let novoHtml = "";
        if (!estaDisponivel) {
            novoHtml = `<button type="button" class="btn-pedir-whats btn-esgotado" disabled title="Este produto está esgotado no momento e não pode ser adicionado ao carrinho">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <span>Esgotado</span>
            </button>`;
        } else if (qtd > 0) {
            novoHtml = `<div class="card-qtd-controle" id="card-qtd-${id}">
                <button type="button" class="btn-card-qtd-step" onclick="window.alterarQtdCarrinho(${id}, -1)" title="Diminuir quantidade" aria-label="Diminuir">−</button>
                <span class="card-qtd-num">${qtd}</span>
                <button type="button" class="btn-card-qtd-step" onclick="window.alterarQtdCarrinho(${id}, 1)" title="Aumentar quantidade" aria-label="Aumentar">+</button>
            </div>`;
        } else {
            novoHtml = `<button type="button" class="btn-adicionar-carrinho" onclick="window.adicionarAoCarrinho(${id})" title="Adicionar ao carrinho">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Adicionar</span>
            </button>`;
        }

        const temp = document.createElement("div");
        temp.innerHTML = novoHtml;
        elementoAntigo.replaceWith(temp.firstElementChild);
    }

    function renderizarItensPainelCarrinho() {
        const lista = document.getElementById("carrinhoListaItens");
        if (!lista) return;

        if (carrinho.length === 0) {
            lista.innerHTML = `
                <div class="carrinho-vazio">
                    <div class="carrinho-vazio-icone">☕</div>
                    <h4>Seu carrinho está vazio</h4>
                    <p>Adicione cafés, lanches ou sobremesas do cardápio para pedir tudo junto de uma só vez pelo WhatsApp!</p>
                </div>
            `;
            return;
        }

        lista.innerHTML = carrinho
            .map((item) => {
                const idSanitizado = Number(item.id_item) || 0;
                const precoUnFormatado = Number(item.preco).toFixed(2).replace(".", ",");
                const subtotalFormatado = (Number(item.preco) * item.quantidade).toFixed(2).replace(".", ",");
                const nomeEscapado = escapeHtml(item.nome);

                const fotoHtml = item.imagem_url
                    ? `<img src="${encodeURI(item.imagem_url)}" alt="${nomeEscapado}" loading="lazy">`
                    : `<span class="carrinho-item-sem-foto">☕</span>`;

                return `
                    <div class="carrinho-item-linha" data-id="${idSanitizado}">
                        <div class="carrinho-item-foto">
                            ${fotoHtml}
                        </div>
                        <div class="carrinho-item-info">
                            <h4 class="carrinho-item-nome" title="${nomeEscapado}">${nomeEscapado}</h4>
                            <div class="carrinho-item-preco-un">R$ ${precoUnFormatado} un.</div>
                            <div class="carrinho-item-subtotal">Subtotal: R$ ${subtotalFormatado}</div>
                        </div>
                        <div class="carrinho-item-controles">
                            <div class="carrinho-qtd-stepper">
                                <button type="button" class="btn-carrinho-step" onclick="window.alterarQtdCarrinho(${idSanitizado}, -1)" title="Diminuir quantidade" aria-label="Diminuir">−</button>
                                <span class="carrinho-qtd-display">${item.quantidade}</span>
                                <button type="button" class="btn-carrinho-step" onclick="window.alterarQtdCarrinho(${idSanitizado}, 1)" title="Aumentar quantidade" aria-label="Aumentar">+</button>
                            </div>
                            <button type="button" class="btn-carrinho-remover" onclick="window.removerItemCarrinho(${idSanitizado})" title="Remover item do carrinho" aria-label="Remover">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    function mostrarToastCarrinho(mensagem) {
        const toast = document.getElementById("carrinhoToast");
        if (!toast) return;

        toast.textContent = mensagem;
        toast.classList.add("mostrar");

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("mostrar");
        }, 3200);
    }

    // Ações globais do Carrinho
    window.adicionarAoCarrinho = function (id) {
        const item = todosItens.find((i) => Number(i.id_item) === Number(id));
        if (!item) return;

        if (!(item.disponivel === 1 || item.disponivel === true)) {
            mostrarToastCarrinho("Este produto está esgotado no momento.");
            return;
        }

        const existente = carrinho.find((i) => Number(i.id_item) === Number(id));
        if (existente) {
            existente.quantidade += 1;
        } else {
            carrinho.push({
                id_item: item.id_item,
                nome: item.nome,
                preco: Number(item.preco),
                imagem_url: item.imagem_url || "",
                categoria: item.categoria || "",
                quantidade: 1,
            });
        }

        salvarCarrinhoStorage();
        atualizarUiCarrinho(true);
        atualizarBotaoCard(id);
        mostrarToastCarrinho(`✓ "${item.nome}" adicionado ao pedido!`);
    };

    window.alterarQtdCarrinho = function (id, delta) {
        const index = carrinho.findIndex((i) => Number(i.id_item) === Number(id));
        if (index === -1) {
            if (delta > 0) window.adicionarAoCarrinho(id);
            return;
        }

        const novaQtd = carrinho[index].quantidade + delta;
        const nomeItem = carrinho[index].nome;

        if (novaQtd <= 0) {
            carrinho.splice(index, 1);
            mostrarToastCarrinho(`"${nomeItem}" removido do pedido.`);
        } else {
            carrinho[index].quantidade = novaQtd;
        }

        salvarCarrinhoStorage();
        atualizarUiCarrinho(true);
        atualizarBotaoCard(id);
    };

    window.removerItemCarrinho = function (id) {
        const index = carrinho.findIndex((i) => Number(i.id_item) === Number(id));
        if (index !== -1) {
            const nome = carrinho[index].nome;
            carrinho.splice(index, 1);
            salvarCarrinhoStorage();
            atualizarUiCarrinho(false);
            atualizarBotaoCard(id);
            mostrarToastCarrinho(`"${nome}" removido do pedido.`);
        }
    };

    window.limparCarrinho = function () {
        if (carrinho.length === 0) return;
        const idsAnteriores = carrinho.map((i) => i.id_item);
        carrinho = [];
        salvarCarrinhoStorage();
        atualizarUiCarrinho(false);
        idsAnteriores.forEach((id) => atualizarBotaoCard(id));
        mostrarToastCarrinho("Carrinho esvaziado.");
    };

    window.alternarCarrinho = function () {
        const painel = document.getElementById("painelCarrinho");
        if (!painel) return;
        if (painel.classList.contains("aberto")) {
            window.fecharCarrinho();
        } else {
            window.abrirCarrinho();
        }
    };

    window.abrirCarrinho = function () {
        const painel = document.getElementById("painelCarrinho");
        if (!painel) return;
        painel.classList.add("aberto");
        painel.setAttribute("aria-hidden", "false");
        renderizarItensPainelCarrinho();
    };

    window.fecharCarrinho = function () {
        const painel = document.getElementById("painelCarrinho");
        if (!painel) return;
        painel.classList.remove("aberto");
        painel.setAttribute("aria-hidden", "true");
    };

    window.enviarPedidoWhatsapp = function () {
        if (carrinho.length === 0) {
            mostrarToastCarrinho("Seu carrinho está vazio! Adicione itens antes de pedir.");
            return;
        }

        salvarPreferenciasCliente();

        const campoNome = document.getElementById("carrinhoNomeCliente");
        const campoObs = document.getElementById("carrinhoObservacoes");
        const radioConsumo = document.querySelector('input[name="tipoConsumo"]:checked');

        const nomeCliente = (campoNome?.value || "").trim();
        const tipoConsumo = radioConsumo?.value || "No Local";
        const observacoes = (campoObs?.value || "").trim();

        const { totalItens, totalPreco } = calcularTotaisCarrinho();
        const valorFormatado = "R$ " + totalPreco.toFixed(2).replace(".", ",");

        // Monta a mensagem completa formatada para o WhatsApp do Coffee Bravo
        let msg = `☕ *PEDIDO — COFFEE BRAVO*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        if (nomeCliente) {
            msg += `👤 *Cliente:* ${nomeCliente}\n`;
        }
        msg += `🍽️ *Consumo:* ${tipoConsumo}\n`;
        msg += `📅 *Horário:* ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        msg += `📋 *ITENS DO PEDIDO:*\n`;

        carrinho.forEach((item) => {
            const subtotal = (Number(item.preco) * item.quantidade).toFixed(2).replace(".", ",");
            const unFormatado = Number(item.preco).toFixed(2).replace(".", ",");
            msg += `• ${item.quantidade}x ${item.nome} (R$ ${unFormatado} un.) = R$ ${subtotal}\n`;
        });

        msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📦 *Total de itens:* ${totalItens}\n`;
        msg += `💰 *VALOR TOTAL: ${valorFormatado}*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

        if (observacoes) {
            msg += `📝 *Observações:*\n${observacoes}\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        }

        msg += `\nOlá! Gostaria de confirmar meu pedido acima com a equipe do Coffee Bravo.`;

        const numeroWhatsapp = "5515996257683";
        const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(msg)}`;

        window.open(url, "_blank");
    };

    // Inicialização da página
    function iniciar() {
        carregarCarrinhoStorage();
        checarPermissoesAdmin();
        configurarEventos();
        carregarPreferenciasCliente();
        atualizarUiCarrinho(false);
        carregarCardapio();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
