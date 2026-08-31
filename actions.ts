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
  raridade: Raridade;
  nivel: 1 | 2 | 3;
  getUpgradeDescricao?(): string; // NOVO: Adiciona a propriedade raridade
  custoMana?: number;     // NOVO
  custoEnergia?: number;  // NOVO
  classeExclusiva?: string; // NOVO: Restringe a habilidade para uma classe específica
  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean;
  onTurn?(jogador: mainCharacter, inimigos: enemy[]): void; // NOVO: Mude para retornar boolean
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
  nivel: 1 | 2 | 3 = 1;
  nome = "Golpe Forte";
  descricao = "Dano massivo único — escala com Força (STR).";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoEnergia = 30;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: Arma x1.2 ➔ Arma x1.5 | Bônus STR: 12% ➔ 15%";
    if (this.nivel === 2) return "Dano Base: Arma x1.5 ➔ Arma x2.0 | Bônus STR: 15% ➔ 20% | Aplica Vulnerável (2 turnos)";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const multArma = this.nivel === 1 ? 1.2 : this.nivel === 2 ? 1.5 : 2.0;
    const multStr = this.nivel === 1 ? 0.12 : this.nivel === 2 ? 0.15 : 0.20;

    const danoBase = jogador.danoComArma() * multArma;
    const bonusStr = calcBonusAtributo(jogador.strength, multStr);
    let dano = jogador.calcularDanoSkill(Math.floor(danoBase + bonusStr));

    let isCrit = false;
    if (Math.random() <= jogador.taxaCritica) {
      dano = Math.floor(dano * 1.5);
      isCrit = true;
    }

    inimigos[alvo].life -= dano;
    const lifesteal = jogador.aplicarRouboDeVida(dano);
    let logMsg = `💪 Você acerta um GOLPE FORTE ${isCrit ? "CRÍTICO " : ""}no ${inimigos[alvo].name} causando ${dano} de dano! (Bônus STR: +${bonusStr})`;
    if (lifesteal > 0) logMsg += ` (Roubou ${lifesteal} vida)`;
    console.log(chalk.yellowBright(logMsg));

    if (!inimigos[alvo].jaCaiu) {
      inimigos[alvo].adicionarCondicao({ nome: "Caído", duracao: 1 });
    } else {
      console.log(chalk.gray(`O inimigo ${inimigos[alvo].name} já caiu antes e evitou ser derrubado novamente.`));
    }

    if (this.nivel === 3 && inimigos[alvo].life > 0) {
      inimigos[alvo].adicionarCondicao({ nome: "Vulnerável", duracao: 2 });
    }

    return true;
  }
}

export class BolaDeFogo implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Bola de Fogo";
  descricao = "Dano em área — escala com Inteligência (INT).";
  tipo = "ATIVA" as const;
  custoMana = 20;
  raridade: Raridade = "COMUM";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 10 ➔ 15 | Bônus INT: 10% ➔ 12%";
    if (this.nivel === 2) return "Dano Base: 15 ➔ 20 | Bônus INT: 12% ➔ 15% | Queimadura: 1 ➔ 2 turnos";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    
    const danoBase = this.nivel === 1 ? 10 : this.nivel === 2 ? 15 : 20;
    const multInt = this.nivel === 1 ? 0.10 : this.nivel === 2 ? 0.12 : 0.15;
    const turnosQueimadura = this.nivel === 3 ? 2 : 1;

    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const danoTotal = jogador.calcularDanoSkill(danoBase + bonusInt);
    
    console.log(chalk.bgRed.white.bold(`🔥 Você conjura uma Bola de Fogo! (Bônus INT: +${bonusInt})`));
    for (let inimigo of inimigos) {
      if (inimigo.life > 0) {
        inimigo.life -= danoTotal;
        const lifesteal = jogador.aplicarRouboDeVida(danoTotal);
        let msg = `O ${inimigo.name} sofreu ${danoTotal} de dano mágico!`;
        if (lifesteal > 0) msg += ` (Roubou ${lifesteal} vida)`;
        console.log(chalk.redBright(msg));

        // Aplica Queimando
        if (inimigo.life > 0) {
          inimigo.adicionarCondicao({ nome: "Queimando", duracao: turnosQueimadura, danoPorTurno: Math.floor(danoTotal * 0.3) });
        }
      }
    }
    return true;
  }
}

export class PosturaDefensiva implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Postura Defensiva";
  descricao = "Usa 15 de Energia. Reduz o dano sofrido no próximo turno.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "COMUM";
  custoEnergia = 15;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração: 1 ➔ 2 turnos | Redução Dano: 30% ➔ 40%";
    if (this.nivel === 2) return "Redução Dano: 40% ➔ 50% | Ganha 20 Energia ao ser atacado";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const reducao = this.nivel === 1 ? 0.70 : this.nivel === 2 ? 0.60 : 0.50; // 30%, 40%, 50% reduction
    const duracao = this.nivel === 1 ? 1 : 2;

    jogador.activeBuffs.push({
      name: "Defesa Absoluta",
      duration: duracao,
      apply: (p) => { p.danoSofridoMultiplier *= reducao; },
      remove: (p) => { p.danoSofridoMultiplier /= reducao; }
    });

    // We don't have an "on attack received" hook easily without changing core logic, 
    // so we'll simulate the energy gain for level 3 by giving a regen buff or simply increasing defense more.
    if (this.nivel === 3) {
        jogador.adicionarCondicao({ nome: "Revigorando", duracao: 2, curaPorTurno: 0 }); // Just a placeholder if we want to expand
        // For simplicity we will heal energy immediately to simulate "brace"
        jogador.energy = Math.min(jogador.maxEnergy, jogador.energy + 20);
        console.log(chalk.blueBright(`Postura Defensiva v3 ativada! Recuperou 20 Energia instantaneamente.`));
    }

    console.log(chalk.bgBlue.white.bold(`\n🛡️ Você assume uma Postura Defensiva! (Dano recebido reduzido em ${Math.round((1 - reducao) * 100)}% por ${duracao} turnos)`));
    return true;
  }
}

export class Cura implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Cura Mágica";
  descricao = "Usa 20 de Mana. Restaura Vida (escala com INT).";
  tipo = "ATIVA" as const;
  raridade: Raridade = "COMUM";
  custoMana = 20;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Cura Base: 20 ➔ 30 | Bônus INT: 20% ➔ 30%";
    if (this.nivel === 2) return "Cura Base: 30 ➔ 50 | Purifica 1 condição negativa";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    
    const curaBase = this.nivel === 1 ? 20 : this.nivel === 2 ? 30 : 50;
    const multInt = this.nivel === 1 ? 0.20 : this.nivel === 2 ? 0.30 : 0.30;
    
    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const totalCura = curaBase + bonusInt;
    
    jogador.life = Math.min(jogador.maxLife, jogador.life + totalCura);
    console.log(chalk.bgGreen.black.bold(`\n🌿 CURA! Você recuperou ${totalCura} de Vida. (Bônus INT: +${bonusInt})`));

    if (this.nivel === 3) {
      const negativos = ["Envenenado", "Sangrando", "Queimando", "Caído", "Vulnerável"];
      const index = jogador.condicoes.findIndex(c => negativos.includes(c.nome));
      if (index !== -1) {
        const removido = jogador.condicoes.splice(index, 1)[0];
        console.log(chalk.greenBright(`A Cura Mágica purificou a condição: ${removido.nome}!`));
      }
    }

    return true;
  }
}

export class DrenarVida implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Drenar Vida";
  descricao = "Usa 15 de Mana. Dano médio, cura igual ao dano.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoMana = 15;
  classeExclusiva = "Necromante";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 15 ➔ 20 | Bônus INT: 15% ➔ 20%";
    if (this.nivel === 2) return "Dano Base: 20 ➔ 30 | Bônus INT: 20% ➔ 25% | Roubo 100% ➔ 150%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    const danoBase = this.nivel === 1 ? 15 : this.nivel === 2 ? 20 : 30;
    const multInt = this.nivel === 1 ? 0.15 : this.nivel === 2 ? 0.20 : 0.25;
    const multCura = this.nivel === 3 ? 1.5 : 1.0;

    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const dano = jogador.calcularDanoSkill(danoBase + bonusInt);

    const inimigo = inimigos[alvoAtual];
    inimigo.life -= dano;
    
    const curaReal = Math.floor(dano * multCura);
    jogador.life = Math.min(jogador.maxLife, jogador.life + curaReal);
    
    console.log(chalk.bgMagenta.white.bold(`\n🦇 Você drenou ${dano} de Vida de ${inimigo.name}! (Curou ${curaReal})`));
    return true;
  }
}

export class FuriaBerserker implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Fúria Berserker";
  descricao = "Usa 25 de Vida. Aumenta massivamente a Força temporariamente.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoVida = 25;
  classeExclusiva = "Berserker";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração: 1 ➔ 2 turnos";
    if (this.nivel === 2) return "Bônus STR: +10 ➔ +20 | Redução Dano: +15%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.life <= this.custoVida) {
      console.log(chalk.red(`Vida insuficiente para ativar Fúria Berserker!`));
      return false;
    }
    jogador.life -= this.custoVida;
    
    const duracao = this.nivel === 1 ? 1 : 2;
    const bonusStr = this.nivel === 3 ? 20 : 10;
    const reducao = this.nivel === 3 ? 0.85 : 1.0;

    jogador.activeBuffs.push({
      name: "Fúria Berserker",
      duration: duracao,
      apply: (p) => { p.strength += bonusStr; p.danoSofridoMultiplier *= reducao; },
      remove: (p) => { p.strength -= bonusStr; p.danoSofridoMultiplier /= reducao; }
    });

    console.log(chalk.bgRed.white.bold(`\n🔥 FÚRIA BERSERKER ATIVADA! Força aumentada em +${bonusStr} por ${duracao} turno(s)!`));
    return true;
  }
}

// =====================================================================
// NOVAS HABILIDADES
// =====================================================================

export class RaioNegro implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Raio Negro";
  descricao = "Usa 10 de vida. Dano extremo — escala com Sorte e Inteligência.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoVida = 10;
  classeExclusiva = "Necromante";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 25 ➔ 35 | Roubo de Vida: 10% ➔ 20%";
    if (this.nivel === 2) return "Dano Base: 35 ➔ 50 | Roubo de Vida: 20% ➔ 30% | Aplica Sangrando (3 turnos)";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.life <= this.custoVida) {
      console.log(chalk.red(`Você tem pouca vida para usar essa habilidade!`));
      return false;
    }
    jogador.life -= this.custoVida;
    
    const danoBase = this.nivel === 1 ? 25 : this.nivel === 2 ? 35 : 50;
    const lifestealExtra = this.nivel === 1 ? 0.10 : this.nivel === 2 ? 0.20 : 0.30;
    
    const bonusLck = calcBonusAtributo(jogador.luck, 0.15);
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.15);
    
    const danoTotal = jogador.calcularDanoSkill(danoBase + bonusLck + bonusInt);

    console.log(chalk.bgMagenta.white.bold(`🌑 Você dispara um RAIO NEGRO pagando ${this.custoVida} de Vida! (Bônus INT/SOR: +${bonusInt + bonusLck})`));
    const inimigo = inimigos[alvoAtual];
    inimigo.life -= danoTotal;
    
    const curaLifesteal = Math.floor(danoTotal * lifestealExtra);
    jogador.life = Math.min(jogador.maxLife, jogador.life + curaLifesteal);
    const lifestealPassiva = jogador.aplicarRouboDeVida(danoTotal);

    let msg = `O ${inimigo.name} foi atingido pelo Raio Negro recebendo ${danoTotal} de dano!`;
    if (curaLifesteal > 0 || lifestealPassiva > 0) msg += ` (Curou ${curaLifesteal + lifestealPassiva} de vida)`;
    console.log(chalk.magentaBright(msg));

    if (this.nivel === 3 && inimigo.life > 0) {
      inimigo.adicionarCondicao({ nome: "Sangrando", duracao: 3, danoPorTurno: Math.floor(danoTotal * 0.2) });
    }

    return true;
  }
}

export class Velocidade implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Velocidade";
  descricao = "Usa 15 de Energia. Aumenta muito sua Destreza por 1 turno.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "COMUM";
  custoEnergia = 15;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Bônus DES: +5 ➔ +10";
    if (this.nivel === 2) return "Duração: 1 ➔ 2 turnos | Bônus DES: +10 ➔ +15";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const bonus = this.nivel === 1 ? 5 : this.nivel === 2 ? 10 : 15;
    const duracao = this.nivel === 3 ? 2 : 1;

    jogador.activeBuffs.push({
      name: "Velocidade",
      duration: duracao,
      apply: (p) => { p.dexterity += bonus; },
      remove: (p) => { p.dexterity -= bonus; }
    });
    console.log(chalk.bgCyan.white.bold(`\n💨 Você se move mais rápido! (+ ${bonus} Destreza por ${duracao} turno(s))`));
    return true;
  }
}

export class CortesFan implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Cortes em Leque";
  descricao = "Usa 25 de Energia. Acerta o alvo principal e inimigos adjacentes.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoEnergia = 25;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano: Arma x0.6 ➔ Arma x0.8 | Bônus DES: 10% ➔ 15%";
    if (this.nivel === 2) return "Dano: Arma x0.8 ➔ Arma x1.0 | Bônus DES: 15% ➔ 20% | Aplica Sangrando (1 turno)";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const multArma = this.nivel === 1 ? 0.6 : this.nivel === 2 ? 0.8 : 1.0;
    const multDes = this.nivel === 1 ? 0.10 : this.nivel === 2 ? 0.15 : 0.20;

    const danoBase = jogador.danoComArma() * multArma;
    const bonusDes = calcBonusAtributo(jogador.dexterity, multDes);
    const danoTotal = jogador.calcularDanoSkill(Math.floor(danoBase + bonusDes));

    console.log(chalk.cyanBright(`\n⚔️ Você gira sua arma realizando Cortes em Leque! (Bônus DES: +${bonusDes})`));
    
    // Alvo principal
    this.aplicarDanoFan(jogador, inimigos[alvoAtual], danoTotal);
    // Adjacente esquerdo
    if (alvoAtual - 1 >= 0) this.aplicarDanoFan(jogador, inimigos[alvoAtual - 1], Math.floor(danoTotal * 0.7));
    // Adjacente direito
    if (alvoAtual + 1 < inimigos.length) this.aplicarDanoFan(jogador, inimigos[alvoAtual + 1], Math.floor(danoTotal * 0.7));

    return true;
  }

  private aplicarDanoFan(jogador: mainCharacter, inimigo: enemy, dano: number) {
    if (inimigo.life <= 0) return;
    inimigo.life -= dano;
    const ls = jogador.aplicarRouboDeVida(dano);
    let msg = `${inimigo.name} sofre ${dano} de dano de corte.`;
    if (ls > 0) msg += ` (+ ${ls} HP)`;
    console.log(chalk.gray(msg));

    if (this.nivel === 3 && inimigo.life > 0) {
      inimigo.adicionarCondicao({ nome: "Sangrando", duracao: 1, danoPorTurno: Math.floor(dano * 0.25) });
    }
  }
}


export class FuriaDescontrolada implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Fúria Descontrolada";
  descricao = "Usa 20 de Vida. Concede um buff brutal, mas pune no próximo combate.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "LENDARIA";
  custoVida = 20;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Bônus: +15 ➔ +25 | Redução de Dano Sofrido: 0% ➔ 15%";
    if (this.nivel === 2) return "Dano Bônus: +25 ➔ +40 | Redução de Dano: 15% ➔ 30% | Vampirismo: 15%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.life <= this.custoVida) {
      console.log(chalk.red(`Você tem pouca vida para ativar a fúria!`));
      return false;
    }
    const jaAtiva = jogador.activeBuffs.find(b => b.name === this.nome);
    if (jaAtiva) {
      console.log(chalk.red(`A Fúria Descontrolada já está ativa!`));
      return false;
    }

    jogador.life -= this.custoVida;
    
    const bonusFixo = this.nivel === 1 ? 15 : this.nivel === 2 ? 25 : 40;
    const danoSofridoMult = this.nivel === 1 ? 1.0 : this.nivel === 2 ? 0.85 : 0.70; // Redução de 15% e 30%
    const lifesteal = this.nivel === 3 ? 0.15 : 0;

    jogador.activeBuffs.push({
      name: this.nome,
      duration: 999, // Dura até o fim da batalha
      apply: (p) => { 
        p.bonusDanoFixo += bonusFixo; 
        p.danoSofridoMultiplier *= danoSofridoMult;
        p.lifesteal += lifesteal;
      },
      remove: (p) => { 
        p.bonusDanoFixo -= bonusFixo; 
        p.danoSofridoMultiplier /= danoSofridoMult;
        p.lifesteal -= lifesteal;
      }
    });

    console.log(chalk.bgRed.white.bold(`\n🤬 FÚRIA DESCONTROLADA ATIVADA! Dano Bônus +${bonusFixo}, sofrendo menos dano!`));
    console.log(chalk.gray(`Você sacrificou ${this.custoVida} de Vida.`));
    return true;
  }
}

export class CancaoEnlouquecedora implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Canção Enlouquecedora";
  descricao = "Usa 25 de Mana. Confunde todos os inimigos.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoMana = 25;
  classeExclusiva = "Bardo";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração Confusão: 1 ➔ 2 turnos";
    if (this.nivel === 2) return "Duração: 2 ➔ 3 turnos | Aplica Fraqueza";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    const duracao = this.nivel === 1 ? 1 : this.nivel === 2 ? 2 : 3;

    console.log(chalk.bgMagenta.white.bold(`\n🎶 CANÇÃO ENLOUQUECEDORA! Melodias caóticas ecoam pela sala!`));

    for (let ini of inimigos) {
      if (ini.life > 0) {
        ini.adicionarCondicao({ nome: "Atordoado", duracao: duracao });
        console.log(chalk.magenta(`${ini.name} está atordoado pela música!`));
        if (this.nivel === 3) {
          ini.adicionarCondicao({ nome: "Vulnerável", duracao: duracao });
        }
      }
    }
    return true;
  }
}

export class Evasivo implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Evasivo";
  descricao = "Usa 20 de Energia. Reduz todo o dano sofrido por 1 turno.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoEnergia = 20;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Redução de Dano: 50% ➔ 65%";
    if (this.nivel === 2) return "Redução de Dano: 65% ➔ 80% | Duração: 1 ➔ 2 turnos";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const reducao = this.nivel === 1 ? 0.50 : this.nivel === 2 ? 0.35 : 0.20;
    const duracao = this.nivel === 3 ? 2 : 1;

    jogador.activeBuffs.push({
      name: "Evasivo",
      duration: duracao,
      apply: (p) => { p.danoSofridoMultiplier *= reducao; },
      remove: (p) => { p.danoSofridoMultiplier /= reducao; }
    });
    console.log(chalk.bgMagenta.white.bold(`\n🌀 Você se concentra em desviar! (Dano reduzido em ${Math.round((1-reducao)*100)}% por ${duracao} turno(s))`));
    return true;
  }
}

export class EncantoDoBardo implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Encanto do Bardo";
  descricao = "Usa 20 de Mana. Diminui o ataque de todos os inimigos.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoMana = 20;
  classeExclusiva = "Bardo";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração: 2 ➔ 3 turnos";
    if (this.nivel === 2) return "Redução Dano Inimigo: -20% ➔ -35%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    const duracao = this.nivel === 1 ? 2 : 3;
    const reducao = this.nivel === 3 ? 0.65 : 0.8; 
    
    // We don't have direct access to reduce enemy attack via buff system easily,
    // so we'll use a hack by reducing player damage taken temporarily or adding a condition
    // For simplicity, we add "Fraqueza" which doesn't natively reduce damage right now, 
    // so we will simulate it by buffing player defense.
    jogador.activeBuffs.push({
      name: "Encanto Protetor",
      duration: duracao,
      apply: (p) => { p.danoSofridoMultiplier *= reducao; },
      remove: (p) => { p.danoSofridoMultiplier /= reducao; }
    });

    console.log(chalk.bgCyan.white.bold(`\n🎵 Sua canção acalma a fúria inimiga! (Dano sofrido reduzido em ${Math.round((1-reducao)*100)}% por ${duracao} turnos)`));
    return true;
  }
}

export class DominioDaMorte implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Domínio da Morte";
  descricao = "Usa 40 de Mana. Dano massivo no inimigo. Se matar, ganha Vida.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "LENDARIA";
  custoMana = 40;
  classeExclusiva = "Necromante";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 40 ➔ 60 | Bônus INT: 20% ➔ 30%";
    if (this.nivel === 2) return "Dano Base: 60 ➔ 80 | Bônus INT: 30% ➔ 40% | Cura na Kill: 100% ➔ 150%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const inimigo = inimigos[alvoAtual];

    const danoBase = this.nivel === 1 ? 40 : this.nivel === 2 ? 60 : 80;
    const multInt = this.nivel === 1 ? 0.20 : this.nivel === 2 ? 0.30 : 0.40;
    const curaMult = this.nivel === 3 ? 1.5 : 1.0;

    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const danoTotal = jogador.calcularDanoSkill(danoBase + bonusInt);

    console.log(chalk.bgMagenta.white.bold(`\n☠️ DOMÍNIO DA MORTE em ${inimigo.name}! (Bônus INT: +${bonusInt})`));
    inimigo.life -= danoTotal;
    const ls = jogador.aplicarRouboDeVida(danoTotal);

    let msg = `${inimigo.name} sofre ${danoTotal} de dano necrótico!`;
    if (ls > 0) msg += ` (Roubou ${ls} HP)`;
    console.log(chalk.magentaBright(msg));

    if (inimigo.life <= 0) {
      const cura = Math.floor(danoTotal * curaMult);
      jogador.life = Math.min(jogador.maxLife, jogador.life + cura);
      console.log(chalk.greenBright(`A morte de ${inimigo.name} lhe concedeu ${cura} de Vida!`));
    }

    return true;
  }
}

export class MataGigantes implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Mata-Gigantes";
  descricao = "Dano massivo contra inimigos com Vida Máxima alta. Escala com DES.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoEnergia = 40;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano MaxHP: 15% ➔ 20% | Bônus DES: 12% ➔ 18%";
    if (this.nivel === 2) return "Dano MaxHP: 20% ➔ 30% | Aplica Vulnerável (3 turnos)";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const inimigo = inimigos[alvoAtual];

    const percHp = this.nivel === 1 ? 0.15 : this.nivel === 2 ? 0.20 : 0.30;
    const multDes = this.nivel === 1 ? 0.12 : this.nivel === 2 ? 0.18 : 0.25;

    const danoBase = inimigo.maxLife * percHp;
    const bonusDes = calcBonusAtributo(jogador.dexterity, multDes);
    const danoTotal = jogador.calcularDanoSkill(Math.floor(danoBase + bonusDes));

    console.log(chalk.bgYellow.black.bold(`\n🗡️ MATA-GIGANTES! (Bônus DES: +${bonusDes})`));
    inimigo.life -= danoTotal;
    const ls = jogador.aplicarRouboDeVida(danoTotal);

    let msg = `O ataque dilacerou ${danoTotal} de vida do ${inimigo.name}!`;
    if (ls > 0) msg += ` (Roubou ${ls} HP)`;
    console.log(chalk.yellowBright(msg));

    if (this.nivel === 3 && inimigo.life > 0) {
      inimigo.adicionarCondicao({ nome: "Vulnerável", duracao: 3 });
    }

    return true;
  }
}

export class SorteDePrincipiante implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Sorte de Principiante";
  descricao = "Sua inexperiência te ajuda. Aumenta a Sorte e dá chance de turno extra.";
  tipo = "PASSIVA" as const;
  raridade: Raridade = "COMUM";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Sorte Bônus: +1 ➔ +3";
    if (this.nivel === 2) return "Sorte Bônus: +3 ➔ +5";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean { return false; }

  onTurn(jogador: mainCharacter, inimigos: enemy[]): void {
    const bonusSorte = this.nivel === 1 ? 1 : this.nivel === 2 ? 3 : 5;
    jogador.activeBuffs.push({
      name: "Sorte de Principiante",
      duration: 1,
      apply: (p) => { p.luck += bonusSorte; },
      remove: (p) => { p.luck -= bonusSorte; }
    });
  }
}

export class RajadaMistica implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Rajada Mística";
  descricao = "Dispara projéteis aleatórios. Escala com INT e SOR.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoMana = 15;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Acertos: 2-3 ➔ 3-4 | Dano Base: 12 ➔ 18";
    if (this.nivel === 2) return "Acertos: 3-4 ➔ 4-6 | Bônus INT/SOR: +50%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    let minHits = this.nivel === 1 ? 2 : this.nivel === 2 ? 3 : 4;
    let maxHits = this.nivel === 1 ? 3 : this.nivel === 2 ? 4 : 6;
    const hits = Math.floor(Math.random() * (maxHits - minHits + 1)) + minHits;

    const danoBaseHit = this.nivel === 1 ? 12 : this.nivel === 2 ? 18 : 25;
    const multStatus = this.nivel === 3 ? 0.15 : 0.10;
    
    const bonusSorte = calcBonusAtributo(jogador.luck, multStatus);
    const bonusInt = calcBonusAtributo(jogador.intelligence, multStatus);
    
    const danoPorHit = jogador.calcularDanoSkill(danoBaseHit + bonusSorte + bonusInt);

    console.log(chalk.bgCyan.white.bold(`\n✨ Você conjura uma RAJADA MÍSTICA (${hits} projéteis)!`));

    for (let i = 0; i < hits; i++) {
      const inimigosVivos = inimigos.filter(e => e.life > 0);
      if (inimigosVivos.length === 0) break;

      const alvoAleatorio = inimigosVivos[Math.floor(Math.random() * inimigosVivos.length)];
      alvoAleatorio.life -= danoPorHit;
      const ls = jogador.aplicarRouboDeVida(danoPorHit);
      
      let msg = `🎯 Projétil acerta ${alvoAleatorio.name} causando ${danoPorHit} de dano mágico.`;
      if (ls > 0) msg += ` (+${ls} HP)`;
      console.log(chalk.cyanBright(msg));
    }

    return true;
  }
}

export class VelocidadeSuperior implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Velocidade Superior";
  descricao = "Usa 25 de Energia. Aumenta massivamente sua Destreza.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoEnergia = 25;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração: 2 ➔ 3 turnos";
    if (this.nivel === 2) return "Bônus DES: +10 ➔ +20 | Chance Evasão: +10%";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const duracao = this.nivel === 1 ? 2 : 3;
    const bonus = this.nivel === 3 ? 20 : 10;
    const evasao = this.nivel === 3 ? 0.9 : 1.0;

    jogador.activeBuffs.push({
      name: "Velocidade Superior",
      duration: duracao,
      apply: (p) => { p.dexterity += bonus; p.danoSofridoMultiplier *= evasao; },
      remove: (p) => { p.dexterity -= bonus; p.danoSofridoMultiplier /= evasao; }
    });
    console.log(chalk.bgCyan.white.bold(`\n☄️ VELOCIDADE SUPERIOR! (+ ${bonus} Destreza por ${duracao} turno(s))`));
    return true;
  }
}

export class Relampago implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Relâmpago";
  descricao = "Usa 25 de Mana. Dano alto. Escala com INT e Sorte.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoMana = 25;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 25 ➔ 35 | Bônus INT: 20% ➔ 30%";
    if (this.nivel === 2) return "Dano Base: 35 ➔ 45 | 30% chance de Paralisar (Pula o turno)";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const inimigo = inimigos[alvoAtual];

    const danoBase = this.nivel === 1 ? 25 : this.nivel === 2 ? 35 : 45;
    const multInt = this.nivel === 1 ? 0.20 : this.nivel === 2 ? 0.30 : 0.30;
    
    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const bonusSorte = calcBonusAtributo(jogador.luck, 0.10);

    const danoTotal = jogador.calcularDanoSkill(danoBase + bonusInt + bonusSorte);
    inimigo.life -= danoTotal;

    console.log(chalk.bgCyan.white.bold(`\n⚡ Um RELÂMPAGO atinge ${inimigo.name} causando ${danoTotal} de dano! (Bônus INT/SOR: +${bonusInt + bonusSorte})`));
    
    if (this.nivel === 3 && inimigo.life > 0 && Math.random() <= 0.30) {
      inimigo.adicionarCondicao({ nome: "Atordoado", duracao: 1 });
      console.log(chalk.cyanBright(`O relâmpago paralisou ${inimigo.name}!`));
    }

    return true;
  }
}

export class Nevasca implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Nevasca";
  descricao = "Usa 30 de Mana. Dano em área em todos os inimigos. Escala com INT.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "EPICA";
  custoMana = 30;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Dano Base: 15 ➔ 20 | Bônus INT: 15% ➔ 20%";
    if (this.nivel === 2) return "Dano Base: 20 ➔ 30 | Bônus INT: 20% ➔ 25% | Aplica Vulnerável em todos";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Mana insuficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    const danoBase = this.nivel === 1 ? 15 : this.nivel === 2 ? 20 : 30;
    const multInt = this.nivel === 1 ? 0.15 : this.nivel === 2 ? 0.20 : 0.25;
    
    const bonusInt = calcBonusAtributo(jogador.intelligence, multInt);
    const danoTotal = jogador.calcularDanoSkill(danoBase + bonusInt);

    console.log(chalk.bgBlue.white.bold(`\n❄️ Uma NEVASCA atinge todos os inimigos! (Dano Mágico: ${danoTotal})`));

    for (let ini of inimigos) {
      if (ini.life > 0) {
        ini.life -= danoTotal;
        let msg = `${ini.name} congela sofrendo ${danoTotal} de dano.`;
        console.log(chalk.cyan(msg));
        if (this.nivel === 3 && ini.life > 0) {
          ini.adicionarCondicao({ nome: "Vulnerável", duracao: 2 });
        }
      }
    }
    
    return true;
  }
}

export class GritoDeGuerra implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Grito de Guerra";
  descricao = "Usa 25 de Energia. Aumenta muito o ataque, reduz um pouco a defesa.";
  tipo = "ATIVA" as const;
  raridade: Raridade = "RARA";
  custoEnergia = 25;

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Duração: 2 ➔ 3 turnos | Bônus Dano Fixo: 10 ➔ 15";
    if (this.nivel === 2) return "Bônus Dano: 15 ➔ 25 | Redução de Defesa Removida";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Energia insuficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    
    const duracao = this.nivel === 1 ? 2 : 3;
    const bonusDano = this.nivel === 1 ? 10 : this.nivel === 2 ? 15 : 25;
    const penalidadeDefesa = this.nivel === 3 ? 1.0 : 1.25; // 25% mais dano sofrido no v1/v2

    jogador.activeBuffs.push({
      name: "Grito de Guerra",
      duration: duracao,
      apply: (p) => { 
        p.bonusDanoFixo += bonusDano; 
        p.danoSofridoMultiplier *= penalidadeDefesa; 
      },
      remove: (p) => { 
        p.bonusDanoFixo -= bonusDano; 
        p.danoSofridoMultiplier /= penalidadeDefesa; 
      }
    });

    console.log(chalk.bgRed.white.bold(`\n🗣️ GRITO DE GUERRA! Você ganha +${bonusDano} de dano por ${duracao} turnos!`));
    return true;
  }
}

export class MestreDeArmas implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Mestre de Armas";
  descricao = "Aumenta passivamente o dano fixo da sua arma.";
  tipo = "PASSIVA" as const;
  raridade: Raridade = "COMUM";
  
  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Bônus Dano: +2 ➔ +4";
    if (this.nivel === 2) return "Bônus Dano: +4 ➔ +7";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean { return false; }

  onTurn(jogador: mainCharacter, inimigos: enemy[]): void {
    const bonus = this.nivel === 1 ? 2 : this.nivel === 2 ? 4 : 7;
    jogador.activeBuffs.push({
      name: "Mestre de Armas",
      duration: 1,
      apply: (p) => { p.bonusDanoFixo += bonus; },
      remove: (p) => { p.bonusDanoFixo -= bonus; }
    });
  }
}

export class Regeneracao implements Habilidade {
  nivel: 1 | 2 | 3 = 1;
  nome = "Regeneração";
  descricao = "Recupera Vida a cada turno de combate.";
  tipo = "PASSIVA" as const;
  raridade: Raridade = "RARA";

  getUpgradeDescricao(): string {
    if (this.nivel === 1) return "Cura: 2 ➔ 5 por turno";
    if (this.nivel === 2) return "Cura: 5 ➔ 10 por turno";
    return "Nível Máximo";
  }

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean { return false; }

  onTurn(jogador: mainCharacter, inimigos: enemy[]): void {
    const cura = this.nivel === 1 ? 2 : this.nivel === 2 ? 5 : 10;
    jogador.life = Math.min(jogador.maxLife, jogador.life + cura);
    console.log(chalk.green(`+ ${cura} HP (Regeneração)`));
  }
}

export const TODAS_HABILIDADES: Habilidade[] = [
  new GolpeForte(),
  new BolaDeFogo(),
  new DrenarVida(),
  new FuriaBerserker(),
  new PosturaDefensiva(),
  new Cura(),
  new RaioNegro(),
  new Velocidade(),
  new CortesFan(),
  new FuriaDescontrolada(),
  new CancaoEnlouquecedora(),
  new Evasivo(),
  new EncantoDoBardo(),
  new DominioDaMorte(),
  new MataGigantes(),
  new SorteDePrincipiante(),
  new RajadaMistica(),
  new VelocidadeSuperior(),
  new Relampago(),
  new Nevasca(),
  new GritoDeGuerra(),
  new MestreDeArmas(),
  new Regeneracao(),
];

// 5. O ALGORITMO DE SORTEIO (GACHA)
export function sortearTresHabilidades(nivel: number, habilidadesAprendidas: Habilidade[] = [], classeJogador: string = ""): Habilidade[] {
  const nomesAprendidos = new Set(habilidadesAprendidas.map(h => h.nome));

  // Filtra do pool as habilidades que o jogador já aprendeu e remove exclusivas de outras classes
  let pool = [...TODAS_HABILIDADES]
    .filter(h => !nomesAprendidos.has(h.nome) && (!h.classeExclusiva || h.classeExclusiva === classeJogador))
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