import { Attack } from './actions';
export class mainCharacter extends Attack {
    life = 0;
    attackPower = 0;
    name = '';
    constructor(name, attack, life) {
        super();
        this.life = life;
        this.attackPower = attack;
        this.name = name;
    }
    estaVivo() {
        return this.life > 0;
    }
}
let Rainan = new mainCharacter("Rainan", 10, 20);
Rainan.attack();
