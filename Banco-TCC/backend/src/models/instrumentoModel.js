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
                    icone VARCHAR(50) DEFAULT '🎻',
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

            // Verifica se a tabela já possui instrumentos cadastrados
            const [linhas] = await pool.query("SELECT COUNT(*) AS total FROM instrumento");
            if (linhas[0].total === 0) {
                console.log("🎻 Tabela de instrumentos vazia. Inserindo instrumentos padrão do Instituto Bravo...");
                const instrumentosIniciais = [
                    {
                        nome: "Piano",
                        categoria: "Teclas & Harmonia",
                        icone: "🎹",
                        imagem_url: "https://images.unsplash.com/photo-1520523839898-50712825e617?w=600&auto=format&fit=crop&q=80",
                        descricao: "O piano é um instrumento de teclado fascinante e completo, essencial para o desenvolvimento da percepção harmônica e rítmica. No IMBT, oferecemos formação completa desde os primeiros acordes até a técnica avançada clássica e popular.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 1
                    },
                    {
                        nome: "Violino",
                        categoria: "Cordas de Arco & Harpa",
                        icone: "🎻",
                        imagem_url: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80",
                        descricao: "O violino é o líder melódico da família das cordas, dono de um timbre aveludado, expressivo e brilhante. Nossos professores trabalham postura, afinação pura, técnica de arco e repertório clássico e contemporâneo.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 2
                    },
                    {
                        nome: "Violoncelo",
                        categoria: "Cordas de Arco & Harpa",
                        icone: "🎻",
                        imagem_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
                        descricao: "Com graves profundos e ressonância emocional incomparável, o violoncelo emociona pela sua semelhança com a voz humana. Aulas com metodologia direcionada à afinação, leitura musical e prática de câmara.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 3
                    },
                    {
                        nome: "Viola de Arco",
                        categoria: "Cordas de Arco & Harpa",
                        icone: "🎻",
                        imagem_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
                        descricao: "A alma intermediária do quarteto de cordas. Possui timbre nobre, caloroso e levemente nostálgico, fundamental para orquestras e música de câmara.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 4
                    },
                    {
                        nome: "Contrabaixo Acústico",
                        categoria: "Cordas de Arco & Harpa",
                        icone: "🎻",
                        imagem_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                        descricao: "O gigante das cordas acústicas. Fornece sustentação harmônica e condução rítmica tanto na música sinfônica quanto no jazz e na MPB.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 5
                    },
                    {
                        nome: "Harpa Clássica",
                        categoria: "Cordas de Arco & Harpa",
                        icone: "🪕",
                        imagem_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
                        descricao: "Instrumento nobre de som celestial e etéreo. Ideal para cortejos de casamento de alto luxo e formações sinfônicas exclusivas.",
                        disponivel_aulas: 0,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 6
                    },
                    {
                        nome: "Flauta Transversal",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎶",
                        imagem_url: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&auto=format&fit=crop&q=80",
                        descricao: "Instrumento de sopro de sonoridade lírica, doce e ágil. Desenvolve o controle de respiração, embocadura e expressividade melódica.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 7
                    },
                    {
                        nome: "Saxofone",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎷",
                        imagem_url: "https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&auto=format&fit=crop&q=80",
                        descricao: "Extremamente versátil, o saxofone brilha no jazz, no pop, na música clássica e em celebrações ao ar livre com solos cativantes e envolventes.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 8
                    },
                    {
                        nome: "Clarinete",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎶",
                        imagem_url: "https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=600&auto=format&fit=crop&q=80",
                        descricao: "Com uma das maiores extensões de notas entre os instrumentos de sopro, o clarinete entrega desde graves aveludados até agudos cheios de brilho.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 9
                    },
                    {
                        nome: "Trompete",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎺",
                        imagem_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
                        descricao: "O brilho triunfal da família dos metais. Ideal para fanfarras de casamento, marchas clássicas solenes e solos vibrantes.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 10
                    },
                    {
                        nome: "Clarim Triunfal",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎺",
                        imagem_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
                        descricao: "Clarim heráldico com estandarte bordado exclusivo, usado para o anúncio triunfal da noiva e cortejos majestosos.",
                        disponivel_aulas: 0,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 11
                    },
                    {
                        nome: "Trombone",
                        categoria: "Sopros (Metais & Madeiras)",
                        icone: "🎺",
                        imagem_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                        descricao: "Metal encorpado com mecanismo de vara característico, gerando harmonia nobre e sonoridade imponente em naipes de metais.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 12
                    },
                    {
                        nome: "Bateria Acústica",
                        categoria: "Percussão & Ritmo",
                        icone: "🥁",
                        imagem_url: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80",
                        descricao: "O coração rítmico da música contemporânea. Aulas focadas em coordenação motora, precisão de tempo, grooves e dinâmica musical.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 13
                    },
                    {
                        nome: "Percussão Sinfônica",
                        categoria: "Percussão & Ritmo",
                        icone: "🥁",
                        imagem_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
                        descricao: "Tímpanos, pratos de choque, sinos tubulares e percussão orquestral clássica para os momentos mais solenes e apoteóticos.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 14
                    },
                    {
                        nome: "Cajon / Percussão Leve",
                        categoria: "Percussão & Ritmo",
                        icone: "📦",
                        imagem_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
                        descricao: "Praticidade e groove acústico caloroso. Ideal para eventos acústicos, casamentos no campo e apresentações intimistas.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 15
                    },
                    {
                        nome: "Violão Acústico / Folk",
                        categoria: "Teclas & Harmonia",
                        icone: "🎸",
                        imagem_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
                        descricao: "O instrumento mais popular e acolhedor do Brasil e do mundo. Ensino completo de dedilhados, acordes, técnica clássica e popular.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 16
                    },
                    {
                        nome: "Guitarra Semi-Acústica",
                        categoria: "Teclas & Harmonia",
                        icone: "🎸",
                        imagem_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
                        descricao: "Timbre encorpado e refinado, perfeito para arranjos de jazz, blues, bossa nova e baladas românticas contemporâneas.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 17
                    },
                    {
                        nome: "Acordeon",
                        categoria: "Teclas & Harmonia",
                        icone: "🪗",
                        imagem_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
                        descricao: "Fole expressivo e riqueza harmônica única. Tradicional em celebrações rústicas, casamento no campo e folclore sofisticado.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 18
                    },
                    {
                        nome: "Ukulelê",
                        categoria: "Teclas & Harmonia",
                        icone: "🪕",
                        imagem_url: "https://images.unsplash.com/photo-1445375011782-238468d778a0?w=600&auto=format&fit=crop&q=80",
                        descricao: "Leveza havaiana e charme descontraído para casamentos na praia, cerimônias diurnas e repertório folk ensolarado.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 19
                    },
                    {
                        nome: "Voz Solista Feminina",
                        categoria: "Vozes & Coral",
                        icone: "🎤",
                        imagem_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
                        descricao: "Interpretação lírica e popular de alta sensibilidade para temas inesquecíveis, hinos e canções de amor.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 20
                    },
                    {
                        nome: "Voz Solista Masculina",
                        categoria: "Vozes & Coral",
                        icone: "🎤",
                        imagem_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                        descricao: "Potência e elegância vocal em árias, clássicos românticos internacionais e canções solenes.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 21
                    },
                    {
                        nome: "Coral / Quarteto Vocal",
                        categoria: "Vozes & Coral",
                        icone: "👥",
                        imagem_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
                        descricao: "Harmonia vocal a quatro vozes para cerimônias de máxima magnitude e solenidade em catedrais e igrejas.",
                        disponivel_aulas: 1,
                        disponivel_eventos: 1,
                        ativo: 1,
                        ordem: 22
                    }
                ];

                for (const inst of instrumentosIniciais) {
                    await pool.query(
                        `INSERT INTO instrumento (nome, categoria, icone, imagem_url, descricao, disponivel_aulas, disponivel_eventos, ativo, ordem)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
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
                console.log(`✅ ${instrumentosIniciais.length} instrumentos inseridos com sucesso.`);
            }
        } catch (erro) {
            console.error("⚠️ Erro ao garantir tabela de instrumentos:", erro.message);
        }
    },

    // Listar todos com filtros flexíveis
    async listarTodos(filtros = {}) {
        try {
            let sql = "SELECT * FROM instrumento WHERE 1=1";
            const params = [];

            if (filtros.ativo !== undefined) {
                sql += " AND ativo = ?";
                params.push(Number(filtros.ativo));
            }

            if (filtros.categoria && filtros.categoria !== "todas") {
                sql += " AND categoria = ?";
                params.push(filtros.categoria);
            }

            if (filtros.aulas !== undefined) {
                sql += " AND disponivel_aulas = ?";
                params.push(Number(filtros.aulas));
            }

            if (filtros.eventos !== undefined) {
                sql += " AND disponivel_eventos = ?";
                params.push(Number(filtros.eventos));
            }

            if (filtros.busca) {
                sql += " AND (nome LIKE ? OR descricao LIKE ? OR categoria LIKE ?)";
                const termo = `%${filtros.busca}%`;
                params.push(termo, termo, termo);
            }

            sql += " ORDER BY ordem ASC, id_instrumento ASC";

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
            const [linhas] = await pool.query("SELECT * FROM instrumento WHERE id_instrumento = ?", [id]);
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
                dados.icone || "🎻",
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
