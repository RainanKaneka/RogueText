// expeditions.ts — Sistema de Expedições Temáticas
import { allRoomDescriptions } from "./roomDescriptions.js";

// =====================================================================
// INTERFACES
// =====================================================================

export type ExpeditionId = "ancient_dungeon" | "frost_mountain" | "flame_kingdom" | "shadow_realm";

export interface RoomDescription {
  id: string;
  texto: string;
  tipo: "combate" | "elite" | "tesouro" | "evento" | "fogueira" | "altar" | "boss";
  inimigosRelacionados: string[]; // nomes de inimigos que podem spawnar nessa descrição
  dificuldade?: number; // multiplicador de dificuldade da sala (0.8 a 1.5), default 1.0
}

export interface Expedition {
  id: ExpeditionId;
  nome: string;
  descricao: string;
  introducao: string; // texto narrativo exibido ao iniciar a expedição
  tema: string;
  icone: string;
  corTema: string; // cor CSS para estilização
  dificuldadeBase: number; // nível base (1-10)
  andares: number;
  monstrosPorAndar: { [key: number]: string[] };
  bossesPorAndar: { [key: number]: string[] };
  descricoesSalas: RoomDescription[];
  recompensasExclusivas: string[]; // nomes de itens exclusivos
  desbloqueada: boolean; // se começa desbloqueada ou não
  condicaoDesbloqueio?: string; // ID da expedição que precisa ser completada
}

// =====================================================================
// CATÁLOGO DE EXPEDIÇÕES
// =====================================================================

export const expeditions: Record<ExpeditionId, Expedition> = {

  // ─── EXPEDIÇÃO 1: MASMORRA ANTIGA (Inicial / Tutorial) ──────────────
  ancient_dungeon: {
    id: "ancient_dungeon",
    nome: "Masmorra Antiga",
    descricao: "Uma masmorra esquecida pelo tempo, repleta de criaturas que se abrigam em suas ruínas. O local perfeito para aventureiros iniciantes provarem seu valor.",
    introducao: "As portas de pedra rangem ao se abrirem, revelando um corredor engolido pela escuridão. O ar é denso, carregado com o cheiro de mofo e séculos de abandono. Tochas há muito apagadas ladeiam paredes rachadas, cobertas de musgo e teias. Sussurros indecifráveis ecoam das profundezas — são os ecos dos que vieram antes de você, ou algo que ainda vive nas sombras? A Masmorra Antiga guarda segredos e perigos esquecidos pelo tempo. Poucos ousam descer. Menos ainda retornam.",
    tema: "ruínas",
    icone: "",
    corTema: "#a0a0a0",
    dificuldadeBase: 1,
    andares: 10,
    monstrosPorAndar: {
      1: ["Rato Gigante", "Morcego Raivoso", "Goblin"],
      2: ["Goblin Escoteiro", "Pequeno Troll", "Aranha das Ruínas"],
      3: ["Esqueleto", "Zumbi", "Aranha Gigante"],
      4: ["Armadura Viva", "Esqueleto Arqueiro", "Gosma Ácida"],
      5: ["Gárgula", "Lobo das Cavernas", "Mímico"],
      6: ["Esqueleto Guerreiro", "Golem de Pedra Menor", "Bandido"],
      7: ["Cavaleiro Caído", "Minotauro", "Armadura Pesada"],
      8: ["Golem de Pedra", "Troll Ancião", "Cavaleiro Corrompido"],
      9: ["Titã Menor", "Dragão das Ruínas Menor", "Elemental de Pedra"],
      10: ["Guarda Real Corrompido", "Behemoth", "Golem de Ferro"],
    },
    bossesPorAndar: {
      1: ["Rei dos Goblins"],
      2: ["Troll Chefe"],
      3: ["Rainha Aranha"],
      4: ["Campeão Caído"],
      5: ["Golem Guardião"],
      6: ["Rei Perdido"],
      7: ["Minotauro Furioso"],
      8: ["Titã de Pedra"],
      9: ["Dragão das Ruínas"],
      10: ["Senhor da Masmorra"],
    },
    descricoesSalas: allRoomDescriptions.ancient_dungeon,
    recompensasExclusivas: ["Espada das Ruínas", "Escudo de Pedra Antiga", "Amuleto do Explorador"],
    desbloqueada: true,
  },

  // ─── EXPEDIÇÃO 2: MONTANHA DE GELO ──────────────────────────────────
  frost_mountain: {
    id: "frost_mountain",
    nome: "Montanha de Gelo",
    descricao: "Picos congelados onde o ar corta como lâminas. Criaturas de gelo ancestrais habitam cavernas cristalinas e protegem segredos milenares.",
    introducao: "O vento corta como navalha enquanto você escala o caminho congelado em direção ao cume. Cada respiração queima os pulmões, e a neve não para de cair. Lá em cima, entre picos de gelo que perfuram as nuvens, cavernas cristalinas guardam criaturas ancestrais que dormem há milênios. Dizem que os próprios Gigantes de Gelo moldaram estas montanhas como um santuário — e que algo muito antigo ainda vigia do topo. A trilha à frente desaparece sob a nevasca. Não há como voltar.",
    tema: "gelo",
    icone: "",
    corTema: "#4fc3f7",
    dificuldadeBase: 3,
    andares: 10,
    monstrosPorAndar: {
      1: ["Lobo Ártico", "Morcego de Gelo", "Goblin do Gelo"],
      2: ["Esqueleto de Gelo", "Elemental de Gelo Menor", "Lobo Ártico"],
      3: ["Troll Congelado", "Aranha de Gelo", "Elemental de Gelo Menor"],
      4: ["Golem de Gelo", "Troll Congelado", "Espectro do Frio"],
      5: ["Yeti", "Golem de Gelo", "Serpente de Gelo"],
      6: ["Cavaleiro do Inverno", "Yeti", "Espectro do Frio"],
      7: ["Wyrm de Gelo", "Cavaleiro do Inverno", "Elemental de Gelo"],
      8: ["Gigante de Gelo", "Wyrm de Gelo", "Elemental de Gelo"],
      9: ["Lich do Gelo", "Gigante de Gelo", "Valquíria Congelada"],
      10: ["Titã do Gelo", "Lich do Gelo", "Valquíria Congelada"],
    },
    bossesPorAndar: {
      1: ["Alfa dos Lobos Árticos"],
      2: ["Troll Ancião Congelado"],
      3: ["Rainha das Aranhas de Gelo"],
      4: ["Golem Cristalino"],
      5: ["Yeti Patriarca"],
      6: ["Cavaleiro do Inverno Eterno"],
      7: ["Hidra de Gelo"],
      8: ["Gigante de Gelo Ancestral"],
      9: ["Lich do Permafrost"],
      10: ["Dragão de Gelo"],
    },
    descricoesSalas: [
      // Combate
      { id: "fm_c1", texto: "Uma caverna congelada, repleta de cristais de gelo que refletem a luz como estrelas.", tipo: "combate", inimigosRelacionados: ["Troll Congelado", "Golem de Gelo"] },
      { id: "fm_c2", texto: "Pegadas enormes na neve levam a uma fenda na montanha. O ar está gelado e pesado.", tipo: "combate", inimigosRelacionados: ["Yeti", "Lobo Ártico"] },
      { id: "fm_c3", texto: "Esqueletos cobertos de gelo permanecem de pé, como se congelados no meio de uma batalha antiga.", tipo: "combate", inimigosRelacionados: ["Esqueleto de Gelo", "Espectro do Frio"] },
      { id: "fm_c4", texto: "Uma passagem estreita entre geleiras. Teias congeladas brilham como fios de prata.", tipo: "combate", inimigosRelacionados: ["Aranha de Gelo", "Goblin do Gelo"] },
      { id: "fm_c5", texto: "Um salão de gelo polido onde o reflexo mostra criaturas que não estão lá... ou estão?", tipo: "combate", inimigosRelacionados: ["Elemental de Gelo Menor", "Elemental de Gelo"] },
      { id: "fm_c6", texto: "O vento uiva através de uma ravina congelada. Olhos brilhantes observam do alto dos penhascos.", tipo: "combate", inimigosRelacionados: ["Lobo Ártico", "Morcego de Gelo"] },
      { id: "fm_c7", texto: "Uma armadura de gelo puro está montada como se um cavaleiro fantasma ainda a vestisse. Ela se move.", tipo: "combate", inimigosRelacionados: ["Cavaleiro do Inverno", "Espectro do Frio"] },
      { id: "fm_c8", texto: "Uma câmara subterrânea onde estalactites de gelo pingam sem parar. Algo colossal respira no escuro.", tipo: "combate", inimigosRelacionados: ["Gigante de Gelo", "Wyrm de Gelo"] },
      { id: "fm_c9", texto: "Um antigo templo dos gigantes, agora tomado pelo gelo. Runas congeladas pulsam com magia proibida.", tipo: "combate", inimigosRelacionados: ["Lich do Gelo", "Valquíria Congelada"] },
      { id: "fm_c10", texto: "Uma serpente translúcida desliza entre pilares de gelo. Seu corpo brilha como vidro líquido.", tipo: "combate", inimigosRelacionados: ["Serpente de Gelo", "Elemental de Gelo"] },
      // Elite
      { id: "fm_e1", texto: "O chão treme. Estacas de gelo brotam das paredes. Algo monstruoso desperta de um sono milenar.", tipo: "elite", inimigosRelacionados: ["Titã do Gelo", "Gigante de Gelo"], dificuldade: 1.5 },
      { id: "fm_e2", texto: "Uma câmara circular coberta de runas. No centro, uma criatura de gelo puro irradia poder incontrolável.", tipo: "elite", inimigosRelacionados: ["Golem Cristalino", "Elemental de Gelo"], dificuldade: 1.5 },
      // Tesouro
      { id: "fm_t1", texto: "Um lago congelado com algo brilhando logo abaixo da superfície translúcida.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "fm_t2", texto: "Uma câmara secreta onde gelo e ouro se fundiram. Tesouros de uma era esquecida.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "fm_t3", texto: "O ninho abandonado de uma criatura colossal. Entre os ossos, relíquias e armas antigas.", tipo: "tesouro", inimigosRelacionados: [] },
      // Evento
      { id: "fm_ev1", texto: "Um eremita aquece as mãos em uma fogueira quase extinta. Ele te observa com olhos curiosos.", tipo: "fogueira", inimigosRelacionados: [] },
      { id: "fm_ev2", texto: "Uma fonte termal emana vapor em meio ao gelo. A água quente parece restauradora.", tipo: "fogueira", inimigosRelacionados: [] },
      { id: "fm_ev3", texto: "Um altar de gelo com oferendas congeladas. Uma voz sussurra promessas de poder...", tipo: "altar", inimigosRelacionados: [] },
      // Boss
      { id: "fm_b1", texto: "O topo da montanha se abre em uma cratera de gelo. No centro, algo colossal respira e a temperatura despenca...", tipo: "boss", inimigosRelacionados: [] },
    ],
    recompensasExclusivas: ["Lâmina de Gelo Eterno", "Arco do Inverno", "Amuleto do Frio"],
    desbloqueada: false,
    condicaoDesbloqueio: "ancient_dungeon",
  },

  // ─── EXPEDIÇÃO 3: REINO DAS CHAMAS ──────────────────────────────────
  flame_kingdom: {
    id: "flame_kingdom",
    nome: "Reino das Chamas",
    descricao: "Terras vulcânicas onde rios de lava cortam a paisagem. Criaturas de fogo dominam este domínio abrasador e derretem tudo que se atreve a entrar.",
    introducao: "O chão estala sob seus pés enquanto o calor distorce o horizonte em ondas tremulantes. Rios de lava cortam a paisagem como veias incandescentes, iluminando cavernas de obsidiana com um brilho vermelho e sinistro. O ar cheira a enxofre e cinzas. Criaturas feitas de puro fogo espreitam entre as rochas negras, e o vulcão no centro deste reino pulsa como um coração vivo. Os antigos diziam que um ser de chamas eternas governa estas terras — e que nenhuma lâmina comum pode feri-lo. O calor aumenta a cada passo.",
    tema: "fogo",
    icone: "",
    corTema: "#ff6b35",
    dificuldadeBase: 3,
    andares: 10,
    monstrosPorAndar: {
      1: ["Salamandra Menor", "Morcego de Fogo", "Goblin do Fogo"],
      2: ["Elemental de Fogo Menor", "Salamandra Menor", "Lagarto de Lava"],
      3: ["Cavaleiro Flamejante", "Fênix Menor", "Elemental de Fogo Menor"],
      4: ["Cão Infernal", "Cavaleiro Flamejante", "Golem de Magma"],
      5: ["Demônio de Fogo", "Golem de Magma", "Serpente de Lava"],
      6: ["Efreet", "Demônio de Fogo", "Fênix"],
      7: ["Titã do Vulcão", "Efreet", "Quimera Flamejante"],
      8: ["Dragão de Fogo Menor", "Titã do Vulcão", "Fênix"],
      9: ["Senhor das Cinzas", "Dragão de Fogo Menor", "Efreet Ancião"],
      10: ["Arauto do Inferno", "Senhor das Cinzas", "Efreet Ancião"],
    },
    bossesPorAndar: {
      1: ["Matriarca Salamandra"],
      2: ["Golem de Magma Ancestral"],
      3: ["Cavaleiro das Cinzas"],
      4: ["Cerbero Flamejante"],
      5: ["Serpente de Lava Anciã"],
      6: ["Fênix Ancestral"],
      7: ["Efreet Sultão"],
      8: ["Titã Vulcânico"],
      9: ["Senhor do Inferno"],
      10: ["Dragão de Fogo"],
    },
    descricoesSalas: [
      // Combate
      { id: "fk_c1", texto: "Rios de lava cortam o chão como veias incandescentes. O calor é quase insuportável.", tipo: "combate", inimigosRelacionados: ["Salamandra Menor", "Lagarto de Lava"] },
      { id: "fk_c2", texto: "Pilares de obsidiana se erguem em um salão negro. Chamas dançam em suas superfícies polidas.", tipo: "combate", inimigosRelacionados: ["Elemental de Fogo Menor", "Cavaleiro Flamejante"] },
      { id: "fk_c3", texto: "Uma forja abandonada ainda arde com fogo eterno. Algo se forjou a si mesmo entre as chamas.", tipo: "combate", inimigosRelacionados: ["Golem de Magma", "Goblin do Fogo"] },
      { id: "fk_c4", texto: "Uma caverna onde cinzas caem como neve negra. Pegadas incandescentes marcam o chão.", tipo: "combate", inimigosRelacionados: ["Cão Infernal", "Demônio de Fogo"] },
      { id: "fk_c5", texto: "Uma ponte de rocha sobre um mar de lava. Do outro lado, silhuetas dançam entre as chamas.", tipo: "combate", inimigosRelacionados: ["Efreet", "Fênix Menor"] },
      { id: "fk_c6", texto: "Ninho de ovos incandescentes. Um deles se racha e algo ígneo emerge com um grito agudo.", tipo: "combate", inimigosRelacionados: ["Fênix Menor", "Morcego de Fogo"] },
      { id: "fk_c7", texto: "Um templo vulcânico com lava borbulhando em canais rituais. Estátuas de demônios vigiam a entrada.", tipo: "combate", inimigosRelacionados: ["Demônio de Fogo", "Efreet"] },
      { id: "fk_c8", texto: "O solo racha e lava jorra em gêiseres. Entre as erupções, algo colossal se ergue.", tipo: "combate", inimigosRelacionados: ["Titã do Vulcão", "Quimera Flamejante"] },
      { id: "fk_c9", texto: "Uma câmara onde o teto brilha como um sol preso. Criaturas de puro fogo circulam como sentinelas.", tipo: "combate", inimigosRelacionados: ["Senhor das Cinzas", "Dragão de Fogo Menor"] },
      { id: "fk_c10", texto: "Uma serpente feita de lava pura desliza entre rochas negras, deixando um rastro incandescente.", tipo: "combate", inimigosRelacionados: ["Serpente de Lava", "Lagarto de Lava"] },
      // Elite
      { id: "fk_e1", texto: "O vulcão ruge. Magma irrompe do chão. Uma criatura ancestral feita de fogo puro se materializa.", tipo: "elite", inimigosRelacionados: ["Arauto do Inferno", "Titã do Vulcão"], dificuldade: 1.5 },
      { id: "fk_e2", texto: "Um trono de obsidiana emite ondas de calor mortal. Quem se senta ali governa o fogo.", tipo: "elite", inimigosRelacionados: ["Efreet Ancião", "Senhor das Cinzas"], dificuldade: 1.5 },
      // Tesouro
      { id: "fk_t1", texto: "Uma câmara onde metais preciosos derreteram e solidificaram em formas exóticas. Riquezas vulcânicas.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "fk_t2", texto: "Um altar de obsidiana com artefatos intocados pelo fogo. Protegidos por magia ancestral.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "fk_t3", texto: "Os restos de uma expedição anterior. Seus corpos viraram cinzas, mas seus equipamentos resistiram.", tipo: "tesouro", inimigosRelacionados: [] },
      // Evento
      { id: "fk_ev1", texto: "Um ferreiro elemental trabalha em uma bigorna de lava. Ele oferece seus serviços... por um preço.", tipo: "fogueira", inimigosRelacionados: [] },
      { id: "fk_ev2", texto: "Uma fissura emite gases quentes que fazem a visão tremer. Visões do futuro ou ilusões de calor?", tipo: "fogueira", inimigosRelacionados: [] },
      { id: "fk_ev3", texto: "Um oásis impossível em meio ao fogo. Água cristalina que não evapora. Beber dela seria tentador...", tipo: "altar", inimigosRelacionados: [] },
      // Boss
      { id: "fk_b1", texto: "O coração do vulcão pulsa. Lava forma um trono colossal e sobre ele, um ser de chamas eternas te observa...", tipo: "boss", inimigosRelacionados: [] },
    ],
    recompensasExclusivas: ["Espada Incandescente", "Cajado do Vulcão", "Anel de Cinzas"],
    desbloqueada: false,
    condicaoDesbloqueio: "ancient_dungeon",
  },

  // ─── EXPEDIÇÃO 4: REINO DAS TREVAS ──────────────────────────────────
  shadow_realm: {
    id: "shadow_realm",
    nome: "Reino das Trevas",
    descricao: "Um domínio onde a luz não alcança. Criaturas da escuridão eterna se alimentam do medo e das almas dos vivos. Poucos retornam para contar a história.",
    introducao: "A luz se extingue como se tivesse sido devorada. A escuridão aqui não é apenas a ausência de luz — ela tem textura, peso, e vontade própria. Sussurros invadem sua mente antes mesmo de dar o primeiro passo. Sombras se movem sem corpo que as projete, e olhos vermelhos piscam no vazio antes de desaparecerem. O Reino das Trevas se alimenta do medo, e cada batida do seu coração ecoa como um convite ao que habita nas profundezas. Os que entraram antes de você não deixaram rastros. Nem ossos. Nem memórias.",
    tema: "trevas",
    icone: "",
    corTema: "#9c27b0",
    dificuldadeBase: 3,
    andares: 10,
    monstrosPorAndar: {
      1: ["Sombra Rastejante", "Morcego Sombrio", "Goblin das Trevas"],
      2: ["Lobo Sombrio", "Sombra Rastejante", "Espectro Menor"],
      3: ["Vampiro Menor", "Esqueleto das Trevas", "Espectro Menor"],
      4: ["Assassino Sombrio", "Vampiro Menor", "Wraith"],
      5: ["Necromante", "Wraith", "Pesadelo Vivo"],
      6: ["Vampiro Nobre", "Cavaleiro da Escuridão", "Pesadelo Vivo"],
      7: ["Aranha Sombria", "Vampiro Nobre", "Demônio das Sombras"],
      8: ["Lich das Trevas", "Demônio das Sombras", "Ceifador"],
      9: ["Arquidemônio", "Lich das Trevas", "Ceifador"],
      10: ["Devorador de Almas", "Arquidemônio", "Avatar das Trevas"],
    },
    bossesPorAndar: {
      1: ["Alfa das Sombras"],
      2: ["Conde Vampiro Menor"],
      3: ["Necromante do Véu"],
      4: ["Assassino Lorde"],
      5: ["Rainha Banshee"],
      6: ["Vampiro Ancestral"],
      7: ["Aracne Sombria"],
      8: ["Lich Supremo"],
      9: ["Arquidemônio Selado"],
      10: ["Senhor das Trevas"],
    },
    descricoesSalas: [
      // Combate
      { id: "sr_c1", texto: "A escuridão é tão densa que parece ter textura. Olhos vermelhos se abrem no vazio.", tipo: "combate", inimigosRelacionados: ["Sombra Rastejante", "Morcego Sombrio"] },
      { id: "sr_c2", texto: "Um corredor onde as tochas se apagam ao serem acesas. Sussurros ecoam de todos os lados.", tipo: "combate", inimigosRelacionados: ["Espectro Menor", "Goblin das Trevas"] },
      { id: "sr_c3", texto: "Teias de escuridão cobrem um salão onde a gravidade parece invertida. Algo observa do teto.", tipo: "combate", inimigosRelacionados: ["Aranha Sombria", "Sombra Rastejante"] },
      { id: "sr_c4", texto: "Um cemitério subterrâneo. Lápides sem nome. Os mortos não descansam aqui.", tipo: "combate", inimigosRelacionados: ["Esqueleto das Trevas", "Wraith"] },
      { id: "sr_c5", texto: "Uma câmara com espelhos quebrados. Cada reflexo mostra uma versão distorcida de você. Algumas se movem por conta própria.", tipo: "combate", inimigosRelacionados: ["Pesadelo Vivo", "Assassino Sombrio"] },
      { id: "sr_c6", texto: "O chão está encharcado com algo escuro. Pegadas levam a uma cripta aberta de onde emana poder necromântico.", tipo: "combate", inimigosRelacionados: ["Necromante", "Vampiro Menor"] },
      { id: "sr_c7", texto: "Um trono vazio de ossos negros. Mas as sombras ao redor dele se movem como se tivessem vontade própria.", tipo: "combate", inimigosRelacionados: ["Cavaleiro da Escuridão", "Vampiro Nobre"] },
      { id: "sr_c8", texto: "Uma fenda dimensional goteja trevas líquidas. Criaturas de outro plano emergem, famintas.", tipo: "combate", inimigosRelacionados: ["Demônio das Sombras", "Ceifador"] },
      { id: "sr_c9", texto: "Um laboratório necromântico abandonado. Frascos de almas quebrados. Os experimentos escaparam.", tipo: "combate", inimigosRelacionados: ["Lich das Trevas", "Lobo Sombrio"] },
      { id: "sr_c10", texto: "O vazio se abre como um olho. No centro, uma criatura que devora luz e esperança.", tipo: "combate", inimigosRelacionados: ["Devorador de Almas", "Avatar das Trevas"] },
      // Elite
      { id: "sr_e1", texto: "As trevas ganham forma. Um ser de escuridão pura materializa-se, irradiando medo absoluto.", tipo: "elite", inimigosRelacionados: ["Arquidemônio", "Avatar das Trevas"], dificuldade: 1.5 },
      { id: "sr_e2", texto: "Um portal para o abismo se abre. O que emerge é mais antigo que a própria escuridão.", tipo: "elite", inimigosRelacionados: ["Devorador de Almas", "Lich das Trevas"], dificuldade: 1.5 },
      // Tesouro
      { id: "sr_t1", texto: "Uma câmara onde sombras protegem um tesouro. Tocá-lo exige coragem... ou loucura.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "sr_t2", texto: "Relíquias de heróis que pereceram nas trevas. Suas armas ainda brilham com a luz da esperança.", tipo: "tesouro", inimigosRelacionados: [] },
      { id: "sr_t3", texto: "Um cofre selado com magia de proteção. Quem o selou queria que fosse encontrado... eventualmente.", tipo: "tesouro", inimigosRelacionados: [] },
      // Evento
      { id: "sr_ev1", texto: "Um espírito lamenta em um canto. Ele oferece informações em troca de algo... intangível.", tipo: "fogueira", inimigosRelacionados: [] },
      { id: "sr_ev2", texto: "Um altar das trevas pulsa com energia proibida. Sacrificar algo pode conceder poder imenso.", tipo: "altar", inimigosRelacionados: [] },
      { id: "sr_ev3", texto: "Uma criatura disforme oferece um pacto. Seus termos são obscuros, mas o poder prometido é real.", tipo: "altar", inimigosRelacionados: [] },
      // Boss
      { id: "sr_b1", texto: "O vazio se solidifica em uma forma impossível. As trevas ganham consciência e fixam seus olhos em você...", tipo: "boss", inimigosRelacionados: [] },
    ],
    recompensasExclusivas: ["Foice do Ceifeiro", "Cajado do Abismo", "Véu das Sombras"],
    desbloqueada: false,
    condicaoDesbloqueio: "ancient_dungeon",
  },
};

// =====================================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================================

/**
 * Retorna as expedições desbloqueadas com base no save do jogador.
 */
export function getExpedicoesDesbloqueadas(expedicoesConcluidas: string[]): Expedition[] {
  return Object.values(expeditions).filter(exp => {
    if (exp.desbloqueada) return true;
    if (exp.condicaoDesbloqueio && expedicoesConcluidas.includes(exp.condicaoDesbloqueio)) return true;
    return false;
  });
}

/**
 * Retorna as expedições bloqueadas.
 */
export function getExpedicoesBloqueadas(expedicoesConcluidas: string[]): Expedition[] {
  return Object.values(expeditions).filter(exp => {
    if (exp.desbloqueada) return false;
    if (exp.condicaoDesbloqueio && expedicoesConcluidas.includes(exp.condicaoDesbloqueio)) return false;
    return true;
  });
}

/**
 * Retorna uma expedição pelo ID.
 */
export function getExpedition(id: ExpeditionId): Expedition {
  return expeditions[id];
}

/**
 * Sorteia descrições de salas do pool da expedição, evitando repetições.
 * @param expedition - A expedição ativa
 * @param tipo - O tipo de sala a filtrar
 * @param descricosUsadas - IDs de descrições já usadas nesta run
 * @returns Uma descrição de sala ou null se todas já foram usadas
 */
export function sortearDescricaoSala(
  expedition: Expedition,
  tipo: RoomDescription["tipo"],
  descricoesUsadas: Set<string>
): RoomDescription | null {
  const disponiveis = expedition.descricoesSalas.filter(
    d => d.tipo === tipo && !descricoesUsadas.has(d.id)
  );

  if (disponiveis.length === 0) {
    // Fallback: permite repetição se esgotou o pool
    const todas = expedition.descricoesSalas.filter(d => d.tipo === tipo);
    if (todas.length === 0) return null;
    return todas[Math.floor(Math.random() * todas.length)]!;
  }

  return disponiveis[Math.floor(Math.random() * disponiveis.length)]!;
}
