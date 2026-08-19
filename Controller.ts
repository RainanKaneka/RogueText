import { mainCharacter } from "./mainCharacter.js";
import { enemy, battleEnemies } from "./enemies.js";
import readline from "readline";
import chalk, { type ChalkInstance } from "chalk";
import { listaConsumiveis } from "./artefacts.js";

const monstrosPorAndar: { [key: number]: string[] } = {
  1: ["Goblin", "Pequeno Troll", "Cão de Caça"],
  2: ["Homúnculo", "Esqueleto", "Zumbi"],
  3: ["Demônio", "Gárgula"],
};

const bossesPorAndar: { [key: number]: string[] } = {
  1: ["Dragão"],
  2: ["Hidra"],
  3: ["Serpente de Fogo"],
};



class RoomGenerator {
  protected inimigo: enemy[] = [];
  private recompensa: string[] = [];
  protected roomChance: number = Math.floor(Math.random() * 100);
  protected andarAtual: number = 1;
  protected salaAtual: number = 0;
  protected salaConcluida: boolean = true;
  protected andarConcluido: boolean = false;

  public generateRoom(andar: number): void {
    // const inimigo1 = new enemy("Goblin", 10, 30);
    // const inimigo2 = new enemy("Troll", 20, 50);
    // const inimigo3 = new enemy("Dragão", 30, 100);
    this.inimigo = [];
    this.roomChance = Math.floor(Math.random() * 100);

    let quantidadeInimigos = Math.floor(Math.random() * 3) + 1;

    if (this.salaAtual === 10) {
      console.log(
        `Você encontrou o inimigo final do andar ${this.andarAtual}! Prepare-se para a batalha!`,
      );

      const listaBosses = bossesPorAndar[this.andarAtual];

      if (!listaBosses || listaBosses.length === 0) {
        console.error(`Nenhum boss encontrado para o andar ${this.andarAtual}`);
        return;
      }

      const bossSorteado =
        listaBosses[Math.floor(Math.random() * listaBosses.length)];

      const bossObject =
        battleEnemies[bossSorteado as keyof typeof battleEnemies];

      const bossInimigo = new enemy(
        bossSorteado!,
        bossObject.attackPower,
        bossObject.life
      );

      this.inimigo.push(bossInimigo);
    } else {
      for (let i = 0; i < quantidadeInimigos; i++) {
        const listaInimigos = monstrosPorAndar[this.andarAtual];

        if (!listaInimigos || listaInimigos.length === 0) {
          console.error(
            `Nenhum inimigo encontrado para o andar ${this.andarAtual}`,
          );
          return;
        }

        const monstroSorteado =
          listaInimigos[Math.floor(Math.random() * listaInimigos.length)];

        const enemyObject =
          battleEnemies[monstroSorteado as keyof typeof battleEnemies];

        const inimigo = new enemy(
          monstroSorteado!,
          enemyObject.attackPower,
          enemyObject.life,
        );

        this.inimigo.push(inimigo);
      }
    }

  }

  constructor() {}
}

const esperarTeclaX = () => {
  return new Promise<void>((resolve) => {
    const ouvinte = (str: string, key: any) => {
      // Se a tecla apertada for 'x', ele remove o ouvinte e destrava a promise
      if (key && key.name === "c") {
        process.stdin.removeListener("keypress", ouvinte);
        resolve();
      }
    };
    // Fica escutando as teclas do terminal
    process.stdin.on("keypress", ouvinte);
  });
};

const esperarEscolha = () => {
  return new Promise<string >((resolve) => {
    const ouvinte = (str: string, key: any) => {
      
      if (key && (key.name === "1" || key.name === "2" || key.name === "3")) {
        console.log(`Você escolheu a opção: ${key.name}`);
        process.stdin.removeListener("keypress", ouvinte);
        
        resolve(key.name);
      }
    };
    process.stdin.on("keypress", ouvinte);
  });
};

const printLento = async (texto: string, velocidadeMs: number = 30, cor?: ChalkInstance) => {
  for (const letra of texto) {
    if (cor) {
      process.stdout.write(cor(letra));
    } else {
      process.stdout.write(letra);
    }
    await new Promise(resolve => setTimeout(resolve, velocidadeMs));
  }
  console.log(); 
};

class GameController extends RoomGenerator {
  private player: mainCharacter;

  constructor(name: string) {
    super();
    this.player = new mainCharacter(name, 15, 100, 100, 100, 0, 0, 0, 0, 0);
    this.generateRoom(this.andarAtual);
  }

  public async avancar(): Promise<void> {
    console.clear();
    if (this.salaConcluida === false) {
      await printLento(
        `Você precisa derrotar todos os inimigos antes de avançar para a próxima sala.`,
        30, chalk.red
      );
      return;
    } else {
        if (this.salaAtual === 10 && this.salaConcluida) {
        this.salaAtual = 0;
        this.andarAtual++;
        await printLento(`--- Você avançou para o andar ${this.andarAtual} ---.`, 30, chalk.magentaBright.bold);
      }
      this.salaConcluida = false;
      this.salaAtual++;
      await printLento(
        `Você avançou para a sala ${this.salaAtual} do andar ${this.andarAtual}.`,
        30, chalk.cyan
      );

      this.generateRoom(this.andarAtual);
      await this.batalhar(this.inimigo);
    }
  }

  public async batalhar(enemy: enemy[]): Promise<void> {
    const nomesInimigos = this.inimigo.map((ini) => ini.name).join(", ");


    await printLento(`A batalha vai começar!`, 50, chalk.bgRed.white.bold);
    await printLento(`${this.player.name} encontrou ${nomesInimigos} !!!`, 50, chalk.yellow);
    await esperarTeclaX();
    while (
      this.player.life > 0 &&
      this.inimigo.some((inimigo) => inimigo.life > 0)
    ) {
      for (let i = 0; i < this.inimigo.length; i++) {
        
        while (this.inimigo[i]!.life > 0 && this.player.life > 0) {
          await printLento(`\n--- SEU TURNO ---`, 20, chalk.blueBright.bold);
          await printLento(`[1] Atacar | [2] Usar Item | [3] Fugir`, 20, chalk.green);
          const escolha = await esperarEscolha();
          if (escolha === "1") {
            this.inimigo[i]!.life -= this.player.attackPower;
            await printLento(
              `Você ataca ${this.inimigo[i]!.name}! O ataque causa ${this.player.attackPower} de dano.`,
              20, chalk.yellowBright
            );
          }
          if (escolha === "2") {
            if(this.player.inventory.length === 0){
              await printLento(`Você não possui itens no inventário!`, 30, chalk.red);
            }else{
              await printLento(`Itens disponíveis: ${this.player.inventory.join(", ")}`, 30, chalk.cyan);
              const escolha = 
              await esperarEscolha();

              const itemEscolhido = this.player.inventory[0];
              if (itemEscolhido === "Poção de Cura") {
                this.player.life += listaConsumiveis["Poção de Cura"].buff as number;
              }
              console.log(chalk.greenBright(`Você usou ${itemEscolhido} e recuperou ${listaConsumiveis["Poção de Cura"].buff} de vida!`));
              this.player.inventory.splice(0, 1);
            }
          }
          if (escolha === "3") {
            const escapeChance = Math.random();
            if (escapeChance < 0.7) {
              await printLento(`Você conseguiu fugir da batalha!`, 40, chalk.greenBright);
              process.exit();
            } else {
              await printLento(`Você falhou em fugir!`, 40, chalk.red);
            }
          }
          if (this.inimigo[i]!.life <= 0) {
            break;
          }
          await esperarTeclaX();
          await printLento(`\nO ${this.inimigo[i]!.name} contra-ataca!`, 30, chalk.redBright.bold);
          this.player.life -= this.inimigo[i]!.attackPower;
          await printLento(`Você recebe ${this.inimigo[i]!.attackPower} de dano.`, 30, chalk.red);
          if (this.player.life <= 0) {
            break;
          }
        }
        if (this.player.life <= 0) {
        await printLento(`Você foi derrotado!`, 50, chalk.bgRed.white.bold);
        await printLento(`Você chegou até a sala ${this.salaAtual} do andar ${this.andarAtual}.`, 50, chalk.gray);
        process.exit();
       }else{
        this.player.experience += this.inimigo[i]!.xpReward;
        await printLento(`Você ganhou ${this.inimigo[i]!.xpReward} de XP ao derrotar o ${this.inimigo[i]!.name}!`, 30, chalk.magenta);
        this.player.levelUp();
        await printLento(`O ${this.inimigo[i]!.name} foi derrotado!`, 30, chalk.greenBright.bold);
        
    }
        
      }
    }

      if (this.player.life > 0) {
      this.salaConcluida = true;
      await printLento(`\nFim da batalha`, 30, chalk.bgGreen.black.bold);
      if(this.salaAtual === 10){
        return
      }else{
        await printLento(`Você pode avançar para a sala ${this.salaAtual + 1} do andar ${this.andarAtual}.`, 30, chalk.cyan);
      }
      await printLento(`------ Estátísicas de Combate ------`, 30, chalk.blueBright);
      await printLento(`Você terminou com ${this.player.life} de vida`, 30, chalk.green);
      let xpGanho = 20 * this.andarAtual + (this.salaAtual * 5);
      this.player.experience += xpGanho;
      await printLento(`Você ganhou ${xpGanho} de experiência bônus por limpar a sala!`, 30, chalk.magentaBright);
      this.player.levelUp();
      
      if (this.roomChance < 90) {
        const recompensa = listaConsumiveis["Poção de Cura"];
        this.player.inventory.push(recompensa.name);
        await printLento(`Você encontrou uma ${recompensa.name}!`, 30, chalk.greenBright);
      }
      await printLento(`Pressione 'X' para avançar para a próxima sala`, 30, chalk.gray);
    }
  }
}

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

console.log(
  "Bem-vindo ao jogo! Pressione 'X' para avançar para a próxima sala.",
);
let Jogo1 = new GameController("Rainan");

process.stdin.on("keypress", async (str: string, key: any) => {
  if (key.name === "x") {
    await printLento("Avançando para a próxima sala...", 50);
    Jogo1.avancar();
  }
  if (key.ctrl && key.name === "c") {
    await printLento("Saindo do jogo...", 50);
    process.exit();
  }
});
