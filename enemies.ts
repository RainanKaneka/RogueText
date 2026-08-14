export class enemy{
  public life:number = 0
  public attackPower:number = 0
  public name:string = ''

  constructor(name:string, attack:number, life:number){
    
    this.life = life
    this.attackPower = attack
    this.name = name
  } 

  estaVivo():boolean{
    return this.life > 0;
  }
}