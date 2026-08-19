export class enemy {
  public life: number = 0
  public maxLife: number = 0
  public attackPower: number = 0
  public name: string = ''
  public xpReward: number = 0

  constructor(name: string, attack: number, life: number) {

    this.life = life
    this.maxLife = life
    this.attackPower = attack
    this.xpReward = Math.floor((this.attackPower * 1.25) + (this.life * 0.75));
    this.name = name
  }

  estaVivo(): boolean {
    return this.life > 0;
  }
}

export const battleEnemies = {
  // Andar 1
  "Goblin": { attackPower: 10, life: 30 },
  "Pequeno Troll": { attackPower: 5, life: 35 },
  "Cão de Caça": { attackPower: 10, life: 20 },
  // Andar 2
  "Esqueleto": { attackPower: 15, life: 45 },
  "Zumbi": { attackPower: 12, life: 50 },
  "Homúnculo": { attackPower: 10, life: 60 },
  //Andar 3
  "Demônio": { attackPower: 20, life: 80 },
  "Gárgula": { attackPower: 15, life: 90 },
  "Armadura Viva": { attackPower: 22, life: 100 },
  // Andar 4
  "Lobo Sombrio": { attackPower: 30, life: 60 },
  "Sacerdote Caído": { attackPower: 25, life: 70 },
  "Quimera": { attackPower: 35, life: 80 },
  // Andar 5
  "Medusa": { attackPower: 15, life: 60 },
  "Verme da Areia": { attackPower: 20, life: 70 },
  "Sereia": { attackPower: 25, life: 80 },
  // Andar 6
  "Vampiro": { attackPower: 15, life: 60 },
  "Necromante": { attackPower: 20, life: 70 },
  "Aranha Gigante": { attackPower: 25, life: 80 },
  // Andar 7
  "Troll da Montanha": { attackPower: 15, life: 60 },
  "Wendigo": { attackPower: 20, life: 70 },
  "Minotauro": { attackPower: 25, life: 80 },
  // Andar 8
  "Golem de Pedra": { attackPower: 15, life: 60 },
  "Ghoul": { attackPower: 20, life: 70 },
  "Lich": { attackPower: 25, life: 80 },
  // Andar 9
  "Titã": { attackPower: 15, life: 60 },
  "Banshee": { attackPower: 20, life: 70 },
  "Demônio Menor": { attackPower: 25, life: 80 },
  // Andar 10
  "Abominação": { attackPower: 15, life: 60 },
  "ArquLich": { attackPower: 20, life: 70 },
  "Súcubo": { attackPower: 25, life: 80 },
  // Bosses
  "Dragão": { attackPower: 40, life: 150 },
  "Hidra": { attackPower: 60, life: 300 },
  "Serpente de Fogo": { attackPower: 80, life: 400 },
}