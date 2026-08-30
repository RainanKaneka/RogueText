// drops.ts — Sistema de Drops de Criaturas

export interface DropItem {
  nome: string;
  descricao: string;
  tier: number;
}

// Todos os itens de drop do jogo
export const dropsDB: Record<string, DropItem> = {
  // Tier 1 — Goblin
  "Orelha Pontuda": { nome: "Orelha Pontuda", descricao: "Uma orelha de goblin, pontuda e levemente fedorenta.", tier: 1 },
  "Couro Rasgado": { nome: "Couro Rasgado", descricao: "Pedaço de couro fino rasgado, útil como material básico.", tier: 1 },
  // Tier 1 — Pequeno Troll
  "Dente Quebrado": { nome: "Dente Quebrado", descricao: "Dente duro de troll, parcialmente trincado.", tier: 1 },
  "Sangue Regenerativo Menor": { nome: "Sangue Regenerativo Menor", descricao: "Sangue espesso com propriedades regenerativas fracas.", tier: 1 },
  // Tier 1 — Cão de Caça
  "Presa Canina": { nome: "Presa Canina", descricao: "Presa afiada de um cão de caça.", tier: 1 },
  "Tendão Fino": { nome: "Tendão Fino", descricao: "Tendão resistente e elástico.", tier: 1 },
  // Tier 1 — Morcego Raivoso
  "Asa de Quiróptero": { nome: "Asa de Quiróptero", descricao: "Asa membranosa de morcego, leve e flexível.", tier: 1 },
  "Glândula de Raiva": { nome: "Glândula de Raiva", descricao: "Pequena glândula que segrega toxinas de raiva.", tier: 1 },

  // Tier 2 — Homúnculo
  "Resíduo de Alquimia": { nome: "Resíduo de Alquimia", descricao: "Sobras de experimentos alquímicos instáveis.", tier: 2 },
  "Núcleo Biológico Instável": { nome: "Núcleo Biológico Instável", descricao: "Núcleo pulsante de energia alquímica.", tier: 2 },
  // Tier 2 — Esqueleto
  "Fragmento de Osso Denso": { nome: "Fragmento de Osso Denso", descricao: "Osso extremamente denso, resistente e pesado.", tier: 2 },
  "Pó Cadavérico": { nome: "Pó Cadavérico", descricao: "Pó fino de ossos velhos com leve essência mágica.", tier: 2 },
  // Tier 2 — Zumbi
  "Tecido Necrótico": { nome: "Tecido Necrótico", descricao: "Tecido corrompido pela morte, mas ainda com estrutura.", tier: 2 },
  "Dente Podre": { nome: "Dente Podre", descricao: "Dente degradado impregnado com veneno putrefato.", tier: 2 },
  // Tier 2 — Múmia
  "Faixas Rituais Secas": { nome: "Faixas Rituais Secas", descricao: "Bandagens impregnadas de óleos de embalsamamento sagrado.", tier: 2 },
  "Poeira de Embalsamamento": { nome: "Poeira de Embalsamamento", descricao: "Pó de ervas e resinas usadas em rituais funerários.", tier: 2 },

  // Tier 3 — Diabrete
  "Cauda Farpada": { nome: "Cauda Farpada", descricao: "Cauda ágil com farpa venenosa na ponta.", tier: 3 },
  "Essência Sulfurosa": { nome: "Essência Sulfurosa", descricao: "Líquido amarelado com odor forte de enxofre.", tier: 3 },
  // Tier 3 — Gárgula
  "Lasca de Granito Rúnico": { nome: "Lasca de Granito Rúnico", descricao: "Pedaço de pedra com inscrições rúnicas.", tier: 3 },
  "Cascalho Endurecido": { nome: "Cascalho Endurecido", descricao: "Fragmento de rocha magicamente endurecida.", tier: 3 },
  // Tier 3 — Armadura Viva
  "Placa de Ferro Assombrada": { nome: "Placa de Ferro Assombrada", descricao: "Metal imbuído de uma consciência espectral.", tier: 3 },
  "Rebite Encantado": { nome: "Rebite Encantado", descricao: "Prego de ferro com encantamento de resistência.", tier: 3 },

  // Tier 4 — Lobo Sombrio
  "Pelo Umbrático": { nome: "Pelo Umbrático", descricao: "Pelo que absorve luz ao redor.", tier: 4 },
  "Garra das Sombras": { nome: "Garra das Sombras", descricao: "Garra afiada com propriedades das trevas.", tier: 4 },
  // Tier 4 — Sacerdote Caído
  "Fragmento de Rosário Profano": { nome: "Fragmento de Rosário Profano", descricao: "Conta de rosário corrompida por rituais sombrios.", tier: 4 },
  "Cinzas Sacrílegas": { nome: "Cinzas Sacrílegas", descricao: "Cinzas de escrituras sagradas queimadas em ritual profano.", tier: 4 },
  // Tier 4 — Quimera
  "Pelo Misto Impregnado": { nome: "Pelo Misto Impregnado", descricao: "Pelagem híbrida carregada de energia mágica instável.", tier: 4 },
  "Ferrão de Serpente": { nome: "Ferrão de Serpente", descricao: "Ferrão venenoso da parte serpentina da quimera.", tier: 4 },

  // Tier 5 — Medusa
  "Escama de Serpente Venenosa": { nome: "Escama de Serpente Venenosa", descricao: "Escama impregnada de peçonha paralisante.", tier: 5 },
  "Olho Petrificante": { nome: "Olho Petrificante", descricao: "Olho de medusa ainda irradiando energia petrificante.", tier: 5 },
  // Tier 5 — Verme da Areia
  "Carapaça Quirina": { nome: "Carapaça Quirina", descricao: "Parte da carapaça dura do verme, resistente a calor.", tier: 5 },
  "Líquido Digestivo Corrosivo": { nome: "Líquido Digestivo Corrosivo", descricao: "Ácido do sistema digestivo do verme, extremamente corrosivo.", tier: 5 },
  // Tier 5 — Sereia
  "Escama Iridiscente": { nome: "Escama Iridiscente", descricao: "Escama que muda de cor com reflexo mágico.", tier: 5 },
  "Corda Vocal Ressonante": { nome: "Corda Vocal Ressonante", descricao: "Tecido vocal da sereia com propriedades sônicas.", tier: 5 },

  // Tier 6 — Vampiro
  "Presa de Sangue Nobre": { nome: "Presa de Sangue Nobre", descricao: "Presa de vampiro ancestral, imbuída de magia hemática.", tier: 6 },
  "Pedaço de Capa Sombria": { nome: "Pedaço de Capa Sombria", descricao: "Tecido da capa vampírica que absorve luz.", tier: 6 },
  // Tier 6 — Necromante
  "Tinta Necromântica Seca": { nome: "Tinta Necromântica Seca", descricao: "Tinta usada em rituais de necromancia.", tier: 6 },
  "Dedo Mumificado Encantado": { nome: "Dedo Mumificado Encantado", descricao: "Dedo com runa de invocação entalhada.", tier: 6 },
  // Tier 6 — Aranha Gigante
  "Seda Pegajosa Reforçada": { nome: "Seda Pegajosa Reforçada", descricao: "Fio de teia extremamente resistente e pegajoso.", tier: 6 },
  "Glândula de Neurotoxina": { nome: "Glândula de Neurotoxina", descricao: "Glândula cheia de veneno que paralisa o sistema nervoso.", tier: 6 },

  // Tier 7 — Troll da Montanha
  "Couro Pedregoso": { nome: "Couro Pedregoso", descricao: "Pele dura como rocha, quase impenetrável.", tier: 7 },
  "Sangue Regenerativo Puro": { nome: "Sangue Regenerativo Puro", descricao: "Sangue com propriedades regenerativas altamente concentradas.", tier: 7 },
  // Tier 7 — Wendigo
  "Chifre Congelado": { nome: "Chifre Congelado", descricao: "Chifre permanentemente recoberto de gelo eterno.", tier: 7 },
  "Garra Fétida": { nome: "Garra Fétida", descricao: "Garra longa impregnada de carne em decomposição.", tier: 7 },
  // Tier 7 — Minotauro
  "Ponta de Chifre Bruto": { nome: "Ponta de Chifre Bruto", descricao: "Fragmento maciço de chifre de minotauro.", tier: 7 },
  "Tendão Muscular Robusto": { nome: "Tendão Muscular Robusto", descricao: "Tendão grosso com força extraordinária.", tier: 7 },

  // Tier 8 — Golem de Pedra
  "Núcleo Sísmico": { nome: "Núcleo Sísmico", descricao: "Coração de pedra pulsante que controla o golem.", tier: 8 },
  "Pedaço de Rocha Viva": { nome: "Pedaço de Rocha Viva", descricao: "Rocha que ainda pulsa com energia telúrica.", tier: 8 },
  // Tier 8 — Ghoul
  "Garra Paralisante": { nome: "Garra Paralisante", descricao: "Garra que injeta toxina paralisante ao arranhar.", tier: 8 },
  "Carne Pútrida Concentrada": { nome: "Carne Pútrida Concentrada", descricao: "Tecido concentrado com propriedades necróticas.", tier: 8 },
  // Tier 8 — Lich
  "Fragmento de Filactéria": { nome: "Fragmento de Filactéria", descricao: "Estilhaço do recipiente da alma do Lich.", tier: 8 },
  "Ectoplasma Puro": { nome: "Ectoplasma Puro", descricao: "Substância espectral de alta pureza.", tier: 8 },

  // Tier 9 — Titã
  "Fragmento de Músculo Pétreo": { nome: "Fragmento de Músculo Pétreo", descricao: "Tecido muscular endurecido como pedra.", tier: 9 },
  "Sangue de Colosso": { nome: "Sangue de Colosso", descricao: "Sangue viscoso de ser de proporções colossais.", tier: 9 },
  // Tier 9 — Banshee
  "Véu Espectral": { nome: "Véu Espectral", descricao: "Pano translúcido entre o mundo dos vivos e dos mortos.", tier: 9 },
  "Fragmento de Lamento": { nome: "Fragmento de Lamento", descricao: "Cristalização de um lamento eterno.", tier: 9 },
  // Tier 9 — Demônio Menor
  "Chifre Farpado Infernal": { nome: "Chifre Farpado Infernal", descricao: "Chifre com farpa que queima ao toque.", tier: 9 },
  "Brasa Abissal": { nome: "Brasa Abissal", descricao: "Fragmento de fogo que nunca se apaga.", tier: 9 },

  // Tier 10 — Abominação
  "Amálgama de Carne Costurada": { nome: "Amálgama de Carne Costurada", descricao: "Massa horripilante de diferentes carnes unidas.", tier: 10 },
  "Osso Retorcido": { nome: "Osso Retorcido", descricao: "Osso deformado por mutações mágicas.", tier: 10 },
  // Tier 10 — ArquLich
  "Pó de Alma Condensada": { nome: "Pó de Alma Condensada", descricao: "Essência de almas aprisionadas e condensadas.", tier: 10 },
  "Runa de Morte Selada": { nome: "Runa de Morte Selada", descricao: "Runa que contém poder sobre a morte selado dentro.", tier: 10 },
  // Tier 10 — Súcubo
  "Asa Membranosa Carmesim": { nome: "Asa Membranosa Carmesim", descricao: "Asa sedosa na cor do sangue, levíssima.", tier: 10 },
  "Feromônio Concentrado": { nome: "Feromônio Concentrado", descricao: "Substância que irradia atração sobrenatural.", tier: 10 },

  // Bosses
  "Escama Dracônica Ancestral": { nome: "Escama Dracônica Ancestral", descricao: "Escama de dragão, quase indestrutível e imbuda de magia.", tier: 10 },
  "Dente de Dragão Primordial": { nome: "Dente de Dragão Primordial", descricao: "Dente enorme de dragão, forjado por eras de fogo.", tier: 10 },
  "Sangue Corrosivo Mutável": { nome: "Sangue Corrosivo Mutável", descricao: "Sangue da Hidra que se altera e corrói qualquer material.", tier: 10 },
  "Couro de Hidra": { nome: "Couro de Hidra", descricao: "Couro multi-camadas que regenera pequenos danos.", tier: 10 },
  "Escama de Magma": { nome: "Escama de Magma", descricao: "Escama da Serpente de Fogo, incandescente ao toque.", tier: 10 },
  "Órgão Ígneo": { nome: "Órgão Ígneo", descricao: "Órgão interno que produz e armazena fogo.", tier: 10 },
  "Véu do Vazio": { nome: "Véu do Vazio", descricao: "Tecido que existe entre dimensões, escuro como o nada.", tier: 10 },
  "Núcleo de Trevas": { nome: "Núcleo de Trevas", descricao: "Coração pulsante de trevas puras.", tier: 10 },
  "Placa Quitinosa Ancestral": { nome: "Placa Quitinosa Ancestral", descricao: "Armadura natural da Centopeia Anciã, milenária.", tier: 10 },
  "Mandíbula Venenosa": { nome: "Mandíbula Venenosa", descricao: "Mandíbula que injeta veneno incapacitante.", tier: 10 },
};

// Tabela de drops por criatura (inimigo → [drop1, drop2])
export const tabelaDrops: Record<string, [string, string]> = {
  // Tier 1
  "Goblin": ["Orelha Pontuda", "Couro Rasgado"],
  "Pequeno Troll": ["Dente Quebrado", "Sangue Regenerativo Menor"],
  "Cão de Caça": ["Presa Canina", "Tendão Fino"],
  "Morcego Raivoso": ["Asa de Quiróptero", "Glândula de Raiva"],
  // Tier 2
  "Homúnculo": ["Resíduo de Alquimia", "Núcleo Biológico Instável"],
  "Esqueleto": ["Fragmento de Osso Denso", "Pó Cadavérico"],
  "Zumbi": ["Tecido Necrótico", "Dente Podre"],
  "Múmia": ["Faixas Rituais Secas", "Poeira de Embalsamamento"],
  // Tier 3
  "Diabrete": ["Cauda Farpada", "Essência Sulfurosa"],
  "Gárgula": ["Lasca de Granito Rúnico", "Cascalho Endurecido"],
  "Armadura Viva": ["Placa de Ferro Assombrada", "Rebite Encantado"],
  // Tier 4
  "Lobo Sombrio": ["Pelo Umbrático", "Garra das Sombras"],
  "Sacerdote Caído": ["Fragmento de Rosário Profano", "Cinzas Sacrílegas"],
  "Quimera": ["Pelo Misto Impregnado", "Ferrão de Serpente"],
  // Tier 5
  "Medusa": ["Escama de Serpente Venenosa", "Olho Petrificante"],
  "Verme da Areia": ["Carapaça Quirina", "Líquido Digestivo Corrosivo"],
  "Sereia": ["Escama Iridiscente", "Corda Vocal Ressonante"],
  // Tier 6
  "Vampiro": ["Presa de Sangue Nobre", "Pedaço de Capa Sombria"],
  "Necromante": ["Tinta Necromântica Seca", "Dedo Mumificado Encantado"],
  "Aranha Gigante": ["Seda Pegajosa Reforçada", "Glândula de Neurotoxina"],
  // Tier 7
  "Troll da Montanha": ["Couro Pedregoso", "Sangue Regenerativo Puro"],
  "Wendigo": ["Chifre Congelado", "Garra Fétida"],
  "Minotauro": ["Ponta de Chifre Bruto", "Tendão Muscular Robusto"],
  // Tier 8
  "Golem de Pedra": ["Núcleo Sísmico", "Pedaço de Rocha Viva"],
  "Ghoul": ["Garra Paralisante", "Carne Pútrida Concentrada"],
  "Lich": ["Fragmento de Filactéria", "Ectoplasma Puro"],
  // Tier 9
  "Titã": ["Fragmento de Músculo Pétreo", "Sangue de Colosso"],
  "Banshee": ["Véu Espectral", "Fragmento de Lamento"],
  "Demônio Menor": ["Chifre Farpado Infernal", "Brasa Abissal"],
  // Tier 10
  "Abominação": ["Amálgama de Carne Costurada", "Osso Retorcido"],
  "ArquLich": ["Pó de Alma Condensada", "Runa de Morte Selada"],
  "Súcubo": ["Asa Membranosa Carmesim", "Feromônio Concentrado"],
  // Bosses
  "Dragão": ["Escama Dracônica Ancestral", "Dente de Dragão Primordial"],
  "Hidra": ["Sangue Corrosivo Mutável", "Couro de Hidra"],
  "Serpente de Fogo": ["Escama de Magma", "Órgão Ígneo"],
  "Servo das Sombras": ["Véu do Vazio", "Núcleo de Trevas"],
  "Centopeia Anciã": ["Placa Quitinosa Ancestral", "Mandíbula Venenosa"],
};

export function rolarDrops(nomeInimigo: string, luck: number): string[] {
  let drops = tabelaDrops[nomeInimigo];
  
  if (!drops) {
    const isGelo = /(Gelo|Ártico|Frio|Yeti|Congelado|Permafrost|Cristalino)/i.test(nomeInimigo);
    const isFogo = /(Fogo|Lava|Flamejante|Infernal|Magma|Cinzas|Vulcão|Vulcânico|Salamandra|Fênix|Efreet)/i.test(nomeInimigo);
    const isTrevas = /(Sombra|Trevas|Sombrio|Espectro|Pesadelo|Vampiro|Assassino|Banshee|Lich|Demônio|Alma|Ceifador|Wraith)/i.test(nomeInimigo);
    
    let drop1 = `Fragmento de ${nomeInimigo}`;
    let drop2 = `Essência de ${nomeInimigo}`;
    
    if (isGelo) {
      drop1 = `Fragmento Congelado de ${nomeInimigo}`;
      drop2 = `Essência Gelada de ${nomeInimigo}`;
    } else if (isFogo) {
      drop1 = `Fragmento Ígneo de ${nomeInimigo}`;
      drop2 = `Cinzas de ${nomeInimigo}`;
    } else if (isTrevas) {
      drop1 = `Fragmento Sombrio de ${nomeInimigo}`;
      drop2 = `Essência Corrupta de ${nomeInimigo}`;
    }
    
    // Registrar no dropsDB dinamicamente
    if (!dropsDB[drop1]) dropsDB[drop1] = { nome: drop1, descricao: `Material extraído de ${nomeInimigo}.`, tier: 3 };
    if (!dropsDB[drop2]) dropsDB[drop2] = { nome: drop2, descricao: `Material raro de ${nomeInimigo}.`, tier: 4 };
    
    // Typecast to any because the type definition expects a tuple [string, string] but an array is fine here for our logic
    drops = [drop1, drop2] as any;
  }

  const chance = Math.min(0.85, 0.50 + luck * 0.01);
  const resultado: string[] = [];

  for (const item of drops) {
    if (Math.random() < chance) {
      resultado.push(item);
    }
  }

  return resultado;
}
