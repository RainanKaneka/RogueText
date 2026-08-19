import { Attack } from "./actions.js";
import type { Habilidade, IAttack } from "./actions.js";
import type { ActiveBuff } from "./artefacts.js";
import chalk from "chalk";

export class mainCharacter extends Attack {
  public life: number = 0;
  public maxLife: number = 0;
  public attackPower: number = 0;
  public name: string = "";
  public inventory: string[] = [];
  public level: number = 1;
  public experience: number = 0;
  public experienceToNextLevel: number = 100;
  public energy: number = 100;
  public maxEnergy: number = 100;
  public mana: number = 100;
  public maxMana: number = 100;
  public defense: number = 0; // Reduz o dano recebido em uma porcentagem
  public dexterity: number = 0; // Aumenta a taxa de esquiva e a chance de acerto crítico
  public luck: number = 0; // Aumenta a chance de encontrar itens raros e a chance de acerto crítico
  public intelligence: number = 0; // Aumenta a quantidade de mana e a eficácia das habilidades mágicas
  public strength: number = 0; // Aumenta o dano físico
  public taxaCritica: number = 0; // Aumenta a chance de acerto crítico
  public bloqueando: boolean = false; // Indica se o personagem está bloqueando o próximo ataque
  public skills: Habilidade[] = [];
  public activeBuffs: ActiveBuff[] = [];

  constructor(
    name: string,
    attack: number,
    maxLife: number,
    maxEnergy: number,
    maxMana: number,
    defense: number,
    dexterity: number,
    luck: number,
    intelligence: number,
    strength: number,
  ) {
    super();
    this.life = maxLife;
    this.maxLife = maxLife;
    this.attackPower = attack;
    this.name = name;
    this.energy = maxEnergy;
    this.maxEnergy = maxEnergy;
    this.mana = maxMana;
    this.maxMana = maxMana;
    this.defense = defense;
  }

  estaVivo(): boolean {
    return this.life > 0;
  }

  levelUp(): boolean {
    let levelUp = false;
    while (this.experience >= this.experienceToNextLevel) {
      this.level += 1;
      this.experience -= this.experienceToNextLevel;
      this.experienceToNextLevel = 100 * (this.level * this.level);
      this.attackPower += 5;
      this.maxLife += 20 + this.level * 5; // Increase max life based on level
      this.life = this.maxLife; // Reset current life to maximum
      this.defense += 1; // Increase defense based on level
      this.dexterity += 1;
      this.taxaCritica += 0.01; // Increase critical hit chance based on level
      this.luck += 1; // Increase luck based on level
      this.intelligence += 1;
      this.strength += 1; 1
      this.maxEnergy += 10 + this.level * 2; // Increase max energy based on level
      this.maxMana += 10 + this.level * 2;
      this.energy = this.maxEnergy; // Reset current energy to maximum
      this.mana = this.maxMana; // Reset current mana to maximum

      console.log(chalk.bgMagenta.white.bold(`\n LEVEL UP! `));
      console.log(
        chalk.magentaBright(
          `Parabéns! ${this.name} subiu para o nível ${this.level}!`,
        ),
      );
      console.log(chalk.yellow(`Ataque aumentado para ${this.attackPower}.`));
      console.log(chalk.green(`Vida aumentada para ${this.life}.`));

      levelUp = true;
    }

    return levelUp;
  }

  upgrades(): void {
    console.log(chalk.bgCyan.white.bold(`\n UPGRADES DISPONÍVEIS! `));
    console.log(chalk.cyanBright(`Escolha um upgrade para ${this.name}:`));
  }

  processarBuffs(): void {
    let hasOutput = false;
    // We iterate backwards to safely remove items while looping
    for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
      const buff = this.activeBuffs[i];
      if (!hasOutput) {
        console.log(chalk.cyanBright(`\n--- Processando Efeitos ---`));
        hasOutput = true;
      }
      if (buff!.onTurn) {
        buff!.onTurn(this);
      }
      
      buff!.duration -= 1;
      
      if (buff!.duration <= 0) {
        if (buff!.onExpire) {
          buff!.onExpire(this);
        }
        this.activeBuffs.splice(i, 1);
      }
    }
  }
}

// let Rainan = new mainCharacter("Rainan", 10, 20)

// Rainan.attack()
