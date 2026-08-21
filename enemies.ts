export class enemy {
  public life: number = 0
  public maxLife: number = 0
  public attackPower: number = 0
  public name: string = ''
  public xpReward: number = 0
  public goldReward: number = 0

  constructor(name: string, attack: number, life: number) {

    this.life = life
    this.maxLife = life
    this.attackPower = attack
    this.xpReward = Math.floor((this.attackPower * 2.5) + (this.life * 1.5));
    this.goldReward = Math.floor(this.attackPower * 1.25) + (this.life * 1.25)
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
  "Morcego Raivoso": { attackPower:15, life: 30},
  // Andar 2
  "Esqueleto": { attackPower: 20, life: 65 },
  "Zumbi": { attackPower: 24, life: 85 },
  "Homúnculo": { attackPower: 30, life: 105 },
  "Múmia": { attackPower: 32, life: 90},
  
  //Andar 3
  "Diabrete": { attackPower: 36, life: 130 },
  "Gárgula": { attackPower: 40, life: 145 },
  "Armadura Viva": { attackPower: 38, life: 160 },
  // Andar 4
  "Lobo Sombrio": { attackPower: 45, life: 200 },
  "Sacerdote Caído": { attackPower: 52, life: 225 },
  "Quimera": { attackPower: 60, life: 240 },
  // Andar 5
  "Medusa": { attackPower: 60, life: 240 },
  "Verme da Areia": { attackPower: 70, life: 260 },
  "Sereia": { attackPower: 65, life: 300 },
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
  "Hidra": { attackPower: 80, life: 400 },
  "Serpente de Fogo": { attackPower: 150, life: 1000 },
  "Servo das Sombras": { attackPower: 320, life: 2500 },
  "Centopeia Anciã": { attackPower: 540, life: 4000}
}