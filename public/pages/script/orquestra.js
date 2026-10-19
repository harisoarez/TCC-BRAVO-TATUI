// Orquestra Bravo Tatuí - Interatividade, Carregamento Dinâmico & CRUD Administrativo

(function () {
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    // Elementos do Modal de Vídeo
    const videoModal = document.getElementById("videoModal");
    const videoIframe = document.getElementById("videoIframe");
    const modalTitulo = document.getElementById("modalTitulo");

    // Elementos da Barra Administrativa e Modal CRUD
    const barraAdmin = document.getElementById("barraAdminOrquestra");
    const linkPainelOrquestra = document.getElementById("linkPainelOrquestra");
    const modalAdmin = document.getElementById("modalAdminOrquestra");
    const toastStatusAdmin = document.getElementById("toastStatusAdmin");

    // Estado local em memória
    let dadosOrquestraCache = {
        conteudo: null,
        videos: []
    };

    // =========================================================
    // 1. Verificação de Acesso Administrativo (Admin e Owner)
    // =========================================================
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

    function obterUsuarioAtual() {
        const token = localStorage.getItem("authToken");
        if (!token) return null;

        const payload = decodificarToken(token);
        let u = {};
        try {
            const raw = localStorage.getItem("usuario");
            if (raw) u = JSON.parse(raw);
        } catch (e) {}

        const tipo = (payload?.tipo_usuario || u.tipo_usuario || u.tipo || "").toLowerCase();
        return {
            token,
            tipo,
            nome: payload?.nome || u.nome || "Usuário",
            isAdmin: tipo === "admin" || tipo === "owner",
            isOwner: tipo === "owner"
        };
    }

    function checarPermissoesAdmin() {
        const u = obterUsuarioAtual();
        if (u && u.isAdmin) {
            if (barraAdmin) {
                barraAdmin.style.display = "flex";
            }
            if (linkPainelOrquestra && u.token) {
                linkPainelOrquestra.href = `${API_BASE}/paginas/orquestra?token=${encodeURIComponent(u.token)}`;
            }
        } else {
            if (barraAdmin) {
                barraAdmin.style.display = "none";
            }
        }
    }

    // =========================================================
    // 2. Carregamento de Dados da API Pública
    // =========================================================
    async function carregarDadosOrquestra() {
        try {
            const resp = await fetch(`${API_BASE}/api/orquestra`);
            const json = await resp.json();

            if (json.sucesso && json.dados) {
                dadosOrquestraCache = json.dados;
                renderizarConteudoNaPagina(json.dados.conteudo);
                renderizarVideosNaPagina(json.dados.videos);
            }
        } catch (erro) {
            console.warn("Não foi possível carregar dados dinâmicos da orquestra, mantendo conteúdo inicial:", erro);
        }
    }

    function renderizarConteudoNaPagina(c) {
        if (!c) return;

        // Título e Subtítulo
        const displayTitulo = document.getElementById("displayTitulo");
        if (displayTitulo && c.titulo) {
            const partes = c.titulo.split(" ");
            if (partes.length >= 2) {
                const primeira = partes[0];
                const resto = partes.slice(1).join(" ");
                displayTitulo.innerHTML = `<span class="palavra-orquestra">${primeira}</span> <span class="palavra-bravo">${resto}</span>`;
            } else {
                displayTitulo.textContent = c.titulo;
            }
        }

        const displaySubtitulo = document.getElementById("displaySubtitulo");
        if (displaySubtitulo && c.subtitulo) displaySubtitulo.textContent = c.subtitulo;

        // Foto Hero e Legenda
        const heroImg = document.getElementById("heroOrquestraImg");
        if (heroImg && c.imagem_hero) heroImg.src = c.imagem_hero;

        const displayLegenda = document.getElementById("displayLegendaHero");
        if (displayLegenda && c.legenda_hero) displayLegenda.textContent = c.legenda_hero;

        // História
        const p1 = document.getElementById("displayHistoriaP1");
        if (p1 && c.historia_p1) p1.textContent = c.historia_p1;

        const p2 = document.getElementById("displayHistoriaP2");
        if (p2 && c.historia_p2) p2.textContent = c.historia_p2;

        // Informações Gerais
        const ensaios = document.getElementById("displayEnsaios");
        if (ensaios && c.ensaios) ensaios.textContent = c.ensaios;

        const participacao = document.getElementById("displayParticipacao");
        if (participacao && c.participacao) participacao.textContent = c.participacao;

        const inscricoes = document.getElementById("displayInscricoes");
        if (inscricoes && c.inscricoes) inscricoes.textContent = c.inscricoes;

        const instrumentos = document.getElementById("displayInstrumentos");
        if (instrumentos && c.instrumentos) instrumentos.textContent = c.instrumentos;

        // Maestro
        const maestroNome = document.getElementById("displayMaestroNome");
        if (maestroNome && c.maestro_nome) maestroNome.textContent = c.maestro_nome;

        const maestroCargo = document.getElementById("displayMaestroCargo");
        if (maestroCargo && c.maestro_cargo) maestroCargo.textContent = c.maestro_cargo;

        const maestroSub = document.getElementById("displayMaestroSubtitulo");
        if (maestroSub && c.maestro_subtitulo) maestroSub.textContent = c.maestro_subtitulo;

        const maestroFoto = document.getElementById("displayMaestroFoto");
        if (maestroFoto && c.maestro_foto) maestroFoto.src = c.maestro_foto;

        const maestroBio = document.getElementById("displayMaestroBio");
        if (maestroBio && c.maestro_bio) maestroBio.textContent = c.maestro_bio;

        // YouTube
        const linkYt = document.getElementById("linkYoutubeOficial");
        if (linkYt && c.youtube_url) linkYt.href = c.youtube_url;
    }

    function renderizarVideosNaPagina(videos) {
        const container = document.getElementById("containerGridVideos");
        if (!container || !Array.isArray(videos) || videos.length === 0) return;

        container.innerHTML = videos.map(v => {
            const thumb = v.thumbnail_url || "../images/orquestra/video1.jpg";

            return `
                <article class="card-video" onclick="abrirVideoModal('${v.titulo.replace(/'/g, "\\'")}', '${v.video_url}')" title="Assistir ${v.titulo}">
                    <div class="video-thumbnail-container">
                        <img src="${thumb}" alt="${v.titulo}" class="video-thumb" onerror="this.onerror=null; this.src='../images/orquestra/video1.jpg';">
                        <div class="video-overlay-gradient"></div>
                        <div class="video-play-btn" aria-label="Reproduzir vídeo">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0c0c0c" style="margin-left: 2px;">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </div>
                    </div>
                    <div class="video-info-box">
                        <h3 class="video-titulo">${v.titulo}</h3>
                        <span class="video-subtitulo">${v.data_apresentacao || 'Apresentação Oficial'}</span>
                    </div>
                </article>
            `;
        }).join("");
    }

    // =========================================================
    // 3. Modal de Reprodução de Vídeo (Player Lightbox)
    // =========================================================
    window.abrirVideoModal = function (titulo, url) {
        if (!videoModal || !videoIframe) return;

        if (modalTitulo) {
            modalTitulo.textContent = titulo || "Apresentação da Orquestra";
        }

        const urlComAutoplay = url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
        videoIframe.src = urlComAutoplay;

        videoModal.classList.add("modal-aberto");
        videoModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    window.fecharVideoModal = function () {
        if (!videoModal || !videoIframe) return;

        videoModal.classList.remove("modal-aberto");
        videoModal.setAttribute("aria-hidden", "true");
        videoIframe.src = "";
        document.body.style.overflow = "";
    };

    // =========================================================
    // 4. Modal de Edição Administrativa (CRUD In-Page)
    // =========================================================
    window.abrirModalEdicaoOrquestra = function () {
        if (!modalAdmin) return;

        const c = dadosOrquestraCache.conteudo || {};

        // Preenche campos de Textos
        const setVal = (id, val, padrao = "") => {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined && val !== null ? val : padrao;
        };

        setVal("adminInputTitulo", c.titulo, "ORQUESTRA DO INSTITUTO MUSICAL BRAVO TATUÍ");
        setVal("adminInputSubtitulo", c.subtitulo, "A excelência da música sinfônica e a formação de concerto na Capital da Música");
        setVal("adminInputHeroImg", c.imagem_hero, "../images/orquestra/orquestra_hero.jpg");
        setVal("adminInputHeroLegenda", c.legenda_hero, "Nossa Orquestra em concerto no teatro da cidade");
        setVal("adminInputHistoriaP1", c.historia_p1, "");
        setVal("adminInputHistoriaP2", c.historia_p2, "");

        // Preenche Informações & Maestro
        setVal("adminInputEnsaios", c.ensaios, "Sábados, das 14h às 17h");
        setVal("adminInputParticipacao", c.participacao, "Alunos e músicos da comunidade");
        setVal("adminInputInscricoes", c.inscricoes, "Abertas no início de cada semestre");
        setVal("adminInputInstrumentos", c.instrumentos, "Cordas, Sopros e Percussão");

        setVal("adminInputMaestroNome", c.maestro_nome, "Maestro Gabriel Lima");
        setVal("adminInputMaestroSubtitulo", c.maestro_subtitulo, "Regente Titular & Diretor Musical");
        setVal("adminInputMaestroFoto", c.maestro_foto, "../images/orquestra/maestro.jpg");
        setVal("adminInputMaestroBio", c.maestro_bio, "");

        setVal("adminInputYoutube", c.youtube_url, "https://www.youtube.com/@bravo_tatui");

        // Renderiza lista de vídeos no modal
        renderizarListaVideosModal();

        modalAdmin.style.display = "flex";
        document.body.style.overflow = "hidden";
        if (toastStatusAdmin) toastStatusAdmin.textContent = "";
    };

    window.fecharModalEdicaoOrquestra = function () {
        if (!modalAdmin) return;
        modalAdmin.style.display = "none";
        document.body.style.overflow = "";
    };

    window.trocarAbaAdmin = function (abaId) {
        const abas = ["textos", "info", "videos"];
        abas.forEach(a => {
            const elAba = document.getElementById(`aba-${a}`);
            if (elAba) elAba.classList.remove("ativa");
        });

        const ativa = document.getElementById(`aba-${abaId}`);
        if (ativa) ativa.classList.add("ativa");

        // Ajusta classe dos botões
        const botoes = document.querySelectorAll(".modal-admin-tabs .tab-btn");
        botoes.forEach(b => {
            const clickAttr = b.getAttribute("onclick") || "";
            if (clickAttr.includes(abaId)) {
                b.classList.add("ativa");
            } else {
                b.classList.remove("ativa");
            }
        });
    };

    function renderizarListaVideosModal() {
        const container = document.getElementById("adminListaVideosContainer");
        if (!container) return;

        const videos = dadosOrquestraCache.videos || [];
        if (videos.length === 0) {
            container.innerHTML = `<p style="font-size: 12px; color: #94a3b8; text-align: center; padding: 12px;">Nenhum vídeo cadastrado.</p>`;
            return;
        }

        container.innerHTML = videos.map(v => `
            <div class="item-video-admin">
                <div>
                    <strong style="color: #F5D696;">${v.titulo}</strong>
                    <div style="font-size: 11px; color: #94a3b8;">${v.data_apresentacao || 'Sem data'} • ${v.video_url}</div>
                </div>
                <button type="button" class="btn-excluir-video-admin" onclick="excluirVideoViaApi(${v.id_video})">Excluir</button>
            </div>
        `).join("");
    }

    window.mostrarFormNovoVideo = function () {
        const box = document.getElementById("boxNovoVideoRapido");
        if (box) box.style.display = "block";
    };

    window.esconderFormNovoVideo = function () {
        const box = document.getElementById("boxNovoVideoRapido");
        if (box) box.style.display = "none";
    };

    // =========================================================
    // 5. Salvar Conteúdo via API REST (PUT /api/orquestra)
    // =========================================================
    window.salvarConteudoViaApi = async function (e) {
        if (e) e.preventDefault();

        const u = obterUsuarioAtual();
        if (!u || !u.isAdmin) {
            alert("Acesso restrito. Faça login como Administrador.");
            return;
        }

        const btnSalvar = document.getElementById("btnSalvarModalAdmin");
        if (btnSalvar) {
            btnSalvar.disabled = true;
            btnSalvar.textContent = "Salvando...";
        }

        const payload = {
            titulo: document.getElementById("adminInputTitulo").value.trim(),
            subtitulo: document.getElementById("adminInputSubtitulo").value.trim(),
            imagem_hero: document.getElementById("adminInputHeroImg").value.trim(),
            legenda_hero: document.getElementById("adminInputHeroLegenda").value.trim(),
            historia_p1: document.getElementById("adminInputHistoriaP1").value.trim(),
            historia_p2: document.getElementById("adminInputHistoriaP2").value.trim(),
            ensaios: document.getElementById("adminInputEnsaios").value.trim(),
            participacao: document.getElementById("adminInputParticipacao").value.trim(),
            inscricoes: document.getElementById("adminInputInscricoes").value.trim(),
            instrumentos: document.getElementById("adminInputInstrumentos").value.trim(),
            maestro_nome: document.getElementById("adminInputMaestroNome").value.trim(),
            maestro_subtitulo: document.getElementById("adminInputMaestroSubtitulo").value.trim(),
            maestro_foto: document.getElementById("adminInputMaestroFoto").value.trim(),
            maestro_bio: document.getElementById("adminInputMaestroBio").value.trim(),
            youtube_url: document.getElementById("adminInputYoutube").value.trim()
        };

        try {
            const resp = await fetch(`${API_BASE}/api/orquestra`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${u.token}`
                },
                body: JSON.stringify(payload)
            });

            const json = await resp.json();

            if (json.sucesso) {
                if (toastStatusAdmin) {
                    toastStatusAdmin.style.color = "#4ade80";
                    toastStatusAdmin.textContent = "✓ Salvo com sucesso!";
                }

                // Atualiza cache e tela imediatamente
                dadosOrquestraCache.conteudo = { ...dadosOrquestraCache.conteudo, ...payload };
                renderizarConteudoNaPagina(dadosOrquestraCache.conteudo);

                setTimeout(() => {
                    fecharModalEdicaoOrquestra();
                }, 800);
            } else {
                if (toastStatusAdmin) {
                    toastStatusAdmin.style.color = "#f87171";
                    toastStatusAdmin.textContent = "✕ " + (json.mensagem || "Erro ao salvar.");
                }
            }
        } catch (erro) {
            console.error("Erro ao salvar dados da orquestra:", erro);
            if (toastStatusAdmin) {
                toastStatusAdmin.style.color = "#f87171";
                toastStatusAdmin.textContent = "✕ Erro de conexão com o servidor.";
            }
        } finally {
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.textContent = "Salvar Todas as Alterações";
            }
        }
    };

    // Adicionar Vídeo via API REST (POST /api/orquestra/videos)
    window.adicionarVideoViaApi = async function () {
        const u = obterUsuarioAtual();
        if (!u || !u.isAdmin) return;

        const titulo = document.getElementById("novoVideoTitulo").value.trim();
        const video_url = document.getElementById("novoVideoUrl").value.trim();
        const thumbnail_url = document.getElementById("novoVideoThumb").value.trim();
        const data_apresentacao = document.getElementById("novoVideoTemporada").value.trim();

        if (!titulo || !video_url) {
            alert("Preencha o título e o link do vídeo.");
            return;
        }

        try {
            const resp = await fetch(`${API_BASE}/api/orquestra/videos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${u.token}`
                },
                body: JSON.stringify({
                    titulo,
                    video_url,
                    thumbnail_url,
                    data_apresentacao,
                    ordem: (dadosOrquestraCache.videos ? dadosOrquestraCache.videos.length + 1 : 1)
                })
            });

            const json = await resp.json();
            if (json.sucesso) {
                // Limpa campos
                document.getElementById("novoVideoTitulo").value = "";
                document.getElementById("novoVideoUrl").value = "";
                document.getElementById("novoVideoThumb").value = "";
                document.getElementById("novoVideoTemporada").value = "";
                esconderFormNovoVideo();

                // Recarrega dados completos
                await carregarDadosOrquestra();
                renderizarListaVideosModal();
            } else {
                alert(json.mensagem || "Erro ao adicionar vídeo.");
            }
        } catch (erro) {
            console.error("Erro ao adicionar vídeo:", erro);
            alert("Erro de conexão com o servidor.");
        }
    };

    // Excluir Vídeo via API REST (DELETE /api/orquestra/videos/:id)
    window.excluirVideoViaApi = async function (id_video) {
        if (!confirm("Deseja realmente remover este vídeo?")) return;

        const u = obterUsuarioAtual();
        if (!u || !u.isAdmin) return;

        try {
            const resp = await fetch(`${API_BASE}/api/orquestra/videos/${id_video}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${u.token}`
                }
            });

            const json = await resp.json();
            if (json.sucesso) {
                await carregarDadosOrquestra();
                renderizarListaVideosModal();
            } else {
                alert(json.mensagem || "Erro ao excluir vídeo.");
            }
        } catch (erro) {
            console.error("Erro ao excluir vídeo:", erro);
        }
    };

    // Fechar modais ao pressionar ESC
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (videoModal && videoModal.classList.contains("modal-aberto")) {
                fecharVideoModal();
            }
            if (modalAdmin && modalAdmin.style.display === "flex") {
                fecharModalEdicaoOrquestra();
            }
        }
    });

    // Inicialização ao carregar o DOM
    function inicializar() {
        checarPermissoesAdmin();
        carregarDadosOrquestra();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar();
    }
})();
