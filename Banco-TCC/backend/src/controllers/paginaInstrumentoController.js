const instrumentoModel = require("../models/instrumentoModel");
const { ehAdmin, ehOwner } = require("../utils/admin");

const paginaInstrumentoController = {
    // Renderiza a página administrativa de gestão de instrumentos
    async paginaInstrumentos(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!usuario) {
                return res.redirect("/site/login.html");
            }

            const isAdmin = ehAdmin(usuario);
            const isOwner = ehOwner(usuario);

            // Alunos são redirecionados para a visualização pública
            if (!isAdmin) {
                return res.redirect("/site/instrumentos.html");
            }

            const [instrumentos, estatisticas, categorias] = await Promise.all([
                instrumentoModel.listarTodos(),
                instrumentoModel.obterEstatisticas(),
                instrumentoModel.listarCategorias()
            ]);

            return res.render("instrumentos/index", {
                titulo: "Gestão de Instrumentos",
                usuario,
                isOwner,
                isAdmin,
                instrumentos,
                estatisticas,
                categorias,
                sucesso: req.query.sucesso || null,
                erro: req.query.erro || null
            });
        } catch (erro) {
            console.error("Erro ao renderizar painel de instrumentos:", erro);
            return res.status(500).send("Erro interno ao carregar a página de instrumentos.");
        }
    },

    // Criar instrumento via formulário SSR do painel
    async criarInstrumento(req, res) {
        try {
            const {
                nome,
                categoria,
                categoria_nova,
                icone,
                descricao,
                imagem_url,
                disponivel_aulas,
                disponivel_eventos,
                ativo,
                ordem
            } = req.body;

            const categoriaFinal = (categoria === "__nova__" && categoria_nova) ? categoria_nova.trim() : (categoria || "Teclas & Harmonia");

            let imagemFinal = imagem_url ? imagem_url.trim() : null;
            if (req.file) {
                imagemFinal = `/uploads/instrumentos/${req.file.filename}`;
            }

            await instrumentoModel.criar({
                nome: nome.trim(),
                categoria: categoriaFinal,
                icone: icone ? icone.trim() : "🎻",
                descricao: descricao ? descricao.trim() : "",
                imagem_url: imagemFinal,
                disponivel_aulas: disponivel_aulas === "1" || disponivel_aulas === "on" || disponivel_aulas === 1 ? 1 : 0,
                disponivel_eventos: disponivel_eventos === "1" || disponivel_eventos === "on" || disponivel_eventos === 1 ? 1 : 0,
                ativo: ativo === "1" || ativo === "on" || ativo === 1 ? 1 : 0,
                ordem: parseInt(ordem) || 0
            });

            return res.redirect("/paginas/instrumentos?sucesso=" + encodeURIComponent(`Instrumento '${nome}' cadastrado com sucesso!`));
        } catch (erro) {
            console.error("Erro ao criar instrumento via painel:", erro);
            return res.redirect("/paginas/instrumentos?erro=" + encodeURIComponent("Erro ao cadastrar instrumento musical."));
        }
    },

    // Atualizar instrumento via formulário SSR do painel
    async atualizarInstrumento(req, res) {
        try {
            const id = req.params.id;
            const {
                nome,
                categoria,
                categoria_nova,
                icone,
                descricao,
                imagem_url,
                disponivel_aulas,
                disponivel_eventos,
                ativo,
                ordem
            } = req.body;

            const categoriaFinal = (categoria === "__nova__" && categoria_nova) ? categoria_nova.trim() : (categoria || "Teclas & Harmonia");

            let imagemFinal = imagem_url !== undefined && imagem_url.trim() ? imagem_url.trim() : undefined;
            if (req.file) {
                imagemFinal = `/uploads/instrumentos/${req.file.filename}`;
            }

            await instrumentoModel.atualizar(id, {
                nome: nome.trim(),
                categoria: categoriaFinal,
                icone: icone ? icone.trim() : "🎻",
                descricao: descricao !== undefined ? descricao.trim() : "",
                imagem_url: imagemFinal,
                disponivel_aulas: disponivel_aulas === "1" || disponivel_aulas === "on" || disponivel_aulas === 1 ? 1 : 0,
                disponivel_eventos: disponivel_eventos === "1" || disponivel_eventos === "on" || disponivel_eventos === 1 ? 1 : 0,
                ativo: ativo === "1" || ativo === "on" || ativo === 1 ? 1 : 0,
                ordem: parseInt(ordem) || 0
            });

            return res.redirect("/paginas/instrumentos?sucesso=" + encodeURIComponent(`Instrumento '${nome}' atualizado com sucesso!`));
        } catch (erro) {
            console.error(`Erro ao atualizar instrumento ${req.params.id} via painel:`, erro);
            return res.redirect("/paginas/instrumentos?erro=" + encodeURIComponent("Erro ao atualizar dados do instrumento."));
        }
    },

    // Alternar status (ativo, aulas, eventos) via SSR
    async alternarStatus(req, res) {
        try {
            const id = req.params.id;
            const campo = req.query.campo || req.body.campo || "ativo";
            await instrumentoModel.alternarStatus(id, campo);
            return res.redirect("/paginas/instrumentos?sucesso=" + encodeURIComponent(`Status de ${campo} atualizado!`));
        } catch (erro) {
            console.error("Erro ao alternar status via painel:", erro);
            return res.redirect("/paginas/instrumentos?erro=" + encodeURIComponent("Erro ao alternar status do instrumento."));
        }
    },

    // Excluir instrumento via formulário SSR do painel
    async excluirInstrumento(req, res) {
        try {
            const id = req.params.id;
            await instrumentoModel.excluir(id);
            return res.redirect("/paginas/instrumentos?sucesso=" + encodeURIComponent("Instrumento excluído com sucesso!"));
        } catch (erro) {
            console.error("Erro ao excluir instrumento via painel:", erro);
            return res.redirect("/paginas/instrumentos?erro=" + encodeURIComponent("Erro ao excluir instrumento."));
        }
    }
};

module.exports = paginaInstrumentoController;
