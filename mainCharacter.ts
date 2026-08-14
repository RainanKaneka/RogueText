import {Attack} from './actions'
import {IAttack} from './actions'


export class mainCharacter extends Attack{
  public life:number = 0
  public attackPower:number = 0
  public name:string = ''

  constructor(name:string, attack:number, life:number){
    super()
    this.life = life
    this.attackPower = attack
    this.name = name
  } 

  estaVivo():boolean{
    return this.life > 0;
  }

}

let Rainan = new mainCharacter("Rainan", 10, 20)

Rainan.attack()

