export class Attack {
    attackPower = 0;
    attack() {
        console.log(`Você causou ${this.attackPower} de dano`);
        return this.attackPower;
    }
}
