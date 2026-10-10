// Formação Selecionada - Instituto Bravo Tatuí

(function () {
    // 1. Dicionário Completo das 16 Formações do Instituto Bravo Tatuí
    const formacoesData = {
        plus: {
            id: "plus",
            nome: "Plus",
            prefixo: "Bravo",
            cor: "#A4ADE5",
            badge: "QUARTETO DE CORDAS & PIANO",
            subtitulo: "Quarteto de cordas e piano elétrico",
            descricao: "A formação Bravo Plus é a síntese primorosa entre a tradição clássica e a versatilidade moderna. Unindo a riqueza acústica do quarteto de cordas tradicional (dois violinos, viola e violoncelo) à base harmônica encorpada do piano elétrico, esta formação entrega uma sonoridade grandiosa, solene e extremamente emocionante. Capaz de transitar de clássicos barrocos a arranjos contemporâneos de pop e cinema com total refinamento.",
            instrumentos: [
                { nome: "Violino I", icone: "🎻", desc: "Melodias principais e brilho agudo" },
                { nome: "Violino II", icone: "🎻", desc: "Harmonia vocal e contraponto" },
                { nome: "Viola de Arco", icone: "🎻", desc: "Corpo harmônico e timbre aveludado" },
                { nome: "Violoncelo", icone: "🎻", desc: "Graves solenes e profundidade acústica" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Sustentação harmônica e dinâmicas ricas" }
            ],
            ocasioes: [
                { titulo: "Cerimônia de Casamento", desc: "Entradas solenes, cortejo e bênção das alianças" },
                { titulo: "Recepções & Coquetéis", desc: "Música de fundo elegante para acolher convidados" },
                { titulo: "Eventos Corporativos de Gala", desc: "Premiações, convenções e jantares de luxo" },
                { titulo: "Bodas & Comemorações", desc: "Celebrações familiares com atmosfera marcante" }
            ],
            estilos: ["Clássico Tradicional", "Pop Internacional Acústico", "Trilhas Sonoras de Filmes", "Música Sacra & Religiosa", "MPB Orquestrada"],
            playlist: [
                { titulo: "A Thousand Years", artista: "Christina Perri (Arranjo Bravo)", tempo: "4:45" },
                { titulo: "Canon in D", artista: "Johann Pachelbel", tempo: "5:20" },
                { titulo: "Viva La Vida", artista: "Coldplay (Cordas & Piano)", tempo: "4:02" },
                { titulo: "She", artista: "Elvis Costello", tempo: "3:30" }
            ],
            imagem: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80"
        },

        classic: {
            id: "classic",
            nome: "Classic",
            prefixo: "Bravo",
            cor: "#7DEEBF",
            badge: "QUARTETO DE CORDAS PURO",
            subtitulo: "Quarteto de cordas (dois violinos, viola e violoncelo)",
            descricao: "A formação camerística mais reverenciada da história da música ocidental. O Bravo Classic dispensa amplificações pesadas e aposta na pureza acústica e no diálogo perfeito entre quatro instrumentos de arco. Cada frase musical ganha textura nobre e riqueza de timbres, criando um clima de pura sofisticação aristocrática para eventos que buscam solenidade absoluta.",
            instrumentos: [
                { nome: "Violino I", icone: "🎻", desc: "Voz líder e solos expressivos" },
                { nome: "Violino II", icone: "🎻", desc: "Costura melódica e preenchimento" },
                { nome: "Viola de Arco", icone: "🎻", desc: "Profundidade aveludada do médio-grave" },
                { nome: "Violoncelo", icone: "🎻", desc: "Fundação rítmica e ressonância dramática" }
            ],
            ocasioes: [
                { titulo: "Entrada Solene da Noiva", desc: "Marchas clássicas e temas tradicionais intocáveis" },
                { titulo: "Casamentos em Igrejas Históricas", desc: "Aproveitamento exemplar da acústica sagrada" },
                { titulo: "Jantares Exclusivos & Vernissages", desc: "Trilha refinada que não interfere na conversa" },
                { titulo: "Cerimônias Tradicionais e Cultos", desc: "Solene reverência e beleza poética" }
            ],
            estilos: ["Música Erudita / Barroca / Romântica", "Clássicos Universais", "Música Sacra Tradicional", "Arranjos Clássicos de Rock Suave"],
            playlist: [
                { titulo: "Marcha Nupcial", artista: "Mendelssohn / Wagner", tempo: "3:40" },
                { titulo: "As Quatro Estações - Primavera", artista: "Antonio Vivaldi", tempo: "3:35" },
                { titulo: "Gabriel's Oboe", artista: "Ennio Morricone", tempo: "3:10" },
                { titulo: "Yellow", artista: "Coldplay (Arranjo Quarteto)", tempo: "4:15" }
            ],
            imagem: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80"
        },

        gold: {
            id: "gold",
            nome: "Gold",
            prefixo: "Bravo",
            cor: "#F7B345",
            badge: "GRANDIOSIDADE SOLENE & CLARINS",
            subtitulo: "Voz, violino, violoncelo, piano elétrico, dois clarins triunfais e percussão",
            descricao: "Concebida para ser verdadeiramente inesquecível. A formação Bravo Gold une a emoção arrebatadora da voz ao calor das cordas e do piano, culminando no anúncio régio dos clarins triunfais com estandartes e na pulsação solene da percussão. Ideal para noivos e anfitriões que desejam impacto visual e sonoro de cinema no momento de maior ápice da celebração.",
            instrumentos: [
                { nome: "Voz Solista", icone: "🎤", desc: "Interpretação emocionante e lirismo vocal" },
                { nome: "2 Clarins Triunfais", icone: "🎺", desc: "Anúncio heráldico da entrada da noiva" },
                { nome: "Violino", icone: "🎻", desc: "Melodia aveludada e solos virtuosos" },
                { nome: "Violoncelo", icone: "🎻", desc: "Base nobre e ressonância emocional" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Harmonia encorpada e dinâmica orquestral" },
                { nome: "Percussão Sinfônica", icone: "🥁", desc: "Clímax rítmico, pratos e tímpanos" }
            ],
            ocasioes: [
                { titulo: "Cortejo Nupcial de Grande Porte", desc: "Anúncio triunfal que arrepia todos os convidados" },
                { titulo: "Casamentos Noturnos em Catedrais", desc: "Presença cênica e imponência sonora total" },
                { titulo: "Solenidades de Formatura & Gala", desc: "Hinos e momentos de condecoração majestosos" },
                { titulo: "Bodas de Ouro e Prata", desc: "Homenagens familiares marcantes" }
            ],
            estilos: ["Temas Épicos de Cinema", "Música Sacra e Grandes Hinos", "Árias e Canções Solenes", "Pop Lírico (estilo Bocelli & Dion)"],
            playlist: [
                { titulo: "Clarins de Claridade & Marcha Nupcial", artista: "Tradicional / Bravo Tatuí", tempo: "4:10" },
                { titulo: "Hallelujah", artista: "Leonard Cohen (Voz & Orquestra)", tempo: "4:30" },
                { titulo: "The Prayer", artista: "Andrea Bocelli & Céline Dion", tempo: "4:25" },
                { titulo: "Con Te Partirò", artista: "Francesco Sartori", tempo: "4:00" }
            ],
            imagem: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
        },

        trio: {
            id: "trio",
            nome: "Trio",
            prefixo: "Bravo",
            cor: "#98DEFA",
            badge: "EQUILÍBRIO & SENSIBILIDADE",
            subtitulo: "Violino, violoncelo e piano elétrico",
            descricao: "Uma das formações mais queridas e dinâmicas da Bravo. O diálogo constante entre o brilho lírico do violino e o timbre aveludado do violoncelo, sustentados pela amplitude do piano elétrico, cria uma experiência sonora quente, elegante e acolhedora. É a pedida ideal para cerimônias que prezam pela intimidade e leveza com máxima excelência musical.",
            instrumentos: [
                { nome: "Violino", icone: "🎻", desc: "Condução melódica primária" },
                { nome: "Violoncelo", icone: "🎻", desc: "Contrapontos líricos e sustentação grave" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Base rítmica e riqueza harmônica" }
            ],
            ocasioes: [
                { titulo: "Casamentos ao Ar Livre / Fazendas", desc: "Integração harmônica com a natureza e o pôr do sol" },
                { titulo: "Mini Weddings & Destination Weddings", desc: "Formação compacta e esteticamente charmosa" },
                { titulo: "Renovação de Votos", desc: "Celebrações românticas e acolhedoras" },
                { titulo: "Recepções de Boas-Vindas", desc: "Acolhimento caloroso aos convidados" }
            ],
            estilos: ["Pop Romântico Contemporâneo", "Trilhas Sonoras Disney & Cinema", "MPB Sofisticada", "Clássicos Românticos"],
            playlist: [
                { titulo: "Perfect", artista: "Ed Sheeran", tempo: "4:20" },
                { titulo: "All of Me", artista: "John Legend", tempo: "4:30" },
                { titulo: "Beauty and the Beast", artista: "Alan Menken", tempo: "3:50" },
                { titulo: "Como É Grande o Meu Amor Por Você", artista: "Roberto Carlos", tempo: "3:40" }
            ],
            imagem: "https://images.unsplash.com/photo-1520523839898-50712825e617?auto=format&fit=crop&w=1200&q=80"
        },

        master: {
            id: "master",
            nome: "Master",
            prefixo: "Bravo",
            cor: "#6CCAD5",
            badge: "ORQUESTRAÇÃO COMPACTA & METAIS",
            subtitulo: "Quarteto de cordas, piano, percussão e dois trompetes",
            descricao: "A potência e o brilho orquestral condensados com maestria. Ao somar o quarteto de cordas completo à força expansiva dos trompetes, do piano e da percussão rítmica, o Bravo Master cria um espetáculo capaz de preencher igrejas monumentais e salões imponentes com energia triunfante e emoção ininterrupta.",
            instrumentos: [
                { nome: "Quarteto de Cordas", icone: "🎻", desc: "2 violinos, viola e violoncelo para textura clássica" },
                { nome: "2 Trompetes", icone: "🎺", desc: "Brilho metálico e chamadas majestosas" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Conexão harmônica de todos os naipes" },
                { nome: "Percussão Completa", icone: "🥁", desc: "Dinâmica e impacto rítmico vibrante" }
            ],
            ocasioes: [
                { titulo: "Grandes Cerimônias de Casamento", desc: "Momentos culminantes com riqueza sonora máxima" },
                { titulo: "Colações de Grau & Formaturas", desc: "Entradas triunfais com metais em evidência" },
                { titulo: "Convenções & Eventos Corporativos", desc: "Encerramentos triunfais de convenções de gala" },
                { titulo: "Celebrações de Fim de Ano", desc: "Concertos exclusivos e recepções festivas" }
            ],
            estilos: ["Trilhas Cinematográficas de Hollywood", "Música Sinfônica Festiva", "Arranjos Clássicos de Rock", "Hinos e Grandes Temas"],
            playlist: [
                { titulo: "Conquest of Paradise", artista: "Vangelis", tempo: "4:48" },
                { titulo: "Pompa e Circunstância", artista: "Edward Elgar", tempo: "4:00" },
                { titulo: "Stand by Me (Sinfônico)", artista: "Ben E. King", tempo: "3:45" },
                { titulo: "Cinema Paradiso", artista: "Ennio Morricone", tempo: "3:30" }
            ],
            imagem: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
        },

        duo: {
            id: "duo",
            nome: "Duo",
            prefixo: "Bravo",
            cor: "#599FB2",
            badge: "DELICADEZA & MINIMALISMO",
            subtitulo: "Violino e piano elétrico ou violão",
            descricao: "O minimalismo acústico elevado ao seu expoente máximo de poesia. Com apenas dois instrumentos em íntima cumplicidade, cada nota tocada tem peso, respiração e significado. Perfeito para cerimônias diurnas, enlaces intimistas ou recepções onde uma trilha sonora suave e sofisticada embala as conversas.",
            instrumentos: [
                { nome: "Violino", icone: "🎻", desc: "Solos delicados e expressividade emotiva" },
                { nome: "Piano Elétrico / Violão", icone: "🎹", desc: "Arpejos harmônicos e condução suave" }
            ],
            ocasioes: [
                { titulo: "Elopement Wedding", desc: "Celebrações a dois com romantismo pleno" },
                { titulo: "Jantares Românticos & Noivados", desc: "Ambiente reservado com música refinada" },
                { titulo: "Coquetéis de Recepção", desc: "Música agradável que permite conversa fluida" },
                { titulo: "Casamentos Civis e Íntimos", desc: "Charme sem excesso de equipamentos" }
            ],
            estilos: ["Bossa Nova & MPB Acústica", "Baladas Românticas Internacionais", "Clássicos Franceses & Jazz Suave", "Temas Românticos"],
            playlist: [
                { titulo: "La Vie En Rose", artista: "Édith Piaf", tempo: "3:15" },
                { titulo: "Garota de Ipanema", artista: "Tom Jobim", tempo: "3:30" },
                { titulo: "Photograph", artista: "Ed Sheeran", tempo: "4:15" },
                { titulo: "Pela Luz dos Olhos Teus", artista: "Vinicius de Moraes", tempo: "3:00" }
            ],
            imagem: "https://images.unsplash.com/photo-1445375011782-238468d778a0?auto=format&fit=crop&w=1200&q=80"
        },

        basic: {
            id: "basic",
            nome: "Basic",
            prefixo: "Bravo",
            cor: "#38BDF8",
            badge: "VERSATILIDADE COMPLETA",
            subtitulo: "Violino, violoncelo, piano elétrico e percussão ou voz",
            descricao: "Projetada para entregar excelente custo-benefício sem abrir mão da qualidade e do peso musical. A combinação de cordas, piano e a escolha entre voz ou percussão permite cobrir com fidelidade desde os momentos contemplativos até os trechos de celebração animada do cortejo.",
            instrumentos: [
                { nome: "Violino", icone: "🎻", desc: "Melodias emotivas e temas principais" },
                { nome: "Violoncelo", icone: "🎻", desc: "Graves aconchegantes e profundidade" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Estrutura harmônica sólida" },
                { nome: "Percussão ou Voz", icone: "🎤", desc: "Personalização de acordo com o perfil dos anfitriões" }
            ],
            ocasioes: [
                { titulo: "Cerimônias de Casamento Modernas", desc: "Equilíbrio entre temas solenes e modernos" },
                { titulo: "Cultos e Celebrações Religiosas", desc: "Louvores e cânticos de celebração" },
                { titulo: "Recepções de Família", desc: "Repertório acolhedor para todas as idades" },
                { titulo: "Bodas e Aniversários", desc: "Celebrações especiais com amigos e família" }
            ],
            estilos: ["Pop Internacional Contemporâneo", "Gospel & Louvor Emocionante", "MPB e Músicas Nacionais", "Baladas Românticas"],
            playlist: [
                { titulo: "De Janeiro a Janeiro", artista: "Roberta Campos", tempo: "3:10" },
                { titulo: "Shallow", artista: "Lady Gaga & Bradley Cooper", tempo: "3:35" },
                { titulo: "Oceanos", artista: "Hillsong (Arranjo Bravo)", tempo: "5:00" },
                { titulo: "Somewhere Over the Rainbow", artista: "H. Arlen", tempo: "3:30" }
            ],
            imagem: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80"
        },

        solo: {
            id: "solo",
            nome: "Solo",
            prefixo: "Bravo",
            cor: "#14B8A6",
            badge: "SOLISTA VIRTUOSO & PLAYBACK",
            subtitulo: "Apenas um instrumento acompanhado por playback profissional",
            descricao: "O virtuosismo e a expressividade de um músico de elite, amparado por arranjos gravados em estúdio profissional. Garante a imponência de uma banda completa com a discrição espacial e orçamentária de um único instrumentista. Perfeito para entradas pontuais ou recepções descontraídas.",
            instrumentos: [
                { nome: "Instrumento Solista", icone: "🎷", desc: "Escolha entre Saxofone, Violino, Violoncelo ou Piano" },
                { nome: "Playback Masterizado", icone: "🎚️", desc: "Base orquestral ou moderna em alta fidelidade" }
            ],
            ocasioes: [
                { titulo: "Entradas Especiais no Cortejo", desc: "Entrada de alianças, floristas ou pais" },
                { titulo: "Sax Lounge & Degustações", desc: "Música ambiente animada para receber convidados" },
                { titulo: "Inaugurações & Lojas de Luxo", desc: "Atração artística refinada e flexível" },
                { titulo: "Pedidos de Casamento & Serenatas", desc: "Momento inesquecível e intimista a dois" }
            ],
            estilos: ["Smooth Jazz & Sax Lounge", "Violino Pop Eletrônico ou Clássico", "Baladas Românticas", "Bossa Nova Moderna"],
            playlist: [
                { titulo: "Careless Whisper (Sax Solo)", artista: "George Michael", tempo: "4:00" },
                { titulo: "Isn't She Lovely", artista: "Stevie Wonder", tempo: "3:20" },
                { titulo: "Czardas (Violino Solo)", artista: "Vittorio Monti", tempo: "3:40" },
                { titulo: "Fly Me to the Moon", artista: "Frank Sinatra", tempo: "2:50" }
            ],
            imagem: "https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=1200&q=80"
        },

        combo: {
            id: "combo",
            nome: "Combo",
            prefixo: "Bravo",
            cor: "#3B82F6",
            badge: "ENERGIA VIBRANTE & BRILHO",
            subtitulo: "Piano elétrico, violino, dois trompetes e percussão",
            descricao: "Uma injeção de entusiasmo, clareza e vigor sonoro. A combinação audaciosa de dois trompetes com o violino e uma forte base rítmica de piano e percussão produz uma atmosfera radiante, ideal para casamentos e formaturas repletas de alegria e momentos de êxtase coletivo.",
            instrumentos: [
                { nome: "2 Trompetes", icone: "🎺", desc: "Fanfarras triunfais e linhas melódicas brilhantes" },
                { nome: "Violino", icone: "🎻", desc: "Contrapontos expressivos e textura clássica" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Harmonia encorpada e ritmo" },
                { nome: "Percussão Dinâmica", icone: "🥁", desc: "Condução rítmica envolvente" }
            ],
            ocasioes: [
                { titulo: "Entradas Festivas de Noivos", desc: "Momento triunfal com os metais vibrando" },
                { titulo: "Celebrações de Casamento ao Ar Livre", desc: "Som expansivo com excelente alcance" },
                { titulo: "Festas de Formatura & Desfiles", desc: "Entusiasmo e orgulho para marcar a conquista" },
                { titulo: "Comemorações Cívicas e Solenes", desc: "Hinos e temas vibrantes" }
            ],
            estilos: ["Pop Festivo Revisitado", "Marchas Triunfais Clássicas", "Trilhas de Cinema", "Soul & Funk Instrumental"],
            playlist: [
                { titulo: "Trumpet Voluntary", artista: "Jeremiah Clarke", tempo: "2:50" },
                { titulo: "Happy", artista: "Pharrell Williams", tempo: "3:40" },
                { titulo: "Can't Take My Eyes Off You", artista: "Frankie Valli", tempo: "3:30" },
                { titulo: "Don't Stop Believin'", artista: "Journey", tempo: "4:10" }
            ],
            imagem: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80"
        },

        folk: {
            id: "folk",
            nome: "Folk",
            prefixo: "Bravo",
            cor: "#C27848",
            badge: "RÚSTICO, AFETIVO & AMADEIRADO",
            subtitulo: "Acordeon, ukulelê, gaita, violão, contrabaixo e cajon",
            descricao: "Aconchegante, nostálgico e transbordando poesia orgânica. O Bravo Folk transporta seus convidados para a atmosfera bucólica de um entardecer no campo, unindo o fole comovente do acordeon, os timbres dedilhados de violão e ukulelê, e o balanço do cajon e contrabaixo.",
            instrumentos: [
                { nome: "Acordeon", icone: "🪗", desc: "Fole emotivo, calor regional e harmonia" },
                { nome: "Violão Folk & Ukulelê", icone: "🎸", desc: "Dedilhado rítmico e texturas ensolaradas" },
                { nome: "Gaita de Boca", icone: "🌬️", desc: "Solos nostálgicos e estilo country-folk" },
                { nome: "Contrabaixo", icone: "🎸", desc: "Graves acústicos quentes e redondos" },
                { nome: "Cajon / Percussão Orgânica", icone: "📦", desc: "Batida acústica suave e despretensiosa" }
            ],
            ocasioes: [
                { titulo: "Casamentos no Campo & Fazendas", desc: "Total sinergia com feno, luzes de gambiarra e verde" },
                { titulo: "Casamentos Estilo Boho Chic", desc: "Estilo autêntico, despojado e altamente estético" },
                { titulo: "Cerimônias ao Pôr do Sol na Praia", desc: "Brisa marinha combinada com violão e ukulelê" },
                { titulo: "Almoços e Festivais Familiares", desc: "Música agradável que aquece as conversas" }
            ],
            estilos: ["Indie Folk Internacional", "Country & Bluegrass Acústico", "MPB Raiz & Regional Sofisticada", "Baladas Acústicas"],
            playlist: [
                { titulo: "Ho Hey", artista: "The Lumineers", tempo: "3:00" },
                { titulo: "Home", artista: "Edward Sharpe & The Magnetic Zeros", tempo: "4:15" },
                { titulo: "Anunciação", artista: "Alceu Valença (Arranjo Folk)", tempo: "3:40" },
                { titulo: "I Will Wait", artista: "Mumford & Sons", tempo: "4:05" }
            ],
            imagem: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"
        },

        tutti: {
            id: "tutti",
            nome: "Tutti",
            prefixo: "Bravo",
            cor: "#F43F5E",
            badge: "FORMAÇÃO COMPLETA & CLÁSSICA",
            subtitulo: "Voz, quarteto de cordas, piano elétrico, percussão e dois clarins",
            descricao: "O termo clássico italiano 'Tutti' traduz a reunião de todas as forças instrumentais em conjunto. Esta formação integra o quarteto de cordas, piano, percussão, voz e clarins heráldicos, criando a mais rica paleta sonora disponível para celebrações que não admitem concessões em requinte e plenitude.",
            instrumentos: [
                { nome: "Voz Solista", icone: "🎤", desc: "Interpretação lírica sublime" },
                { nome: "Quarteto de Cordas", icone: "🎻", desc: "2 violinos, viola e violoncelo em harmonia pura" },
                { nome: "2 Clarins Triunfais", icone: "🎺", desc: "Anúncios solenes de abertura" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Amarração harmônica densa e rica" },
                { nome: "Percussão Sinfônica", icone: "🥁", desc: "Dinâmicas dramáticas e grandiosas" }
            ],
            ocasioes: [
                { titulo: "Grandes Casamentos Tradicionais", desc: "Cerimônias completas com cortejos amplos" },
                { titulo: "Bodas de Ouro e Prata de Luxo", desc: "Trilha sonora comovente para toda a família" },
                { titulo: "Celebrações Sacras Históricas", desc: "Execução fidedigna de árias e obras orquestrais" },
                { titulo: "Eventos Cívicos e Acadêmicos de Gala", desc: "Máxima solenidade e respeito institucional" }
            ],
            estilos: ["Música Erudita Tradicional", "Árias Célebres de Ópera", "Música Sacra de Concerto", "Grandes Baladas Clássicas"],
            playlist: [
                { titulo: "Nessun Dorma", artista: "Giacomo Puccini", tempo: "3:45" },
                { titulo: "Ave Maria", artista: "Franz Schubert", tempo: "4:10" },
                { titulo: "My Way", artista: "Frank Sinatra (Arranjo Orquestral)", tempo: "4:30" },
                { titulo: "Amazing Grace", artista: "Tradicional", tempo: "3:50" }
            ],
            imagem: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80"
        },

        acustic: {
            id: "acustic",
            nome: "Acustic",
            prefixo: "Bravo",
            cor: "#AE7257",
            badge: "BANDA ACÚSTICA CONTEMPORÂNEA",
            subtitulo: "Voz, piano elétrico, violino, contrabaixo e bateria",
            descricao: "O vigor contagiante de uma banda moderna suavizado pelo requinte erudito do violino. O Bravo Acustic transita com elegância ímpar entre baladas de amor emocionantes na cerimônia e uma recepção descontraída, sofisticada e cheia de balanço.",
            instrumentos: [
                { nome: "Voz Solista", icone: "🎤", desc: "Vocal cativante e versátil" },
                { nome: "Violino", icone: "🎻", desc: "O toque orquestral e nobre" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Harmonias ricas e solos modernos" },
                { nome: "Contrabaixo", icone: "🎸", desc: "Groove e peso rítmico encorpado" },
                { nome: "Bateria / Percussão", icone: "🥁", desc: "Pulso e dinâmica para cada andamento" }
            ],
            ocasioes: [
                { titulo: "Recepções de Casamento & Jantares", desc: "Trilha sonora moderna e vibrante durante a festa" },
                { titulo: "Casamentos Modernos e Descontraídos", desc: "Repertório jovem e repleto de sucessos atuais" },
                { titulo: "Eventos Corporativos Dinâmicos", desc: "Apresentações musicais que engajam o público" },
                { titulo: "Festas de Aniversário de Alto Padrão", desc: "Música de qualidade impecável e energia positiva" }
            ],
            estilos: ["Pop Rock Acústico", "Soul & R&B Romântico", "MPB Contemporânea", "Hits Internacionais Revisitados"],
            playlist: [
                { titulo: "Thinking Out Loud", artista: "Ed Sheeran", tempo: "4:40" },
                { titulo: "Valerie", artista: "Amy Winehouse", tempo: "3:30" },
                { titulo: "Trevo (Tu)", artista: "Anavitória", tempo: "3:25" },
                { titulo: "Just The Way You Are", artista: "Bruno Mars", tempo: "3:40" }
            ],
            imagem: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
        },

        jazz: {
            id: "jazz",
            nome: "Jazz",
            prefixo: "Bravo",
            cor: "#F9975E",
            badge: "JAZZ CLUB & BOSSA NOVA",
            subtitulo: "Voz, violino, violoncelo, guitarra, piano elétrico, dois trompetes e percussão",
            descricao: "O ápice do charme cosmopolita e da elegância despretensiosa. Inspirado nos clubes de jazz lendários de Nova York e na sofisticação da Bossa Nova carioca, o Bravo Jazz une naipes nobres de cordas e trompetes ao balanço da guitarra semi-acústica e da voz aveludada.",
            instrumentos: [
                { nome: "Voz Jazz", icone: "🎤", desc: "Timbre aveludado e interpretação intimista" },
                { nome: "Violino & Violoncelo", icone: "🎻", desc: "Arranjos cinematográficos de cordas jazzísticas" },
                { nome: "Guitarra Semi-Acústica", icone: "🎸", desc: "Acordes refinados e fraseados limpos" },
                { nome: "Piano Elétrico", icone: "🎹", desc: "Harmonias complexas e improvisos de bom gosto" },
                { nome: "2 Trompetes com Surdina", icone: "🎺", desc: "Timbre clássico vintage e intervenções brilhantes" },
                { nome: "Percussão & Bateria Jazz", icone: "🥁", desc: "Vassourinhas, pratos elegantes e swing" }
            ],
            ocasioes: [
                { titulo: "Coquetéis de Gala & Lounges", desc: "Clima sofisticado perfeito para taças de champanhe" },
                { titulo: "Recepções de Casamento Noturnas", desc: "Uma atmosfera de sofisticação ímpar" },
                { titulo: "Noites de Premiação & Degustação", desc: "Música de altíssimo padrão estético" },
                { titulo: "Festas Temáticas Vintage", desc: "Reencenação elegante da era de ouro da música" }
            ],
            estilos: ["Standard Jazz & Swing", "Bossa Nova Autêntica", "Blues Suave & Vintage Soul", "Releituras Jazzísticas de Músicas Pop"],
            playlist: [
                { titulo: "Cheek to Cheek", artista: "Ella Fitzgerald & Louis Armstrong", tempo: "3:50" },
                { titulo: "Autumn Leaves", artista: "Miles Davis / Nat King Cole", tempo: "4:10" },
                { titulo: "Wave", artista: "Tom Jobim", tempo: "3:30" },
                { titulo: "What a Wonderful World", artista: "Louis Armstrong", tempo: "3:20" }
            ],
            imagem: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80"
        },

        orquestra: {
            id: "orquestra",
            nome: "Orquestra",
            prefixo: "Bravo",
            cor: "#F5D696",
            badge: "ORQUESTRA SINFÔNICA COMPLETA",
            subtitulo: "Orquestra sinfônica completa sob regência de Maestro",
            descricao: "A experiência máxima e definitiva da arte musical humana. Dezenas de músicos sinfônicos reunidos sob a batuta atenta do Maestro, unindo naipes completos de cordas, madeiras, metais brilhantes, percussão orquestral e tímpanos. Cada acorde ecoa com magnitude arrebatadora, transformando sua cerimônia em um marco lendário.",
            instrumentos: [
                { nome: "Naipe de Cordas Completo", icone: "🎻", desc: "Violinos I e II, Violas, Violoncelos e Contrabaixos" },
                { nome: "Madeiras Clássicas", icone: "🎶", desc: "Flautas transversais, Clarinetes e Oboé" },
                { nome: "Metais Sinfônicos", icone: "🎺", desc: "Trompetes, Trompas e Trombones majestosos" },
                { nome: "Percussão Sinfônica & Tímpanos", icone: "🥁", desc: "Impacto visceral e dinâmicas triunfais" },
                { nome: "Piano de Cauda / Órgão", icone: "🎹", desc: "Fundação harmônica majestosa" },
                { nome: "Maestro Regente", icone: "🎼", desc: "Direção artística e precisão milimétrica" }
            ],
            ocasioes: [
                { titulo: "Grandes Casamentos em Catedrais", desc: "O ápice do luxo, tradição e solenidade" },
                { titulo: "Concertos Especiais & Galas", desc: "Espetáculos comemorativos de grande prestígio" },
                { titulo: "Eventos Cívicos e Jubileus", desc: "Momentos históricos que exigem grandiosidade" },
                { titulo: "Gravações e Celebrações de Gala", desc: "Produções de alto impacto audiovisual" }
            ],
            estilos: ["Repertório Sinfônico Completo", "Grandes Trilhas Épicas de Cinema", "Óperas e Poemas Sinfônicos", "Clássicos Universais"],
            playlist: [
                { titulo: "O Fortuna (Carmina Burana)", artista: "Carl Orff", tempo: "3:20" },
                { titulo: "Bolero", artista: "Maurice Ravel", tempo: "5:00" },
                { titulo: "Jurassic Park Theme", artista: "John Williams", tempo: "4:30" },
                { titulo: "Intermezzo (Cavalleria Rusticana)", artista: "Pietro Mascagni", tempo: "3:40" }
            ],
            imagem: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80"
        },

        electro: {
            id: "electro",
            nome: "Electro",
            prefixo: "Bravo",
            cor: "#818CF8",
            badge: "LIVE SHOW ELETRÔNICO",
            subtitulo: "Trio Bravo Electro (Violino Elétrico, Live DJ & Percussão / Sax)",
            descricao: "O encontro eletrizante do virtuosismo acústico com a pulsação frenética das pistas mundiais. Munidos de violino com iluminação LED interna, sintetizadores, live beats e saxofone ou percussão ao vivo, o Trio Bravo Electro explode de energia para incendiar a abertura de pista da sua festa.",
            instrumentos: [
                { nome: "Violino Elétrico LED", icone: "🎻", desc: "Solos incendiários com efeitos e visual futurista" },
                { nome: "Live DJ & Sintetizadores", icone: "🎧", desc: "Beats eletrônicos, transições fluidas e synths" },
                { nome: "Saxofone ou Percussão Eletrônica", icone: "🎷", desc: "Swing ao vivo e interação direta na pista de dança" }
            ],
            ocasioes: [
                { titulo: "Abertura de Pista de Dança", desc: "Momento de transição bombástica após o cortejo" },
                { titulo: "After Parties de Casamento", desc: "Música eletrônica de alto impacto até a madrugada" },
                { titulo: "Festas de Formatura & Lançamentos", desc: "Conexão direta com público jovem e moderno" },
                { titulo: "Pool Parties & Sunsets Exclusivos", desc: "Vibe eletrônica sofisticada e contagiante" }
            ],
            estilos: ["Melodic House & Deep House", "Pop Eletrônico & Dance Internacional", "Violin EDM / Festival Hits", "Remixes Eletrônicos Exclusivos"],
            playlist: [
                { titulo: "Titanium (Violin Live Remix)", artista: "David Guetta & Sia", tempo: "3:40" },
                { titulo: "Wake Me Up", artista: "Avicii", tempo: "4:00" },
                { titulo: "Levels", artista: "Avicii", tempo: "3:20" },
                { titulo: "Rather Be (Live)", artista: "Clean Bandit", tempo: "3:45" }
            ],
            imagem: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
        },

        personalizada: {
            id: "personalizada",
            nome: "Faça do seu Jeito",
            prefixo: "",
            cor: "#F5D696",
            badge: "PROJETO ARTÍSTICO SOB MEDIDA",
            subtitulo: "Personalize com os instrumentos e estilo de sua preferência!",
            descricao: "A sua história de amor e a sua comemoração são únicas, e a sua trilha sonora deve refletir exatamente a sua essência. Com a consultoria dedicada do Maestro e dos diretores artísticos do Instituto Bravo Tatuí, você monta a instrumentação dos seus sonhos — combinando harpa, flautas, saxofone, coral, orquestra ou qualquer instrumento do seu desejo.",
            instrumentos: [],
            ocasioes: [
                { titulo: "Casamentos com Conceito Temático", desc: "Músicas e temas fora do padrão comercial" },
                { titulo: "Sonhos Musicais Exclusivos", desc: "Instrumentos raros como Harpa, Gaita de Fole ou Cravo" },
                { titulo: "Celebrações Ecumênicas e Culturais", desc: "Fusão de tradições e raízes familiares" },
                { titulo: "Grandes Espetáculos Corporativos", desc: "Trilha sonora institucional pensada para a sua marca" }
            ],
            estilos: ["Qualquer Estilo ou Combinação Musical Personalizada"],
            playlist: [],
            imagem: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
        }
    };

    // 2. Catálogo Completo de Instrumentos para Escolha Personalizada ('Faça do seu Jeito')
    const catalogoInstrumentos = [
        {
            categoria: "Cordas de Arco & Harpa",
            icone: "🎻",
            itens: [
                { id: "violino", nome: "Violino", desc: "Melodias agudas brilhantes" },
                { id: "viola", nome: "Viola de Arco", desc: "Harmonia aveludada intermediária" },
                { id: "violoncelo", nome: "Violoncelo", desc: "Graves líricos e nobres" },
                { id: "contrabaixo", nome: "Contrabaixo Acústico", desc: "Fundação rítmica profunda" },
                { id: "harpa", nome: "Harpa Clássica", desc: "Toque etéreo e angelical" }
            ]
        },
        {
            categoria: "Teclas & Harmonia",
            icone: "🎹",
            itens: [
                { id: "piano", nome: "Piano Elétrico / Cauda", desc: "Sustentação harmônica essencial" },
                { id: "violao", nome: "Violão Acústico / Folk", desc: "Dedilhado acolhedor e rítmico" },
                { id: "guitarra", nome: "Guitarra Semi-Acústica", desc: "Charme jazzístico e vintage" },
                { id: "acordeon", nome: "Acordeon", desc: "Fole emotivo e calor regional" },
                { id: "ukulele", nome: "Ukulelê", desc: "Leveza e atmosfera solar" }
            ]
        },
        {
            categoria: "Sopros (Metais & Madeiras)",
            icone: "🎺",
            itens: [
                { id: "clarim", nome: "Clarim Triunfal (com Estandarte)", desc: "Anúncios régios de entrada" },
                { id: "trompete", nome: "Trompete", desc: "Fanfarras triunfais e brilho" },
                { id: "trombone", nome: "Trombone", desc: "Metais médios encorpados" },
                { id: "saxofone", nome: "Saxofone (Alto / Tenor / Soprano)", desc: "Sensualidade e swing melódico" },
                { id: "flauta", nome: "Flauta Transversal", desc: "Docilidade lírica e suavidade" },
                { id: "clarinete", nome: "Clarinete", desc: "Pureza sonora clássica" }
            ]
        },
        {
            categoria: "Percussão & Ritmo",
            icone: "🥁",
            itens: [
                { id: "percussao_sinfonica", nome: "Percussão Sinfônica", desc: "Tímpanos, pratos e sinos solenes" },
                { id: "bateria", nome: "Bateria Acústica", desc: "Pulso rítmico contemporâneo" },
                { id: "cajon", nome: "Cajon / Percussão Leve", desc: "Acústico despojado e orgânico" }
            ]
        },
        {
            categoria: "Vozes & Coral",
            icone: "🎤",
            itens: [
                { id: "voz_feminina", nome: "Voz Solista Feminina", desc: "Interpretação lírica e emocionante" },
                { id: "voz_masculina", nome: "Voz Solista Masculina", desc: "Imponência vocal e calor" },
                { id: "coral", nome: "Coral / Quarteto Vocal", desc: "Textura polifônica majestosa" }
            ]
        }
    ];

    // Conjunto de instrumentos selecionados pelo cliente na formação personalizada (inicia vazio)
    let instrumentosSelecionados = new Set();

    // Array ordenado para permitir navegação Anterior / Próximo e geração do carrossel
    const listaFormacoesIds = Object.keys(formacoesData);

    // 3. Auxiliar para conversão de Hex para RGBA (para sombras, brilhos e transparências harmônicas)
    function hexParaRgba(hex, alpha) {
        let c = hex.replace("#", "");
        if (c.length === 3) {
            c = c.split("").map(char => char + char).join("");
        }
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 4. Montar a Área Interativa de Escolha de Instrumentos ('Faça do seu Jeito')
    const API_BASE = (window.location.port === "3000" || (!window.location.port && window.location.protocol === "http:")) ? "" : "http://localhost:3000";

    async function carregarInstrumentosDaApi() {
        try {
            const resp = await fetch(`${API_BASE}/api/instrumentos?eventos=1&ativo=1`);
            const dados = await resp.json();
            if (dados.sucesso && Array.isArray(dados.dados) && dados.dados.length > 0) {
                // Agrupa instrumentos por categoria dinamicamente
                const mapaCategorias = {};
                dados.dados.forEach(inst => {
                    const cat = inst.categoria || "Geral";
                    if (!mapaCategorias[cat]) {
                        mapaCategorias[cat] = {
                            categoria: cat,
                            icone: inst.icone || "🎻",
                            itens: []
                        };
                    }
                    mapaCategorias[cat].itens.push({
                        id: `inst-${inst.id_instrumento}`,
                        nome: inst.nome,
                        desc: inst.descricao ? (inst.descricao.length > 60 ? inst.descricao.substring(0, 57) + "..." : inst.descricao) : "Instrumento musical"
                    });
                });

                catalogoInstrumentos = Object.values(mapaCategorias);
                renderizarHtmlSeletorInstrumentos();
            }
        } catch (e) {
            // Usa o catálogo padrão pré-definido
        }
    }

    function renderizarHtmlSeletorInstrumentos() {
        const container = document.getElementById("containerCategoriasInstrumentos");
        if (!container) return;

        container.innerHTML = catalogoInstrumentos.map(cat => `
            <div class="custom-cat-block">
                <div class="custom-cat-header">
                    <span class="custom-cat-icon">${cat.icone}</span>
                    <h3>${cat.categoria}</h3>
                </div>
                <div class="custom-inst-grid">
                    ${cat.itens.map(inst => {
                        const estaSelecionado = instrumentosSelecionados.has(inst.nome);
                        return `
                            <div class="custom-inst-card ${estaSelecionado ? 'selecionado' : ''}" 
                                 onclick="window.toggleInstrumentoPersonalizado('${inst.nome}')"
                                 id="inst-card-${inst.id}"
                                 data-nome="${inst.nome}">
                                <div class="card-check-indicator">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div class="card-inst-text">
                                    <strong class="card-inst-name">${inst.nome}</strong>
                                    <small class="card-inst-desc">${inst.desc}</small>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `).join("");

        atualizarResumoPersonalizado();
    }

    function inicializarSeletorDeInstrumentos() {
        renderizarHtmlSeletorInstrumentos();
        carregarInstrumentosDaApi();
    }

    // Alternar instrumento ao clicar
    window.toggleInstrumentoPersonalizado = function (nomeInstrumento) {
        if (instrumentosSelecionados.has(nomeInstrumento)) {
            instrumentosSelecionados.delete(nomeInstrumento);
        } else {
            instrumentosSelecionados.add(nomeInstrumento);
        }

        // Atualizar classes dos cards na interface
        document.querySelectorAll(".custom-inst-card").forEach(el => {
            const nomeCard = el.getAttribute("data-nome");
            if (instrumentosSelecionados.has(nomeCard)) {
                el.classList.add("selecionado");
            } else {
                el.classList.remove("selecionado");
            }
        });

        atualizarResumoPersonalizado();
    };

    window.limparInstrumentosPersonalizados = function () {
        instrumentosSelecionados.clear();
        document.querySelectorAll(".custom-inst-card").forEach(c => c.classList.remove("selecionado"));
        const obsEl = document.getElementById("campoObservacoesPersonalizadas");
        if (obsEl) obsEl.value = "";
        atualizarResumoPersonalizado();
    };

    // Atualiza a caixa de resumo e o link dinâmico de orçamento no WhatsApp
    function atualizarResumoPersonalizado() {
        const contadorEl = document.getElementById("contadorInstrumentos");
        const tagsContainer = document.getElementById("tagsInstrumentosSelecionados");
        const lista = Array.from(instrumentosSelecionados);

        if (contadorEl) contadorEl.textContent = lista.length;

        if (tagsContainer) {
            if (lista.length === 0) {
                tagsContainer.innerHTML = `<span class="nenhum-selecionado">Nenhum instrumento selecionado ainda. Clique nas opções acima para montar sua formação.</span>`;
            } else {
                tagsContainer.innerHTML = lista.map(nome => `
                    <span class="tag-chip-selected">
                        <span>${nome}</span>
                        <button type="button" class="btn-remove-chip" onclick="event.stopPropagation(); window.toggleInstrumentoPersonalizado('${nome}')" title="Remover instrumento">&times;</button>
                    </span>
                `).join("");
            }
        }

        window.atualizarMensagemWhatsappPersonalizada();
    }

    // Monta a mensagem personalizada do WhatsApp com base nos instrumentos e observações
    window.atualizarMensagemWhatsappPersonalizada = function () {
        const btnWhatsapp = document.getElementById("btnWhatsapp");
        const textoBtn = document.getElementById("textoBtnWhatsapp");
        const obsEl = document.getElementById("campoObservacoesPersonalizadas");
        const obs = obsEl ? obsEl.value.trim() : "";
        const lista = Array.from(instrumentosSelecionados);

        let mensagem = "";
        if (lista.length === 0) {
            mensagem = `Olá! Tenho interesse em montar uma formação musical sob medida com o Instituto Bravo Tatuí. Gostaria de receber uma consultoria sobre instrumentos e orçamentos.`;
            if (textoBtn) textoBtn.textContent = `Solicitar Consultoria no WhatsApp`;
        } else {
            mensagem = `Olá! Montei minha formação personalizada no site Bravo Tatuí com ${lista.length} instrumento(s):\n- ${lista.join("\n- ")}`;
            if (obs) {
                mensagem += `\n\nObservações/Músicas desejadas:\n"${obs}"`;
            }
            mensagem += `\n\nGostaria de receber um orçamento exclusivo!`;
            if (textoBtn) textoBtn.textContent = `Solicitar Orçamento (${lista.length} instrumentos)`;
        }

        if (btnWhatsapp) {
            btnWhatsapp.href = `https://wa.me/5515996257683?text=${encodeURIComponent(mensagem)}`;
        }
    };

    // 5. Renderização Dinâmica da Formação Selecionada
    function renderizarFormacao(formacaoId) {
        const dados = formacoesData[formacaoId] || formacoesData.plus;
        const idAtivo = dados.id;
        const isPersonalizada = idAtivo === "personalizada";

        // Atualizar título da página
        const nomeCompleto = dados.prefixo ? `${dados.prefixo} ${dados.nome}` : dados.nome;
        document.title = `${nomeCompleto} | Instituto Musical Bravo Tatuí`;

        // Atualizar breadcrumbs trail
        const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = nomeCompleto;
        }

        // Atualizar CSS Custom Properties dinamicamente no elemento raiz
        const root = document.documentElement;
        const cor = dados.cor;
        root.style.setProperty("--formation-color", cor);
        root.style.setProperty("--formation-glow", hexParaRgba(cor, 0.22));
        root.style.setProperty("--formation-border", hexParaRgba(cor, 0.38));
        root.style.setProperty("--formation-badge-bg", hexParaRgba(cor, 0.12));
        root.style.setProperty("--formation-light-overlay", hexParaRgba(cor, 0.05));

        // Atualizar Header & Hero
        const badgeTexto = document.getElementById("badgeTexto");
        if (badgeTexto) badgeTexto.textContent = dados.badge;

        const tituloEl = document.getElementById("tituloFormacao");
        if (tituloEl) {
            if (dados.prefixo) {
                tituloEl.innerHTML = `${dados.prefixo} <span class="destaque" style="color: ${cor};">${dados.nome}</span>`;
            } else {
                tituloEl.innerHTML = `<span class="destaque" style="color: ${cor};">${dados.nome}</span>`;
            }
        }

        const subtituloEl = document.getElementById("subtituloFormacao");
        if (subtituloEl) subtituloEl.textContent = dados.subtitulo;

        const descricaoEl = document.getElementById("descricaoLonga");
        if (descricaoEl) descricaoEl.textContent = dados.descricao;

        // Alternar entre Seção de Instrumentos Padrão e o Seletor Interativo da Personalizada
        const secaoPadrao = document.getElementById("secaoInstrumentosPadrao");
        const secaoPersonalizada = document.getElementById("secaoInstrumentosPersonalizada");
        const secaoPlaylist = document.getElementById("secaoPlaylist");
        const secaoAvisoCustom = document.getElementById("secaoAvisoCustom");
        const secaoOcasioes = document.getElementById("secaoOcasioes");
        const tituloCta = document.getElementById("tituloCta");
        const descricaoCta = document.getElementById("descricaoCta");

        if (isPersonalizada) {
            if (secaoPadrao) secaoPadrao.style.display = "none";
            if (secaoPersonalizada) secaoPersonalizada.style.display = "block";
            if (secaoPlaylist) secaoPlaylist.style.display = "none";
            if (secaoAvisoCustom) secaoAvisoCustom.style.display = "block";
            if (secaoOcasioes) secaoOcasioes.style.display = "none"; // Remove o card de recomendações de ocasiões na página "Faça do seu jeito"
            if (tituloCta) tituloCta.textContent = "Seu Projeto Sob Medida";
            if (descricaoCta) descricaoCta.textContent = "Converse diretamente com o Maestro para alinhar os arranjos, horários e sonorização para o seu evento.";
            window.limparInstrumentosPersonalizados();
        } else {
            if (secaoPadrao) secaoPadrao.style.display = "block";
            if (secaoPersonalizada) secaoPersonalizada.style.display = "none";
            if (secaoPlaylist) secaoPlaylist.style.display = "block";
            if (secaoAvisoCustom) secaoAvisoCustom.style.display = "none";
            if (secaoOcasioes) secaoOcasioes.style.display = "block";
            if (tituloCta) tituloCta.textContent = `Deseja a formação ${nomeCompleto} no seu Evento?`;
            if (descricaoCta) descricaoCta.textContent = "Receba atendimento exclusivo e tire todas as suas dúvidas diretamente com a equipe artística do Instituto Musical Bravo Tatuí.";

            // Atualizar Instrumentos Inclusos da formação fixa
            const instContainer = document.getElementById("instrumentosContainer");
            if (instContainer) {
                instContainer.innerHTML = dados.instrumentos.map(inst => `
                    <div class="instrument-pill">
                        <span class="inst-icon">${inst.icone}</span>
                        <div class="inst-info">
                            <strong>${inst.nome}</strong>
                            <small>${inst.desc}</small>
                        </div>
                    </div>
                `).join("");
            }

            // Atualizar Playlist de Demonstração
            const playlistContainer = document.getElementById("playlistContainer");
            if (playlistContainer) {
                playlistContainer.innerHTML = dados.playlist.map((musica) => `
                    <div class="playlist-track" onclick="window.toggleTrackPlay(this)">
                        <div class="track-left">
                            <button type="button" class="btn-play-sim" title="Ouvir demonstração">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </button>
                            <div class="track-names">
                                <span class="track-title">${musica.titulo}</span>
                                <span class="track-artist">${musica.artista}</span>
                            </div>
                        </div>
                        <div class="track-wave">
                            <span class="wave-bar"></span>
                            <span class="wave-bar"></span>
                            <span class="wave-bar"></span>
                            <span class="wave-bar"></span>
                        </div>
                        <span class="track-time">${musica.tempo}</span>
                    </div>
                `).join("");
            }

            // Atualizar link padrão do WhatsApp
            const btnWhatsapp = document.getElementById("btnWhatsapp");
            const textoBtn = document.getElementById("textoBtnWhatsapp");
            if (btnWhatsapp) {
                const mensagem = `Olá! Gostaria de solicitar um orçamento e saber a disponibilidade da formação ${nomeCompleto} para o meu evento com o Instituto Bravo Tatuí.`;
                btnWhatsapp.href = `https://wa.me/5515996257683?text=${encodeURIComponent(mensagem)}`;
            }
            if (textoBtn) {
                textoBtn.textContent = `Solicitar Orçamento no WhatsApp`;
            }
        }

        // Atualizar Ocasiões Ideais
        const ocasioesContainer = document.getElementById("ocasioesContainer");
        if (ocasioesContainer) {
            ocasioesContainer.innerHTML = dados.ocasioes.map(oc => `
                <div class="occasion-item">
                    <div class="occasion-indicator" style="background-color: ${cor};"></div>
                    <div class="occasion-text">
                        <strong>${oc.titulo}</strong>
                        <p>${oc.desc}</p>
                    </div>
                </div>
            `).join("");
        }

        // Atualizar Estilos & Repertório
        const estilosContainer = document.getElementById("estilosContainer");
        if (estilosContainer) {
            estilosContainer.innerHTML = dados.estilos.map(estilo => `
                <span class="style-chip">
                    <span class="chip-bullet" style="background-color: ${cor};"></span>
                    ${estilo}
                </span>
            `).join("");
        }

        // Atualizar Imagem Showcase
        const imgEl = document.getElementById("imagemFormacao");
        if (imgEl) {
            imgEl.src = dados.imagem;
            imgEl.alt = `Formação ${nomeCompleto} - Instituto Musical Bravo Tatuí`;
        }

        const tagFoto = document.getElementById("tagFoto");
        if (tagFoto) {
            tagFoto.textContent = `Bravo Tatuí • ${nomeCompleto}`;
        }

        // Atualizar Navegação Próximo / Anterior
        const currentIndex = listaFormacoesIds.indexOf(idAtivo);
        const prevIndex = (currentIndex - 1 + listaFormacoesIds.length) % listaFormacoesIds.length;
        const nextIndex = (currentIndex + 1) % listaFormacoesIds.length;

        const prevFormacao = formacoesData[listaFormacoesIds[prevIndex]];
        const nextFormacao = formacoesData[listaFormacoesIds[nextIndex]];

        const btnPrev = document.getElementById("btnPrevFormacao");
        const labelPrev = document.getElementById("labelPrevFormacao");
        if (btnPrev && labelPrev) {
            btnPrev.href = `./formacaoSelecionada.html?id=${prevFormacao.id}`;
            labelPrev.textContent = prevFormacao.prefixo ? `${prevFormacao.prefixo} ${prevFormacao.nome}` : prevFormacao.nome;
            labelPrev.style.color = prevFormacao.cor;
        }

        const btnNext = document.getElementById("btnNextFormacao");
        const labelNext = document.getElementById("labelNextFormacao");
        if (btnNext && labelNext) {
            btnNext.href = `./formacaoSelecionada.html?id=${nextFormacao.id}`;
            labelNext.textContent = nextFormacao.prefixo ? `${nextFormacao.prefixo} ${nextFormacao.nome}` : nextFormacao.nome;
            labelNext.style.color = nextFormacao.cor;
        }

        // Atualizar os Pills de Todas as Formações no Rodapé
        atualizarPillsStrip(idAtivo);
    }

    // 6. Montar Pill Strip de Todas as Formações no Rodapé
    function popularControlesDeNavegacao() {
        const pillsTrack = document.getElementById("pillsTrack");
        if (pillsTrack) {
            pillsTrack.innerHTML = listaFormacoesIds.map(id => {
                const item = formacoesData[id];
                const nomeCurto = item.nome;
                return `
                    <a href="./formacaoSelecionada.html?id=${item.id}" 
                       class="pill-link" 
                       id="pill-${item.id}"
                       data-id="${item.id}"
                       style="--pill-color: ${item.cor};">
                        <span class="pill-dot" style="background-color: ${item.cor};"></span>
                        <span class="pill-title">${nomeCurto}</span>
                    </a>
                `;
            }).join("");
        }
    }

    function atualizarPillsStrip(idAtivo) {
        listaFormacoesIds.forEach(id => {
            const pill = document.getElementById(`pill-${id}`);
            if (pill) {
                if (id === idAtivo) {
                    pill.classList.add("ativo");
                    pill.style.borderColor = formacoesData[id].cor;
                    pill.style.boxShadow = `0 0 15px ${hexParaRgba(formacoesData[id].cor, 0.4)}`;
                } else {
                    pill.classList.remove("ativo");
                    pill.style.borderColor = "";
                    pill.style.boxShadow = "";
                }
            }
        });
    }

    // 7. Efeito Interativo de Play nas Músicas da Playlist
    window.toggleTrackPlay = function (elementoTrack) {
        const estaAtivo = elementoTrack.classList.contains("tocando");

        // Pausar outros
        document.querySelectorAll(".playlist-track").forEach(tr => {
            tr.classList.remove("tocando");
            const btn = tr.querySelector(".btn-play-sim");
            if (btn) {
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            }
        });

        if (!estaAtivo) {
            elementoTrack.classList.add("tocando");
            const btn = elementoTrack.querySelector(".btn-play-sim");
            if (btn) {
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            }
        }
    };

    // 8. Inicialização
    function iniciar() {
        popularControlesDeNavegacao();
        inicializarSeletorDeInstrumentos();

        const params = new URLSearchParams(window.location.search);
        let idParam = (params.get("id") || "plus").toLowerCase();

        if (!formacoesData[idParam]) {
            idParam = "plus";
        }

        renderizarFormacao(idParam);

        // Suporte ao botão voltar/avançar do navegador
        window.addEventListener("popstate", () => {
            const currentParams = new URLSearchParams(window.location.search);
            const currentId = currentParams.get("id") || "plus";
            renderizarFormacao(currentId);
        });

        // Garante que ao voltar para a página ou sair dela, nenhum instrumento continue selecionado
        window.addEventListener("pageshow", () => {
            const currentParams = new URLSearchParams(window.location.search);
            const currentId = (currentParams.get("id") || "").toLowerCase();
            if (currentId === "personalizada") {
                if (typeof window.limparInstrumentosPersonalizados === "function") {
                    window.limparInstrumentosPersonalizados();
                }
            }
        });

        window.addEventListener("pagehide", () => {
            if (typeof window.limparInstrumentosPersonalizados === "function") {
                window.limparInstrumentosPersonalizados();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
