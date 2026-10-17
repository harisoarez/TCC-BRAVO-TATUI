const pool = require("../config/database");

const instrumentoModel = {
    // Garante que a tabela exista e tenha itens padrão iniciais
    async garantirTabela() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS instrumento (
                    id_instrumento INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(100) NOT NULL,
                    categoria VARCHAR(60) NOT NULL,
                    icone VARCHAR(50) DEFAULT '',
                    imagem_url VARCHAR(500) NULL,
                    descricao TEXT,
                    disponivel_aulas TINYINT(1) DEFAULT 1,
                    disponivel_eventos TINYINT(1) DEFAULT 1,
                    ativo TINYINT(1) DEFAULT 1,
                    ordem INT DEFAULT 0,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Verifica se a tabela já possui instrumentos cadastrados ou se possui dados legados
            const [linhas] = await pool.query("SELECT COUNT(*) AS total FROM instrumento");
            const [temLegados] = await pool.query("SELECT COUNT(*) AS total FROM instrumento WHERE nome IN ('Harpa Clássica', 'Clarim Triunfal', 'Ukulelê', 'Acordeon', 'Cajon / Percussão Leve')");

            const precisaSincronizar = (linhas[0].total === 0 || (temLegados[0] && temLegados[0].total > 0));

            if (precisaSincronizar) {
                console.log("Sincronizando tabela de instrumentos com os 10 instrumentos da página oficial...");
                const { instrumentosOficiais } = require("../utils/sincronizarInstrumentos");

                await pool.query("DELETE FROM instrumento");
                await pool.query("ALTER TABLE instrumento AUTO_INCREMENT = 1");

                for (const inst of instrumentosOficiais) {
                    await pool.query(
                        `INSERT INTO instrumento (id_instrumento, nome, categoria, icone, imagem_url, descricao, disponivel_aulas, disponivel_eventos, ativo, ordem)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            inst.id_instrumento,
                            inst.nome,
                            inst.categoria,
                            inst.icone,
                            inst.imagem_url,
                            inst.descricao,
                            inst.disponivel_aulas,
                            inst.disponivel_eventos,
                            inst.ativo,
                            inst.ordem
                        ]
                    );
                }
                console.log(`Catálogo sincronizado com sucesso: exatamente ${instrumentosOficiais.length} instrumentos.`);
            }
        } catch (erro) {
            console.error("Erro ao garantir tabela de instrumentos:", erro.message);
        }
    },

    // Listar todos com filtros flexíveis
    async listarTodos(filtros = {}) {
        try {
            let sql = `
                SELECT i.*,
                       COALESCE(
                           (SELECT MIN(c.valor_mensalidade) 
                              FROM curso_mensalidade c 
                             WHERE c.ativo = 1 
                               AND (LOWER(TRIM(i.nome)) LIKE CONCAT('%', LOWER(TRIM(c.nome)), '%')
                                 OR LOWER(TRIM(c.nome)) LIKE CONCAT('%', LOWER(TRIM(i.nome)), '%'))),
                           CASE 
                               WHEN i.nome LIKE '%Piano%' THEN 225
                               WHEN i.nome LIKE '%Violino%' THEN 195
                               WHEN i.nome LIKE '%Violoncelo%' THEN 195
                               WHEN i.nome LIKE '%Viola%' THEN 195
                               WHEN i.nome LIKE '%Contrabaixo%' THEN 195
                               WHEN i.nome LIKE '%Flauta%' THEN 180
                               WHEN i.nome LIKE '%Saxofone%' THEN 195
                               WHEN i.nome LIKE '%Clarinete%' THEN 185
                               WHEN i.nome LIKE '%Trompete%' THEN 195
                               WHEN i.nome LIKE '%Trombone%' THEN 195
                               WHEN i.nome LIKE '%Violão%' THEN 180
                               WHEN i.nome LIKE '%Guitarra%' THEN 195
                               WHEN i.nome LIKE '%Acordeon%' THEN 195
                               WHEN i.nome LIKE '%Ukulelê%' THEN 180
                               WHEN i.nome LIKE '%Voz%' OR i.nome LIKE '%Canto%' THEN 220
                               WHEN i.nome LIKE '%Percussão%' OR i.nome LIKE '%Cajon%' THEN 180
                               WHEN i.nome LIKE '%Bateria%' THEN 220
                               ELSE 190
                           END
                       ) AS valor_mensalidade
                  FROM instrumento i
                 WHERE 1=1
            `;
            const params = [];

            if (filtros.ativo !== undefined) {
                sql += " AND i.ativo = ?";
                params.push(Number(filtros.ativo));
            }

            if (filtros.categoria && filtros.categoria !== "todas") {
                sql += " AND i.categoria = ?";
                params.push(filtros.categoria);
            }

            if (filtros.aulas !== undefined) {
                sql += " AND i.disponivel_aulas = ?";
                params.push(Number(filtros.aulas));
            }

            if (filtros.eventos !== undefined) {
                sql += " AND i.disponivel_eventos = ?";
                params.push(Number(filtros.eventos));
            }

            if (filtros.busca) {
                sql += " AND (i.nome LIKE ? OR i.descricao LIKE ? OR i.categoria LIKE ?)";
                const termo = `%${filtros.busca}%`;
                params.push(termo, termo, termo);
            }

            sql += " ORDER BY i.ordem ASC, i.id_instrumento ASC";

            const [linhas] = await pool.query(sql, params);
            return linhas;
        } catch (erro) {
            console.error("Erro ao listar instrumentos no banco:", erro.message);
            return [];
        }
    },

    // Buscar instrumento por ID
    async buscarPorId(id) {
        try {
            const sql = `
                SELECT i.*,
                       COALESCE(
                           (SELECT MIN(c.valor_mensalidade) 
                              FROM curso_mensalidade c 
                             WHERE c.ativo = 1 
                               AND (LOWER(TRIM(i.nome)) LIKE CONCAT('%', LOWER(TRIM(c.nome)), '%')
                                 OR LOWER(TRIM(c.nome)) LIKE CONCAT('%', LOWER(TRIM(i.nome)), '%'))),
                           195
                       ) AS valor_mensalidade
                  FROM instrumento i
                 WHERE i.id_instrumento = ?
            `;
            const [linhas] = await pool.query(sql, [id]);
            return linhas[0] || null;
        } catch (erro) {
            console.error(`Erro ao buscar instrumento com ID ${id}:`, erro.message);
            return null;
        }
    },

    // Criar novo instrumento
    async criar(dados) {
        try {
            const sql = `
                INSERT INTO instrumento (nome, categoria, icone, imagem_url, descricao, disponivel_aulas, disponivel_eventos, ativo, ordem)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                dados.nome,
                dados.categoria || "Geral",
                dados.icone || "",
                dados.imagem_url || null,
                dados.descricao || "",
                dados.disponivel_aulas !== undefined ? Number(dados.disponivel_aulas) : 1,
                dados.disponivel_eventos !== undefined ? Number(dados.disponivel_eventos) : 1,
                dados.ativo !== undefined ? Number(dados.ativo) : 1,
                dados.ordem !== undefined ? Number(dados.ordem) : 0
            ];

            const [resultado] = await pool.query(sql, params);
            return resultado.insertId;
        } catch (erro) {
            console.error("Erro ao criar instrumento:", erro.message);
            throw erro;
        }
    },

    // Atualizar instrumento existente
    async atualizar(id, dados) {
        try {
            const campos = [];
            const params = [];

            if (dados.nome !== undefined) {
                campos.push("nome = ?");
                params.push(dados.nome);
            }
            if (dados.categoria !== undefined) {
                campos.push("categoria = ?");
                params.push(dados.categoria);
            }
            if (dados.icone !== undefined) {
                campos.push("icone = ?");
                params.push(dados.icone);
            }
            if (dados.imagem_url !== undefined) {
                campos.push("imagem_url = ?");
                params.push(dados.imagem_url);
            }
            if (dados.descricao !== undefined) {
                campos.push("descricao = ?");
                params.push(dados.descricao);
            }
            if (dados.disponivel_aulas !== undefined) {
                campos.push("disponivel_aulas = ?");
                params.push(Number(dados.disponivel_aulas));
            }
            if (dados.disponivel_eventos !== undefined) {
                campos.push("disponivel_eventos = ?");
                params.push(Number(dados.disponivel_eventos));
            }
            if (dados.ativo !== undefined) {
                campos.push("ativo = ?");
                params.push(Number(dados.ativo));
            }
            if (dados.ordem !== undefined) {
                campos.push("ordem = ?");
                params.push(Number(dados.ordem));
            }

            if (campos.length === 0) return true;

            const sql = `UPDATE instrumento SET ${campos.join(", ")} WHERE id_instrumento = ?`;
            params.push(id);

            const [resultado] = await pool.query(sql, params);
            return resultado.affectedRows > 0;
        } catch (erro) {
            console.error(`Erro ao atualizar instrumento ${id}:`, erro.message);
            throw erro;
        }
    },

    // Alternar status (ativo, aulas, eventos)
    async alternarStatus(id, campo = "ativo") {
        try {
            const camposPermitidos = ["ativo", "disponivel_aulas", "disponivel_eventos"];
            if (!camposPermitidos.includes(campo)) {
                throw new Error("Campo inválido para alternância de status.");
            }

            const sql = `UPDATE instrumento SET ${campo} = IF(${campo} = 1, 0, 1) WHERE id_instrumento = ?`;
            const [resultado] = await pool.query(sql, [id]);
            return resultado.affectedRows > 0;
        } catch (erro) {
            console.error(`Erro ao alternar ${campo} do instrumento ${id}:`, erro.message);
            throw erro;
        }
    },

    // Excluir instrumento
    async excluir(id) {
        try {
            const [resultado] = await pool.query("DELETE FROM instrumento WHERE id_instrumento = ?", [id]);
            return resultado.affectedRows > 0;
        } catch (erro) {
            console.error(`Erro ao excluir instrumento ${id}:`, erro.message);
            throw erro;
        }
    },

    // Listar categorias distintas cadastradas
    async listarCategorias() {
        try {
            const [linhas] = await pool.query("SELECT DISTINCT categoria FROM instrumento ORDER BY categoria ASC");
            return linhas.map(l => l.categoria);
        } catch (erro) {
            console.error("Erro ao listar categorias de instrumentos:", erro.message);
            return ["Cordas de Arco & Harpa", "Teclas & Harmonia", "Sopros (Metais & Madeiras)", "Percussão & Ritmo", "Vozes & Coral"];
        }
    },

    // Estatísticas para o Dashboard Administrativo
    async obterEstatisticas() {
        try {
            const [linhasTotal] = await pool.query("SELECT COUNT(*) AS total FROM instrumento");
            const [linhasAulas] = await pool.query("SELECT COUNT(*) AS total FROM instrumento WHERE disponivel_aulas = 1 AND ativo = 1");
            const [linhasEventos] = await pool.query("SELECT COUNT(*) AS total FROM instrumento WHERE disponivel_eventos = 1 AND ativo = 1");
            const [linhasCategorias] = await pool.query("SELECT COUNT(DISTINCT categoria) AS total FROM instrumento");

            return {
                totalGeral: linhasTotal[0]?.total || 0,
                totalAulas: linhasAulas[0]?.total || 0,
                totalEventos: linhasEventos[0]?.total || 0,
                totalCategorias: linhasCategorias[0]?.total || 0,
            };
        } catch (erro) {
            console.error("Erro ao obter estatísticas de instrumentos:", erro.message);
            return {
                totalGeral: 0,
                totalAulas: 0,
                totalEventos: 0,
                totalCategorias: 0,
            };
        }
    }
};

module.exports = instrumentoModel;
