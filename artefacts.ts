import type { Habilidade, Raridade } from "./actions";
import { mainCharacter } from "./mainCharacter";
import chalk from "chalk";

export interface ActiveBuff {
  name: string;
  duration: number;
  onTurn?: (jogador: mainCharacter) => void;
  onExpire?: (jogador: mainCharacter) => void;
}

export interface IConsumivel {
  name: string;
  description: string;
  usar: (jogador: mainCharacter) => ActiveBuff | void;
}

export type ScalingGrade = "S" | "A" | "B" | "C" | "D" | "E";

export interface IWeapons {
  name: string;
  description: string;
  habilidade: Habilidade | undefined;
  raridade: Raridade;
  price: number;
  damage: number;
  levelRequired: number;
  scaling: {
    strength: ScalingGrade;
    dexterity: ScalingGrade;
    intelligence: ScalingGrade;
    luck?: ScalingGrade;
  };
  calcularDano: (jogador: mainCharacter) => number;
}

// Multiplicadores de escalonamento por grau (% do atributo adicionado ao dano)
const SCALING_MULT: Record<ScalingGrade, number> = {
  S: 0.25,
  A: 0.18,
  B: 0.12,
  C: 0.07,
  D: 0.03,
  E: 0.01,
};

const calcAttrBonus = (attr: number, mult: number) => {
  return Math.floor((attr * 2 + Math.pow(attr, 2) * 0.6) * mult);
};

const calcDano = (arma: Pick<IWeapons, "damage" | "scaling">, jogador: mainCharacter): number => {
  const luckScaling = arma.scaling.luck ? SCALING_MULT[arma.scaling.luck] : 0;
  const bonus =
    calcAttrBonus(jogador.strength, SCALING_MULT[arma.scaling.strength]) +
    calcAttrBonus(jogador.dexterity, SCALING_MULT[arma.scaling.dexterity]) +
    calcAttrBonus(jogador.intelligence, SCALING_MULT[arma.scaling.intelligence]) +
    calcAttrBonus(jogador.luck, luckScaling);
  return arma.damage + bonus;
};

export const listaArmas: Record<string, IWeapons> = {
  "Espada Quebrada": {
    name: "Espada Quebrada",
    description: "Uma espada velha e lascada. Sua arma de partida.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 0,
    damage: 18,
    levelRequired: 1,
    scaling: { strength: "B", dexterity: "C", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Adaga": {
    name: "Adaga",
    description: "Uma adaga veloz. Escala bem com Destreza.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 250,
    damage: 20,
    levelRequired: 1,
    scaling: { strength: "D", dexterity: "C", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Espada Longa": {
    name: "Espada Longa",
    description: "Uma espada equilibrada. Escala com Força e Destreza.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 250,
    damage: 20,
    levelRequired: 1,
    scaling: { strength: "C", dexterity: "D", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Cajado de Madeira": {
    name: "Cajado de Madeira",
    description: "Um cajado arcano. Escala com Inteligência.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 250,
    damage: 20,
    levelRequired: 2,
    scaling: { strength: "E", dexterity: "D", intelligence: "C" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Trompete do Bardo": {
    name: "Trompete do Bardo",
    description: "Um trompete arcano. Escala com sorte.",
    habilidade: undefined,
    raridade: "RARA",
    price: 1000,
    damage: 24,
    levelRequired: 0,
    scaling: { strength: "E", dexterity: "D", intelligence: "E", luck: "B" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Tomo Antigo": {
    name: "Tomo Antigo",
    description: "Um livro antigo. Escala com Inteligência.",
    habilidade: undefined,
    raridade: "RARA",
    price: 1000,
    damage: 26,
    levelRequired: 0,
    scaling: { strength: "E", dexterity: "D", intelligence: "B", luck: "D" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Cajado do Aprendiz": {
    name: "Cajado do Aprendiz",
    description: "Um cajado típico de iniciantes na magia.",
    habilidade: undefined,
    raridade: "RARA",
    price: 1500,
    damage: 28,
    levelRequired: 6,
    scaling: { strength: "E", dexterity: "D", intelligence: "B" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Machado Anão": {
    name: "Machado Anão",
    description: "Um machado pesado forjado por anões. Exige muita Força.",
    habilidade: undefined,
    raridade: "RARA",
    price: 1200,
    damage: 45,
    levelRequired: 5,
    scaling: { strength: "B", dexterity: "E", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Arco Curto": {
    name: "Arco Curto",
    description: "Um arco ágil. Exige Destreza para aproveitar ao máximo.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 1000,
    damage: 24,
    levelRequired: 5,
    scaling: { strength: "E", dexterity: "B", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Clarinete Sombrio": {
    name: "Clarinete Sombrio",
    description: "Um clarinete sombrio. Escala com Sorte e Inteligência.",
    habilidade: undefined,
    raridade: "RARA",
    price: 1250,
    damage: 20,
    levelRequired: 5,
    scaling: { strength: "E", dexterity: "D", intelligence: "B", luck: "C" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Martelo de Guerra": {
    name: "Martelo de Guerra",
    description: "Um martelo colossal. Escalonamento A em Força, destruidor nas mãos certas.",
    habilidade: undefined,
    raridade: "EPICA",
    price: 8500,
    damage: 55,
    levelRequired: 10,
    scaling: { strength: "A", dexterity: "C", intelligence: "E" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  // === LENDÁRIAS ===
  "Lâmina da Sombra": {
    name: "Lâmina da Sombra",
    description: "Uma lâmina forjada nas sombras do além. Escala com Destreza e Força.",
    habilidade: undefined,
    raridade: "LENDARIA",
    price: 12500,
    damage: 75,
    levelRequired: 7,
    scaling: { strength: "B", dexterity: "A", intelligence: "C" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Cetro do Arcano": {
    name: "Cetro do Arcano",
    description: "Um cetro imbuído com magia ancestral. Escalonamento A em Inteligência.",
    habilidade: undefined,
    raridade: "LENDARIA",
    price: 14000,
    damage: 70,
    levelRequired: 8,
    scaling: { strength: "E", dexterity: "B", intelligence: "A" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  // === ÚNICAS ===
  "Excalibur": {
    name: "Excalibur",
    description: "A espada lendária dos reis. Escala com Força, Destreza e Inteligência.",
    habilidade: undefined,
    raridade: "UNICA",
    price: 100000,
    damage: 130,
    levelRequired: 10,
    scaling: { strength: "B", dexterity: "A", intelligence: "S" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
};

// =================================================================
// SISTEMA DE ARMADURAS
// =================================================================

export interface EquipmentPassive {
  nome: string;
  descricao: string;
  /** Chamado ao equipar/início da run. Aplica o efeito no jogador. */
  aplicar: (jogador: mainCharacter) => void;
  /** Chamado ao remover/fim da run. Reverte o efeito no jogador. */
  remover: (jogador: mainCharacter) => void;
  /** Chamado a cada turno da batalha. */
  onTurn?: (jogador: mainCharacter, inimigos: import("./enemies").enemy[]) => void;
}

export interface IArmadura {
  name: string;
  description: string;
  raridade: Raridade;
  price: number;         // Custo na loja (0 = não disponível na loja)
  bonusVida: number;     // Bônus de vida máxima
  bonusDefesa: number;   // Bônus de defesa
  passiva?: EquipmentPassive;
  receita?: Record<string, number>; // Materiais para forjar
}

export interface IAcessorio {
  name: string;
  description: string;
  raridade: Raridade;
  price: number;
  bonusStats?: {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    luck?: number;
    defense?: number;
  };
  passiva?: EquipmentPassive;
  receita?: Record<string, number>; // Materiais para forjar
}

export const listaArmaduras: Record<string, IArmadura> = {
  // ── Conjunto Inicial (disponível na loja) ─────────────────────────
  "Robes Rasgados": {
    name: "Robes Rasgados",
    description: "Trajes desgastados. Oferecem proteção mínima.",
    raridade: "COMUM",
    price: 0,
    bonusVida: 0,
    bonusDefesa: 0,
  },
  "Vestes de Couro": {
    name: "Vestes de Couro",
    description: "Couro curtido que oferece proteção básica.",
    raridade: "COMUM",
    price: 300,
    bonusVida: 30,
    bonusDefesa: 2,
  },
  "Cota de Malha": {
    name: "Cota de Malha",
    description: "Armadura de elos metálicos. Equilibrada entre proteção e mobilidade.",
    raridade: "RARA",
    price: 800,
    bonusVida: 60,
    bonusDefesa: 5,
    receita: { "Placa de Ferro Assombrada": 3, "Rebite Encantado": 2 },
  },
  "Armadura de Placas": {
    name: "Armadura de Placas",
    description: "Proteção máxima, mas reduz levemente a agilidade.",
    raridade: "EPICA",
    price: 2500,
    bonusVida: 120,
    bonusDefesa: 12,
    receita: { "Cascalho Endurecido": 5, "Placa de Ferro Assombrada": 4, "Cinzas Sacrílegas": 2 },
    passiva: {
      nome: "Bastião",
      descricao: "Enquanto com mais de 50% de vida, recebe 10% menos dano.",
      aplicar: (j) => { j._armorPassivaAtiva = "Bastião"; },
      remover: (j) => { j._armorPassivaAtiva = undefined; },
    },
  },
  "Manto do Feiticeiro": {
    name: "Manto do Feiticeiro",
    description: "Manto imbuído de magia. Aumenta a Inteligência.",
    raridade: "RARA",
    price: 900,
    bonusVida: 20,
    bonusDefesa: 2,
    receita: { "Resíduo de Alquimia": 4, "Essência Sulfurosa": 3 },
    passiva: {
      nome: "Mente Afiada",
      descricao: "+3 de Inteligência durante a run.",
      aplicar: (j) => { j.intelligence += 3; },
      remover: (j) => { j.intelligence -= 3; },
    },
  },
  "Gibão de Ladrão": {
    name: "Gibão de Ladrão",
    description: "Veste leve que favorece agilidade e furtividade.",
    raridade: "RARA",
    price: 750,
    bonusVida: 25,
    bonusDefesa: 3,
    receita: { "Couro Rasgado": 5, "Pelo Misto Impregnado": 2 },
    passiva: {
      nome: "Furtivo",
      descricao: "+3 de Destreza durante a run.",
      aplicar: (j) => { j.dexterity += 3; },
      remover: (j) => { j.dexterity -= 3; },
    },
  },
  // ── Crafting ─────────────────────────
  "Couraça do Errante": {
    name: "Couraça do Errante",
    description: "Uma armadura formidável que exala uma aura destrutiva constante.",
    raridade: "LENDARIA",
    price: 0,
    bonusVida: 150,
    bonusDefesa: 15,
    receita: { "Fragmento de Osso Denso": 5, "Cauda Farpada": 3, "Placa de Ferro Assombrada": 2 },
    passiva: {
      nome: "Aura do Errante",
      descricao: "Causa 5 (+10% FOR +10% SOR) de dano em todos os inimigos por turno.",
      aplicar: (j) => { /* passiva atuando onTurn */ },
      remover: (j) => { },
      onTurn: (j, inimigos) => {
        const dano = 5 + Math.floor(j.strength * 0.1) + Math.floor(j.luck * 0.1);
        inimigos.forEach(ini => ini.life -= dano);
        console.log(`[Aura do Errante] Causou ${dano} de dano a todos os inimigos!`);
      }
    }
  }
};

export const listaAcessorios: Record<string, IAcessorio> = {
  // ── Conjunto Inicial (disponível na loja) ─────────────────────────
  "Sem Acessório": {
    name: "Sem Acessório",
    description: "Nenhum acessório equipado.",
    raridade: "COMUM",
    price: 0,
  },
  "Amuleto da Vitalidade": {
    name: "Amuleto da Vitalidade",
    description: "Aumenta a vida máxima em 50.",
    raridade: "COMUM",
    price: 350,
    passiva: {
      nome: "Vitalidade",
      descricao: "+50 de Vida Máxima.",
      aplicar: (j) => { j.maxLife += 50; j.life += 50; },
      remover: (j) => { j.maxLife -= 50; if (j.life > j.maxLife) j.life = j.maxLife; },
    },
  },
  "Anel da Força": {
    name: "Anel da Força",
    description: "Anel simples que amplifica a força física.",
    raridade: "COMUM",
    price: 400,
    bonusStats: { strength: 2 },
  },
  "Anel da Sorte": {
    name: "Anel da Sorte",
    description: "Um anel com uma moeda de ouro incrustada. Aumenta a Sorte.",
    raridade: "COMUM",
    price: 400,
    bonusStats: { luck: 2 },
  },
  "Pingente do Estudioso": {
    name: "Pingente do Estudioso",
    description: "Amplifica o poder mágico do portador.",
    raridade: "RARA",
    price: 700,
    bonusStats: { intelligence: 3 },
    receita: { "Núcleo Biológico Instável": 3, "Essência Sulfurosa": 2 },
  },
  "Bracelete do Arqueiro": {
    name: "Bracelete do Arqueiro",
    description: "Aumenta a precisão e a chance de crítico.",
    raridade: "RARA",
    price: 700,
    bonusStats: { dexterity: 3 },
    receita: { "Tendão Fino": 4, "Garra das Sombras": 2 },
  },
  "Amuleto da Resistência": {
    name: "Amuleto da Resistência",
    description: "Aumenta a defesa passivamente.",
    raridade: "RARA",
    price: 600,
    bonusStats: { defense: 4 },
    receita: { "Lasca de Granito Rúnico": 4, "Pelo Umbrático": 2 },
  },
  "Anel Polivalente": {
    name: "Anel Polivalente",
    description: "+1 em todos os atributos.",
    raridade: "EPICA",
    price: 1500,
    bonusStats: { strength: 1, dexterity: 1, intelligence: 1, luck: 1, defense: 1 },
    receita: { "Fragmento de Rosário Profano": 2, "Ferrão de Serpente": 2, "Escama de Serpente Venenosa": 1 },
  },
  // ── Crafting ─────────────────────────
  "Anel da Sangria": {
    name: "Anel da Sangria",
    description: "Anel de cor rubi que suga a vitalidade do alvo. Concede 10% de roubo de vida físico.",
    raridade: "EPICA",
    price: 0,
    receita: { "Sangue Regenerativo Menor": 5, "Dente Podre": 3, "Asa de Quiróptero": 2 },
    passiva: {
      nome: "Sangria",
      descricao: "10% de Lifesteal em ataques físicos.",
      aplicar: (j) => { j._accessoryPassivaAtiva = "Sangria"; },
      remover: (j) => { j._accessoryPassivaAtiva = undefined; }
    }
  },
  "Colar da Revigoração": {
    name: "Colar da Revigoração",
    description: "Pingente que pulsa com vida. Cura vida todo turno, escalando com DEF e INT.",
    raridade: "LENDARIA",
    price: 0,
    receita: { "Pó Cadavérico": 5, "Núcleo Biológico Instável": 3, "Poeira de Embalsamamento": 1 },
    passiva: {
      nome: "Revigoração",
      descricao: "Cura 15 de vida (+2% DEF + 1% INT) por turno.",
      aplicar: () => {},
      remover: () => {},
      onTurn: (j) => {
        const curaExtraDef = Math.floor(j.defense * 0.02 * 15); // Wait, "aumenta em 2% a cada 1 ponto" means 2% of the base 15 heal, or just +2 flat?
        // "a cura aumenta em 2% a cada 1 ponto em defesa" = cura * (1 + DEF * 0.02)
        const fatorDef = 1 + (j.defense * 0.02);
        const fatorInt = (j.intelligence * 0.01); // "e 1% a cada 1 ponto em int" = fator total = 1 + DEF*0.02 + INT*0.01
        const curaBase = 15;
        const curaTotal = Math.floor(curaBase * (1 + (j.defense * 0.02) + (j.intelligence * 0.01)));
        j.curar(curaTotal);
        console.log(`[Revigoração] Curou ${curaTotal} de vida!`);
      }
    }
  },
  "Aura de Vaas": {
    name: "Aura de Vaas",
    description: "Você cria uma pressão gravitacional em volta de você. Passivamente no início do turno, causa dano em área.",
    raridade: "EPICA",
    price: 0,
    receita: { "Núcleo Sísmico": 2, "Véu Espectral": 1 },
    passiva: {
      nome: "Pressão Gravitacional",
      descricao: "No início do turno, causa 20 + 4% da Vida Máxima em todos os inimigos.",
      aplicar: () => {},
      remover: () => {},
      onTurn: (j, inimigos) => {
        if (!inimigos || inimigos.length === 0) return;
        const dano = Math.floor(20 + (j.maxLife * 0.04));
        console.log(chalk.magenta(`🌀 A Aura de Vaas esmaga os inimigos, causando ${dano} de dano em todos!`));
        for (const ini of inimigos) {
          ini.life -= dano;
        }
      }
    }
  }
};

export const listaConsumiveis: Record<string, IConsumivel> = {
  "Poção de Cura": {
    name: "Poção de Cura",
    description: "Recupera 20 pontos de vida",
    usar: (jogador: mainCharacter) => {
      jogador.curar(20);
      console.log(chalk.greenBright(`Você usou Poção de Cura e recuperou 20 de vida!`));
    }
  },
  "Poção de Cura Gradual": {
    name: "Poção de Cura Gradual",
    description: "Recupera 10 pontos de vida por turno por 3 turnos",
    usar: (jogador: mainCharacter) => {
      console.log(chalk.greenBright(`Você usou Poção de Cura Gradual! Sentindo-se revitalizado.`));
      return {
        name: "Cura Gradual",
        duration: 3,
        onTurn: (j: mainCharacter) => {
          j.curar(10);
          console.log(chalk.greenBright(`[Efeito] Cura Gradual recuperou 10 de vida! (Vida atual: ${j.life})`));
        }
      };
    }
  },
  "Poção de Força": {
    name: "Poção de Força",
    description: "Aumenta a força em 5 pontos por 5 turnos",
    usar: (jogador: mainCharacter) => {
      jogador.attackPower += 5;
      console.log(chalk.greenBright(`Você usou Poção de Força e ganhou 5 pontos de força!`));
      return {
        name: "Força Aumentada",
        duration: 5,
        onExpire: (j: mainCharacter) => {
          j.attackPower -= 5;
          console.log(chalk.yellowBright(`[Efeito Acabou] O efeito da Poção de Força se esvaiu. -5 de força.`));
        }
      };
    }
  },
  "Poção de Armadura": {
    name: "Poção de Armadura",
    description: "Aumenta a defesa em 10 pontos por 3 turnos",
    usar: (jogador: mainCharacter) => {
      jogador.defense += 10;
      console.log(chalk.greenBright(`Você usou Poção de Armadura e ganhou 10 de defesa!`));
      return {
        name: "Armadura Aumentada",
        duration: 3,
        onExpire: (j: mainCharacter) => {
          j.defense -= 10;
          console.log(chalk.yellowBright(`[Efeito Acabou] O efeito da Poção de Armadura se esvaiu. -10 de defesa.`));
        }
      };
    }
  },
  "Poção de Mana": {
    name: "Poção de Mana",
    description: "Recupera um pouco de mana",
    usar: (jogador: mainCharacter) => {
      const manaRecuperada = 30;

      jogador.mana += manaRecuperada;

      console.log(chalk.blueBright(`Você usou Poção de Mana e recuperou 30 de Mana`))
      if (jogador.mana > jogador.maxMana) {
        jogador.mana = jogador.maxMana;
      }

    }

  },
  "Poção de Energia": {
    name: "Poção de Energia",
    description: "Recupera um pouco de energia",
    usar: (jogador: mainCharacter) => {
      const energiaRecuperada = 30;

      jogador.energy += energiaRecuperada;

      console.log(chalk.blueBright(`Você usou Poção de Energia e recuperou 30 de Energia`))
      if (jogador.energy > jogador.maxEnergy) {
        jogador.energy = jogador.maxEnergy;
      }

    }

  }



}


// =================================================================
// SISTEMA DE BAÚS
// =================================================================

export type RaridadeBau = "COMUM" | "RARO" | "EPICO" | "LENDARIO" | "UNICO";

export interface IBau {
  nome: string;
  raridade: RaridadeBau;
  descricao: string;
}

export const listaBaus: Record<RaridadeBau, IBau> = {
  COMUM: { nome: "Baú Comum", raridade: "COMUM", descricao: "Um baú simples de madeira. Guarda itens comuns." },
  RARO: { nome: "Baú Raro", raridade: "RARO", descricao: "Um baú com fechadura prateada. Itens raros em seu interior." },
  EPICO: { nome: "Baú Épico", raridade: "EPICO", descricao: "Um baú de ferro gravado com runas. Promete grandes recompensas." },
  LENDARIO: { nome: "Baú Lendário", raridade: "LENDARIO", descricao: "Um baú antigo emanando energia mística. Itens de lenda aguardam." },
  UNICO: { nome: "Baú Único", raridade: "UNICO", descricao: "Um baú Único, visto apenas uma vez. O que ele escondeá?" },
};

// Tabela de pesos por raridade do baú → quais raridades de item podem sair e com qual peso
const TABELA_BAU: Record<RaridadeBau, { raridade: Raridade; peso: number }[]> = {
  COMUM: [
    { raridade: "COMUM", peso: 70 },
    { raridade: "RARA", peso: 25 },
    { raridade: "EPICA", peso: 5 },
  ],
  RARO: [
    { raridade: "RARA", peso: 65 },
    { raridade: "EPICA", peso: 30 },
    { raridade: "LENDARIA", peso: 5 },
  ],
  EPICO: [
    { raridade: "EPICA", peso: 60 },
    { raridade: "LENDARIA", peso: 32 },
    { raridade: "UNICA", peso: 8 },
  ],
  LENDARIO: [
    { raridade: "LENDARIA", peso: 70 },
    { raridade: "UNICA", peso: 30 },
  ],
  UNICO: [
    { raridade: "UNICA", peso: 100 },
  ],
};

// Rolagem ponderada: retorna uma raridade de item com base nos pesos
function rolarRaridade(tabela: { raridade: Raridade; peso: number }[]): Raridade {
  const total = tabela.reduce((s, e) => s + e.peso, 0);
  let roll = Math.random() * total;
  for (const entrada of tabela) {
    roll -= entrada.peso;
    if (roll <= 0) return entrada.raridade;
  }
  return tabela[tabela.length - 1]!.raridade;
}

// Abre o baú e retorna um item (arma ou consumível) da raridade rolada
export function abrirBau(
  bau: IBau,
  player: mainCharacter
): { tipo: "arma"; item: IWeapons } | { tipo: "consumivel"; item: IConsumivel } {
  const tabela = TABELA_BAU[bau.raridade];
  const raridadeRolada = rolarRaridade(tabela);

  // Filtra armas e consumíveis pela raridade rolada
  const armasDisponiveis = Object.values(listaArmas).filter(
    (a) => a.raridade === raridadeRolada && a.name !== "Espada Quebrada"
  );

  // Para consumíveis, todos são COMUM por ora — se raridade > COMUM, cai para arma
  const consumiveisDisponiveis = raridadeRolada === "COMUM"
    ? Object.values(listaConsumiveis)
    : [];

  const todasOpcoes = [
    ...armasDisponiveis.map((a) => ({ tipo: "arma" as const, item: a })),
    ...consumiveisDisponiveis.map((c) => ({ tipo: "consumivel" as const, item: c })),
  ];

  // Se não encontrou nada dessa raridade, cai para COMUM
  if (todasOpcoes.length === 0) {
    const fallback = Object.values(listaConsumiveis);
    const escolhido = fallback[Math.floor(Math.random() * fallback.length)]!;
    return { tipo: "consumivel", item: escolhido };
  }

  const escolhido = todasOpcoes[Math.floor(Math.random() * todasOpcoes.length)]!;
  return escolhido;
}

// Retorna qual baú um boss do andar X deve dar
export function bauDoAndar(andar: number): IBau {
  if (andar <= 2) return listaBaus["COMUM"];
  if (andar <= 4) return listaBaus["RARO"];
  if (andar <= 6) return listaBaus["EPICO"];
  if (andar <= 8) return listaBaus["LENDARIO"];
  return listaBaus["UNICO"];
}