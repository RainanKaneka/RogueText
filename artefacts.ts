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

export type ScalingGrade = "S" | "A" | "B" | "C" | "D" | "-";

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
  "-": 0,
};

const calcDano = (arma: Pick<IWeapons, "damage" | "scaling">, jogador: mainCharacter): number => {
  const bonus =
    Math.floor((((jogador.strength ** 2) + (jogador.strength ** 2)) * jogador.strength / 3) * SCALING_MULT[arma.scaling.strength]) +
    Math.floor(((jogador.dexterity ** 2) + (jogador.dexterity ** 2)) * jogador.dexterity / 3 * SCALING_MULT[arma.scaling.dexterity]) +
    Math.floor(((jogador.intelligence ** 2) + (jogador.intelligence ** 2)) * jogador.intelligence / 3 * SCALING_MULT[arma.scaling.intelligence]);
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
    scaling: { strength: "B", dexterity: "C", intelligence: "-" },
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
    scaling: { strength: "D", dexterity: "C", intelligence: "-" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Espada Longa": {
    name: "Espada Longa",
    description: "Uma espada equilibrada. Escala com Força e Destreza.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 250,
    damage: 28,
    levelRequired: 1,
    scaling: { strength: "C", dexterity: "D", intelligence: "-" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Cajado de Madeira": {
    name: "Cajado de Madeira",
    description: "Um cajado arcano. Escala com Inteligência.",
    habilidade: undefined,
    raridade: "COMUM",
    price: 250,
    damage: 25,
    levelRequired: 2,
    scaling: { strength: "-", dexterity: "D", intelligence: "C" },
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
    scaling: { strength: "B", dexterity: "-", intelligence: "-" },
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
    scaling: { strength: "-", dexterity: "B", intelligence: "-" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Martelo de Guerra": {
    name: "Martelo de Guerra",
    description: "Um martelo colossal. Escalonamento S em Força, destruidor nas mãos certas.",
    habilidade: undefined,
    raridade: "EPICA",
    price: 8500,
    damage: 50,
    levelRequired: 10,
    scaling: { strength: "A", dexterity: "C", intelligence: "-" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  // === LENDÁRIAS ===
  "Lâmina da Sombra": {
    name: "Lâmina da Sombra",
    description: "Uma lâmina forjada nas sombras do além. Escala com Destreza e Força.",
    habilidade: undefined,
    raridade: "LENDARIA",
    price: 12500,
    damage: 80,
    levelRequired: 7,
    scaling: { strength: "B", dexterity: "A", intelligence: "C" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  "Cetro do Arcano": {
    name: "Cetro do Arcano",
    description: "Um cetro imbuído com magia ancestral. Escalonamento S em Inteligência.",
    habilidade: undefined,
    raridade: "LENDARIA",
    price: 14000,
    damage: 65,
    levelRequired: 8,
    scaling: { strength: "-", dexterity: "B", intelligence: "A" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
  // === ÚNICAS ===
  "Excalibur": {
    name: "Excalibur",
    description: "A espada lendária dos reis. Escala com Força, Destreza e Inteligência.",
    habilidade: undefined,
    raridade: "UNICA",
    price: 100000,
    damage: 500,
    levelRequired: 10,
    scaling: { strength: "B", dexterity: "A", intelligence: "S" },
    calcularDano(jogador) { return calcDano(this, jogador); },
  },
};

export const listaConsumiveis: Record<string, IConsumivel> = {
  "Poção de Cura": {
    name: "Poção de Cura",
    description: "Recupera 20 pontos de vida",
    usar: (jogador: mainCharacter) => {
      jogador.life += 20;
      if (jogador.life > jogador.maxLife) jogador.life = jogador.maxLife;
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
          j.life += 10;
          if (j.life > j.maxLife) j.life = j.maxLife;
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
  }
};

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