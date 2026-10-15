const orquestraModel = require("../models/orquestraModel");
const { ehAdmin, ehOwner } = require("../utils/admin");

const paginaOrquestraController = {
    // Renderiza a página administrativa de gestão da Orquestra
    async paginaOrquestra(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!usuario) {
                return res.redirect("/site/login.html");
            }

            const isAdmin = ehAdmin(usuario);
            const isOwner = ehOwner(usuario);

            if (!isAdmin) {
                return res.redirect("/site/orquestra.html");
            }

            const [conteudo, videos] = await Promise.all([
                orquestraModel.obterConteudo(),
                orquestraModel.listarVideos(false)
            ]);

            return res.render("orquestra/index", {
                titulo: "Gestão da Orquestra Bravo Tatuí",
                usuario,
                isOwner,
                isAdmin,
                conteudo,
                videos,
                sucesso: req.query.sucesso || null,
                erro: req.query.erro || null
            });
        } catch (erro) {
            console.error("Erro ao renderizar painel da orquestra:", erro);
            return res.status(500).send("Erro interno ao carregar a página da orquestra.");
        }
    },

    // Atualizar textos e dados gerais da página
    async salvarConteudo(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!ehAdmin(usuario)) {
                return res.status(403).send("Acesso restrito à administração.");
            }

            const dados = req.body;
            await orquestraModel.atualizarConteudo(dados);

            return res.redirect("/paginas/orquestra?sucesso=" + encodeURIComponent("Conteúdo da Orquestra atualizado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao salvar conteúdo da orquestra:", erro);
            return res.redirect("/paginas/orquestra?erro=" + encodeURIComponent("Erro ao salvar dados da orquestra: " + erro.message));
        }
    },

    // Adicionar novo vídeo
    async criarVideo(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!ehAdmin(usuario)) {
                return res.status(403).send("Acesso restrito à administração.");
            }

            const { titulo, video_url, thumbnail_url, data_apresentacao, ordem } = req.body;

            if (!titulo || !video_url) {
                return res.redirect("/paginas/orquestra?erro=" + encodeURIComponent("Título e link do vídeo são obrigatórios."));
            }

            let urlFinal = video_url.trim();
            if (urlFinal.includes("watch?v=")) {
                urlFinal = urlFinal.replace("watch?v=", "embed/");
            } else if (urlFinal.includes("youtu.be/")) {
                urlFinal = urlFinal.replace("youtu.be/", "www.youtube.com/embed/");
            }

            await orquestraModel.criarVideo({
                titulo: titulo.trim(),
                video_url: urlFinal,
                thumbnail_url: thumbnail_url ? thumbnail_url.trim() : "../images/orquestra/video1.jpg",
                data_apresentacao: data_apresentacao ? data_apresentacao.trim() : "",
                ordem: ordem ? Number(ordem) : 0
            });

            return res.redirect("/paginas/orquestra?sucesso=" + encodeURIComponent("Novo vídeo cadastrado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao criar vídeo da orquestra:", erro);
            return res.redirect("/paginas/orquestra?erro=" + encodeURIComponent("Erro ao adicionar vídeo: " + erro.message));
        }
    },

    // Atualizar vídeo existente
    async atualizarVideo(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!ehAdmin(usuario)) {
                return res.status(403).send("Acesso restrito à administração.");
            }

            const id = req.params.id;
            const { titulo, video_url, thumbnail_url, data_apresentacao, ordem, ativo } = req.body;

            const dados = {
                titulo: titulo.trim(),
                thumbnail_url: thumbnail_url ? thumbnail_url.trim() : undefined,
                data_apresentacao: data_apresentacao ? data_apresentacao.trim() : undefined,
                ordem: ordem ? Number(ordem) : 0,
                ativo: ativo === "0" ? 0 : 1
            };

            if (video_url) {
                let urlFinal = video_url.trim();
                if (urlFinal.includes("watch?v=")) {
                    urlFinal = urlFinal.replace("watch?v=", "embed/");
                } else if (urlFinal.includes("youtu.be/")) {
                    urlFinal = urlFinal.replace("youtu.be/", "www.youtube.com/embed/");
                }
                dados.video_url = urlFinal;
            }

            await orquestraModel.atualizarVideo(id, dados);

            return res.redirect("/paginas/orquestra?sucesso=" + encodeURIComponent("Vídeo atualizado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao atualizar vídeo da orquestra:", erro);
            return res.redirect("/paginas/orquestra?erro=" + encodeURIComponent("Erro ao atualizar vídeo: " + erro.message));
        }
    },

    // Excluir vídeo
    async excluirVideo(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!ehAdmin(usuario)) {
                return res.status(403).send("Acesso restrito à administração.");
            }

            const id = req.params.id;
            await orquestraModel.excluirVideo(id);

            return res.redirect("/paginas/orquestra?sucesso=" + encodeURIComponent("Vídeo removido com sucesso!"));
        } catch (erro) {
            console.error("Erro ao excluir vídeo da orquestra:", erro);
            return res.redirect("/paginas/orquestra?erro=" + encodeURIComponent("Erro ao excluir vídeo: " + erro.message));
        }
    }
};

module.exports = paginaOrquestraController;
