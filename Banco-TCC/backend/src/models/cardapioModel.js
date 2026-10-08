const pool = require("../config/database");

const cardapioModel = {
    // Garante que a tabela exista e tenha itens padrão iniciais
    async garantirTabela() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS cardapio_item (
                    id_item INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(100) NOT NULL,
                    descricao TEXT,
                    preco DECIMAL(10,2) NOT NULL,
                    categoria VARCHAR(50) NOT NULL,
                    imagem_url VARCHAR(500) NULL,
                    disponivel TINYINT(1) DEFAULT 1,
                    destaque TINYINT(1) DEFAULT 0,
                    ordem INT DEFAULT 0,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Verifica se a tabela já possui itens cadastrados
            const [linhas] = await pool.query("SELECT COUNT(*) AS total FROM cardapio_item");
            if (linhas[0].total === 0) {
                console.log("☕ Cardápio vazio. Inserindo itens iniciais do Coffee Bravo...");
                const itensIniciais = [
                    {
                        nome: "Café Espresso Bravo",
                        descricao: "Grãos selecionados 100% Arábica, torra média, notas marcantes de cacau e caramelo.",
                        preco: 7.50,
                        categoria: "Cafés",
                        imagem_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 1
                    },
                    {
                        nome: "Cappuccino Italiano Especial",
                        descricao: "Espresso duplo, leite vaporizado aveludado, toque de cacau 70% e leve canela aromática.",
                        preco: 12.00,
                        categoria: "Cafés",
                        imagem_url: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 2
                    },
                    {
                        nome: "Latte Macchiato Cremoso",
                        descricao: "Leite vaporizado aveludado com uma generosa dose de café espresso extraído na hora.",
                        preco: 11.50,
                        categoria: "Cafés",
                        imagem_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 3
                    },
                    {
                        nome: "Mocha Bravo Belga",
                        descricao: "Espresso encorpado, calda artesanal de chocolate belga meio amargo e chantilly da casa.",
                        preco: 15.00,
                        categoria: "Cafés",
                        imagem_url: "https://images.unsplash.com/photo-1578314670553-3335bc858485?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 4
                    },
                    {
                        nome: "Cold Brew Cítrico Refrescante",
                        descricao: "Infusão a frio por 18 horas, servido com gelo cristalino, rodela de laranja e xarope suave.",
                        preco: 14.00,
                        categoria: "Bebidas Geladas",
                        imagem_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 5
                    },
                    {
                        nome: "Frappé de Doce de Leite & Café",
                        descricao: "Bebida gelada batida com espresso duplo, doce de leite artesanal, gelo e cobertura de chantilly.",
                        preco: 16.50,
                        categoria: "Bebidas Geladas",
                        imagem_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 6
                    },
                    {
                        nome: "Soda Italiana de Frutas Vermelhas",
                        descricao: "Água gaseificada com xarope natural de amora e framboesa, finalizada com folhas de hortelã fresca.",
                        preco: 12.00,
                        categoria: "Bebidas Geladas",
                        imagem_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 7
                    },
                    {
                        nome: "Pão de Queijo Mineiro da Casa",
                        descricao: "Receita artesanal com legítimo queijo Canastra meia cura, crocante por fora e macio por dentro.",
                        preco: 6.50,
                        categoria: "Salgados & Lanches",
                        imagem_url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 8
                    },
                    {
                        nome: "Croissant Folhado Francês",
                        descricao: "Massa amanteigada puríssima de fermentação lenta, leve e ultra folhada. Acompanha geleia ou manteiga.",
                        preco: 11.00,
                        categoria: "Salgados & Lanches",
                        imagem_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 9
                    },
                    {
                        nome: "Quiche de Alho-Poró com Queijo Brie",
                        descricao: "Massa brisée dourada e crocante recheada com alho-poró salteado e fatias de queijo brie.",
                        preco: 16.50,
                        categoria: "Salgados & Lanches",
                        imagem_url: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 10
                    },
                    {
                        nome: "Toast de Avocado & Ovos Mexidos",
                        descricao: "Pão rústico de fermentação natural levain, abacate temperado, ovos caipiras mexidos cremosos.",
                        preco: 19.00,
                        categoria: "Salgados & Lanches",
                        imagem_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 11
                    },
                    {
                        nome: "Cheesecake de Frutas Vermelhas",
                        descricao: "Base de biscoito amanteigado, recheio sedoso de cream cheese e calda artesanal de morangos e mirtilos.",
                        preco: 17.00,
                        categoria: "Doces & Sobremesas",
                        imagem_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 12
                    },
                    {
                        nome: "Brownie Bravo com Sorvete",
                        descricao: "Brownie molhadinho de chocolate 70% com nozes, servido quentinho com sorvete de baunilha em fava.",
                        preco: 18.50,
                        categoria: "Doces & Sobremesas",
                        imagem_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 13
                    },
                    {
                        nome: "Cookie Gigante Triplo Chocolate",
                        descricao: "Assado diariamente na casa, crocante nas bordas e recheado de gotas de chocolate branco e ao leite.",
                        preco: 9.00,
                        categoria: "Doces & Sobremesas",
                        imagem_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 0,
                        ordem: 14
                    },
                    {
                        nome: "Combo Sol Maior",
                        descricao: "1 Café Espresso Bravo + 1 Pão de Queijo Mineiro Artesanal + 1 Brigadeiro Gourmet de Cacau.",
                        preco: 15.00,
                        categoria: "Combos",
                        imagem_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 15
                    },
                    {
                        nome: "Combo Sinfonia",
                        descricao: "1 Cappuccino Italiano Especial + 1 Croissant Folhado com Queijo Canastra e Peito de Peru.",
                        preco: 22.00,
                        categoria: "Combos",
                        imagem_url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
                        disponivel: 1,
                        destaque: 1,
                        ordem: 16
                    }
                ];

                for (const item of itensIniciais) {
                    await pool.query(
                        `INSERT INTO cardapio_item (nome, descricao, preco, categoria, imagem_url, disponivel, destaque, ordem)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [item.nome, item.descricao, item.preco, item.categoria, item.imagem_url, item.disponivel, item.destaque, item.ordem]
                    );
                }
                console.log("✓ Itens iniciais do Coffee Bravo inseridos com sucesso!");
            }
        } catch (erro) {
            console.error("Erro ao garantir tabela do cardápio:", erro);
        }
    },

    // Lista todos os itens com filtros opcionais
    async listarTodos({ categoria, apenasDisponiveis, busca, destaque } = {}) {
        let sql = "SELECT * FROM cardapio_item WHERE 1=1";
        const params = [];

        if (categoria && categoria !== "Todos") {
            sql += " AND categoria = ?";
            params.push(categoria);
        }

        if (apenasDisponiveis === true || apenasDisponiveis === "true" || apenasDisponiveis === 1 || apenasDisponiveis === "1") {
            sql += " AND disponivel = 1";
        }

        if (destaque === true || destaque === "true" || destaque === 1 || destaque === "1") {
            sql += " AND destaque = 1";
        }

        if (busca && busca.trim()) {
            sql += " AND (nome LIKE ? OR descricao LIKE ? OR categoria LIKE ?)";
            const termo = `%${busca.trim()}%`;
            params.push(termo, termo, termo);
        }

        sql += " ORDER BY ordem ASC, id_item ASC";

        const [linhas] = await pool.query(sql, params);
        return linhas;
    },

    // Busca um item por ID
    async buscarPorId(id) {
        const [linhas] = await pool.query("SELECT * FROM cardapio_item WHERE id_item = ?", [id]);
        return linhas[0] || null;
    },

    // Cria um novo item no cardápio
    async criar({ nome, descricao, preco, categoria, imagem_url, disponivel = 1, destaque = 0, ordem = 0 }) {
        const precoNumerico = parseFloat(preco) || 0.00;
        const [resultado] = await pool.query(
            `INSERT INTO cardapio_item (nome, descricao, preco, categoria, imagem_url, disponivel, destaque, ordem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                descricao ? descricao.trim() : "",
                precoNumerico,
                categoria ? categoria.trim() : "Outros",
                imagem_url ? imagem_url.trim() : null,
                disponivel ? 1 : 0,
                destaque ? 1 : 0,
                parseInt(ordem) || 0
            ]
        );
        return resultado.insertId;
    },

    // Atualiza um item existente
    async atualizar(id, { nome, descricao, preco, categoria, imagem_url, disponivel, destaque, ordem }) {
        const itemAtual = await this.buscarPorId(id);
        if (!itemAtual) return null;

        const nomeFinal = nome !== undefined ? nome.trim() : itemAtual.nome;
        const descricaoFinal = descricao !== undefined ? (descricao ? descricao.trim() : "") : itemAtual.descricao;
        const precoFinal = preco !== undefined ? parseFloat(preco) : itemAtual.preco;
        const categoriaFinal = categoria !== undefined ? categoria.trim() : itemAtual.categoria;
        const imagemFinal = imagem_url !== undefined ? imagem_url : itemAtual.imagem_url;
        const disponivelFinal = disponivel !== undefined ? (disponivel ? 1 : 0) : itemAtual.disponivel;
        const destaqueFinal = destaque !== undefined ? (destaque ? 1 : 0) : itemAtual.destaque;
        const ordemFinal = ordem !== undefined ? parseInt(ordem) : itemAtual.ordem;

        await pool.query(
            `UPDATE cardapio_item 
             SET nome = ?, descricao = ?, preco = ?, categoria = ?, imagem_url = ?, disponivel = ?, destaque = ?, ordem = ?
             WHERE id_item = ?`,
            [nomeFinal, descricaoFinal, precoFinal, categoriaFinal, imagemFinal, disponivelFinal, destaqueFinal, ordemFinal, id]
        );

        return await this.buscarPorId(id);
    },

    // Alterna status de disponibilidade (disponível / esgotado)
    async alternarStatus(id, disponivel) {
        let novoStatus = disponivel;
        if (novoStatus === undefined) {
            const item = await this.buscarPorId(id);
            if (!item) return null;
            novoStatus = item.disponivel ? 0 : 1;
        } else {
            novoStatus = (novoStatus === 1 || novoStatus === "1" || novoStatus === true || novoStatus === "true") ? 1 : 0;
        }

        await pool.query("UPDATE cardapio_item SET disponivel = ? WHERE id_item = ?", [novoStatus, id]);
        return novoStatus;
    },

    // Exclui um item
    async excluir(id) {
        const [resultado] = await pool.query("DELETE FROM cardapio_item WHERE id_item = ?", [id]);
        return resultado.affectedRows > 0;
    },

    // Retorna categorias distintas
    async listarCategorias() {
        const [linhas] = await pool.query(
            "SELECT DISTINCT categoria FROM cardapio_item WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria ASC"
        );
        return linhas.map(l => l.categoria);
    },

    // Estatísticas gerais para os cards do painel
    async obterEstatisticas() {
        const [total] = await pool.query("SELECT COUNT(*) AS total FROM cardapio_item");
        const [disponiveis] = await pool.query("SELECT COUNT(*) AS total FROM cardapio_item WHERE disponivel = 1");
        const [esgotados] = await pool.query("SELECT COUNT(*) AS total FROM cardapio_item WHERE disponivel = 0");
        const [destaques] = await pool.query("SELECT COUNT(*) AS total FROM cardapio_item WHERE destaque = 1");
        const [categorias] = await pool.query("SELECT COUNT(DISTINCT categoria) AS total FROM cardapio_item");

        return {
            totalItens: total[0]?.total || 0,
            disponiveis: disponiveis[0]?.total || 0,
            esgotados: esgotados[0]?.total || 0,
            destaques: destaques[0]?.total || 0,
            totalCategorias: categorias[0]?.total || 0,
        };
    }
};

module.exports = cardapioModel;
