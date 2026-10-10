// Controle da Barra de Navegação e Usuário

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

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

    function obterUsuarioLogado() {
        const token = localStorage.getItem("authToken");
        if (!token) return null;

        const payload = decodificarToken(token);
        let u = {};
        try {
            const usuarioJson = localStorage.getItem("usuario");
            if (usuarioJson) u = JSON.parse(usuarioJson);
        } catch (e) {}

        const tipoFinal = (payload?.tipo_usuario || u.tipo_usuario || u.tipo || "normal").toLowerCase();
        const nomeFinal = payload?.nome || u.nome || "Usuário";
        const emailFinal = payload?.email || u.email || "";
        const idFinal = payload?.id_usuario || u.id_usuario || u.id;

        return {
            id: idFinal,
            id_usuario: idFinal,
            nome: nomeFinal,
            email: emailFinal,
            tipo: tipoFinal,
            tipo_usuario: tipoFinal,
            foto_url: u.foto_url || "",
            descricao: u.descricao || "",
            telefone: u.telefone || "",
            token: token,
        };
    }

    function inicializarNavbar() {
        const nav = document.getElementById("nav-bar");
        if (!nav) return;

        const usuario = obterUsuarioLogado();
        const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

        const isIndex = paginaAtual === "index.html" || paginaAtual === "";
        const isFormacoes = paginaAtual.includes("formacao");
        const isInstrumentos = paginaAtual.includes("inst");
        const isCardapio = paginaAtual.includes("cardapio");
        const isCalendario = paginaAtual.includes("calendario");
        const isLogin = paginaAtual.includes("login");

        // Logo
        const logoHtml = `
            <div class="logo-container">
                <a href="./index.html" class="logo-link" title="Instituto Musical Bravo Tatuí">
                    <img src="https://friocenterpescados.com.br/uploads/tilapia-inteira-eviscerada_1.jpg" alt="Logo Bravo" class="logo-tilapia">
                    <span class="logo-text">BRAVO TATUÍ</span>
                </a>
            </div>
        `;

        // Links de navegação
        const linkCalendarioHtml = usuario ? `
            <a href="./calendario.html" class="nav-link-calendario ${isCalendario ? 'link-ativo' : ''}">
                Calendário
            </a>
        ` : "";

        const linkPainelAdminHtml = (usuario && (usuario.tipo === "admin" || usuario.tipo === "owner")) ? `
            <a href="${API_BASE || 'http://localhost:3000'}/paginas/dashboard?token=${encodeURIComponent(usuario.token)}" style="color: #F5D696; font-weight:600;">
                Painel
            </a>
        ` : "";

        const linkMatriculaHtml = (usuario && (usuario.tipo === "aluno" || usuario.tipo === "normal")) ? `
            <a href="${API_BASE || 'http://localhost:3000'}/paginas/matricula?token=${encodeURIComponent(usuario.token)}" style="color: #38bdf8; font-weight:600;">
                Matrícula
            </a>
        ` : "";

        const linksCentraisHtml = `
            <div class="nav-links-center">
                <a href="./index.html" class="${isIndex ? 'link-ativo' : ''}">Início</a>
                <a href="./formacoes.html" class="${isFormacoes ? 'link-ativo' : ''}">Bravo Tatuí</a>
                <a href="./instrumentos.html" class="${isInstrumentos ? 'link-ativo' : ''}">Aulas no IMBT</a>
                <a href="./cardapio.html" class="${isCardapio ? 'link-ativo' : ''}">Coffee Bravo</a>
                ${linkCalendarioHtml}
                ${linkPainelAdminHtml}
                ${linkMatriculaHtml}
            </div>
        `;

        // 3. Canto Superior Direito (Área de Usuário)
        let areaUsuarioHtml = "";

        if (!usuario) {
            // DESLOGADO: Ícone de pessoa cinza e botão de entrar
            areaUsuarioHtml = `
                <div class="nav-user-area">
                    <div class="user-guest-box">
                        <div class="avatar-guest" title="Não conectado">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <a href="./login.html" class="btn-entrar-nav">Entrar</a>
                    </div>
                </div>
            `;
        } else {
            // LOGADO: Borda colorida por tipo de usuário (Sem Emojis nos Badges):
            // Owner = Borda Preta
            // Admin = Borda Amarela
            // Professor = Borda Amarela
            // Normal / Aluno = Borda Azul Claro
            let classeBorda = "borda-normal";
            let rotuloCargo = "Aluno";
            let badgeClass = "normal";

            if (usuario.tipo === "owner") {
                classeBorda = "borda-owner";
                rotuloCargo = "Owner";
                badgeClass = "owner";
            } else if (usuario.tipo === "admin") {
                classeBorda = "borda-admin";
                rotuloCargo = "Admin";
                badgeClass = "admin";
            } else if (usuario.tipo === "professor") {
                classeBorda = "borda-admin";
                rotuloCargo = "Professor";
                badgeClass = "admin";
            }

            const primeiroNome = usuario.nome.split(" ")[0];

            // Botão Adicionar Conta (para Owner ou Admin)
            const botaoAdicionarConta = (usuario.tipo === "owner" || usuario.tipo === "admin") ? `
                <button type="button" class="btn-nav-adicionar-conta" onclick="window.abrirModalCriarConta()">
                    + Adicionar Conta
                </button>
            ` : "";

            const avatarConteudo = usuario.foto_url ? `
                <img src="${usuario.foto_url}" alt="${usuario.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            ` : `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            `;

            areaUsuarioHtml = `
                <div class="nav-user-area">
                    <div class="user-logged-box">
                        ${botaoAdicionarConta}
                        <div class="avatar-perfil ${classeBorda}" onclick="window.abrirModalPerfilGlobal()" title="${usuario.nome} (${rotuloCargo}) - Clique para ver ou editar seu perfil" style="cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            ${avatarConteudo}
                        </div>
                        <div class="user-info-col" onclick="window.abrirModalPerfilGlobal()" title="Clique para ver ou editar seu perfil" style="cursor: pointer;">
                            <span class="user-nome-texto">${primeiroNome}</span>
                            <span class="user-badge-cargo ${badgeClass}">${rotuloCargo}</span>
                        </div>
                        <button type="button" class="btn-nav-sair-logout" onclick="window.fazerLogoutNav()" title="Encerrar sessão">
                            Sair
                        </button>
                    </div>
                </div>
            `;
        }

        // Injeta o HTML estruturado dentro do #nav-bar
        nav.innerHTML = `
            ${logoHtml}
            ${linksCentraisHtml}
            <div class="nav-right-cluster">
                ${areaUsuarioHtml}
                <button type="button" class="btn-hamburger-nav" id="btnHamburgerNav" aria-label="Abrir menu de navegação" title="Abrir menu">
                    <span class="hamburger-bar"></span>
                    <span class="hamburger-bar"></span>
                    <span class="hamburger-bar"></span>
                </button>
            </div>
        `;

        // Injeta o Drawer do Menu Hamburguer para Mobile e Tablet
        injetarMenuMobileDrawer(usuario, {
            isIndex,
            isFormacoes,
            isInstrumentos,
            isCardapio,
            isCalendario,
            isLogin
        });

        // Se estiver logado, injeta o modal de perfil em todas as páginas do site
        if (usuario) {
            injetarModalPerfilGlobal(usuario);
        }

        // Se for Admin ou Owner, injeta o modal de criação de conta no documento
        if (usuario && (usuario.tipo === "owner" || usuario.tipo === "admin")) {
            injetarModalCriarConta(usuario);
        }
    }

    // Menu mobile
    window.abrirMenuMobile = function () {
        const drawer = document.getElementById("menuMobileDrawer");
        if (drawer) {
            drawer.classList.add("aberto");
            document.body.style.overflow = "hidden";
        }
    };

    window.fecharMenuMobile = function () {
        const drawer = document.getElementById("menuMobileDrawer");
        if (drawer) {
            drawer.classList.remove("aberto");
            document.body.style.overflow = "";
        }
    };

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            window.fecharMenuMobile();
        }
    });

    function injetarMenuMobileDrawer(usuario, paginas) {
        let drawerExistente = document.getElementById("menuMobileDrawer");
        if (drawerExistente) {
            drawerExistente.remove();
        }

        const linkCalendarioDrawer = usuario ? `
            <a href="./calendario.html" class="menu-mobile-link ${paginas.isCalendario ? 'link-ativo-mobile' : ''}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Calendário</span>
            </a>
        ` : "";

        const linkPainelDrawer = (usuario && (usuario.tipo === "admin" || usuario.tipo === "owner")) ? `
            <a href="${API_BASE || 'http://localhost:3000'}/paginas/dashboard?token=${encodeURIComponent(usuario.token)}" class="menu-mobile-link link-destaque-gold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Painel Administrativo</span>
            </a>
        ` : "";

        const linkMatriculaDrawer = (usuario && (usuario.tipo === "aluno" || usuario.tipo === "normal")) ? `
            <a href="${API_BASE || 'http://localhost:3000'}/paginas/matricula?token=${encodeURIComponent(usuario.token)}" class="menu-mobile-link link-destaque-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Matrícula do Aluno</span>
            </a>
        ` : "";

        const linkAddContaDrawer = (usuario && (usuario.tipo === "admin" || usuario.tipo === "owner")) ? `
            <button type="button" class="menu-mobile-btn-addconta" onclick="window.fecharMenuMobile(); window.abrirModalCriarConta();">
                + Adicionar Conta de Usuário
            </button>
        ` : "";

        let userAreaDrawerHtml = "";
        if (!usuario) {
            userAreaDrawerHtml = `
                <div class="menu-mobile-user-card guest">
                    <div class="avatar-guest-mobile">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div class="guest-info-mobile">
                        <span>Olá, Visitante</span>
                        <a href="./login.html" class="btn-entrar-drawer">Fazer Login</a>
                    </div>
                </div>
            `;
        } else {
            let rotuloCargo = "Aluno";
            let badgeClass = "normal";
            if (usuario.tipo === "owner") { rotuloCargo = "Owner"; badgeClass = "owner"; }
            else if (usuario.tipo === "admin") { rotuloCargo = "Admin"; badgeClass = "admin"; }
            else if (usuario.tipo === "professor") { rotuloCargo = "Professor"; badgeClass = "admin"; }

            const avatarMobile = usuario.foto_url ? `
                <img src="${usuario.foto_url}" alt="${usuario.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            ` : `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            `;

            userAreaDrawerHtml = `
                <div class="menu-mobile-user-card logged">
                    <div class="user-card-main-mobile" onclick="window.fecharMenuMobile(); window.abrirModalPerfilGlobal();" style="cursor: pointer;">
                        <div class="avatar-perfil-mobile">
                            ${avatarMobile}
                        </div>
                        <div class="user-dados-mobile">
                            <span class="user-nome-mobile">${usuario.nome}</span>
                            <span class="user-badge-cargo ${badgeClass}">${rotuloCargo}</span>
                        </div>
                    </div>
                    <div class="user-card-botoes-mobile">
                        <button type="button" class="btn-drawer-perfil" onclick="window.fecharMenuMobile(); window.abrirModalPerfilGlobal();">Editar Perfil</button>
                        <button type="button" class="btn-drawer-sair" onclick="window.fazerLogoutNav();">Sair</button>
                    </div>
                </div>
            `;
        }

        const drawerHtml = `
            <div id="menuMobileDrawer" class="menu-mobile-drawer-overlay" role="dialog" aria-modal="true" aria-label="Menu de Navegação">
                <div class="menu-mobile-drawer">
                    <div class="menu-mobile-header">
                        <a href="./index.html" class="menu-mobile-logo-link" onclick="window.fecharMenuMobile();">
                            <img src="https://friocenterpescados.com.br/uploads/tilapia-inteira-eviscerada_1.jpg" alt="Logo" class="menu-logo-img">
                            <span class="menu-logo-text">BRAVO TATUÍ</span>
                        </a>
                        <button type="button" class="btn-fechar-menu-mobile" id="btnFecharMenuMobile" aria-label="Fechar menu">&times;</button>
                    </div>

                    <div class="menu-mobile-scrollable">
                        ${userAreaDrawerHtml}

                        <nav class="menu-mobile-nav">
                            <a href="./index.html" class="menu-mobile-link ${paginas.isIndex ? 'link-ativo-mobile' : ''}" onclick="window.fecharMenuMobile();">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                <span>Início</span>
                            </a>
                            <a href="./formacoes.html" class="menu-mobile-link ${paginas.isFormacoes ? 'link-ativo-mobile' : ''}" onclick="window.fecharMenuMobile();">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                                <span>Bravo Tatuí (Eventos)</span>
                            </a>
                            <a href="./instrumentos.html" class="menu-mobile-link ${paginas.isInstrumentos ? 'link-ativo-mobile' : ''}" onclick="window.fecharMenuMobile();">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                                <span>Aulas no IMBT</span>
                            </a>
                            <a href="./cardapio.html" class="menu-mobile-link ${paginas.isCardapio ? 'link-ativo-mobile' : ''}" onclick="window.fecharMenuMobile();">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                                <span>Coffee Bravo</span>
                            </a>
                            ${linkCalendarioDrawer}
                            ${linkPainelDrawer}
                            ${linkMatriculaDrawer}
                            ${linkAddContaDrawer}
                        </nav>

                        <div class="menu-mobile-footer">
                            <a href="https://wa.me/5515996257683" target="_blank" class="btn-drawer-whatsapp">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                <span>WhatsApp: (15) 99625-7683</span>
                            </a>
                            <a href="https://www.instagram.com/bravo_tatui/" target="_blank" class="btn-drawer-insta">
                                <img src="../images/Instagram_icon.png" alt="Instagram" width="16" height="16">
                                <span>@bravo_tatui</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", drawerHtml);

        const btnHamburguer = document.getElementById("btnHamburgerNav");
        const btnFechar = document.getElementById("btnFecharMenuMobile");
        const overlay = document.getElementById("menuMobileDrawer");

        if (btnHamburguer) {
            btnHamburguer.onclick = window.abrirMenuMobile;
        }
        if (btnFechar) {
            btnFechar.onclick = window.fecharMenuMobile;
        }
        if (overlay) {
            overlay.onclick = function (e) {
                if (e.target === overlay) window.fecharMenuMobile();
            };
        }
    }

    // Modal de Adicionar Conta
    function injetarModalCriarConta(usuarioLogado) {
        if (document.getElementById("modalCriarContaGlobal")) return;

        const isOwner = usuarioLogado.tipo === "owner";

        const campoTipoUsuario = isOwner ? `
            <div class="form-grupo-conta">
                <label for="campoNovoTipo">Tipo de Conta</label>
                <select id="campoNovoTipo">
                    <option value="normal">Normal (Aluno)</option>
                    <option value="admin">Administrador</option>
                </select>
                <small style="color: #94a3b8; font-size: 11px;">Selecione o nível de permissão.</small>
            </div>
        ` : `
            <div class="form-grupo-conta">
                <label>Tipo de Conta</label>
                <input type="text" value="Normal (Aluno)" disabled style="opacity: 0.7; cursor: not-allowed;">
                <input type="hidden" id="campoNovoTipo" value="normal">
            </div>
        `;

        const modalDiv = document.createElement("div");
        modalDiv.id = "modalCriarContaGlobal";
        modalDiv.className = "modal-overlay-conta oculto";
        modalDiv.innerHTML = `
            <div class="modal-card-conta">
                <div class="modal-header-conta">
                    <h2>Adicionar Nova Conta</h2>
                    <button type="button" class="btn-fechar-modal-conta" onclick="window.fecharModalCriarConta()">&times;</button>
                </div>

                <div id="feedbackCriarConta" class="feedback-criar-conta"></div>

                <form id="formCriarContaGlobal">
                    <div class="form-grupo-conta">
                        <label for="campoNovoNome">Nome Completo</label>
                        <input type="text" id="campoNovoNome" placeholder="Ex: Maria Clara Silva" required>
                    </div>

                    <div class="form-grupo-conta">
                        <label for="campoNovoEmail">E-mail</label>
                        <input type="email" id="campoNovoEmail" placeholder="usuario@exemplo.com" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-grupo-conta">
                            <label for="campoNovoCPF">CPF</label>
                            <input type="text" id="campoNovoCPF" placeholder="000.000.000-00">
                        </div>
                        <div class="form-grupo-conta">
                            <label for="campoNovoTel">Celular / Telefone</label>
                            <input type="text" id="campoNovoTel" placeholder="(15) 99999-0000">
                        </div>
                    </div>

                    <div class="form-grupo-conta" id="grupoDataNascConta">
                        <label for="campoDataNascimento">Data de Nascimento (Aluno)</label>
                        <input type="date" id="campoDataNascimento">
                    </div>

                    ${campoTipoUsuario}

                    <div class="form-grupo-conta">
                        <label>Senha Gerada</label>
                        <div class="box-senha-gerada">
                            <div class="linha-senha">
                                <input type="text" id="campoSenhaGerada" class="input-senha-gerada" readonly required>
                                <button type="button" class="btn-acao-senha" onclick="window.gerarNovaSenha()">Gerar Outra</button>
                                <button type="button" id="btnCopiarSenha" class="btn-acao-senha" onclick="window.copiarSenhaGerada()">Copiar</button>
                            </div>
                            <div class="aviso-envio-manual">
                                <span>Envie esta senha para o aluno. Ele poderá alterá-la após o primeiro acesso.</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" id="btnSubmitConta" class="btn-submit-criar-conta">Criar Conta</button>
                </form>
            </div>
        `;

        document.body.appendChild(modalDiv);

        document.getElementById("formCriarContaGlobal").addEventListener("submit", processarCriacaoConta);
    }

    function gerarSenhaAleatoria() {
        const maiusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const minusculas = "abcdefghijkmnpqrstuvwxyz";
        const numeros = "23456789";
        const simbolos = "@#$%&!";

        let senha = "";
        senha += maiusculas.charAt(Math.floor(Math.random() * maiusculas.length));
        senha += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
        senha += numeros.charAt(Math.floor(Math.random() * numeros.length));
        senha += simbolos.charAt(Math.floor(Math.random() * simbolos.length));

        const todos = maiusculas + minusculas + numeros + simbolos;
        for (let i = 0; i < 6; i++) {
            senha += todos.charAt(Math.floor(Math.random() * todos.length));
        }

        return senha.split("").sort(() => 0.5 - Math.random()).join("");
    }

    window.gerarNovaSenha = function () {
        const input = document.getElementById("campoSenhaGerada");
        if (input) {
            input.value = gerarSenhaAleatoria();
        }
    };

    window.copiarSenhaGerada = function () {
        const input = document.getElementById("campoSenhaGerada");
        const btn = document.getElementById("btnCopiarSenha");
        if (!input || !input.value) return;

        navigator.clipboard.writeText(input.value).then(() => {
            if (btn) {
                const original = btn.textContent;
                btn.textContent = "✓ Copiado!";
                btn.style.borderColor = "#22c55e";
                btn.style.color = "#86efac";
                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.borderColor = "";
                    btn.style.color = "";
                }, 2000);
            }
        }).catch(() => {
            input.select();
            document.execCommand("copy");
            alert("Senha copiada para a área de transferência!");
        });
    };

    window.abrirModalCriarConta = function () {
        const modal = document.getElementById("modalCriarContaGlobal");
        if (!modal) return;
        window.gerarNovaSenha();
        const fb = document.getElementById("feedbackCriarConta");
        if (fb) fb.style.display = "none";
        modal.classList.remove("oculto");
    };

    window.fecharModalCriarConta = function () {
        const modal = document.getElementById("modalCriarContaGlobal");
        if (modal) modal.classList.add("oculto");
    };

    async function processarCriacaoConta(e) {
        e.preventDefault();

        const btn = document.getElementById("btnSubmitConta");
        const fb = document.getElementById("feedbackCriarConta");
        const token = localStorage.getItem("authToken");

        const nome = document.getElementById("campoNovoNome").value.trim();
        const email = document.getElementById("campoNovoEmail").value.trim();
        const cpf = document.getElementById("campoNovoCPF").value.trim();
        const telefone = document.getElementById("campoNovoTel").value.trim();
        const data_nascimento = document.getElementById("campoDataNascimento") ? document.getElementById("campoDataNascimento").value : null;
        const tipo_usuario = document.getElementById("campoNovoTipo").value;
        const senha = document.getElementById("campoSenhaGerada").value;

        btn.disabled = true;
        btn.textContent = "Cadastrando conta...";

        try {
            const resp = await fetch(`${API_BASE}/api/usuarios/criar-conta`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nome, cpf, email, telefone, data_nascimento, tipo_usuario, senha }),
            });

            const dados = await resp.json();

            if (dados.sucesso) {
                fb.className = "feedback-criar-conta sucesso";
                fb.innerHTML = `
                    <strong>Conta criada com sucesso!</strong><br>
                    E-mail: <code>${email}</code><br>
                    Senha Inicial: <code>${senha}</code><br>
                    <em>Senha inicial gerada com sucesso.</em>
                `;
                fb.style.display = "block";
                document.getElementById("formCriarContaGlobal").reset();
                window.gerarNovaSenha();
            } else {
                fb.className = "feedback-criar-conta erro";
                fb.textContent = dados.mensagem || "Erro ao cadastrar conta.";
                fb.style.display = "block";
            }
        } catch (erro) {
            fb.className = "feedback-criar-conta erro";
            fb.textContent = "Erro de conexão com o servidor.";
            fb.style.display = "block";
        } finally {
            btn.disabled = false;
            btn.textContent = "Criar Conta";
        }
    }

    function injetarModalPerfilGlobal(usuarioLogado) {
        if (document.getElementById("modalPerfilGlobalSite")) return;

        const modalDiv = document.createElement("div");
        modalDiv.id = "modalPerfilGlobalSite";
        modalDiv.className = "oculto";
        modalDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:none; align-items:center; justify-content:center; z-index:99999;";

        let rotuloCargo = "Aluno";
        if (usuarioLogado.tipo === "owner") rotuloCargo = "Owner";
        else if (usuarioLogado.tipo === "admin") rotuloCargo = "Administrador";
        else if (usuarioLogado.tipo === "professor") rotuloCargo = "Professor";

        const fotoSrc = usuarioLogado.foto_url || "";
        const placeholderAvatar = fotoSrc ? `
            <img src="${fotoSrc}" id="sitePreviewFotoPerfil" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
        ` : `
            <div id="sitePreviewPlaceholder" style="font-size: 26px; color: #F5D696; font-weight: bold;">
                ${(usuarioLogado.nome || 'U').charAt(0)}
            </div>
        `;

        modalDiv.innerHTML = `
            <div style="background:#ffffff; color:#0f172a; width:92%; max-width:480px; border-radius:12px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.3); font-family:sans-serif; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
                    <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Meu Perfil de Usuário</h3>
                    <button type="button" onclick="window.fecharModalPerfilGlobal()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; line-height:1;">&times;</button>
                </div>

                <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px; background:#f8fafc; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <div style="width:60px; height:60px; border-radius:50%; background:#0f172a; display:flex; align-items:center; justify-content:center; overflow:hidden; border:2px solid #F5D696; flex-shrink:0;">
                        ${placeholderAvatar}
                    </div>
                    <div>
                        <h4 style="margin:0 0 4px 0; font-size:16px; font-weight:800; color:#0f172a;">${usuarioLogado.nome}</h4>
                        <p style="margin:0; font-size:12.5px; color:#64748b;">${usuarioLogado.email} • <strong>${rotuloCargo}</strong></p>
                    </div>
                </div>

                <form id="formPerfilUsuarioSite" enctype="multipart/form-data">
                    <div style="margin-bottom:14px; text-align:left;">
                        <label for="campoSiteFotoPerfil" style="display:block; font-size:12.5px; font-weight:700; margin-bottom:6px; color:#334155;">Trocar Foto de Perfil</label>
                        <input type="file" id="campoSiteFotoPerfil" name="foto" accept="image/*" style="width:100%; font-size:13px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
                        <small style="color:#64748b; font-size:11px;">Formatos aceitos: JPG, PNG, WEBP (até 4MB).</small>
                    </div>

                    <div style="margin-bottom:14px; text-align:left;">
                        <label for="campoSiteTelefone" style="display:block; font-size:12.5px; font-weight:700; margin-bottom:6px; color:#334155;">Telefone / Celular</label>
                        <input type="text" id="campoSiteTelefone" name="telefone" value="${usuarioLogado.telefone || ''}" placeholder="(15) 99999-0000" style="width:100%; font-size:13.5px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
                    </div>

                    <div style="margin-bottom:18px; text-align:left;">
                        <label for="campoSiteDescricao" style="display:block; font-size:12.5px; font-weight:700; margin-bottom:6px; color:#334155;">Sobre Mim / Descrição</label>
                        <textarea id="campoSiteDescricao" name="descricao" rows="3" placeholder="Escreva uma breve descrição..." style="width:100%; font-size:13px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; resize:vertical;">${usuarioLogado.descricao || ''}</textarea>
                    </div>

                    <div id="mensagemFeedbackPerfilSite" style="display:none; padding:8px 12px; border-radius:6px; font-size:12.5px; margin-bottom:12px; font-weight:600;"></div>

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" onclick="window.fecharModalPerfilGlobal()" style="padding:9px 16px; border:1px solid #cbd5e1; background:#f1f5f9; color:#475569; border-radius:6px; font-weight:600; cursor:pointer;">Cancelar</button>
                        <button type="submit" id="btnSalvarPerfilSite" style="padding:9px 20px; border:none; background:#0f172a; color:#F5D696; border-radius:6px; font-weight:700; cursor:pointer;">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalDiv);

        window.abrirModalPerfilGlobal = function() {
            modalDiv.classList.remove("oculto");
            modalDiv.style.display = "flex";
        };

        window.fecharModalPerfilGlobal = function() {
            modalDiv.classList.add("oculto");
            modalDiv.style.display = "none";
        };

        const formPerfil = document.getElementById("formPerfilUsuarioSite");
        if (formPerfil) {
            formPerfil.addEventListener("submit", async function(e) {
                e.preventDefault();
                const btn = document.getElementById("btnSalvarPerfilSite");
                const feedback = document.getElementById("mensagemFeedbackPerfilSite");
                btn.disabled = true;
                btn.textContent = "Salvando perfil...";

                const token = usuarioLogado.token || localStorage.getItem("authToken");
                const formData = new FormData(this);

                try {
                    const resp = await fetch(`${API_BASE || 'http://localhost:3000'}/api/usuarios/perfil`, {
                        method: "POST",
                        headers: token ? { Authorization: "Bearer " + token } : {},
                        body: formData,
                    });
                    const dados = await resp.json();

                    if (dados.sucesso) {
                        feedback.style.display = "block";
                        feedback.style.background = "#dcfce7";
                        feedback.style.color = "#15803d";
                        feedback.textContent = "✓ " + dados.mensagem;

                        if (dados.fotoUrl) usuarioLogado.foto_url = dados.fotoUrl;
                        if (dados.descricao !== undefined) usuarioLogado.descricao = dados.descricao;
                        const novoTel = document.getElementById("campoSiteTelefone").value;
                        if (novoTel) usuarioLogado.telefone = novoTel;

                        const dadosSalvar = {
                            id_usuario: usuarioLogado.id_usuario || usuarioLogado.id,
                            id: usuarioLogado.id_usuario || usuarioLogado.id,
                            nome: usuarioLogado.nome,
                            email: usuarioLogado.email,
                            tipo_usuario: usuarioLogado.tipo_usuario || usuarioLogado.tipo,
                            tipo: usuarioLogado.tipo,
                            foto_url: usuarioLogado.foto_url,
                            descricao: usuarioLogado.descricao,
                            telefone: usuarioLogado.telefone,
                        };
                        localStorage.setItem("usuario", JSON.stringify(dadosSalvar));

                        setTimeout(() => {
                            window.location.reload();
                        }, 900);
                    } else {
                        feedback.style.display = "block";
                        feedback.style.background = "#fee2e2";
                        feedback.style.color = "#b91c1c";
                        feedback.textContent = "Erro: " + (dados.mensagem || "Falha ao salvar perfil.");
                    }
                } catch (err) {
                    feedback.style.display = "block";
                    feedback.style.background = "#fee2e2";
                    feedback.style.color = "#b91c1c";
                    feedback.textContent = "Erro de conexão ao salvar perfil.";
                } finally {
                    btn.disabled = false;
                    btn.textContent = "Salvar Alterações";
                }
            });
        }
    }

    window.fazerLogoutNav = async function () {
        try {
            await fetch(`${API_BASE || 'http://localhost:3000'}/api/logout`, { credentials: "include" });
        } catch (e) {}
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        sessionStorage.clear();
        alert("Sessão finalizada.");
        window.location.href = "./login.html";
    };

    // Executa ao carregar o DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarNavbar);
    } else {
        inicializarNavbar();
    }
})();
