export class enemy {
    life = 0;
    attackPower = 0;
    name = '';
    constructor(name, attack, life) {
        this.life = life;
        this.attackPower = attack;
        this.name = name;
    }
    estaVivo() {
        return this.life > 0;
    }
}
