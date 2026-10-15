const pool = require("../config/database");

const orquestraModel = {
    // Garante que as tabelas orquestra_conteudo e orquestra_video existam e tenham dados padrão
    async garantirTabela() {
        try {
            // 1. Tabela de Conteúdo Geral da Página
            await pool.query(`
                CREATE TABLE IF NOT EXISTS orquestra_conteudo (
                    id_conteudo INT PRIMARY KEY AUTO_INCREMENT,
                    titulo VARCHAR(150) NOT NULL DEFAULT 'ORQUESTRA BRAVO TATUÍ',
                    subtitulo VARCHAR(255) DEFAULT 'A excelência da música sinfônica e a formação de concerto na Capital da Música',
                    imagem_hero VARCHAR(500) DEFAULT '../images/orquestra/orquestra_hero.jpg',
                    legenda_hero VARCHAR(255) DEFAULT 'Nossa Orquestra em concerto no teatro da cidade',
                    historia_p1 TEXT,
                    historia_p2 TEXT,
                    ensaios VARCHAR(255) DEFAULT 'Sábados, das 14h às 17h',
                    participacao VARCHAR(255) DEFAULT 'Alunos e músicos da comunidade',
                    inscricoes VARCHAR(255) DEFAULT 'Abertas no início de cada semestre',
                    instrumentos VARCHAR(255) DEFAULT 'Cordas, Sopros e Percussão',
                    maestro_nome VARCHAR(150) DEFAULT 'Maestro Gabriel Lima',
                    maestro_cargo VARCHAR(150) DEFAULT 'O MAESTRO',
                    maestro_subtitulo VARCHAR(150) DEFAULT 'Regente Titular & Diretor Musical',
                    maestro_foto VARCHAR(500) DEFAULT '../images/orquestra/maestro.jpg',
                    maestro_bio TEXT,
                    youtube_url VARCHAR(500) DEFAULT 'https://www.youtube.com/@bravo_tatui',
                    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // 2. Tabela de Vídeos e Apresentações
            await pool.query(`
                CREATE TABLE IF NOT EXISTS orquestra_video (
                    id_video INT PRIMARY KEY AUTO_INCREMENT,
                    titulo VARCHAR(150) NOT NULL,
                    video_url VARCHAR(500) NOT NULL,
                    thumbnail_url VARCHAR(500) NULL,
                    data_apresentacao VARCHAR(100) NULL,
                    ordem INT DEFAULT 0,
                    ativo TINYINT(1) DEFAULT 1,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Verifica se orquestra_conteudo possui registro
            const [conteudos] = await pool.query("SELECT COUNT(*) AS total FROM orquestra_conteudo");
            if (conteudos[0].total === 0) {
                console.log("Inserindo conteúdo inicial da Orquestra Bravo Tatuí...");
                await pool.query(`
                    INSERT INTO orquestra_conteudo (
                        titulo, subtitulo, imagem_hero, legenda_hero,
                        historia_p1, historia_p2,
                        ensaios, participacao, inscricoes, instrumentos,
                        maestro_nome, maestro_cargo, maestro_subtitulo, maestro_foto, maestro_bio,
                        youtube_url
                    ) VALUES (
                        'ORQUESTRA BRAVO TATUÍ',
                        'A excelência da música sinfônica e a formação de concerto na Capital da Música',
                        '../images/orquestra/orquestra_hero.jpg',
                        'Nossa Orquestra em concerto no teatro da cidade',
                        'A Orquestra Bravo Tatuí viabiliza a formação e a evolução e a realização em harmonia no Instituto Musical Bravo Tatuí, e é a orquestra mais uma evolução musical a passo do encanto cultural e celeiro de música, como elemento-evolução no Instituto Musical Bravo Tatuí.',
                        'Nossa missão contemporânea abraça músicos com repertório ativo e sinfônico, a orquestra é de um orgulho imenso para quem ouve e um orgulho de fazer música na Capital da Música (Tatuí).',
                        'Sábados, das 14h às 17h',
                        'Alunos e músicos da comunidade',
                        'Abertas no início de cada semestre',
                        'Cordas, Sopros e Percussão',
                        'Maestro Gabriel Lima',
                        'O MAESTRO',
                        'Regente Titular & Diretor Musical',
                        '../images/orquestra/maestro.jpg',
                        'Maestro Gabriel Lima é um músico com expressiva trajetória na regência e formação orquestral. Com paixão pela música de concerto e realização no Instituto Musical Bravo Tatuí, lidera a orquestra unindo técnica, emoção e excelência artística na Capital da Música.',
                        'https://www.youtube.com/@bravo_tatui'
                    )
                `);
            }

            // Verifica se orquestra_video possui registros
            const [videos] = await pool.query("SELECT COUNT(*) AS total FROM orquestra_video");
            if (videos[0].total === 0) {
                console.log("Inserindo vídeos padrão da Orquestra Bravo Tatuí...");
                const videosIniciais = [
                    {
                        titulo: "Concerto de Primavera - 2025",
                        video_url: "https://www.youtube.com/embed/jfKfPfyJRdk",
                        thumbnail_url: "../images/orquestra/video1.jpg",
                        data_apresentacao: "Temporada 2025",
                        ordem: 1
                    },
                    {
                        titulo: "Apresentação Especial de Fim de Ano",
                        video_url: "https://www.youtube.com/embed/5qap5aO4i9A",
                        thumbnail_url: "../images/orquestra/video2.jpg",
                        data_apresentacao: "Gala de Dezembro",
                        ordem: 2
                    },
                    {
                        titulo: "Ensaio Geral Aberto",
                        video_url: "https://www.youtube.com/embed/kJQP7kiw5Fk",
                        thumbnail_url: "../images/orquestra/video3.jpg",
                        data_apresentacao: "Prática de Conjunto",
                        ordem: 3
                    }
                ];

                for (const v of videosIniciais) {
                    await pool.query(
                        `INSERT INTO orquestra_video (titulo, video_url, thumbnail_url, data_apresentacao, ordem, ativo) VALUES (?, ?, ?, ?, ?, 1)`,
                        [v.titulo, v.video_url, v.thumbnail_url, v.data_apresentacao, v.ordem]
                    );
                }
            }

            console.log("Tabelas da Orquestra inicializadas com sucesso!");
        } catch (erro) {
            console.error("Erro ao inicializar tabelas da Orquestra:", erro);
        }
    },

    // Retorna o conteúdo geral da página
    async obterConteudo() {
        try {
            const [linhas] = await pool.query("SELECT * FROM orquestra_conteudo ORDER BY id_conteudo ASC LIMIT 1");
            return linhas[0] || null;
        } catch (erro) {
            console.error("Erro ao obter conteúdo da orquestra:", erro);
            throw erro;
        }
    },

    // Atualiza o conteúdo geral da página
    async atualizarConteudo(dados) {
        try {
            const campos = [];
            const valores = [];

            const camposPermitidos = [
                "titulo", "subtitulo", "imagem_hero", "legenda_hero",
                "historia_p1", "historia_p2",
                "ensaios", "participacao", "inscricoes", "instrumentos",
                "maestro_nome", "maestro_cargo", "maestro_subtitulo", "maestro_foto", "maestro_bio",
                "youtube_url"
            ];

            for (const c of camposPermitidos) {
                if (dados[c] !== undefined) {
                    campos.push(`${c} = ?`);
                    valores.push(dados[c]);
                }
            }

            if (campos.length === 0) return true;

            const sql = `UPDATE orquestra_conteudo SET ${campos.join(", ")} ORDER BY id_conteudo ASC LIMIT 1`;
            await pool.query(sql, valores);
            return true;
        } catch (erro) {
            console.error("Erro ao atualizar conteúdo da orquestra:", erro);
            throw erro;
        }
    },

    // Listar todos os vídeos
    async listarVideos(apenasAtivos = false) {
        try {
            const condicao = apenasAtivos ? "WHERE ativo = 1" : "";
            const [linhas] = await pool.query(`SELECT * FROM orquestra_video ${condicao} ORDER BY ordem ASC, id_video DESC`);
            return linhas;
        } catch (erro) {
            console.error("Erro ao listar vídeos da orquestra:", erro);
            throw erro;
        }
    },

    // Obter vídeo por ID
    async obterVideoPorId(id_video) {
        try {
            const [linhas] = await pool.query("SELECT * FROM orquestra_video WHERE id_video = ?", [id_video]);
            return linhas[0] || null;
        } catch (erro) {
            console.error("Erro ao obter vídeo da orquestra:", erro);
            throw erro;
        }
    },

    // Criar novo vídeo
    async criarVideo(dados) {
        try {
            const { titulo, video_url, thumbnail_url, data_apresentacao, ordem } = dados;
            const [resultado] = await pool.query(
                `INSERT INTO orquestra_video (titulo, video_url, thumbnail_url, data_apresentacao, ordem, ativo) VALUES (?, ?, ?, ?, ?, 1)`,
                [titulo, video_url, thumbnail_url || "", data_apresentacao || "", ordem || 0]
            );
            return resultado.insertId;
        } catch (erro) {
            console.error("Erro ao criar vídeo da orquestra:", erro);
            throw erro;
        }
    },

    // Atualizar vídeo existente
    async atualizarVideo(id_video, dados) {
        try {
            const campos = [];
            const valores = [];

            const camposPermitidos = ["titulo", "video_url", "thumbnail_url", "data_apresentacao", "ordem", "ativo"];
            for (const c of camposPermitidos) {
                if (dados[c] !== undefined) {
                    campos.push(`${c} = ?`);
                    valores.push(dados[c]);
                }
            }

            if (campos.length === 0) return true;

            valores.push(id_video);
            const sql = `UPDATE orquestra_video SET ${campos.join(", ")} WHERE id_video = ?`;
            await pool.query(sql, valores);
            return true;
        } catch (erro) {
            console.error("Erro ao atualizar vídeo da orquestra:", erro);
            throw erro;
        }
    },

    // Excluir vídeo
    async excluirVideo(id_video) {
        try {
            await pool.query("DELETE FROM orquestra_video WHERE id_video = ?", [id_video]);
            return true;
        } catch (erro) {
            console.error("Erro ao excluir vídeo da orquestra:", erro);
            throw erro;
        }
    }
};

module.exports = orquestraModel;
