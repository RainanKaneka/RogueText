export class enemy{
  public life:number = 0
  public attackPower:number = 0
  public name:string = ''
  public xpReward:number = 0

  constructor(name:string, attack:number, life:number){
    
    this.life = life
    this.attackPower = attack
    this.xpReward = Math.floor((this.attackPower * 1) + (this.life * 0.5));
    this.name = name
  } 

  estaVivo():boolean{
    return this.life > 0;
  }
}

export const battleEnemies = {
  // Andar 1
  "Goblin": {attackPower: 10, life: 30},
  "Pequeno Troll": {attackPower: 5, life: 35},
  "Cão de Caça": {attackPower: 10, life: 20},
  // Andar 2
  "Esqueleto": {attackPower: 15, life: 45},
  "Zumbi": {attackPower: 12, life: 50},
  "Homúnculo": {attackPower: 10, life: 60},
  //Andar 3
  "Demônio": {attackPower: 20, life: 80},
  "Gárgula": {attackPower: 15, life: 90},
  // Bosses
  "Dragão": {attackPower: 25, life: 100},
  "Hidra": {attackPower: 35, life: 150},
  "Serpente de Fogo": {attackPower: 50, life: 200},
}