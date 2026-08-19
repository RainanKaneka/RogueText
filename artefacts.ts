import { mainCharacter } from "./mainCharacter.js"
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
    description: "Aumenta o ataque em 5 pontos por 3 turnos",
    usar: (jogador: mainCharacter) => {
      jogador.attackPower += 5;
      console.log(chalk.greenBright(`Você usou Poção de Força e ganhou 5 de ataque!`));
      return {
        name: "Força Aumentada",
        duration: 3,
        onExpire: (j: mainCharacter) => {
          j.attackPower -= 5;
          console.log(chalk.yellowBright(`[Efeito Acabou] O efeito da Poção de Força se esvaiu. -5 de ataque.`));
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
}