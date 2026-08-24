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
  // Stats base normalizados. Serão escalados exponencialmente pelo andar em Controller.ts
  // Andar 1
  "Goblin": { attackPower: 8, life: 30 },
  "Pequeno Troll": { attackPower: 5, life: 45 },
  "Cão de Caça": { attackPower: 12, life: 20 },
  "Morcego Raivoso": { attackPower: 14, life: 25 },
  // Andar 2
  "Esqueleto": { attackPower: 9, life: 35 },
  "Zumbi": { attackPower: 11, life: 40 },
  "Homúnculo": { attackPower: 10, life: 45 },
  "Múmia": { attackPower: 13, life: 35 },
  // Andar 3
  "Diabrete": { attackPower: 15, life: 25 },
  "Gárgula": { attackPower: 10, life: 50 },
  "Armadura Viva": { attackPower: 8, life: 60 },
  // Andar 4
  "Lobo Sombrio": { attackPower: 14, life: 35 },
  "Sacerdote Caído": { attackPower: 12, life: 40 },
  "Quimera": { attackPower: 15, life: 55 },
  // Andar 5
  "Medusa": { attackPower: 15, life: 40 },
  "Verme da Areia": { attackPower: 12, life: 65 },
  "Sereia": { attackPower: 11, life: 50 },
  // Andar 6
  "Vampiro": { attackPower: 16, life: 45 },
  "Necromante": { attackPower: 18, life: 35 },
  "Aranha Gigante": { attackPower: 13, life: 50 },
  // Andar 7
  "Troll da Montanha": { attackPower: 14, life: 70 },
  "Wendigo": { attackPower: 17, life: 55 },
  "Minotauro": { attackPower: 16, life: 65 },
  // Andar 8
  "Golem de Pedra": { attackPower: 12, life: 80 },
  "Ghoul": { attackPower: 15, life: 60 },
  "Lich": { attackPower: 18, life: 40 },
  // Andar 9
  "Titã": { attackPower: 14, life: 90 },
  "Banshee": { attackPower: 19, life: 45 },
  "Demônio Menor": { attackPower: 16, life: 50 },
  // Andar 10
  "Abominação": { attackPower: 15, life: 75 },
  "ArquLich": { attackPower: 20, life: 60 },
  "Súcubo": { attackPower: 18, life: 55 },
  // Bosses
  "Dragão": { attackPower: 12, life: 60 },
  "Hidra": { attackPower: 14, life: 70 },
  "Serpente de Fogo": { attackPower: 18, life: 50 },
  "Servo das Sombras": { attackPower: 15, life: 65 },
  "Centopeia Anciã": { attackPower: 13, life: 80 },
  "Rei Perdido": { attackPower: 16, life: 75 },
  "Rainha da Praga": { attackPower: 17, life: 70 },
  "O Segundo Dedo": { attackPower: 20, life: 100 },
  "Dragão Negro": { attackPower: 25, life: 120 },
  "O Errante": { attackPower: 30, life: 150 },
} 