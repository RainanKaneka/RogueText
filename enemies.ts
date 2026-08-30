import chalk from "chalk";
import type { Condicao } from "./conditions";

export class enemy {
  public life: number = 0
  public maxLife: number = 0
  public attackPower: number = 0
  public name: string = ''
  public xpReward: number = 0
  public goldReward: number = 0
  public condicoes: Condicao[] = [];
  public isBoss: boolean = false;
  public jaCaiu: boolean = false;

  constructor(name: string, attack: number, life: number, isBoss: boolean = false) {

    this.life = life
    this.maxLife = life
    this.attackPower = attack
    this.xpReward = Math.floor((this.attackPower * 2.5) + (this.life * 1.5));
    this.goldReward = Math.floor(this.attackPower * 1.25) + (this.life * 1.25)
    this.name = name
    this.isBoss = isBoss;
  }

  estaVivo(): boolean {
    return this.life > 0;
  }

  adicionarCondicao(condicao: Condicao): void {
    if (this.isBoss && ["Amedrontado", "Paralisado", "Caído"].includes(condicao.nome)) {
      console.log(chalk.gray(`O Boss ${this.name} é imune a ${condicao.nome}.`));
      return;
    }

    if (condicao.nome === "Caído") {
      if (this.jaCaiu) {
        console.log(chalk.gray(`O inimigo ${this.name} já aprendeu a se esquivar e resistiu a ser derrubado novamente.`));
        return;
      } else {
        this.jaCaiu = true;
      }
    }

    if (condicao.nome === "Envenenado") {
      const existe = this.condicoes.find(c => c.nome === "Envenenado");
      if (existe) {
        existe.duracao = Math.max(existe.duracao, condicao.duracao);
        if (condicao.danoOpcional) existe.danoOpcional = condicao.danoOpcional;
        return;
      }
    }
    this.condicoes.push(condicao);
  }

  processarCondicoesInicioTurno(): void {
    for (let i = this.condicoes.length - 1; i >= 0; i--) {
      const c = this.condicoes[i]!;
      
      if (c.nome === "Queimando" && c.danoOpcional) {
        this.life -= c.danoOpcional;
        console.log(chalk.redBright(`🔥 ${this.name} sofreu ${c.danoOpcional} de dano de queimadura.`));
      } else if (c.nome === "Envenenado" && c.danoOpcional) {
        if (this.life > 1) {
          this.life = Math.max(1, this.life - c.danoOpcional);
          console.log(chalk.greenBright(`☠️ ${this.name} sofreu ${c.danoOpcional} de dano de veneno.`));
        } else {
          console.log(chalk.greenBright(`☠️ O veneno corrói ${this.name}, mas ele resiste com 1 de vida.`));
        }
        if (c.stacks === undefined) c.stacks = 1;
        else c.stacks += 1;
      }

      c.duracao -= 1;
      if (c.duracao <= 0) {
        if (c.nome !== "Caído") {
          console.log(chalk.cyan(`A condição ${c.nome} de ${this.name} passou.`));
        }
        this.condicoes.splice(i, 1);
      }
    }
  }
}

export const battleEnemies: Record<string, { attackPower: number; life: number }> = {
  // =====================================================================
  // INIMIGOS ORIGINAIS (mantidos para compatibilidade)
  // =====================================================================
  // Andar 1
  "Goblin": { attackPower: 8, life: 30 },
  "Pequeno Troll": { attackPower: 5, life: 45 },
  "Cão de Caça": { attackPower: 12, life: 20 },
  "Morcego Raivoso": { attackPower: 14, life: 25 },
  // Andar 2
  "Esqueleto": { attackPower: 9, life: 35 },
  "Zumbi": { attackPower: 11, life: 40 },
  "Homúnculo": { attackPower: 10, life: 45 },
  "Múmia": { attackPower: 13, life: 35 },
  // Andar 3
  "Diabrete": { attackPower: 15, life: 25 },
  "Gárgula": { attackPower: 10, life: 50 },
  "Armadura Viva": { attackPower: 8, life: 60 },
  // Andar 4
  "Lobo Sombrio": { attackPower: 14, life: 35 },
  "Sacerdote Caído": { attackPower: 12, life: 40 },
  "Quimera": { attackPower: 15, life: 55 },
  // Andar 5
  "Medusa": { attackPower: 15, life: 40 },
  "Verme da Areia": { attackPower: 12, life: 65 },
  "Sereia": { attackPower: 11, life: 50 },
  // Andar 6
  "Vampiro": { attackPower: 16, life: 45 },
  "Necromante": { attackPower: 18, life: 35 },
  "Aranha Gigante": { attackPower: 13, life: 50 },
  // Andar 7
  "Troll da Montanha": { attackPower: 14, life: 70 },
  "Wendigo": { attackPower: 17, life: 55 },
  "Minotauro": { attackPower: 16, life: 65 },
  // Andar 8
  "Golem de Pedra": { attackPower: 12, life: 80 },
  "Ghoul": { attackPower: 15, life: 60 },
  "Lich": { attackPower: 18, life: 40 },
  // Andar 9
  "Titã": { attackPower: 14, life: 90 },
  "Banshee": { attackPower: 19, life: 45 },
  "Demônio Menor": { attackPower: 16, life: 50 },
  // Andar 10
  "Abominação": { attackPower: 15, life: 75 },
  "ArquLich": { attackPower: 20, life: 60 },
  "Súcubo": { attackPower: 18, life: 55 },
  // Bosses Originais
  "Dragão": { attackPower: 12, life: 60 },
  "Hidra": { attackPower: 14, life: 70 },
  "Serpente de Fogo": { attackPower: 18, life: 50 },
  "Servo das Sombras": { attackPower: 15, life: 65 },
  "Centopeia Anciã": { attackPower: 13, life: 80 },
  "Rei Perdido": { attackPower: 16, life: 75 },
  "Rainha da Praga": { attackPower: 17, life: 70 },
  "O Segundo Dedo": { attackPower: 20, life: 100 },
  "Dragão Negro": { attackPower: 25, life: 120 },
  "O Errante": { attackPower: 30, life: 150 },

  // =====================================================================
  // MASMORRA ANTIGA — Novos inimigos básicos de masmorras
  // =====================================================================
  "Rato Gigante": { attackPower: 5, life: 15 },
  "Morcego Raivoso": { attackPower: 14, life: 25 },
  "Goblin": { attackPower: 8, life: 30 },
  "Goblin Escoteiro": { attackPower: 7, life: 25 },
  "Pequeno Troll": { attackPower: 5, life: 45 },
  "Aranha das Ruínas": { attackPower: 9, life: 30 },
  "Esqueleto": { attackPower: 9, life: 35 },
  "Zumbi": { attackPower: 11, life: 40 },
  "Aranha Gigante": { attackPower: 11, life: 40 },
  "Armadura Viva": { attackPower: 11, life: 55 },
  "Esqueleto Arqueiro": { attackPower: 14, life: 30 },
  "Gosma Ácida": { attackPower: 10, life: 45 },
  "Gárgula": { attackPower: 12, life: 50 },
  "Lobo das Cavernas": { attackPower: 13, life: 35 },
  "Mímico": { attackPower: 16, life: 60 },
  "Esqueleto Guerreiro": { attackPower: 13, life: 45 },
  "Golem de Pedra Menor": { attackPower: 10, life: 55 },
  "Bandido": { attackPower: 12, life: 40 },
  "Cavaleiro Caído": { attackPower: 13, life: 50 },
  "Minotauro": { attackPower: 16, life: 60 },
  "Armadura Pesada": { attackPower: 12, life: 70 },
  "Golem de Pedra": { attackPower: 12, life: 80 },
  "Troll Ancião": { attackPower: 14, life: 85 },
  "Cavaleiro Corrompido": { attackPower: 15, life: 65 },
  "Titã Menor": { attackPower: 13, life: 75 },
  "Dragão das Ruínas Menor": { attackPower: 18, life: 70 },
  "Elemental de Pedra": { attackPower: 11, life: 80 },
  "Guarda Real Corrompido": { attackPower: 17, life: 75 },
  "Behemoth": { attackPower: 20, life: 90 },
  "Golem de Ferro": { attackPower: 15, life: 100 },
  // Boss — Masmorra Antiga
  "Rei dos Goblins": { attackPower: 10, life: 50 },
  "Troll Chefe": { attackPower: 12, life: 65 },
  "Rainha Aranha": { attackPower: 14, life: 60 },
  "Campeão Caído": { attackPower: 15, life: 70 },
  "Golem Guardião": { attackPower: 14, life: 85 },
  "Rei Perdido": { attackPower: 16, life: 75 },
  "Minotauro Furioso": { attackPower: 19, life: 80 },
  "Titã de Pedra": { attackPower: 16, life: 110 },
  "Dragão das Ruínas": { attackPower: 23, life: 100 },
  "Senhor da Masmorra": { attackPower: 25, life: 140 },

  // =====================================================================
  // MONTANHA DE GELO ❄️
  // =====================================================================
  // Monstros
  "Lobo Ártico": { attackPower: 10, life: 25 },
  "Morcego de Gelo": { attackPower: 12, life: 20 },
  "Goblin do Gelo": { attackPower: 8, life: 28 },
  "Esqueleto de Gelo": { attackPower: 10, life: 35 },
  "Elemental de Gelo Menor": { attackPower: 11, life: 30 },
  "Troll Congelado": { attackPower: 9, life: 55 },
  "Aranha de Gelo": { attackPower: 12, life: 35 },
  "Golem de Gelo": { attackPower: 10, life: 60 },
  "Espectro do Frio": { attackPower: 14, life: 30 },
  "Yeti": { attackPower: 13, life: 55 },
  "Serpente de Gelo": { attackPower: 14, life: 40 },
  "Cavaleiro do Inverno": { attackPower: 15, life: 50 },
  "Wyrm de Gelo": { attackPower: 16, life: 55 },
  "Elemental de Gelo": { attackPower: 17, life: 45 },
  "Gigante de Gelo": { attackPower: 14, life: 80 },
  "Lich do Gelo": { attackPower: 19, life: 40 },
  "Valquíria Congelada": { attackPower: 17, life: 50 },
  "Titã do Gelo": { attackPower: 16, life: 85 },
  // Bosses — Montanha de Gelo
  "Alfa dos Lobos Árticos": { attackPower: 12, life: 50 },
  "Troll Ancião Congelado": { attackPower: 10, life: 65 },
  "Rainha das Aranhas de Gelo": { attackPower: 14, life: 55 },
  "Golem Cristalino": { attackPower: 11, life: 75 },
  "Yeti Patriarca": { attackPower: 14, life: 70 },
  "Cavaleiro do Inverno Eterno": { attackPower: 16, life: 65 },
  "Hidra de Gelo": { attackPower: 17, life: 75 },
  "Gigante de Gelo Ancestral": { attackPower: 18, life: 90 },
  "Lich do Permafrost": { attackPower: 22, life: 70 },
  "Dragão de Gelo": { attackPower: 25, life: 130 },

  // =====================================================================
  // REINO DAS CHAMAS 🔥
  // =====================================================================
  // Monstros
  "Salamandra Menor": { attackPower: 9, life: 25 },
  "Morcego de Fogo": { attackPower: 13, life: 18 },
  "Goblin do Fogo": { attackPower: 8, life: 28 },
  "Elemental de Fogo Menor": { attackPower: 12, life: 28 },
  "Lagarto de Lava": { attackPower: 10, life: 35 },
  "Cavaleiro Flamejante": { attackPower: 14, life: 45 },
  "Fênix Menor": { attackPower: 13, life: 30 },
  "Cão Infernal": { attackPower: 15, life: 35 },
  "Golem de Magma": { attackPower: 11, life: 65 },
  "Demônio de Fogo": { attackPower: 16, life: 45 },
  "Serpente de Lava": { attackPower: 14, life: 45 },
  "Efreet": { attackPower: 17, life: 50 },
  "Fênix": { attackPower: 18, life: 40 },
  "Titã do Vulcão": { attackPower: 15, life: 80 },
  "Quimera Flamejante": { attackPower: 16, life: 60 },
  "Dragão de Fogo Menor": { attackPower: 19, life: 55 },
  "Senhor das Cinzas": { attackPower: 20, life: 50 },
  "Efreet Ancião": { attackPower: 18, life: 55 },
  "Arauto do Inferno": { attackPower: 17, life: 70 },
  // Bosses — Reino das Chamas
  "Matriarca Salamandra": { attackPower: 11, life: 50 },
  "Golem de Magma Ancestral": { attackPower: 12, life: 70 },
  "Cavaleiro das Cinzas": { attackPower: 15, life: 60 },
  "Cerbero Flamejante": { attackPower: 16, life: 65 },
  "Serpente de Lava Anciã": { attackPower: 15, life: 75 },
  "Fênix Ancestral": { attackPower: 18, life: 60 },
  "Efreet Sultão": { attackPower: 19, life: 70 },
  "Titã Vulcânico": { attackPower: 20, life: 85 },
  "Senhor do Inferno": { attackPower: 23, life: 75 },
  "Dragão de Fogo": { attackPower: 26, life: 135 },

  // =====================================================================
  // REINO DAS TREVAS 🌑
  // =====================================================================
  // Monstros
  "Sombra Rastejante": { attackPower: 8, life: 20 },
  "Morcego Sombrio": { attackPower: 11, life: 18 },
  "Goblin das Trevas": { attackPower: 9, life: 25 },
  "Espectro Menor": { attackPower: 12, life: 22 },
  "Vampiro Menor": { attackPower: 13, life: 35 },
  "Esqueleto das Trevas": { attackPower: 11, life: 38 },
  "Assassino Sombrio": { attackPower: 16, life: 30 },
  "Wraith": { attackPower: 14, life: 35 },
  "Pesadelo Vivo": { attackPower: 15, life: 40 },
  "Vampiro Nobre": { attackPower: 17, life: 45 },
  "Cavaleiro da Escuridão": { attackPower: 16, life: 55 },
  "Aranha Sombria": { attackPower: 14, life: 45 },
  "Demônio das Sombras": { attackPower: 18, life: 50 },
  "Ceifador": { attackPower: 20, life: 40 },
  "Lich das Trevas": { attackPower: 19, life: 45 },
  "Arquidemônio": { attackPower: 18, life: 60 },
  "Devorador de Almas": { attackPower: 17, life: 70 },
  "Avatar das Trevas": { attackPower: 20, life: 55 },
  // Bosses — Reino das Trevas
  "Alfa das Sombras": { attackPower: 11, life: 45 },
  "Conde Vampiro Menor": { attackPower: 13, life: 55 },
  "Necromante do Véu": { attackPower: 15, life: 50 },
  "Assassino Lorde": { attackPower: 17, life: 55 },
  "Rainha Banshee": { attackPower: 16, life: 60 },
  "Vampiro Ancestral": { attackPower: 18, life: 65 },
  "Aracne Sombria": { attackPower: 17, life: 70 },
  "Lich Supremo": { attackPower: 20, life: 75 },
  "Arquidemônio Selado": { attackPower: 23, life: 80 },
  "Senhor das Trevas": { attackPower: 28, life: 140 },
} 