const orquestraModel = require("../models/orquestraModel");

const orquestraController = {
    // Obter dados completos para exibição pública na página
    async obterDados(req, res) {
        try {
            const conteudo = await orquestraModel.obterConteudo();
            const videos = await orquestraModel.listarVideos(true);

            return res.status(200).json({
                sucesso: true,
                dados: {
                    conteudo: conteudo || {
                        titulo: "ORQUESTRA DO INSTITUTO MUSICAL BRAVO TATUÍ",
                        subtitulo: "A excelência da música sinfônica e a formação de concerto na Capital da Música",
                        imagem_hero: "../images/orquestra/orquestra_hero.jpg",
                        legenda_hero: "Nossa Orquestra em concerto no teatro da cidade",
                        historia_p1: "A Orquestra Bravo Tatuí viabiliza a formação e a evolução e a realização em harmonia no Instituto Musical Bravo Tatuí, e é a orquestra mais uma evolução musical a passo do encanto cultural e celeiro de música, como elemento-evolução no Instituto Musical Bravo Tatuí.",
                        historia_p2: "Nossa missão contemporânea abraça músicos com repertório ativo e sinfônico, a orquestra é de um orgulho imenso para quem ouve e um orgulho de fazer música na Capital da Música (Tatuí).",
                        ensaios: "Sábados, das 14h às 17h",
                        participacao: "Alunos e músicos da comunidade",
                        inscricoes: "Abertas no início de cada semestre",
                        instrumentos: "Cordas, Sopros e Percussão",
                        maestro_nome: "Maestro Gabriel Lima",
                        maestro_cargo: "O MAESTRO",
                        maestro_subtitulo: "Regente Titular & Diretor Musical",
                        maestro_foto: "../images/orquestra/maestro.jpg",
                        maestro_bio: "Maestro Gabriel Lima é um músico com expressiva trajetória na regência e formação orquestral. Com paixão pela música de concerto e realização no Instituto Musical Bravo Tatuí, lidera a orquestra unindo técnica, emoção e excelência artística na Capital da Música.",
                        youtube_url: "https://www.youtube.com/@bravo_tatui"
                    },
                    videos: videos || []
                }
            });
        } catch (erro) {
            console.error("Erro na rota GET /api/orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar informações da Orquestra."
            });
        }
    },

    // Atualizar conteúdo da página (Admin e Owner)
    async atualizarConteudo(req, res) {
        try {
            const dados = req.body;
            await orquestraModel.atualizarConteudo(dados);
            const atualizado = await orquestraModel.obterConteudo();

            return res.status(200).json({
                sucesso: true,
                mensagem: "Conteúdo da Orquestra atualizado com sucesso!",
                dados: atualizado
            });
        } catch (erro) {
            console.error("Erro na rota PUT /api/orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar conteúdo da página da Orquestra."
            });
        }
    },

    // Listar vídeos
    async listarVideos(req, res) {
        try {
            const videos = await orquestraModel.listarVideos(false);
            return res.status(200).json({
                sucesso: true,
                dados: videos
            });
        } catch (erro) {
            console.error("Erro ao listar vídeos da orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar vídeos da orquestra."
            });
        }
    },

    // Criar vídeo
    async criarVideo(req, res) {
        try {
            const { titulo, video_url, thumbnail_url, data_apresentacao, ordem } = req.body;

            if (!titulo || !video_url) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Título e Link do Vídeo são obrigatórios."
                });
            }

            // Normaliza URLs do YouTube se necessário
            let urlFinal = video_url.trim();
            if (urlFinal.includes("watch?v=")) {
                urlFinal = urlFinal.replace("watch?v=", "embed/");
            } else if (urlFinal.includes("youtu.be/")) {
                urlFinal = urlFinal.replace("youtu.be/", "www.youtube.com/embed/");
            }

            const id = await orquestraModel.criarVideo({
                titulo: titulo.trim(),
                video_url: urlFinal,
                thumbnail_url: thumbnail_url ? thumbnail_url.trim() : "../images/orquestra/video1.jpg",
                data_apresentacao: data_apresentacao ? data_apresentacao.trim() : "",
                ordem: ordem ? Number(ordem) : 0
            });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Vídeo cadastrado com sucesso!",
                id_video: id
            });
        } catch (erro) {
            console.error("Erro ao criar vídeo da orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar novo vídeo."
            });
        }
    },

    // Atualizar vídeo existente
    async atualizarVideo(req, res) {
        try {
            const id = req.params.id;
            const dados = req.body;

            if (dados.video_url) {
                let urlFinal = dados.video_url.trim();
                if (urlFinal.includes("watch?v=")) {
                    urlFinal = urlFinal.replace("watch?v=", "embed/");
                } else if (urlFinal.includes("youtu.be/")) {
                    urlFinal = urlFinal.replace("youtu.be/", "www.youtube.com/embed/");
                }
                dados.video_url = urlFinal;
            }

            await orquestraModel.atualizarVideo(id, dados);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Vídeo atualizado com sucesso!"
            });
        } catch (erro) {
            console.error("Erro ao atualizar vídeo da orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar dados do vídeo."
            });
        }
    },

    // Excluir vídeo
    async excluirVideo(req, res) {
        try {
            const id = req.params.id;
            await orquestraModel.excluirVideo(id);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Vídeo removido com sucesso!"
            });
        } catch (erro) {
            console.error("Erro ao excluir vídeo da orquestra:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao remover vídeo."
            });
        }
    }
};

module.exports = orquestraController;
