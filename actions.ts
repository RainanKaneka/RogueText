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
  classeExclusiva?: string; // NOVO: Restringe a habilidade para uma classe específica
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
    const lifesteal = jogador.aplicarRouboDeVida(dano);
    let logMsg = `💪 Você acerta um GOLPE FORTE no ${inimigos[alvo]!.name} causando ${dano} de dano! (Bônus STR: +${bonusStr})`;
    if (lifesteal > 0) logMsg += ` (Roubou ${lifesteal} vida)`;
    console.log(chalk.yellowBright(logMsg));
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
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.12);
    const danoTotal = danoBase + bonusInt;
    console.log(chalk.bgRed.white.bold(`🔥 Você conjura uma Bola de Fogo! (Bônus INT: +${bonusInt})`));
    for (let inimigo of inimigos) {
      if (inimigo.life > 0) {
        inimigo.life -= danoTotal;
        const lifesteal = jogador.aplicarRouboDeVida(danoTotal);
        let msg = `O ${inimigo.name} sofreu ${danoTotal} de dano mágico!`;
        if (lifesteal > 0) msg += ` (Roubou ${lifesteal} vida)`;
        console.log(msg);
      }
    }
    return true;
  }
}

export class PosturaDefensiva implements Habilidade {
  nome = "Postura Defensiva";
  descricao = "Usa 15 Energia. Aumenta Defesa temporariamente — escala com Defesa (DEF).";
  tipo = "ATIVA" as const;
  custoEnergia = 40;
  raridade: Raridade = "COMUM";

  usar(jogador: mainCharacter, inimigos: enemy[], alvoAtual: number): boolean {
    const isAtiva = jogador.activeBuffs.some(b => b.name === "Postura Defensiva");
    if (isAtiva) {
      console.log(chalk.yellow("Você já está em Postura Defensiva!"));
      return false;
    }

    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const bonusDef = 5 + Math.floor(jogador.defense * 0.2);
    jogador.defense += bonusDef;
    jogador.bloqueando = true;

    jogador.activeBuffs.push({
      name: "Postura Defensiva",
      duration: 3,
      onExpire: (jog: mainCharacter) => {
        jog.defense -= bonusDef;
        jog.bloqueando = false;
        console.log(chalk.yellow(`🛡️ A Postura Defensiva acabou. Defesa retornou ao normal.`));
      }
    });

    console.log(chalk.cyanBright(`🛡️ Postura defensiva assumida! +${bonusDef} de Defesa por 3 turnos. (Defesa atual: ${jogador.defense})`));
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
    const bonusInt = calcBonusAtributo(jogador.intelligence, 0.12);
    const curaTotal = curaBase + bonusInt;
    jogador.curar(curaTotal);
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
    jogador.curar(cura);
    const lifestealExtra = jogador.aplicarRouboDeVida(dano);
    console.log(chalk.magentaBright(`🩸 Você drena ${inimigos[alvo]!.name}! Dano: ${dano} (Bônus STR: +${bonusStr}) | Cura base: ${cura} (Bônus INT: +${bonusInt})${lifestealExtra > 0 ? ` | Roubo Sangria: ${lifestealExtra}` : ''}`));
    return true;
  }
}

export class FuriaBerserker implements Habilidade {
  nome = "Fúria Berserker";
  descricao = "Usa 70 Energia. Aumenta Força por 3 turnos — escala com Força (STR).";
  tipo = "ATIVA" as const;
  raridade = "COMUM" as const;
  custoEnergia = 70;
  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const bonusStr = Math.max(1, Math.floor(jogador.strength * 0.5));
    jogador.strength += bonusStr;
    
    jogador.activeBuffs.push({
      name: "Fúria Berserker",
      duration: 3,
      onExpire: (j) => {
        j.strength -= bonusStr;
        console.log(chalk.yellowBright(`[Esgotamento] A Fúria Berserker acabou. Você perdeu ${bonusStr} de Força.`));
      }
    });

    console.log(chalk.redBright(`😤 Você entra em FÚRIA! +${bonusStr} de Força por 3 turnos! (Força atual: ${jogador.strength})`));
    return true;
  }
}

// =====================================================================
// NOVAS HABILIDADES
// =====================================================================

export class RaioNegro implements Habilidade {
  nome = "Raio Negro";
  descricao = "Passiva Épica. +5% crit base. Acertos críticos consecutivos aumentam a chance em +10% (máx 65%). Errar reseta.";
  tipo = "PASSIVA" as const;
  raridade = "EPICA" as const;
  // Stack atual do bonus crit (controlado externamente pelo Controller ao processar ataques)
  usar(jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean {
    // Passiva — aplicada no momento de carregar a habilidade (bônus base fixo)
    // O stack dinâmico é gerenciado em Controller.ts via raioNegroStack
    return true;
  }
}

export class Velocidade implements Habilidade {
  nome = "Velocidade";
  descricao = "Usa 100 Mana. Por 3 turnos, a janela de acerto do Parry fica maior, facilitando o timing.";
  tipo = "ATIVA" as const;
  raridade = "LENDARIA" as const;
  custoMana = 100;
  usar(jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;
    const duracao = jogador.classe === "Keth" ? 9999 : 3;
    jogador.activeBuffs.push({
      name: "Velocidade",
      duration: duracao,
      onExpire: (_j: mainCharacter) => {
        console.log(chalk.yellowBright("[Velocidade] O efeito de Velocidade se encerrou."));
      }
    });
    const msg = jogador.classe === "Keth" 
      ? "💨 Velocidade ativada! Janela de Parry aumentada para todo o combate!"
      : "💨 Velocidade ativada! Janela de Parry aumentada por 3 turnos!";
    console.log(chalk.cyanBright(msg));
    return true;
  }
}

export class CortesFan implements Habilidade {
  nome = "Cortes Fantasma";
  descricao = "Usa 40 Energia. Desfere 3 cortes que atravessam o 1º inimigo e atingem o 2º — escala com Destreza (DEX).";
  tipo = "ATIVA" as const;
  raridade = "RARA" as const;
  custoEnergia = 40;
  usar(jogador: mainCharacter, inimigos: enemy[], alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    const bonusDex = calcBonusAtributo(jogador.dexterity, 0.10);
    const danoPorCorte = Math.floor((jogador.danoComArma() / 2) + bonusDex);
    let log = `👻 Cortes Fantasma! 3 cortes de ${danoPorCorte} dano cada (Bônus DEX: +${bonusDex})`;
    for (let i = 0; i < 3; i++) {
      let ls = 0;
      // Corte no alvo principal
      if (inimigos[alvo] && inimigos[alvo]!.life > 0) {
        inimigos[alvo]!.life -= danoPorCorte;
        ls += jogador.aplicarRouboDeVida(danoPorCorte);
      }
      // Atravessa para o segundo inimigo (próximo ativo)
      const segundoAlvo = inimigos.findIndex((ini, idx) => idx !== alvo && ini.life > 0);
      if (segundoAlvo !== -1) {
        inimigos[segundoAlvo]!.life -= danoPorCorte;
        ls += jogador.aplicarRouboDeVida(danoPorCorte);
      }
      if (ls > 0) log += `\n (Corte ${i+1} curou ${ls} vida!)`;
    }
    console.log(chalk.cyanBright(log));
    return true;
  }
}


export class FuriaDescontrolada implements Habilidade {
  nome = "Fúria Descontrolada";
  descricao = "Usa 100 Energia. Todo este combate, seus ataques causam crítico garantido. No próximo combate, perde o 1º turno e causa -15% de dano.";
  tipo = "ATIVA" as const;
  raridade = "LENDARIA" as const;
  custoEnergia = 100;
  usar(jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean {
    if (jogador.energy < this.custoEnergia) {
      console.log(chalk.blue(`Você não tem Energia suficiente! (Necessário: ${this.custoEnergia})`));
      return false;
    }
    jogador.energy -= this.custoEnergia;
    // A ativação real é via flag no Controller (furiaDescontroladaAtiva)
    // A habilidade sinaliza isso via buff temporário de nome especial
    jogador.activeBuffs.push({
      name: "Fúria Descontrolada",
      duration: 9999, // dura o combate inteiro; removido manualmente ao vencer/perder
      onExpire: (_j: mainCharacter) => {
        console.log(chalk.yellowBright("[Fúria Descontrolada] A fúria se apagou."));
      }
    });
    console.log(chalk.redBright("🔥 FÚria DESCONTROLADA! Crítico garantido este combate! Mas você irá pagar um preço..."));
    return true;
  }
}

export class CancaoEnlouquecedora implements Habilidade {
  nome = "Canção Enlouquecedora";
  descricao = "Usa 80 Mana. Faz os inimigos se atacarem mutuamente com seu próprio dano — escala com Sorte e Inteligência.";
  tipo = "ATIVA" as const;
  raridade = "EPICA" as const;
  custoMana = 80;
  usar(jogador: mainCharacter, inimigos: enemy[], _alvo: number): boolean {
    if (jogador.mana < this.custoMana) {
      console.log(chalk.blue(`Você não tem Mana suficiente! (Necessário: ${this.custoMana})`));
      return false;
    }
    jogador.mana -= this.custoMana;

    // Escalonamento com Sorte e Inteligência: cada atributo adiciona um multiplicador extra
    const bonusLuck = 1 + Math.floor(jogador.luck * 0.03 * 100) / 100;
    const bonusInt = 1 + Math.floor(jogador.intelligence * 0.02 * 100) / 100;
    const multiplicador = bonusLuck * bonusInt;

    const vivos = inimigos.filter(i => i.life > 0);
    let log = `🎶 Canção Enlouquecedora! Os inimigos enlouquecem e se atacam! (x${multiplicador.toFixed(2)} dano)`;

    if (vivos.length === 1) {
      // Só um inimigo: ataca a si mesmo
      const dano = Math.floor(vivos[0]!.attackPower * multiplicador);
      vivos[0]!.life -= dano;
      const ls = jogador.aplicarRouboDeVida(dano);
      log += `\n${vivos[0]!.name} ataca a si mesmo! (${dano} de dano)` + (ls > 0 ? ` (Roubou ${ls} vida)` : '');
    } else {
      // Cada inimigo ataca o próximo na lista (circular)
      for (let i = 0; i < vivos.length; i++) {
        const atacante = vivos[i]!;
        const alvo = vivos[(i + 1) % vivos.length]!;
        const dano = Math.floor(atacante.attackPower * multiplicador);
        alvo.life -= dano;
        const ls = jogador.aplicarRouboDeVida(dano);
        log += `\n${atacante.name} ataca ${alvo.name}! (${dano} de dano)` + (ls > 0 ? ` (Roubou ${ls} vida)` : '');
      }
    }

    console.log(chalk.magentaBright(log));
    return true;
  }
}

export class Evasivo implements Habilidade {
  nome = "Evasivo";
  descricao = "Passiva Rara. Mesmo errando o Parry, você tem chance de desviar do ataque — escala com Destreza (DEX), máx 40%.";
  tipo = "PASSIVA" as const;
  raridade = "RARA" as const;
  // A lógica de esquiva é aplicada no callback de falha do parry no Controller
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean {
    return true; // Passiva, não tem uso ativo
  }
}

export class EncantoDoBardo implements Habilidade {
  nome = "Encanto do Bardo";
  descricao = "Passiva Exclusiva. No final do seu turno, há chance de encantar um inimigo (ele atacará os próprios aliados). Curas recebidas são 1.25x mais efetivas.";
  tipo = "PASSIVA" as const;
  raridade = "LENDARIA" as const;
  classeExclusiva = "Bardo";
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean { return true; }
}

export class DominioDaMorte implements Habilidade {
  nome = "Domínio da Morte";
  descricao = "Passiva Exclusiva. Causa 1.5x de dano contra mortos-vivos. Além disso, inimigos mortos podem reviver como seus aliados.";
  tipo = "PASSIVA" as const;
  raridade = "LENDARIA" as const;
  classeExclusiva = "Necromante";
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean { return true; }
}

export class MataGigantes implements Habilidade {
  nome = "Mata gigantes";
  descricao = "Passiva Épica. Causa mais dano quanto mais vida o inimigo tiver acima de você (máx de 45% com 2500 de diferença).";
  tipo = "PASSIVA" as const;
  raridade = "EPICA" as const;
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean { return true; }
}

export class SorteDePrincipiante implements Habilidade {
  nome = "Sorte de principiante";
  descricao = "Passiva Rara. Pequena chance de jogar novamente no primeiro turno do combate (Escala com Sorte, até 30%).";
  tipo = "PASSIVA" as const;
  raridade = "RARA" as const;
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean { return true; }
}

export class RajadaMistica implements Habilidade {
  nome = "Rajada Mística";
  descricao = "Usa 0 Mana. Dispara rajadas (1 a 4). Causa 10 dano mágico/rajada. Restaura mana por inimigo diferente atingido.";
  tipo = "ATIVA" as const;
  raridade = "COMUM" as const;
  custoMana = 0;
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean {
    // A lógica de ativação e seleção de alvo é processada no Controller.ts
    return true; 
  }
}

export class VelocidadeSuperior implements Habilidade {
  nome = "Velocidade Superior";
  descricao = "Passiva (Keth). Ao derrotar um inimigo, tem 5% de chance de poder atacar novamente (Escala com Destreza, max 35%).";
  tipo = "PASSIVA" as const;
  raridade = "UNICA" as const;
  classeExclusiva = "Keth";
  usar(_jogador: mainCharacter, _inimigos: enemy[], _alvo: number): boolean { return true; }
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