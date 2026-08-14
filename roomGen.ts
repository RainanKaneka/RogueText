import { mainCharacter } from "./mainCharacter";
import {enemy} from "./enemies"

class GameController{
  private player:mainCharacter;
  public enemy:enemy;

  constructor(name:string){
    this.player = new mainCharacter(name, 20, 100)
1
    this.enemy = new enemy("Orc", 15, 40)

  }

  public batalhar(enemy:enemy):void{
    console.log("------ A batalha vai começar! ------")
    console.log(`${this.player.name} Versus ${this.enemy.name} !!!`)
    while(this.player.life > 0 && this.enemy.life > 0){
      console.log(`${this.player.name} ataca ${this.enemy.name} !`)
      this.enemy.life -= this.player.attackPower
      console.log(`O ataque causa ${this.player.attackPower} de dano.` )

      if(this.enemy.life > 0){
        console.log(`O ${this.enemy.name} contra-ataca!`)
        this.player.life -= this.enemy.attackPower
        console.log(`O ataque causa ${this.enemy.attackPower} de dano.`)
      }else{
        console.log(`O inimigo morreu! Você venceu!`)
      }
    }
    console.log(`Fim da batalha`)  
    console.log(`------ Estátísicas de Combate ------`)
    console.log(`Você terminou com ${this.player.life} de vida`)
    
  }
};

let Jogo1 = new GameController('Rainan')

Jogo1.batalhar(Jogo1.enemy)