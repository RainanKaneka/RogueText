import type { enemy } from './enemies.js';
import { mainCharacter } from './mainCharacter.js'
import chalk from 'chalk';

export interface IAttack {
  attackPower: number
  attack(): number
}

export type Raridade = "COMUM" | "RARA" | "EPICA" | "LENDARIA" | "UNICA";

export interface Habilidade {
  nome: string;
  descricao: string;
  tipo: "ATIVA" | "PASSIVA";
  raridade: Raridade; // NOVO: Adiciona a propriedade raridade
  custoMana?: number;     // NOVO
  custoEnergia?: number;  // NOVO
  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean; // NOVO: Mude para retornar boolean
}

export class Attack implements IAttack {
  attackPower: number = 0

  attack(): number {

    console.log(`Você causou ${this.attackPower} de dano`)

    return this.attackPower

  }

}


// Habilidades especiais que podem ser usadas em batalha
export class GolpeForte implements Habilidade {
  nome = "Golpe Forte";
  descricao = "Usa 15 Energia. Dano massivo em um alvo.";
  tipo = "ATIVA" as const;
  raridade = "RARA" as const;
  custoEnergia = 15;
  usar(jogador: any, inimigos: any[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) return false;
    jogador.energy -= this.custoEnergia;
    inimigos[alvo].life -= (jogador.attackPower * 2);
    console.log(`Você acerta um GOLPE FORTE no ${inimigos[alvo].name} e causa ${jogador.attackPower * 2} de dano!`);
    return true;
  }
}

export class BolaDeFogo implements Habilidade {
  nome = "Bola de Fogo";
  descricao = "Usa 20 de Mana. Causa 15 de dano em área.";
  tipo = "ATIVA" as const;
  custoMana = 20;
  raridade: Raridade = "COMUM";

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    // 1. Checa se o jogador tem os recursos
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false; // Retorna falso para avisar que o turno não deve passar
    }

    // 2. Gasta os recursos
    jogador.mana -= this.custoMana;

    // 3. Executa a magia
    console.log(chalk.bgRed.white.bold(`🔥 Você conjura uma Bola de Fogo gastando ${this.custoMana} de Mana!`));
    for (let inimigo of inimigos) {
      if (inimigo.life > 0) {
        inimigo.life -= 15;
        console.log(`O ${inimigo.name} sofreu 15 de dano mágico!`);
      }
    }
    return true; // Magia lançada com sucesso!
  }
}

export class PosturaDefensiva implements Habilidade {
  nome = "Postura Defensiva";
  descricao = "Bloqueia o próximo ataque e reflete metade do dano.";
  tipo = "ATIVA" as const;
  custoEnergia = 15;
  raridade: Raridade = "COMUM";

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    // 1. Checa se o jogador tem os recursos
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }

    // 2. Gasta os recursos
    jogador.energy -= this.custoEnergia;

    // 3. Executa a habilidade
    jogador.bloqueando = true;
    console.log(`🛡️ Você levanta seu escudo e se prepara para o impacto!`);
    return true;
  }
}
export class Cura implements Habilidade {
  nome = "Cura";
  descricao = "Usa 15 de Mana. Restaura 20 de vida.";
  tipo = "ATIVA" as const
  custoMana = 50;
  raridade = "RARA" as const;

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    // 1. Checa se o jogador tem os recursos
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    // 2. Gasta os recursos
    jogador.mana -= this.custoMana;

    // 3. Executa a habilidade
    jogador.life += 20;
    if (jogador.life > jogador.maxLife) {
      jogador.life = jogador.maxLife;
    }
    console.log(`💚 Você se curou e restaurou 20 de vida!`);
    return true;
  }

}
export class DrenarVida implements Habilidade {
  nome = "Drenar Vida";
  descricao = "Usa 40 Mana. Causa dano e cura o jogador.";
  tipo = "ATIVA" as const;
  raridade = "EPICA" as const;
  custoMana = 40;
  usar(jogador: any, inimigos: any[], alvo: number): boolean {
    if (jogador.mana < this.custoMana) return false;
    jogador.mana -= this.custoMana;
    inimigos[alvo].life -= 20;
    jogador.life += 20;
    console.log(`Você suga a essência vital do ${inimigos[alvo].name}!`);
    return true;
  }
}
export class FuriaBerserker implements Habilidade {
  nome = "Fúria Berserker";
  descricao = "Usa 10 Energia. Seu ataque fica mais forte.";
  tipo = "ATIVA" as const;
  raridade = "COMUM" as const;
  custoEnergia = 10;
  usar(jogador: any, inimigos: any[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) return false;
    jogador.energy -= this.custoEnergia;
    jogador.strength += 5; // Aumenta a força pro resto da batalha
    console.log(`Você entra em FÚRIA! Sua Força aumentou!`);
    return true;
  }
}

export const TODAS_HABILIDADES: Habilidade[] = [
  new GolpeForte(),
  new BolaDeFogo(),
  new DrenarVida(),
  new FuriaBerserker(),
  new PosturaDefensiva(),
  new Cura()
];

// 5. O ALGORITMO DE SORTEIO (GACHA)
export function sortearTresHabilidades(nivel: number): Habilidade[] {
  // Fazemos uma cópia do catálogo e embaralhamos as habilidades
  let pool = [...TODAS_HABILIDADES].sort(() => Math.random() - 0.5);
  const opcoes: Habilidade[] = [];
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break; // Segurança caso o jogo tenha menos de 3 skills
    let raridadeAlvo: Raridade = "COMUM";
    let chance = Math.random() * 100;
    // A mágica da probabilidade por nível acontece aqui:
    if (nivel >= 7 && chance <= 10) raridadeAlvo = "EPICA";
    else if (nivel >= 3 && chance <= 30) raridadeAlvo = "RARA";
    // Procura no pool se existe alguma skill da raridade sorteada
    let indexAchado = pool.findIndex(h => h.raridade === raridadeAlvo);
    // Se não achou (ex: faltou skill epica no jogo), pega a primeira comum disponível
    if (indexAchado === -1) indexAchado = 0;
    // Guarda a skill sorteada e tira ela do pool para não vir repetida!
    opcoes.push(pool[indexAchado]!);
    pool.splice(indexAchado, 1);
  }
  return opcoes;
}