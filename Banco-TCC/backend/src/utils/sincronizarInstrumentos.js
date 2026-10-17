const pool = require("../config/database");

const instrumentosOficiais = [
    {
        id_instrumento: 1,
        nome: "Piano",
        categoria: "Teclas & Harmonia",
        icone: "",
        imagem_url: "../images/piano.png",
        descricao: "O piano é um instrumento de teclado fascinante e completo, essencial para o desenvolvimento da percepção harmônica e rítmica. No IMBT, oferecemos formação completa desde os primeiros acordes até a técnica avançada clássica e popular.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 1
    },
    {
        id_instrumento: 2,
        nome: "Violino",
        categoria: "Cordas de Arco & Harpa",
        icone: "",
        imagem_url: "../images/violino.png",
        descricao: "O violino é o líder melódico da família das cordas, dono de um timbre aveludado, expressivo e brilhante. Nossos professores trabalham postura, afinação pura, técnica de arco e repertório clássico e contemporâneo.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 2
    },
    {
        id_instrumento: 3,
        nome: "Violoncelo",
        categoria: "Cordas de Arco & Harpa",
        icone: "",
        imagem_url: "../images/violoncelo.png",
        descricao: "Com graves profundos e ressonância emocional incomparável, o violoncelo emociona pela sua semelhança com a voz humana. Aulas com metodologia direcionada à afinação, leitura musical e prática de câmara.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 3
    },
    {
        id_instrumento: 4,
        nome: "Viola de Arco",
        categoria: "Cordas de Arco & Harpa",
        icone: "",
        imagem_url: "../images/viola-arco.png",
        descricao: "A alma intermediária do quarteto de cordas. Possui timbre nobre, caloroso e levemente nostálgico, fundamental para orquestras e música de câmara.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 4
    },
    {
        id_instrumento: 5,
        nome: "Contrabaixo Acústico",
        categoria: "Cordas de Arco & Harpa",
        icone: "",
        imagem_url: "../images/contra-acustico.png",
        descricao: "O gigante das cordas acústicas. Fornece sustentação harmônica e condução rítmica tanto na música sinfônica quanto no jazz e na MPB.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 5
    },
    {
        id_instrumento: 6,
        nome: "Flauta Transversal",
        categoria: "Sopros (Metais & Madeiras)",
        icone: "",
        imagem_url: "../images/flauta.png",
        descricao: "Instrumento de sopro de sonoridade lírica, doce e ágil. Desenvolve o controle de respiração, embocadura e expressividade melódica.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 6
    },
    {
        id_instrumento: 7,
        nome: "Saxofone",
        categoria: "Sopros (Metais & Madeiras)",
        icone: "",
        imagem_url: "../images/saxofone.png",
        descricao: "Extremamente versátil, o saxofone brilha no jazz, no pop, na música clássica e em celebrações ao ar livre com solos cativantes e envolventes.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 7
    },
    {
        id_instrumento: 8,
        nome: "Clarinete",
        categoria: "Sopros (Metais & Madeiras)",
        icone: "",
        imagem_url: "../images/clarinete.png",
        descricao: "Com uma das maiores extensões de notas entre os instrumentos de sopro, o clarinete entrega desde graves aveludados até agudos cheios de brilho.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 8
    },
    {
        id_instrumento: 9,
        nome: "Trompete",
        categoria: "Sopros (Metais & Madeiras)",
        icone: "",
        imagem_url: "../images/trompete.png",
        descricao: "O brilho triunfal da família dos metais. Ideal para fanfarras de casamento, marchas clássicas solenes e solos vibrantes.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 9
    },
    {
        id_instrumento: 10,
        nome: "Bateria",
        categoria: "Percussão & Ritmo",
        icone: "",
        imagem_url: "../images/Bateria.png",
        descricao: "O coração rítmico da música contemporânea. Aulas focadas em coordenação motora, precisão de tempo, grooves e dinâmica musical.",
        disponivel_aulas: 1,
        disponivel_eventos: 1,
        ativo: 1,
        ordem: 10
    }
];

async function sincronizar() {
    console.log("Iniciando sincronização dos instrumentos com a página oficial...");

    try {
        // Remove instrumentos legados fora dos 10 oficiais
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

        const [resultado] = await pool.query("SELECT id_instrumento, nome, categoria, imagem_url FROM instrumento ORDER BY ordem, id_instrumento");
        console.log(`Sucesso! Agora o banco possui exatamente ${resultado.length} instrumentos baseados na página oficial:`);
        console.table(resultado);
        process.exit(0);
    } catch (err) {
        console.error("Erro durante sincronização:", err);
        process.exit(1);
    }
}

if (require.main === module) {
    sincronizar();
}

module.exports = { instrumentosOficiais, sincronizar };
