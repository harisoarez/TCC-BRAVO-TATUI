const instrumentoModel = require("../models/instrumentoModel");
const path = require("path");
const fs = require("fs");

const instrumentoController = {
    // GET /api/instrumentos
    async listar(req, res) {
        try {
            const { categoria, busca, aulas, eventos, ativo } = req.query;
            const filtros = {};

            if (categoria) filtros.categoria = categoria;
            if (busca) filtros.busca = busca;
            if (aulas !== undefined) filtros.aulas = aulas;
            if (eventos !== undefined) filtros.eventos = eventos;
            if (ativo !== undefined) filtros.ativo = ativo;

            const instrumentos = await instrumentoModel.listarTodos(filtros);
            return res.json({
                sucesso: true,
                total: instrumentos.length,
                dados: instrumentos
            });
        } catch (erro) {
            console.error("Erro no controller listar instrumentos:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar instrumentos musicais."
            });
        }
    },

    // GET /api/instrumentos/:id
    async obterPorId(req, res) {
        try {
            const { id } = req.params;
            const instrumento = await instrumentoModel.buscarPorId(id);

            if (!instrumento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Instrumento não encontrado."
                });
            }

            return res.json({
                sucesso: true,
                dados: instrumento
            });
        } catch (erro) {
            console.error(`Erro ao buscar instrumento ${req.params.id}:`, erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao consultar dados do instrumento."
            });
        }
    },

    // GET /api/instrumentos/categorias
    async listarCategorias(req, res) {
        try {
            const categorias = await instrumentoModel.listarCategorias();
            return res.json({
                sucesso: true,
                dados: categorias
            });
        } catch (erro) {
            console.error("Erro ao listar categorias de instrumentos:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar categorias de instrumentos."
            });
        }
    },

    // GET /api/instrumentos/estatisticas
    async obterEstatisticas(req, res) {
        try {
            const stats = await instrumentoModel.obterEstatisticas();
            return res.json({
                sucesso: true,
                dados: stats
            });
        } catch (erro) {
            console.error("Erro ao obter estatísticas:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao consultar métricas de instrumentos."
            });
        }
    },

    // POST /api/instrumentos
    async criar(req, res) {
        try {
            const {
                nome,
                categoria,
                icone,
                descricao,
                disponivel_aulas,
                disponivel_eventos,
                ativo,
                ordem,
                imagem_url
            } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O nome do instrumento é obrigatório."
                });
            }

            let imagemFinal = imagem_url ? imagem_url.trim() : null;
            if (req.file) {
                imagemFinal = `/uploads/instrumentos/${req.file.filename}`;
            }

            const novoId = await instrumentoModel.criar({
                nome: nome.trim(),
                categoria: categoria ? categoria.trim() : "Teclas & Harmonia",
                icone: icone ? icone.trim() : "🎻",
                descricao: descricao ? descricao.trim() : "",
                disponivel_aulas: disponivel_aulas !== undefined ? (disponivel_aulas === "1" || disponivel_aulas === 1 || disponivel_aulas === true || disponivel_aulas === "on" ? 1 : 0) : 1,
                disponivel_eventos: disponivel_eventos !== undefined ? (disponivel_eventos === "1" || disponivel_eventos === 1 || disponivel_eventos === true || disponivel_eventos === "on" ? 1 : 0) : 1,
                ativo: ativo !== undefined ? (ativo === "1" || ativo === 1 || ativo === true || ativo === "on" ? 1 : 0) : 1,
                ordem: ordem ? Number(ordem) : 0,
                imagem_url: imagemFinal
            });

            const instrumentoCriado = await instrumentoModel.buscarPorId(novoId);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Instrumento cadastrado com sucesso!",
                dados: instrumentoCriado
            });
        } catch (erro) {
            console.error("Erro ao criar instrumento:", erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar instrumento musical."
            });
        }
    },

    // PUT /api/instrumentos/:id
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const instrumentoAtual = await instrumentoModel.buscarPorId(id);

            if (!instrumentoAtual) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Instrumento não encontrado para atualização."
                });
            }

            const {
                nome,
                categoria,
                icone,
                descricao,
                disponivel_aulas,
                disponivel_eventos,
                ativo,
                ordem,
                imagem_url
            } = req.body;

            let imagemFinal = instrumentoAtual.imagem_url;
            if (req.file) {
                imagemFinal = `/uploads/instrumentos/${req.file.filename}`;
            } else if (imagem_url !== undefined && imagem_url.trim()) {
                imagemFinal = imagem_url.trim();
            }

            await instrumentoModel.atualizar(id, {
                nome: nome ? nome.trim() : instrumentoAtual.nome,
                categoria: categoria ? categoria.trim() : instrumentoAtual.categoria,
                icone: icone ? icone.trim() : instrumentoAtual.icone,
                descricao: descricao !== undefined ? descricao.trim() : instrumentoAtual.descricao,
                disponivel_aulas: disponivel_aulas !== undefined ? (disponivel_aulas === "1" || disponivel_aulas === 1 || disponivel_aulas === true || disponivel_aulas === "on" ? 1 : 0) : instrumentoAtual.disponivel_aulas,
                disponivel_eventos: disponivel_eventos !== undefined ? (disponivel_eventos === "1" || disponivel_eventos === 1 || disponivel_eventos === true || disponivel_eventos === "on" ? 1 : 0) : instrumentoAtual.disponivel_eventos,
                ativo: ativo !== undefined ? (ativo === "1" || ativo === 1 || ativo === true || ativo === "on" ? 1 : 0) : instrumentoAtual.ativo,
                ordem: ordem !== undefined ? Number(ordem) : instrumentoAtual.ordem,
                imagem_url: imagemFinal
            });

            const instrumentoAtualizado = await instrumentoModel.buscarPorId(id);

            return res.json({
                sucesso: true,
                mensagem: "Instrumento atualizado com sucesso!",
                dados: instrumentoAtualizado
            });
        } catch (erro) {
            console.error(`Erro ao atualizar instrumento ${req.params.id}:`, erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar instrumento musical."
            });
        }
    },

    // PATCH /api/instrumentos/:id/status
    async alternarStatus(req, res) {
        try {
            const { id } = req.params;
            const { campo } = req.body; // 'ativo', 'disponivel_aulas', 'disponivel_eventos'

            const instrumento = await instrumentoModel.buscarPorId(id);
            if (!instrumento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Instrumento não encontrado."
                });
            }

            const campoFinal = campo || "ativo";
            await instrumentoModel.alternarStatus(id, campoFinal);
            const atualizado = await instrumentoModel.buscarPorId(id);

            return res.json({
                sucesso: true,
                mensagem: `Status de ${campoFinal} alterado com sucesso!`,
                dados: atualizado
            });
        } catch (erro) {
            console.error(`Erro ao alternar status do instrumento ${req.params.id}:`, erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao alterar status do instrumento."
            });
        }
    },

    // DELETE /api/instrumentos/:id
    async excluir(req, res) {
        try {
            const { id } = req.params;
            const instrumento = await instrumentoModel.buscarPorId(id);

            if (!instrumento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Instrumento não encontrado para exclusão."
                });
            }

            await instrumentoModel.excluir(id);

            return res.json({
                sucesso: true,
                mensagem: `O instrumento '${instrumento.nome}' foi removido com sucesso.`
            });
        } catch (erro) {
            console.error(`Erro ao excluir instrumento ${req.params.id}:`, erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir instrumento musical."
            });
        }
    }
};

module.exports = instrumentoController;
