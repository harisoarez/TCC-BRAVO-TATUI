const cardapioModel = require("../models/cardapioModel");

const cardapioController = {
    // Listar itens (público)
    async listar(req, res) {
        try {
            const { categoria, apenasDisponiveis, busca, destaque } = req.query;
            const itens = await cardapioModel.listarTodos({
                categoria,
                apenasDisponiveis,
                busca,
                destaque
            });
            return res.json({
                sucesso: true,
                total: itens.length,
                itens
            });
        } catch (erro) {
            console.error("Erro ao listar itens do cardápio:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao consultar itens do cardápio."
            });
        }
    },

    // Buscar item por ID
    async obterPorId(req, res) {
        try {
            const id = req.params.id;
            const item = await cardapioModel.buscarPorId(id);
            if (!item) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Item não encontrado."
                });
            }
            return res.json({ sucesso: true, item });
        } catch (erro) {
            console.error("Erro ao obter item:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno ao buscar item."
            });
        }
    },

    // Criar novo item (admin/owner)
    async criar(req, res) {
        try {
            const { nome, descricao, preco, categoria, imagem_url, disponivel, destaque, ordem } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({ sucesso: false, mensagem: "O nome do item é obrigatório." });
            }
            if (preco === undefined || isNaN(parseFloat(preco))) {
                return res.status(400).json({ sucesso: false, mensagem: "Informe um preço válido para o item." });
            }
            if (!categoria || !categoria.trim()) {
                return res.status(400).json({ sucesso: false, mensagem: "A categoria é obrigatória." });
            }

            let imagemFinal = imagem_url ? imagem_url.trim() : null;
            if (req.file) {
                imagemFinal = `/uploads/cardapio/${req.file.filename}`;
            }

            const idCriado = await cardapioModel.criar({
                nome,
                descricao,
                preco: parseFloat(preco),
                categoria,
                imagem_url: imagemFinal,
                disponivel: disponivel === "0" || disponivel === 0 || disponivel === false || disponivel === "false" ? 0 : 1,
                destaque: destaque === "1" || destaque === 1 || destaque === true || destaque === "true" ? 1 : 0,
                ordem: parseInt(ordem) || 0
            });

            const novoItem = await cardapioModel.buscarPorId(idCriado);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Item cadastrado com sucesso no cardápio!",
                item: novoItem
            });
        } catch (erro) {
            console.error("Erro ao criar item no cardápio:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar novo item."
            });
        }
    },

    // Atualizar item (admin/owner)
    async atualizar(req, res) {
        try {
            const id = req.params.id;
            const itemExistente = await cardapioModel.buscarPorId(id);
            if (!itemExistente) {
                return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado." });
            }

            const { nome, descricao, preco, categoria, imagem_url, disponivel, destaque, ordem } = req.body;

            let imagemFinal = itemExistente.imagem_url;
            if (req.file) {
                imagemFinal = `/uploads/cardapio/${req.file.filename}`;
            } else if (imagem_url !== undefined) {
                imagemFinal = imagem_url.trim();
            }

            const itemAtualizado = await cardapioModel.atualizar(id, {
                nome: nome || itemExistente.nome,
                descricao: descricao !== undefined ? descricao : itemExistente.descricao,
                preco: preco !== undefined ? parseFloat(preco) : itemExistente.preco,
                categoria: categoria || itemExistente.categoria,
                imagem_url: imagemFinal,
                disponivel: disponivel !== undefined ? (disponivel === "1" || disponivel === 1 || disponivel === true || disponivel === "true" ? 1 : 0) : itemExistente.disponivel,
                destaque: destaque !== undefined ? (destaque === "1" || destaque === 1 || destaque === true || destaque === "true" ? 1 : 0) : itemExistente.destaque,
                ordem: ordem !== undefined ? parseInt(ordem) : itemExistente.ordem
            });

            return res.json({
                sucesso: true,
                mensagem: "Item atualizado com sucesso!",
                item: itemAtualizado
            });
        } catch (erro) {
            console.error("Erro ao atualizar item do cardápio:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar item."
            });
        }
    },

    // Alternar status de disponibilidade (admin/owner)
    async alternarStatus(req, res) {
        try {
            const id = req.params.id;
            const { disponivel } = req.body;

            const novoStatus = await cardapioModel.alternarStatus(id, disponivel);
            if (novoStatus === null) {
                return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado." });
            }

            return res.json({
                sucesso: true,
                mensagem: novoStatus === 1 ? "Item marcado como DISPONÍVEL." : "Item marcado como ESGOTADO.",
                disponivel: novoStatus
            });
        } catch (erro) {
            console.error("Erro ao alternar status do item:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao alternar disponibilidade do item."
            });
        }
    },

    // Excluir item (admin/owner)
    async excluir(req, res) {
        try {
            const id = req.params.id;
            const excluido = await cardapioModel.excluir(id);
            if (!excluido) {
                return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado para exclusão." });
            }

            return res.json({
                sucesso: true,
                mensagem: "Item removido do cardápio com sucesso!"
            });
        } catch (erro) {
            console.error("Erro ao excluir item do cardápio:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir item."
            });
        }
    },

    // Listar categorias distintas
    async listarCategorias(req, res) {
        try {
            const categorias = await cardapioModel.listarCategorias();
            return res.json({ sucesso: true, categorias });
        } catch (erro) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar categorias." });
        }
    },

    // Obter estatísticas para os cards
    async obterEstatisticas(req, res) {
        try {
            const stats = await cardapioModel.obterEstatisticas();
            return res.json({ sucesso: true, estatisticas: stats });
        } catch (erro) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar estatísticas." });
        }
    }
};

module.exports = cardapioController;
