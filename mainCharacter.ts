import { Attack } from "./actions";
import type { Habilidade, IAttack } from "./actions";
import type { ActiveBuff, IWeapons, IArmadura, IAcessorio } from "./artefacts";
import { listaArmas } from "./artefacts";
import chalk from "chalk";
import type { Condicao } from "./conditions";

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
  public condicoes: Condicao[] = [];

  // Taxa crítica deriva automaticamente da Destreza (2% por ponto de DEX) + bônus
  public lifesteal: number = 0;
  public bonusDanoFixo: number = 0;
  public multDanoArma: number = 1.0;
  public multDanoSkill: number = 1.0;
  public danoSofridoMultiplier: number = 1.0;
  public goldMultiplier: number = 1.0;
  public bonusCritico: number = 0;

  get taxaCritica(): number {
    return (this.dexterity * 0.02) + this.bonusCritico;
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
    return Math.floor((this.equippedWeapon.calcularDano(this) + this.bonusDanoFixo) * this.multDanoArma);
  }

  // Aplica os bônus de pactos (Caniçal, Estudioso) para danos de Habilidades
  calcularDanoSkill(baseDamage: number): number {
    return Math.floor((baseDamage + this.bonusDanoFixo) * this.multDanoSkill);
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
    const lifestealPorcentagem = (this._accessoryPassivaAtiva === "Sangria" ? 0.10 : 0) + this.lifesteal;
    if (lifestealPorcentagem > 0) {
      cura = Math.floor(dano * lifestealPorcentagem);
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
      this.life = Math.min(this.maxLife, this.life + Math.floor(this.maxLife * 0.3));
      this.maxEnergy += 10 + (this.level * 2) * (this.strength / 5);
      this.maxMana += 10 + (this.level * 2) * (this.intelligence / 5);
      this.energy = Math.min(this.maxEnergy, this.energy + Math.floor(this.maxEnergy * 0.3));
      this.mana = Math.min(this.maxMana, this.mana + Math.floor(this.maxMana * 0.3));

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

  adicionarCondicao(condicao: Condicao): void {
    // Se for envenenado, verifica se já existe para adicionar stacks
    if (condicao.nome === "Envenenado") {
      const existe = this.condicoes.find(c => c.nome === "Envenenado");
      if (existe) {
        existe.duracao = Math.max(existe.duracao, condicao.duracao);
        if (condicao.danoOpcional) existe.danoOpcional = condicao.danoOpcional;
        // Não reseta stacks, mantém subindo a cada turno como o usuário pediu "passivamente"
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
        console.log(chalk.redBright(`🔥 Você sofreu ${c.danoOpcional} de dano de queimadura.`));
        if (this.life <= 0) {
          console.log(chalk.bgRed.white.bold(`Você sucumbiu às chamas.`));
          // A morte será processada na view/controller principal
        }
      } else if (c.nome === "Envenenado" && c.danoOpcional) {
        if (this.life > 1) {
          this.life = Math.max(1, this.life - c.danoOpcional);
          console.log(chalk.greenBright(`☠️ Você sofreu ${c.danoOpcional} de dano de veneno.`));
        } else {
          console.log(chalk.greenBright(`☠️ O veneno corrói você, mas você resiste com 1 de vida.`));
        }
        if (c.stacks === undefined) c.stacks = 1;
        else c.stacks += 1; // Aumenta 5% de erro a cada turno
      }

      c.duracao -= 1;
      if (c.duracao <= 0) {
        if (c.nome !== "Caído") { // Caído é removido ao usar a ação Levantar
          console.log(chalk.cyan(`A condição ${c.nome} passou.`));
        }
        this.condicoes.splice(i, 1);
      }
    }
  }
}

// let Rainan = new mainCharacter("Rainan", 10, 20)

// Rainan.attack()
