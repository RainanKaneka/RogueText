import { EncantoDoBardo, DominioDaMorte, VelocidadeSuperior, type Habilidade } from './actions.js';
import { listaArmas } from './artefacts.js';
import type { mainCharacter } from './mainCharacter.js';
import { temFlag, type SaveData } from './saveData.js';

// =====================================================================
// INTERFACE DE CLASSE
// =====================================================================

export interface IClasse {
  nome: string;
  descricao: string;
  andarDesbloqueio: number;
  condicaoDesbloqueio?: (save: SaveData) => boolean;
  mensagemRequisito?: string;
  atributos: {
    strength: number;
    dexterity: number;
    intelligence: number;
    luck: number;
    defense: number;
  };
  armaInicial: string;
  passivas: Habilidade[];
}

// =====================================================================
// LISTA DE CLASSES
// =====================================================================

export const listaClasses: IClasse[] = [
  {
    nome: 'Guerreiro',
    descricao: 'Um combatente resistente e poderoso. Especialista em combate corpo a corpo com alta Força e Defesa.',
    andarDesbloqueio: 0,
    atributos: { strength: 3, dexterity: 2, intelligence: 0, luck: 0, defense: 4 },
    armaInicial: 'Espada Longa',
    passivas: [],
  },
  {
    nome: 'Mago',
    descricao: 'Um erudito das artes arcanas. Usa a Inteligência para potencializar magias devastadoras.',
    andarDesbloqueio: 0,
    atributos: { strength: 0, dexterity: 1, intelligence: 3, luck: 2, defense: 0 },
    armaInicial: 'Cajado de Madeira',
    passivas: [],
  },
  {
    nome: 'Ladino',
    descricao: 'Um assassino ágil e sorrateiro. Alta Destreza e Sorte garantem críticos frequentes.',
    andarDesbloqueio: 0,
    atributos: { strength: 1, dexterity: 3, intelligence: 1, luck: 3, defense: 0 },
    armaInicial: 'Adaga',
    passivas: [],
  },
  {
    nome: 'Bardo',
    descricao: 'Um bardo versátil. Alta Destreza e Sorte garantem críticos frequentes.',
    andarDesbloqueio: 3,
    atributos: { strength: 1, dexterity: 2, intelligence: 2, luck: 5, defense: 1 },
    armaInicial: 'Trompete do Bardo',
    passivas: [new EncantoDoBardo()],
  },
  {
    nome: 'Necromante',
    descricao: 'Um necromante habilidoso.',
    andarDesbloqueio: 5,
    condicaoDesbloqueio: (save) => save.andarMaxAlcancado >= 5 && !!save.flags?.includes("necromante_unlock"),
    mensagemRequisito: "Alcançar Andar 5 e derrotar Servo das Sombras com >50% de vida",
    atributos: { strength: 0, dexterity: 3, intelligence: 5, luck: 4, defense: 0 },
    armaInicial: 'Tomo Antigo',
    passivas: [new DominioDaMorte()],
  },
  {
    nome: 'Keth',
    descricao: 'Um lendário ladino que já contribuiu para a sobrevivência do mundo uma vez.',
    andarDesbloqueio: 999, // Desbloqueio especial
    condicaoDesbloqueio: (save) => !!save.flags?.includes("EXP_1_HARD_DEX_20"),
    mensagemRequisito: "Completar a Expedição 1 no modo Difícil com pelo menos 20 de Destreza.",
    atributos: { strength: 0, dexterity: 5, intelligence: 1, luck: 3, defense: 1 },
    armaInicial: 'Adaga',
    passivas: [new VelocidadeSuperior()],
  },
];

// =====================================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================================

export function getClassesDisponiveis(save: SaveData): IClasse[] {
  return listaClasses.filter((c) => {
    if (c.condicaoDesbloqueio) return c.condicaoDesbloqueio(save);
    return c.andarDesbloqueio <= save.andarMaxAlcancado;
  });
}

export function getClassesBloqueadas(save: SaveData): IClasse[] {
  return listaClasses.filter((c) => {
    if (c.condicaoDesbloqueio) return !c.condicaoDesbloqueio(save);
    return c.andarDesbloqueio > save.andarMaxAlcancado;
  });
}

export function aplicarClasse(jogador: mainCharacter, classe: IClasse): void {
  jogador.classe = classe.nome;
  jogador.strength += classe.atributos.strength;
  jogador.dexterity += classe.atributos.dexterity;
  jogador.intelligence += classe.atributos.intelligence;
  jogador.luck += classe.atributos.luck;
  jogador.defense += classe.atributos.defense;

  if (temFlag('marco_10_parrys')) {
    jogador.dexterity += 3;
  }

  const arma = listaArmas[classe.armaInicial];
  if (arma) {
    // Apenas adiciona a arma no inventário para o caso de querer equipar depois, mas NÃO sobrescreve a arma do loadout
    if (!jogador.weaponInventory.find(w => w.name === arma.name)) {
      jogador.weaponInventory.push(arma);
    }
  }

  for (const passiva of classe.passivas) {
    jogador.skills.push(passiva);
  }
}
