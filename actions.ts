import {mainCharacter} from './mainCharacter'


export interface IAttack{
  attackPower:number
  attack():number
}

export class Attack implements IAttack{
attackPower:number = 0

attack():number{

  console.log(`Você causou ${this.attackPower} de dano`)

  return this.attackPower

}

}
