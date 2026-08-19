import { mainCharacter } from "./mainCharacter.js";
import { enemy, battleEnemies } from "./enemies.js";
import readline from "readline";
import chalk, { type ChalkInstance } from "chalk";
import { listaConsumiveis } from "./artefacts.js";
import { sortearTresHabilidades } from "./actions.js";

const monstrosPorAndar: { [key: number]: string[] } = {
  1: ["Goblin", "Pequeno Troll", "Cão de Caça"],
  2: ["Homúnculo", "Esqueleto", "Zumbi"],
  3: ["Demônio", "Gárgula", "Armadura Viva"],
  4: ["Lobo sombrio", "Sacerdote Caído", "Quimera"],
  5: ["Medusa", "Verme da Areia", "Sereia"],
  6: ["Vampiro", "Necromante", "Aranha Gigante"],
  7: ["Troll da Montanha", "Wendigo", "Minotauro"],
  8: ["Golem de Pedra", "Ghoul", "Lich"],
  9: ["Titã", "Banshee", "Demônio Menor"],
  10: ["Abominação", "ArquLich", "Súcubo"],
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
        bossObject.life,
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

  constructor() { }
}

const esperarTeclaC = () => {
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
  return new Promise<string>((resolve) => {
    const ouvinte = (str: string, key: any) => {
      if (key && /^[1-9]$/.test(key.name)) {
        console.log(`Você escolheu a opção: ${key.name}`);
        process.stdin.removeListener("keypress", ouvinte);

        resolve(key.name);
      }
    };
    process.stdin.on("keypress", ouvinte);
  });
};

const mostrarStatus = (player: mainCharacter, inimigo: { name: string; life: number; maxLife: number }) => {
  const barraVida = (atual: number, max: number, tamanho: number = 10) => {
    const preenchido = Math.round((atual / max) * tamanho);
    const vazio = tamanho - preenchido;
    return chalk.green("█".repeat(preenchido)) + chalk.gray("░".repeat(vazio));
  };

  console.log(chalk.gray("\n" + "─".repeat(50)));
  console.log(
    chalk.bold.white(` ${player.name}`) +
    chalk.gray(` | Nv. ${player.level} | XP: `) +
    chalk.yellow(`${player.experience}/${player.experienceToNextLevel}`)
  );
  console.log(
    chalk.red(` ❤️  Vida:    `) + barraVida(player.life, player.maxLife) + chalk.red(` ${player.life}/${player.maxLife}`) +
    chalk.blue(`   💧 Mana:   `) + barraVida(player.mana, player.maxMana, 8) + chalk.blue(` ${player.mana}/${player.maxMana}`)
  );
  console.log(
    chalk.yellow(` ⚡ Energia: `) + barraVida(player.energy, player.maxEnergy) + chalk.yellow(` ${player.energy}/${player.maxEnergy}`) +
    chalk.magenta(`   ⚔️  Ataque: ${player.attackPower}`) +
    chalk.cyan(`  🛡️  Defesa: ${player.defense}`)
  );
  if (player.activeBuffs.length > 0) {
    const buffsAtivos = player.activeBuffs.map(b => chalk.greenBright(`[${b.name} (${b.duration}t)]`)).join(" ");
    console.log(` ✨ Buffs: ${buffsAtivos}`);
  }
  console.log(chalk.gray("─".repeat(50)));
  console.log(
    chalk.redBright(` 💀 ${inimigo.name}: `) + barraVida(inimigo.life, inimigo.maxLife) + chalk.redBright(` ${inimigo.life}/${inimigo.maxLife}`)
  );
  console.log(chalk.gray("─".repeat(50)));
};

const printLento = async (
  texto: string,
  velocidadeMs: number = 30,
  cor?: ChalkInstance,
) => {
  for (const letra of texto) {
    if (cor) {
      process.stdout.write(cor(letra));
    } else {
      process.stdout.write(letra);
    }
    await new Promise((resolve) => setTimeout(resolve, velocidadeMs));
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
        30,
        chalk.red,
      );
      return;
    } else {
      if (this.salaAtual === 10 && this.salaConcluida) {
        this.salaAtual = 0;
        this.andarAtual++;
        await printLento(
          `--- Você avançou para o andar ${this.andarAtual} ---.`,
          30,
          chalk.magentaBright.bold,
        );
      }
      this.salaConcluida = false;
      this.salaAtual++;
      await printLento(
        `Você avançou para a sala ${this.salaAtual} do andar ${this.andarAtual}.`,
        30,
        chalk.cyan,
      );

      this.generateRoom(this.andarAtual);
      await this.batalhar(this.inimigo);
    }
  }

  public async batalhar(enemy: enemy[]): Promise<void> {
    const nomesInimigos = this.inimigo.map((ini) => ini.name).join(", ");

    await printLento(`A batalha vai começar!`, 50, chalk.bgRed.white.bold);
    await printLento(
      `${this.player.name} encontrou ${nomesInimigos} !!!`,
      50,
      chalk.yellow,
    );
    await esperarTeclaC();
    while (
      this.player.life > 0 &&
      this.inimigo.some((inimigo) => inimigo.life > 0)
    ) {
      for (let i = 0; i < this.inimigo.length; i++) {
        while (this.inimigo[i]!.life > 0 && this.player.life > 0) {
          mostrarStatus(this.player, this.inimigo[i]!);
          await printLento(`--- SEU TURNO ---`, 20, chalk.blueBright.bold);
          await printLento(
            `[1] Atacar | [2] Usar Item | [3] Usar Habilidade | [4] Fugir`,
            20,
            chalk.green,
          );
          const escolha = await esperarEscolha();
          if (escolha === "1") {
            // 1. Calcula o Dano Base (Ataque + Força)
            const danoBase =
              this.player.attackPower + this.player.strength * 1.5;

            // 2. Calcula se foi Crítico!
            const isCrit = Math.random() < this.player.taxaCritica; // Ex: se critChance for 0.10, tem 10% de chance
            let danoFinal = isCrit ? danoBase * 2 : danoBase;
            danoFinal = Math.floor(danoFinal); // Arredonda para não ter dano quebrado

            // 3. Aplica o dano
            this.inimigo[i]!.life -= danoFinal;

            if (isCrit) {
              await printLento(
                chalk.bgYellow.black.bold(
                  `⚡ ACERTO CRÍTICO! Você ataca o ${this.inimigo[i]!.name} causando ${danoFinal} de dano!`,
                ),
                30,
              );
            } else {
              await printLento(
                `Você ataca ${this.inimigo[i]!.name}! O ataque causa ${danoFinal} de dano.`,
                30,
                chalk.yellowBright,
              );
            }
          }
          if (escolha === "2") {
            if (this.player.inventory.length === 0) {
              await printLento(
                `Você não possui itens no inventário!`,
                30,
                chalk.red,
              );
            } else {
              console.log(chalk.cyan(`Itens disponíveis:`));
              this.player.inventory.forEach((item, index) => {
                console.log(chalk.cyan(`[${index + 1}] ${item}`));
              });
              const escolhaItem = await esperarEscolha();
              const itemIndex = parseInt(escolhaItem) - 1;

              if (itemIndex >= 0 && itemIndex < this.player.inventory.length) {
                const itemEscolhido = this.player.inventory[itemIndex];
                const consumivel = listaConsumiveis[itemEscolhido as keyof typeof listaConsumiveis]!;

                const buff = consumivel.usar(this.player);
                if (buff) {
                  this.player.activeBuffs.push(buff);
                }

                this.player.inventory.splice(itemIndex, 1);
              } else {
                console.log(chalk.red(`Escolha inválida!`));
              }
            }
          }
          if (escolha === "3") {
            // Se ele escolheu a habilidade 0 (Bola de Fogo, por exemplo):
            if (this.player.skills.length === 0) {
              await printLento(
                `Você não possui habilidades para usar!`,
                30,
                chalk.red,
              );
            } else {
              console.log(
                chalk.cyan(
                  `Habilidades disponíveis: ${this.player.skills.map((s, idx) => `[${idx + 1}] ${s.nome}`).join(", ")}`,
                ),
              );
              const escolhaHabilidade = await esperarEscolha();

              if (escolhaHabilidade === "1") {
                this.player.skills[0]!.usar(this.player, this.inimigo, i);
              }
              if (escolhaHabilidade === "2" && this.player.skills[1]) {
                this.player.skills[1]!.usar(this.player, this.inimigo, i);
              }
              if (escolhaHabilidade === "3" && this.player.skills[2]) {
                this.player.skills[2]!.usar(this.player, this.inimigo, i);
              }
              // Aqui você pode adicionar mais condições para habilidades adicionais, se houver.
              // Por exemplo, se o jogador tiver 4 habilidades, você pode adicionar:
              // if (escolhaHabilidade === "4" && this.player.skills[3]) {
              //   this.player.skills[3]!.usar(this.player, this.inimigo, i);
              // }
            }
          }
          if (escolha === "4") {
            const escapeChance = Math.random();
            if (escapeChance < 0.7) {
              await printLento(
                `Você conseguiu fugir da batalha!`,
                40,
                chalk.greenBright,
              );
              process.exit();
            } else {
              await printLento(`Você falhou em fugir!`, 40, chalk.red);
            }
          }

          this.player.processarBuffs();

          if (this.inimigo[i]!.life <= 0) {
            break;
          }
          await esperarTeclaC();
          await printLento(
            `\nO ${this.inimigo[i]!.name} contra-ataca!`,
            30,
            chalk.redBright.bold,
          );

          // 1. Calcula a porcentagem de redução (1 de defesa = 0.5% a menos de dano)
          // O Math.min garante que a redução máxima nunca passe de 80% (0.80)
          const reducaoPorcentagem = Math.min(this.player.defense * 0.005, 0.8);

          // Se a redução for de 5% (0.05), o multiplicador de dano é 0.95 (ou seja, você toma 95% do dano)
          const multiplicadorDano = 1 - reducaoPorcentagem;

          // 2. Calcula o dano final recebido
          let danoRecebido = Math.floor(
            this.inimigo[i]!.attackPower * multiplicadorDano,
          );

          // Garante que o inimigo sempre dê pelo menos 1 de dano
          if (danoRecebido < 1) danoRecebido = 1;

          this.player.life -= danoRecebido;
          await printLento(
            `Você recebeu ${danoRecebido} de dano.`,
            30,
            chalk.red,
          );
          if (this.player.life <= 0) {
            break;
          }
        }
        if (this.player.life <= 0) {
          await printLento(`Você foi derrotado!`, 50, chalk.bgRed.white.bold);
          await printLento(
            `Você chegou até a sala ${this.salaAtual} do andar ${this.andarAtual}.`,
            50,
            chalk.gray,
          );
          process.exit();
        } else {
          this.player.experience += this.inimigo[i]!.xpReward;
          await printLento(
            `Você ganhou ${this.inimigo[i]!.xpReward} de XP ao derrotar o ${this.inimigo[i]!.name}!`,
            30,
            chalk.magenta,
          );
          const upou = this.player.levelUp();
          if (upou) {
            await printLento(`\nVocê tem direito a uma nova habilidade!`, 30, chalk.bgYellow.black);

            // Chama o nosso algoritmo passando o nível atual
            const opcoes = sortearTresHabilidades(this.player.level);

            for (let j = 0; j < opcoes.length; j++) {
              let cor = chalk.white;
              if (opcoes[j]!.raridade === "RARA") cor = chalk.blue;
              if (opcoes[j]!.raridade === "EPICA") cor = chalk.magenta;

              console.log(cor(`[${j + 1}] ${opcoes[j]!.nome} (${opcoes[j]!.raridade})`));
              console.log(chalk.gray(`    ${opcoes[j]!.descricao}`));
            }

            // Pega a escolha do usuário (Reaproveitando a sua função do menu de combate!)
            let escolhaHab = await esperarEscolha();

            // Converte a tecla "1", "2" ou "3" para o index 0, 1 ou 2
            let indexEscolhido = parseInt(escolhaHab) - 1;

            // Adiciona a habilidade escolhida no inventário do jogador!
            this.player.skills.push(opcoes[indexEscolhido]!);
            await printLento(`Você aprendeu a habilidade ${opcoes[indexEscolhido]!.nome}!`, 30, chalk.green);
          }
          await printLento(
            `O ${this.inimigo[i]!.name} foi derrotado!`,
            30,
            chalk.greenBright.bold,
          );
        }
      }
    }

    if (this.player.life > 0) {
      this.salaConcluida = true;
      await printLento(`\nFim da batalha`, 30, chalk.bgGreen.black.bold);
      if (this.salaAtual === 10) {
        return;
      } else {
        await printLento(
          `Você pode avançar para a sala ${this.salaAtual + 1} do andar ${this.andarAtual}.`,
          30,
          chalk.cyan,
        );
      }
      await printLento(
        `------ Estátísicas de Combate ------`,
        30,
        chalk.blueBright,
      );
      await printLento(
        `Você terminou com ${this.player.life} de vida`,
        30,
        chalk.green,
      );
      let xpGanho = 20 * this.andarAtual + this.salaAtual * 10;
      this.player.experience += xpGanho;
      await printLento(
        `Você ganhou ${xpGanho} de experiência bônus por limpar a sala!`,
        30,
        chalk.magentaBright,
      );
      this.player.levelUp();

      if (this.roomChance < 90) {
        const nomesConsumiveis = Object.keys(listaConsumiveis);
        const randomItemName = nomesConsumiveis[Math.floor(Math.random() * nomesConsumiveis.length)];
        const recompensa = listaConsumiveis[randomItemName as keyof typeof listaConsumiveis]!;
        this.player.inventory.push(recompensa.name);
        await printLento(
          `Você encontrou um(a) ${recompensa.name}!`,
          30,
          chalk.greenBright,
        );
      }
      await printLento(
        `Pressione 'X' para avançar para a próxima sala`,
        30,
        chalk.gray,
      );
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
let isBusy = false;

process.stdin.on("keypress", async (str: string, key: any) => {
  if (key.name === "x" && !isBusy) {
    isBusy = true;
    await printLento("Avançando para a próxima sala...", 50);
    await Jogo1.avancar();
    isBusy = false;
  }
  if (key.ctrl && key.name === "c") {
    await printLento("Saindo do jogo...", 50);
    process.exit();
  }
});

// const esperarTeclaX = () => {
//   return new Promise<void>((resolve) => {
//     const ouvinte = (str: string, key: any) => {
//       // Se a tecla apertada for 'x', ele remove o ouvinte e destrava a promise
//       if (key && key.name === "x") {
//         process.stdin.removeListener("keypress", ouvinte);
//         Jogo1.avancar();
//         resolve();
//       }
//       if (key.ctrl && key.name === "c") {
//         process.stdin.removeListener("keypress", ouvinte);
//         process.exit();
//       }
//     };
//     // Fica escutando as teclas do terminal
//     process.stdin.on("keypress", ouvinte);
//   });
// };

