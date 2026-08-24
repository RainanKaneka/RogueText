import { Attack } from "./actions";
import type { Habilidade, IAttack } from "./actions";
import type { ActiveBuff, IWeapons, IArmadura, IAcessorio } from "./artefacts";
import { listaArmas } from "./artefacts";
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
  public bloqueando: boolean = false;
  public skills: Habilidade[] = [];
  public activeBuffs: ActiveBuff[] = [];
  public weaponInventory: IWeapons[] = [];
  public equippedWeapon: IWeapons;
  public equippedArmor: IArmadura | null = null;
  public equippedAccessories: IAcessorio[] = [];
  public classe: string = "";
  public pontosDeAtributo: number = 0;
  public gold: number = 0;
  /** Flag interna usada pela passiva 'Bastião' da Armadura de Placas */
  public _armorPassivaAtiva?: string;
  /** Flag interna usada pela passiva 'Sangria' do Anel da Sangria */
  public _accessoryPassivaAtiva?: string;

  // Taxa crítica deriva automaticamente da Destreza (2% por ponto de DEX)
  get taxaCritica(): number {
    return this.dexterity * 0.02;
  }

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
    // Equipar a Espada Quebrada como arma inicial
    this.equippedWeapon = listaArmas["Espada Quebrada"]!;
    this.weaponInventory = [this.equippedWeapon];
  }

  estaVivo(): boolean {
    return this.life > 0;
  }

  curar(quantidade: number): void {
    let curaFinal = quantidade;
    const temEncanto = this.skills.some(s => s.nome === "Encanto do Bardo");
    if (temEncanto) {
      curaFinal = Math.floor(curaFinal * 1.25);
    }
    
    this.life += curaFinal;
    if (this.life > this.maxLife) {
      this.life = this.maxLife;
    }
  }

  // Retorna o dano físico considerando a arma equipada e seu escalonamento
  danoComArma(): number {
    return this.equippedWeapon.calcularDano(this);
  }

  /**
   * Equipa uma armadura: aplica bônus de vida/defesa e aciona a passiva.
   * Remove a armadura anterior antes de aplicar a nova.
   */
  equiparArmadura(armadura: IArmadura): void {
    // Remove bônus da armadura anterior, se existir
    if (this.equippedArmor) {
      this.maxLife -= this.equippedArmor.bonusVida;
      this.life = Math.min(this.life, this.maxLife);
      this.defense -= this.equippedArmor.bonusDefesa;
      this.equippedArmor.passiva?.remover(this);
    }
    this.equippedArmor = armadura;
    this.maxLife += armadura.bonusVida;
    this.life += armadura.bonusVida;
    this.defense += armadura.bonusDefesa;
    armadura.passiva?.aplicar(this);
  }

  /**
   * Equipa um acessório, aplicando seus stats e passiva.
   * Não limpa os acessórios anteriores. Use removerEquipamentos() antes de reequipar.
   */
  equiparAcessorio(acessorio: IAcessorio): void {
    this.equippedAccessories.push(acessorio);
    const stats = acessorio.bonusStats;
    if (stats) {
      this.strength    += stats.strength    ?? 0;
      this.dexterity   += stats.dexterity   ?? 0;
      this.intelligence+= stats.intelligence?? 0;
      this.luck        += stats.luck        ?? 0;
      this.defense     += stats.defense     ?? 0;
    }
    acessorio.passiva?.aplicar(this);
  }

  /**
   * Remove todos os bônus de equipamento ao fim da run.
   * Chamado no game over, fuga e vitória.
   */
  removerEquipamentos(): void {
    if (this.equippedArmor) {
      this.maxLife -= this.equippedArmor.bonusVida;
      this.defense -= this.equippedArmor.bonusDefesa;
      this.equippedArmor.passiva?.remover(this);
      this.equippedArmor = null;
    }
    for (const acc of this.equippedAccessories) {
      const stats = acc.bonusStats;
      if (stats) {
        this.strength    -= stats.strength    ?? 0;
        this.dexterity   -= stats.dexterity   ?? 0;
        this.intelligence-= stats.intelligence?? 0;
        this.luck        -= stats.luck        ?? 0;
        this.defense     -= stats.defense     ?? 0;
      }
      acc.passiva?.remover(this);
    }
    this.equippedAccessories = [];
  }

  aplicarRouboDeVida(dano: number): number {
    let cura = 0;
    if (this._accessoryPassivaAtiva === "Sangria") {
      cura = Math.floor(dano * 0.10);
      if (cura > 0) {
        this.life = Math.min(this.maxLife, this.life + cura);
      }
    }
    return cura;
  }

  levelUp(): boolean {
    if (this.experience >= this.experienceToNextLevel) {
      this.level += 1;
      this.experience -= this.experienceToNextLevel;
      this.experienceToNextLevel = 80 * this.level * (this.level + 2);

      let defCalc = this.defense;
      // Subtrai a defesa temporária das poções para não escalar vida máxima base
      const armorBuffsCount = this.activeBuffs.filter(b => b.name === "Armadura Aumentada").length;
      defCalc -= (armorBuffsCount * 10);

      // Aumentos base de recursos por nível
      this.maxLife += 25 + (this.level * 3) + Math.floor(defCalc * 2);
      this.life = this.maxLife;
      this.maxEnergy += 10 + (this.level * 2) * (this.strength / 5);
      this.maxMana += 10 + (this.level * 2) * (this.intelligence /5);
      this.energy = this.maxEnergy;
      this.mana = this.maxMana;

      // +1 ponto de atributo para o jogador alocar
      this.pontosDeAtributo += 1;

      // Passiva Keth: +1 Destreza a cada 3 níveis
      if (this.classe === "Keth" && this.level % 3 === 0) {
        this.dexterity += 1;
      }

      console.log(chalk.bgMagenta.white.bold(`\n LEVEL UP! `));
      console.log(
        chalk.magentaBright(
          `Parabéns! ${this.name} subiu para o nível ${this.level}!`,
        ),
      );
      console.log(chalk.green(`Vida máxima aumentada para ${this.maxLife}.`));
      console.log(chalk.cyan(`Você ganhou 1 ponto de atributo para alocar!`));

      return true;
    }

    return false;
  }

  upgrades(): void {
    console.log(chalk.bgCyan.white.bold(`\n UPGRADES DISPONÍVEIS! `));
    console.log(chalk.cyanBright(`Escolha um upgrade para ${this.name}:`));
  }

  processarBuffs(): void {
    for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
      const buff = this.activeBuffs[i];
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

  processarPassivasDeEquipamento(inimigos: import("./enemies").enemy[]): void {
    if (this.equippedArmor?.passiva?.onTurn) {
      this.equippedArmor.passiva.onTurn(this, inimigos);
    }
    for (const acc of this.equippedAccessories) {
      if (acc.passiva?.onTurn) {
        acc.passiva.onTurn(this, inimigos);
      }
    }
  }
}

// let Rainan = new mainCharacter("Rainan", 10, 20)

// Rainan.attack()
