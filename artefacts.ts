import { mainCharacter } from "./mainCharacter.js"


export class Consumiveis{
 protected name:string = ''
 protected buff:string | number = ''
 protected description:string = ''
 protected duration:number = 0


 constructor(name:string, buff:string | number){
  this.name = name
  this.buff = buff


 }


}

export const listaConsumiveis = {

  "Poção de Cura": {name:"Poção de Cura", buff: 20, description: "Recupera 20 pontos de vida", duration: 0},
  "Poção de Força": {name:"Poção de Força", buff: 5, description: "Aumenta o ataque em 5 pontos por 3 turnos", duration: 3},
  "Poção de Armadura": {name:"Poção de Armadura", buff: 5, description: "Aumenta a defesa em 5 pontos por 3 turnos", duration: 3}

}