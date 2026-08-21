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

// Helper: fórmula de escalonamento de atributo para habilidades
// Usa a mesma curva quadrática das armas para consistência de poder
const calcBonusAtributo = (atributo: number, multiplicador: number = 0.12): number => {
  return Math.floor(((atributo ** 2) * 2 * atributo / 3) * multiplicador);
};

// Habilidades especiais que podem ser usadas em batalha
export class GolpeForte implements Habilidade {
  nome = "Golpe Forte";
  descricao = "Usa 30 Energia. Dano massivo — escala com Força (STR).";
  tipo = "ATIVA" as const;
  raridade = "RARA" as const;
  custoEnergia = 30;
  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const danoBase = jogador.danoComArma() * 1.5;
    const bonusStr = calcBonusAtributo(jogador.strength, 0.15);
    const dano = Math.floor(danoBase + bonusStr);
    inimigos[alvo]!.life -= dano;
    console.log(chalk.yellowBright(`💪 Você acerta um GOLPE FORTE no ${inimigos[alvo]!.name} causando ${dano} de dano! (Bônus STR: +${bonusStr})`));
    return true;
  }
}

export class BolaDeFogo implements Habilidade {
  nome = "Bola de Fogo";
  descricao = "Usa 20 de Mana. Dano em área — escala com Inteligência (INT).";
  tipo = "ATIVA" as const;
  custoMana = 20;
  raridade: Raridade = "COMUM";

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const danoBase = 15;
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.18);
    const danoTotal = danoBase + bonusInt;
    console.log(chalk.bgRed.white.bold(`🔥 Você conjura uma Bola de Fogo! (Bônus INT: +${bonusInt})`));
    for (let inimigo of inimigos) {
      if (inimigo.life > 0) {
        inimigo.life -= danoTotal;
        console.log(`O ${inimigo.name} sofreu ${danoTotal} de dano mágico!`);
      }
    }
    return true;
  }
}

export class PosturaDefensiva implements Habilidade {
  nome = "Postura Defensiva";
  descricao = "Usa 15 Energia. Aumenta Defesa temporariamente — escala com Defesa (DEF).";
  tipo = "ATIVA" as const;
  custoEnergia = 15;
  raridade: Raridade = "COMUM";

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const bonusDef = 5 + Math.floor(jogador.defense * 0.2);
    jogador.defense += bonusDef;
    jogador.bloqueando = true;
    console.log(chalk.cyanBright(`🛡️ Postura defensiva assumida! +${bonusDef} de Defesa temporária. (Defesa total: ${jogador.defense})`));
    return true;
  }
}

export class Cura implements Habilidade {
  nome = "Cura";
  descricao = "Usa 50 de Mana. Restaura vida — escala com Inteligência (INT).";
  tipo = "ATIVA" as const;
  custoMana = 50;
  raridade = "RARA" as const;

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const curaBase = 20;
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.20);
    const curaTotal = curaBase + bonusInt;
    jogador.life = Math.min(jogador.life + curaTotal, jogador.maxLife);
    console.log(chalk.greenBright(`💚 Você se curou restaurando ${curaTotal} de vida! (Bônus INT: +${bonusInt})`));
    return true;
  }
}

export class DrenarVida implements Habilidade {
  nome = "Drenar Vida";
  descricao = "Usa 40 Mana. Dano (escala STR) e cura (escala INT).";
  tipo = "ATIVA" as const;
  raridade = "EPICA" as const;
  custoMana = 40;
  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const bonusStr = calcBonusAtributo(jogador.strength, 0.12);
    const dano = Math.floor(jogador.danoComArma() * 1.5 + bonusStr);
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.10);
    const cura = Math.floor(dano / 2 + bonusInt);
    inimigos[alvo]!.life -= dano;
    jogador.life = Math.min(jogador.life + cura, jogador.maxLife);
    console.log(chalk.magentaBright(`🩸 Você drena ${inimigos[alvo]!.name}! Dano: ${dano} (Bônus STR: +${bonusStr}) | Cura: ${cura} (Bônus INT: +${bonusInt})`));
    return true;
  }
}

export class FuriaBerserker implements Habilidade {
  nome = "Fúria Berserker";
  descricao = "Usa 20 Energia. Aumenta Força no combate — escala com Força (STR).";
  tipo = "ATIVA" as const;
  raridade = "COMUM" as const;
  custoEnergia = 20;
  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const bonusStr = Math.max(1, Math.floor(jogador.strength * 0.5));
    jogador.strength += bonusStr;
    console.log(chalk.redBright(`😤 Você entra em FÚRIA! +${bonusStr} de Força permanente! (Força atual: ${jogador.strength})`));
    return true;
  }
}

// export class Velocidade implements Habilidade{
//   nome = "Velocidade";
//   descricao = "";
//   tipo = "ATIVA" as const
//   raridade = "COMUM" as const
//   custoEnergia = 50;
//   usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
//     if(jogador.energy < this.custoEnergia){
//        console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
//       return false;
//     }
//     jogador.energy -= this.custoEnergia
//     const bonusDex = 1

//   }

// }

export const TODAS_HABILIDADES: Habilidade[] = [
  new GolpeForte(),
  new BolaDeFogo(),
  new DrenarVida(),
  new FuriaBerserker(),
  new PosturaDefensiva(),
  new Cura()
];

// 5. O ALGORITMO DE SORTEIO (GACHA)
export function sortearTresHabilidades(nivel: number, habilidadesAprendidas: Habilidade[] = []): Habilidade[] {
  const nomesAprendidos = new Set(habilidadesAprendidas.map(h => h.nome));

  // Filtra do pool as habilidades que o jogador já aprendeu
  let pool = [...TODAS_HABILIDADES]
    .filter(h => !nomesAprendidos.has(h.nome))
    .sort(() => Math.random() - 0.5);

  const opcoes: Habilidade[] = [];
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break; // Segurança caso o jogo tenha menos de 3 skills disponíveis
    let raridadeAlvo: Raridade = "COMUM";
    let chance = Math.random() * 100;
    // A mágica da probabilidade por nível acontece aqui:
    if (nivel >= 7 && chance <= 10) raridadeAlvo = "EPICA"
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