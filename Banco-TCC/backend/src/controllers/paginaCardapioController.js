const cardapioModel = require("../models/cardapioModel");
const { ehAdmin, ehOwner } = require("../utils/admin");

const paginaCardapioController = {
    // Renderiza a página administrativa de gestão do cardápio
    async paginaCardapio(req, res) {
        try {
            const usuario = res.locals.usuario || (req.session && req.session.usuario);
            if (!usuario) {
                return res.redirect("/site/login.html");
            }

            const tipo = (usuario.tipo_usuario || usuario.tipo || "").toLowerCase();
            const isAdmin = ehAdmin(usuario);
            const isOwner = ehOwner(usuario);

            // Alunos são redirecionados para a visualização pública do cardápio
            if (!isAdmin) {
                return res.redirect("/site/cardapio.html");
            }

            const [itens, estatisticas, categorias] = await Promise.all([
                cardapioModel.listarTodos(),
                cardapioModel.obterEstatisticas(),
                cardapioModel.listarCategorias()
            ]);

            return res.render("cardapio/index", {
                titulo: "Cardápio Coffee Bravo",
                usuario,
                isOwner,
                isAdmin,
                itens,
                estatisticas,
                categorias,
                sucesso: req.query.sucesso || null,
                erro: req.query.erro || null
            });
        } catch (erro) {
            console.error("Erro ao renderizar painel do cardápio:", erro);
            return res.status(500).send("Erro interno ao carregar a página do cardápio.");
        }
    },

    // Criar item via formulário SSR do painel
    async criarItem(req, res) {
        try {
            const { nome, descricao, preco, categoria, categoria_nova, imagem_url, disponivel, destaque, ordem } = req.body;

            const categoriaFinal = (categoria === "__nova__" && categoria_nova) ? categoria_nova.trim() : (categoria || "Cafés");

            let imagemFinal = imagem_url ? imagem_url.trim() : null;
            if (req.file) {
                imagemFinal = `/uploads/cardapio/${req.file.filename}`;
            }

            await cardapioModel.criar({
                nome,
                descricao,
                preco: parseFloat(preco) || 0,
                categoria: categoriaFinal,
                imagem_url: imagemFinal,
                disponivel: disponivel === "1" || disponivel === "on" || disponivel === 1 ? 1 : 0,
                destaque: destaque === "1" || destaque === "on" || destaque === 1 ? 1 : 0,
                ordem: parseInt(ordem) || 0
            });

            return res.redirect("/paginas/cardapio?sucesso=" + encodeURIComponent("Item adicionado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao criar item via painel:", erro);
            return res.redirect("/paginas/cardapio?erro=" + encodeURIComponent("Erro ao cadastrar item."));
        }
    },

    // Atualizar item via formulário SSR do painel
    async atualizarItem(req, res) {
        try {
            const id = req.params.id;
            const { nome, descricao, preco, categoria, categoria_nova, imagem_url, disponivel, destaque, ordem } = req.body;

            const categoriaFinal = (categoria === "__nova__" && categoria_nova) ? categoria_nova.trim() : (categoria || "Cafés");

            let imagemFinal = imagem_url !== undefined ? imagem_url.trim() : undefined;
            if (req.file) {
                imagemFinal = `/uploads/cardapio/${req.file.filename}`;
            }

            await cardapioModel.atualizar(id, {
                nome,
                descricao,
                preco: parseFloat(preco),
                categoria: categoriaFinal,
                imagem_url: imagemFinal,
                disponivel: disponivel === "1" || disponivel === "on" || disponivel === 1 ? 1 : 0,
                destaque: destaque === "1" || destaque === "on" || destaque === 1 ? 1 : 0,
                ordem: parseInt(ordem) || 0
            });

            return res.redirect("/paginas/cardapio?sucesso=" + encodeURIComponent("Item atualizado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao atualizar item via painel:", erro);
            return res.redirect("/paginas/cardapio?erro=" + encodeURIComponent("Erro ao atualizar item."));
        }
    },

    // Alternar status de disponibilidade
    async alternarStatus(req, res) {
        try {
            const id = req.params.id;
            const novoStatus = await cardapioModel.alternarStatus(id);

            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.json({ sucesso: true, disponivel: novoStatus });
            }

            return res.redirect("/paginas/cardapio?sucesso=" + encodeURIComponent("Status alterado com sucesso!"));
        } catch (erro) {
            console.error("Erro ao alternar status via painel:", erro);
            return res.redirect("/paginas/cardapio?erro=" + encodeURIComponent("Erro ao alternar status."));
        }
    },

    // Excluir item
    async excluirItem(req, res) {
        try {
            const id = req.params.id;
            await cardapioModel.excluir(id);

            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.json({ sucesso: true, mensagem: "Item excluído com sucesso!" });
            }

            return res.redirect("/paginas/cardapio?sucesso=" + encodeURIComponent("Item excluído com sucesso!"));
        } catch (erro) {
            console.error("Erro ao excluir item via painel:", erro);
            return res.redirect("/paginas/cardapio?erro=" + encodeURIComponent("Erro ao excluir item."));
        }
    }
};

module.exports = paginaCardapioController;
