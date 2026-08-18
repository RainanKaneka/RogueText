import {Attack} from './actions.js'
import type { IAttack } from './actions.js'
import chalk from 'chalk';


export class mainCharacter extends Attack{
  public life:number = 0
  public maxLife:number = 0
  public attackPower:number = 0
  public name:string = ''
  public inventory:string[] = []
  public level:number = 1
  public experience:number = 0
  public experienceToNextLevel:number = 100

  constructor(name:string, attack:number, maxLife:number){
    super()
    this.life = maxLife
    this.maxLife = maxLife
    this.attackPower = attack
    this.name = name
  } 

  estaVivo():boolean{
    return this.life > 0;
  }

  levelUp():void{
    while (this.experience >= this.experienceToNextLevel) {
    this.level += 1;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = 100 * (this.level * this.level); 
    this.attackPower += 5;
    this.maxLife += 20;
    this.life = this.maxLife; // Reset current life to maximum
    console.log(chalk.bgMagenta.white.bold(`\n LEVEL UP! `));
    console.log(chalk.magentaBright(`Parabéns! ${this.name} subiu para o nível ${this.level}!`));
    console.log(chalk.yellow(`Ataque aumentado para ${this.attackPower}.`));
    console.log(chalk.green(`Vida aumentada para ${this.life}.`));
  }
    }

  upgrades():void{
    console.log(chalk.bgCyan.white.bold(`\n UPGRADES DISPONÍVEIS! `));
    console.log(chalk.cyanBright(`Escolha um upgrade para ${this.name}:`));

  }  

}

// let Rainan = new mainCharacter("Rainan", 10, 20)

// Rainan.attack()

