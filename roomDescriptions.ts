import type { ExpeditionId, RoomDescription } from "./expeditions.js";

export const allRoomDescriptions: Record<ExpeditionId, RoomDescription[]> = {
  ancient_dungeon: [
    // --- COMBATE COMUM ---
    // Andar 1: Rato Gigante, Morcego Raivoso, Goblin
    { id: "ad_c1", texto: "O corredor de entrada da masmorra cheira a mofo e excrementos. Pequenas pegadas de garras cobrem o chão empoeirado, e algo arranha as pedras freneticamente atrás de uma pilha de entulho.", tipo: "combate", inimigosRelacionados: ["Rato Gigante"] },
    { id: "ad_c2", texto: "O teto da primeira câmara é alto e escuro demais para enxergar. Guano cobre o chão, e o som de asas de couro batendo ecoa lá em cima — dezenas de olhos vermelhos se abrem ao mesmo tempo.", tipo: "combate", inimigosRelacionados: ["Morcego Raivoso"] },
    { id: "ad_c3", texto: "Restos de comida e ossos roídos estão espalhados pelo chão de um acampamento improvisado. Risadinhas agudas ecoam das sombras enquanto pequenas silhuetas verdes recuam atrás de barricadas de madeira podre.", tipo: "combate", inimigosRelacionados: ["Goblin"] },
    { id: "ad_c4", texto: "Na despensa abandonada da masmorra, sacos de grãos foram rasgados e espalhados pelo chão. Ratos enormes, do tamanho de cães pequenos, roem os restos e erguem as cabeças ao perceber sua presença.", tipo: "combate", inimigosRelacionados: ["Rato Gigante", "Morcego Raivoso"] },

    // Andar 2: Goblin Escoteiro, Pequeno Troll, Aranha das Ruínas
    { id: "ad_c5", texto: "Um goblin menor, coberto de tinta de guerra, espia você de trás de uma coluna rachada. Ele segura uma faca enferrujada e parece estar avaliando se deve atacar ou correr para avisar os outros.", tipo: "combate", inimigosRelacionados: ["Goblin Escoteiro"] },
    { id: "ad_c6", texto: "A passagem se estreita e o fedor azedo de troll impregna o ar. Marcas de garras enormes sulcam as paredes, e grunhidos roucos vêm de uma alcova coberta por um couro esfarrapado.", tipo: "combate", inimigosRelacionados: ["Pequeno Troll"] },
    { id: "ad_c7", texto: "Teias pegajosas cobrem toda a extensão do corredor, do chão ao teto. No centro, casulos pendurados ainda se movem fracamente — a aranha que os fez não está longe.", tipo: "combate", inimigosRelacionados: ["Aranha das Ruínas"] },
    { id: "ad_c8", texto: "Um beco sem saída onde goblins batedores montaram uma emboscada com armadilhas de corda. Pedras afiadas foram empilhadas como munição, e olhos amarelados brilham em cada canto.", tipo: "combate", inimigosRelacionados: ["Goblin Escoteiro", "Goblin Escoteiro"] },

    // Andar 3: Esqueleto, Zumbi, Aranha Gigante
    { id: "ad_c9", texto: "Uma cripta antiga com nichos nas paredes, cada um contendo restos mortais. Vários dos esqueletos estão fora de seus lugares, de pé, com armas enferrujadas nas mãos ossudas.", tipo: "combate", inimigosRelacionados: ["Esqueleto"] },
    { id: "ad_c10", texto: "O fedor de carne apodrecida é insuportável. Figuras cambaleantes arrastam-se pelo corredor, gemendo, com pele cinzenta pendendo dos ossos. Elas se viram lentamente ao ouvir seus passos.", tipo: "combate", inimigosRelacionados: ["Zumbi"] },
    { id: "ad_c11", texto: "Uma caverna natural conectada à masmorra está completamente forrada de teias brancas e grossas. No centro, uma aranha monstruosa do tamanho de um cavalo termina de embrulhar sua presa.", tipo: "combate", inimigosRelacionados: ["Aranha Gigante"] },
    { id: "ad_c12", texto: "Um antigo cemitério subterrâneo da masmorra. Lápides rachadas e covas abertas. Os mortos que deveriam descansar aqui se erguem com olhos vazios e punhos cerrados.", tipo: "combate", inimigosRelacionados: ["Esqueleto", "Zumbi"] },

    // Andar 4: Armadura Viva, Esqueleto Arqueiro, Gosma Ácida
    { id: "ad_c13", texto: "No salão de armaduras da antiga guarnição, peças de aço ferrugento estão dispostas em fileiras perfeitas. Uma delas range, vira a cabeça e ergue a espada que segurava como decoração.", tipo: "combate", inimigosRelacionados: ["Armadura Viva"] },
    { id: "ad_c14", texto: "Um balcão de pedra elevado domina a sala como uma muralha interna. De trás dele, flechas de osso voam — esqueletos armados com arcos recurvos antigos disparam com precisão mortal.", tipo: "combate", inimigosRelacionados: ["Esqueleto Arqueiro"] },
    { id: "ad_c15", texto: "O piso deste corredor está corroído, derretido em padrões circulares. Uma massa gelatinosa verde-ácida pulsa lentamente pelo chão, dissolvendo tudo que toca.", tipo: "combate", inimigosRelacionados: ["Gosma Ácida"] },
    { id: "ad_c16", texto: "Uma sala de armazenamento destruída. Ácido corroeu as prateleiras, e no meio da gosma borbulhante, ossos reanimados empunham arcos, protegidos pela criatura viscosa.", tipo: "combate", inimigosRelacionados: ["Gosma Ácida", "Esqueleto Arqueiro"] },

    // Andar 5: Gárgula, Lobo das Cavernas, Mímico
    { id: "ad_c17", texto: "Uma galeria adornada com estátuas grotescas nos cantos. Você passa por uma delas e jura que seus olhos de pedra a acompanharam. Quando olha de novo, a estátua não está mais no mesmo lugar.", tipo: "combate", inimigosRelacionados: ["Gárgula"] },
    { id: "ad_c18", texto: "O túnel se conecta a uma caverna natural onde ossos de presas estão espalhados. Olhos brilhantes na escuridão e o som de garras arranhando pedra revelam uma matilha de predadores subterrâneos.", tipo: "combate", inimigosRelacionados: ["Lobo das Cavernas"] },
    { id: "ad_c19", texto: "Uma sala de tesouro aparentemente intocada. Um baú ornamentado com ouro está no centro, brilhando de forma tentadora. Mas quando você se aproxima, a tampa se abre revelando fileiras de dentes afiados.", tipo: "combate", inimigosRelacionados: ["Mímico"] },
    { id: "ad_c20", texto: "Uma ponte de pedra sobre um abismo escuro no interior da masmorra. Estátuas de gárgulas decoram os pilares — até que uma delas espalha suas asas e salta em sua direção.", tipo: "combate", inimigosRelacionados: ["Gárgula", "Gárgula"] },

    // Andar 6: Esqueleto Guerreiro, Golem de Pedra Menor, Bandido
    { id: "ad_c21", texto: "Um antigo pátio de treinamento onde esqueletos completos, vestidos com armadura de combate e empunhando espadas, marcham em formação como se ainda obedecessem ordens de um general morto.", tipo: "combate", inimigosRelacionados: ["Esqueleto Guerreiro"] },
    { id: "ad_c22", texto: "Uma câmara onde estátuas menores de guerreiros foram alinhadas como sentinelas. Quando você pisa na laje central, runas se acendem e as estátuas de pedra começam a se mover.", tipo: "combate", inimigosRelacionados: ["Golem de Pedra Menor"] },
    { id: "ad_c23", texto: "Você encontra um acampamento recente com fogueira ainda quente e garrafas de vinho vazias. Risadas cruéis ecoam antes que figuras armadas com facas e bestas surjam das sombras.", tipo: "combate", inimigosRelacionados: ["Bandido"] },
    { id: "ad_c24", texto: "Os bandidos fizeram desta sala seu quartel-general. Barricadas de madeira, sacos de moedas roubadas e armadilhas improvisadas. Eles não pretendem dividir o território.", tipo: "combate", inimigosRelacionados: ["Bandido", "Bandido"] },

    // Andar 7: Cavaleiro Caído, Minotauro, Armadura Pesada
    { id: "ad_c25", texto: "Um cavaleiro ajoelhado diante de um altar profanado. Sua armadura está manchada de sangue seco, e quando ele se levanta, seus olhos emitem um brilho fantasmagórico. Ele jurou proteger este lugar — mesmo após a morte.", tipo: "combate", inimigosRelacionados: ["Cavaleiro Caído"] },
    { id: "ad_c26", texto: "O corredor se alarga numa câmara com marcas de chifres nas paredes, como se algo enorme tivesse se atirado contra elas repetidamente. Um mugido furioso ecoa das profundezas.", tipo: "combate", inimigosRelacionados: ["Minotauro"] },
    { id: "ad_c27", texto: "Uma sala de guarda onde armaduras completas de aço pesado ainda montam vigília. Encharcadas de magia residual, elas se erguem com movimentos lentos mas devastadores.", tipo: "combate", inimigosRelacionados: ["Armadura Pesada"] },
    { id: "ad_c28", texto: "O labirinto interior da masmorra. Paredes arranhadas por chifres, esqueletos esmagados no chão, e o som ritmado de cascos pesados se aproximando.", tipo: "combate", inimigosRelacionados: ["Minotauro", "Cavaleiro Caído"] },

    // Andar 8: Golem de Pedra, Troll Ancião, Cavaleiro Corrompido
    { id: "ad_c29", texto: "Uma câmara monumental com um guardião de pedra de três metros de altura. Runas antigas pulsam em seu peito — ele foi construído para impedir que qualquer intruso avance além deste ponto.", tipo: "combate", inimigosRelacionados: ["Golem de Pedra"] },
    { id: "ad_c30", texto: "A toca de um troll ancião. Pilhas de ossos, peles curtidas e troféus macabros decoram as paredes. A criatura é enorme, coberta de cicatrizes, e cada regeneração a tornou mais resistente.", tipo: "combate", inimigosRelacionados: ["Troll Ancião"] },
    { id: "ad_c31", texto: "Um cavaleiro que outrora defendia a masmorra agora serve a forças sombrias. Sua armadura negra emana uma névoa púrpura, e sua espada brilha com encantamentos proibidos.", tipo: "combate", inimigosRelacionados: ["Cavaleiro Corrompido"] },
    { id: "ad_c32", texto: "A antiga sala do trono intermediário. O cavaleiro que jurou lealdade ao rei caído guarda esta passagem junto a um golem que ele próprio ativou como última defesa.", tipo: "combate", inimigosRelacionados: ["Cavaleiro Corrompido", "Golem de Pedra"] },

    // Andar 9: Titã Menor, Dragão das Ruínas Menor, Elemental de Pedra
    { id: "ad_c33", texto: "Uma câmara colossal onde as colunas são do tamanho de sequoias. Entre elas, uma figura humanóide gigantesca de rocha e músculo se ergue — um titã menor, guardião esquecido de uma era morta.", tipo: "combate", inimigosRelacionados: ["Titã Menor"] },
    { id: "ad_c34", texto: "Uma silhueta draconiana repousa enrolada no topo de um pilar desmoronado. Escamas acinzentadas como pedra, garras que sulcam o mármore. Quando ela abre os olhos, chamas fracas escapam de suas narinas.", tipo: "combate", inimigosRelacionados: ["Dragão das Ruínas Menor"] },
    { id: "ad_c35", texto: "O ar fica denso e carregado de energia. Pedras flutuam ao redor de um núcleo brilhante no centro da sala — um elemental de pedra, fragmento vivo da própria masmorra.", tipo: "combate", inimigosRelacionados: ["Elemental de Pedra"] },
    { id: "ad_c36", texto: "Um fosso gigantesco onde os escombros se condensaram em formas vivas. Titãs de pedra e elementais compartilham este espaço como guardiões primitivos da estrutura.", tipo: "combate", inimigosRelacionados: ["Titã Menor", "Elemental de Pedra"] },

    // Andar 10: Guarda Real Corrompido, Behemoth, Golem de Ferro
    { id: "ad_c37", texto: "A antecâmara do senhor da masmorra. Guardas reais que falharam em proteger seu rei agora servem como carcereiros eternos, com armaduras negras e olhos sem vida.", tipo: "combate", inimigosRelacionados: ["Guarda Real Corrompido"] },
    { id: "ad_c38", texto: "Uma besta colossal, quase primitiva, está acorrentada no centro de uma arena subterrânea. As correntes estão quase partidas. Ela mastiga ossos enquanto baba ácida escorre de suas mandíbulas.", tipo: "combate", inimigosRelacionados: ["Behemoth"] },
    { id: "ad_c39", texto: "A forja mestra da masmorra ainda funciona, alimentada por magia antiga. Sua obra-prima — um golem de ferro perfeito, sem ferrugem, sem falhas — guarda a passagem final.", tipo: "combate", inimigosRelacionados: ["Golem de Ferro"] },
    { id: "ad_c40", texto: "A última linha de defesa antes do senhor da masmorra. Guardas reais corrompidos flanqueiam um golem de ferro reluzente que bloqueia a porta selada.", tipo: "combate", inimigosRelacionados: ["Guarda Real Corrompido", "Golem de Ferro"] },

    // --- ELITE ---
    { id: "ad_e1", texto: "Uma porta reforçada com correntes enferrujadas. O chão treme ritmicamente do outro lado. Ao arrombar a porta, você se depara com um minotauro furioso, preso aqui como punição por desobedecer seu mestre.", tipo: "elite", inimigosRelacionados: ["Minotauro", "Minotauro"], dificuldade: 1.5 },
    { id: "ad_e2", texto: "O salão central da masmorra, onde duas enormes estátuas de pedra guardam um portal selado. Quando você tenta passar, ambas despertam simultaneamente com um estrondo ensurdecedor.", tipo: "elite", inimigosRelacionados: ["Golem de Pedra", "Golem de Pedra Menor"], dificuldade: 1.5 },
    { id: "ad_e3", texto: "Um ninho no topo de uma torre interna em ruínas. Uma criatura draconiana com escamas de rocha e asas membranosas protege seus ovos com ferocidade — e uma gárgula guarda a base da torre.", tipo: "elite", inimigosRelacionados: ["Dragão das Ruínas Menor", "Gárgula"], dificuldade: 1.6 },
    { id: "ad_e4", texto: "A sala do capitão da guarda real. Ele permanece em seu posto mesmo após séculos, cercado por seus soldados mais leais — armaduras pesadas que nunca abandonaram a formação.", tipo: "elite", inimigosRelacionados: ["Guarda Real Corrompido", "Armadura Pesada"], dificuldade: 1.5 },
    { id: "ad_e5", texto: "A oficina secreta do artífice da masmorra. Sua criação suprema — um golem de ferro colossal — foi ativada e não reconhece aliados. Um elemental de pedra alimenta a fornalha que o mantém vivo.", tipo: "elite", inimigosRelacionados: ["Golem de Ferro", "Elemental de Pedra"], dificuldade: 1.6 },

    // --- TESOURO ---
    { id: "ad_t1", texto: "Uma sala secreta escondida atrás de uma parede falsa. Um baú de madeira antiga repousa no centro, coberto de pó, intocado por séculos.", tipo: "tesouro", inimigosRelacionados: [] },
    { id: "ad_t2", texto: "Um pequeno santuário dedicado a uma divindade esquecida. Oferendas de ouro e joias ainda estão sobre o altar, como se os fiéis tivessem saído ontem.", tipo: "tesouro", inimigosRelacionados: [] },
    { id: "ad_t3", texto: "Os restos de um acampamento de aventureiros que vieram antes de você. Eles não sobreviveram, mas seus suprimentos e equipamentos ficaram para trás.", tipo: "tesouro", inimigosRelacionados: [] },
    { id: "ad_t4", texto: "Atrás de uma cachoeira subterrânea que escorre pelas pedras, você avista um brilho metálico vindo de um caixote de madeira lacrado com cera.", tipo: "tesouro", inimigosRelacionados: [] },
    { id: "ad_t5", texto: "Um cofre antigo está escondido numa alcova atrás de uma estante desmoronada. O mecanismo de tranca já se desfez com o tempo, e o conteúdo está ali para quem encontrar.", tipo: "tesouro", inimigosRelacionados: [] },

    // --- FOGUEIRA ---
    { id: "ad_fog1", texto: "Uma alcova protegida do vento onde alguém deixou toras secas empilhadas e um anel de pedras. Um local perfeito para acender uma fogueira e descansar por um momento.", tipo: "fogueira", inimigosRelacionados: [] },
    { id: "ad_fog2", texto: "Uma fonte de água cristalina brota entre as pedras rachadas. A água emite um brilho suave e convidativo, como se a própria masmorra oferecesse um momento de trégua.", tipo: "fogueira", inimigosRelacionados: [] },
    { id: "ad_fog3", texto: "Você encontra uma pequena câmara aquecida por uma fissura geotérmica no chão. O ar quente e seco é reconfortante, e o espaço parece seguro o suficiente para descansar.", tipo: "fogueira", inimigosRelacionados: [] },
    { id: "ad_fog4", texto: "Os restos de um acampamento de aventureiros anteriores. A fogueira foi apagada há pouco, mas as brasas ainda estão quentes. Há lenha suficiente para reacendê-la.", tipo: "fogueira", inimigosRelacionados: [] },

    // --- ALTAR ---
    { id: "ad_alt1", texto: "Um altar de pedra negra manchado com sangue ressecado. Símbolos profanos estão gravados na superfície, e uma aura letal paira no ar. A entidade que habita este altar ainda exige tributos.", tipo: "altar", inimigosRelacionados: [] },
    { id: "ad_alt2", texto: "Uma estátua demoníaca com as mãos abertas domina a sala. Uma voz grave sussurra em sua mente, prometendo poder em troca de um sacrifício.", tipo: "altar", inimigosRelacionados: [] },
    { id: "ad_alt3", texto: "Círculos rituais estão gravados no chão com tinta vermelha escura. No centro, um pedestal emana uma energia sombria que puxa você em sua direção. Algo oferece um pacto.", tipo: "altar", inimigosRelacionados: [] },
    { id: "ad_alt4", texto: "Um santuário profanado onde velas negras ardem sem se consumir. A presença de algo antigo e faminto permeia o ar — está disposto a negociar poder por um preço.", tipo: "altar", inimigosRelacionados: [] },

    // --- BOSS ---
    { id: "ad_b1", texto: "As enormes portas de ferro negro foram arrancadas das dobradiças. O salão do trono se abre diante de você — e no escuro, sentado em seu trono de ossos, o mestre desta ruína aguarda.", tipo: "boss", inimigosRelacionados: [] },
    { id: "ad_b2", texto: "O teto desabou, revelando um céu de rocha pura lá em cima. No centro desta arena de escombros, a vibração no chão indica que algo colossal está se aproximando do outro lado.", tipo: "boss", inimigosRelacionados: [] },
    { id: "ad_b3", texto: "O cheiro de morte preenche a câmara abobadada mais profunda da masmorra. Ossos de mil heróis decoram as paredes como troféus — este é o covil do verdadeiro guardião.", tipo: "boss", inimigosRelacionados: [] },
  ],
  
  frost_mountain: [],
  flame_kingdom: [],
  shadow_realm: []
};
