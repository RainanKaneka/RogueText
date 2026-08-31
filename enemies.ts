import chalk from "chalk";
import type { Condicao } from "./conditions";

export class enemy {
  public life: number = 0
  public maxLife: number = 0
  public attackPower: number = 0
  public name: string = ''
  public xpReward: number = 0
  public goldReward: number = 0
  public condicoes: Condicao[] = [];
  public isBoss: boolean = false;
  public jaCaiu: boolean = false;

  constructor(name: string, attack: number, life: number, isBoss: boolean = false) {

    this.life = life
    this.maxLife = life
    this.attackPower = attack
    this.xpReward = Math.floor((this.attackPower * 2.5) + (this.life * 1.5));
    this.goldReward = Math.floor(this.attackPower * 1.25) + (this.life * 1.25)
    this.name = name
    this.isBoss = isBoss;
  }

  estaVivo(): boolean {
    return this.life > 0;
  }

  adicionarCondicao(condicao: Condicao): void {
    if (this.isBoss && ["Amedrontado", "Paralisado", "Caído"].includes(condicao.nome)) {
      console.log(chalk.gray(`O Boss ${this.name} é imune a ${condicao.nome}.`));
      return;
    }

    if (condicao.nome === "Caído") {
      if (this.jaCaiu) {
        console.log(chalk.gray(`O inimigo ${this.name} já aprendeu a se esquivar e resistiu a ser derrubado novamente.`));
        return;
      } else {
        this.jaCaiu = true;
      }
    }

    if (condicao.nome === "Envenenado") {
      const existe = this.condicoes.find(c => c.nome === "Envenenado");
      if (existe) {
        existe.duracao = Math.max(existe.duracao, condicao.duracao);
        if (condicao.danoOpcional) existe.danoOpcional = condicao.danoOpcional;
        return;
      }
    }
    this.condicoes.push(condicao);
  }

  processarCondicoesInicioTurno(): void {
    for (let i = this.condicoes.length - 1; i >= 0; i--) {
      const c = this.condicoes[i]!;
      
      if (c.nome === "Queimando" && c.danoOpcional) {
        this.life -= c.danoOpcional;
        console.log(chalk.redBright(`🔥 ${this.name} sofreu ${c.danoOpcional} de dano de queimadura.`));
      } else if (c.nome === "Envenenado" && c.danoOpcional) {
        if (this.life > 1) {
          this.life = Math.max(1, this.life - c.danoOpcional);
          console.log(chalk.greenBright(`☠️ ${this.name} sofreu ${c.danoOpcional} de dano de veneno.`));
        } else {
          console.log(chalk.greenBright(`☠️ O veneno corrói ${this.name}, mas ele resiste com 1 de vida.`));
        }
        if (c.stacks === undefined) c.stacks = 1;
        else c.stacks += 1;
      }

      c.duracao -= 1;
      if (c.duracao <= 0) {
        if (c.nome !== "Caído") {
          console.log(chalk.cyan(`A condição ${c.nome} de ${this.name} passou.`));
        }
        this.condicoes.splice(i, 1);
      }
    }
  }
}

export const battleEnemies: Record<string, { descricao?: string; attackPower: number; life: number }> = {
  // =====================================================================
  // INIMIGOS ORIGINAIS (mantidos para compatibilidade)
  // =====================================================================
  // Andar 1
  "Goblin": { descricao: 'Pequenos humanóides de pele verde que habitam cavernas e ruínas rasas. São covardes, mas perigosos em bando.', attackPower: 8, life: 30 },
  "Pequeno Troll": { descricao: 'Uma versão imatura dos trolls de montanha. Sua pele é dura como couro grosso e já apresentam forte regeneração.', attackPower: 5, life: 45 },
  "Cão de Caça": { descricao: 'Cães selvagens treinados por bandidos locais. Magros, mas com presas extremamente afiadas.', attackPower: 12, life: 20 },
  "Morcego Raivoso": { descricao: 'Habitantes dos tetos de masmorras. Ficam agressivos e descem em bando quando sentem cheiro de sangue.', attackPower: 14, life: 25 },
  // Andar 2
  "Esqueleto": { descricao: 'Guerreiros do passado trazidos de volta por magias antigas. Atacam tudo que ainda possui o calor da vida.', attackPower: 9, life: 35 },
  "Zumbi": { descricao: 'Corpos em decomposição reanimados. Lentos, mas a infecção em suas garras é um perigo constante.', attackPower: 11, life: 40 },
  "Homúnculo": { descricao: 'Criaturas feitas de barro e sangue alquímico. Patrulham áreas de antigos laboratórios subterrâneos.', attackPower: 10, life: 45 },
  "Múmia": { descricao: 'Soberanos esquecidos envoltos em faixas amaldiçoadas. Movem-se com uma lentidão aterrorizante nas tumbas.', attackPower: 13, life: 35 },
  // Andar 3
  "Diabrete": { descricao: 'Pequenos demônios conjurados para causar o caos. Costumam roubar itens e atacar pelas costas.', attackPower: 15, life: 25 },
  "Gárgula": { descricao: 'Estátuas de pedra que ganham vida nas profundezas. Aguardam imóveis até que a presa esteja perto.', attackPower: 10, life: 50 },
  "Armadura Viva": { descricao: 'Armaduras habitadas por espíritos de soldados caídos. Continuam a patrulhar os corredores vazios eternamente.', attackPower: 8, life: 60 },
  // Andar 4
  "Lobo Sombrio": { descricao: 'Predadores noturnos que se misturam às sombras. Caçam furtivamente e raramente são vistos antes de atacar.', attackPower: 14, life: 35 },
  "Sacerdote Caído": { descricao: 'Antigos fiéis que abandonaram a luz. Usam orações profanas para atormentar exploradores.', attackPower: 12, life: 40 },
  "Quimera": { descricao: 'Uma abominação criada por feiticeiros enlouquecidos. A fusão aterrorizante de três feras violentas.', attackPower: 15, life: 55 },
  // Andar 5
  "Medusa": { descricao: 'Mulheres amaldiçoadas cujos cabelos são serpentes peçonhentas. Habitam locais isolados, cercadas por suas estátuas.', attackPower: 15, life: 40 },
  "Verme da Areia": { descricao: 'Criaturas colossais que devoram a terra. Seu fluido digestivo é capaz de derreter aço.', attackPower: 12, life: 65 },
  "Sereia": { descricao: 'Espíritos aquáticos corrompidos que atraem vítimas para a água com cânticos hipnotizantes.', attackPower: 11, life: 50 },
  // Andar 6
  "Vampiro": { descricao: 'Senhores da noite que se alimentam do sangue humano. Rápidos e letais, possuem força sobrenatural.', attackPower: 16, life: 45 },
  "Necromante": { descricao: 'Magos obscuros que estudam as artes da morte. Raramente sujam as próprias mãos, preferindo usar servos.', attackPower: 18, life: 35 },
  "Aranha Gigante": { descricao: 'Monstros tecelões que fazem tocas nas partes mais profundas da masmorra. Suas presas injetam uma forte neurotoxina.', attackPower: 13, life: 50 },
  // Andar 7
  "Troll da Montanha": { descricao: 'Bestas enormes com pele rochosa. Sua regeneração os torna quase invulneráveis a ataques curtos.', attackPower: 14, life: 70 },
  "Wendigo": { descricao: 'Canibais amaldiçoados pelo frio eterno. Seu corpo esquelético e frio gela o ar ao redor.', attackPower: 17, life: 55 },
  "Minotauro": { descricao: 'Criaturas de pura fúria e músculos, frequentemente presas em labirintos para destroçar invasores.', attackPower: 16, life: 65 },
  // Andar 8
  "Golem de Pedra": { descricao: 'Autômatos maciços criados como os guardiões finais. Não sentem dor nem cansaço.', attackPower: 12, life: 80 },
  "Ghoul": { descricao: 'Devoradores de cadáveres. Atoxina em suas garras paralisa a presa, permitindo que a comam ainda viva.', attackPower: 15, life: 60 },
  "Lich": { descricao: 'Um mago que enganou a morte. Sua filactéria guarda sua alma, tornando-o imortal enquanto ela existir.', attackPower: 18, life: 40 },
  // Andar 9
  "Titã": { descricao: 'Gigantes primordiais esquecidos pelo tempo. Cada passo seu faz a terra tremer.', attackPower: 14, life: 90 },
  "Banshee": { descricao: 'Espíritos femininos agoniados. Seu grito ecoa pelas paredes, causando paralisia e terror profundo.', attackPower: 19, life: 45 },
  "Demônio Menor": { descricao: 'Entidades do abismo, invocadas para pactos sombrios. Deleitavam-se em torturar os fracos.', attackPower: 16, life: 50 },
  // Andar 10
  "Abominação": { descricao: 'Uma massa amorfa de carne e ossos. A pior das criações necromânticas, um horror indescritível.', attackPower: 15, life: 75 },
  "ArquLich": { descricao: 'O ápice da necromancia. Possui um domínio total sobre as artes profanas e a própria morte.', attackPower: 20, life: 60 },
  "Súcubo": { descricao: 'Demônios da tentação que iludem e drenam a energia vital de suas vítimas.', attackPower: 18, life: 55 },
  // Bosses Originais
  "Dragão": { descricao: 'Reis dos céus antigos, agora adormecidos em grandes tesouros. Seu sopro incinera exércitos.', attackPower: 12, life: 60 },
  "Hidra": { descricao: 'Fera de múltiplas cabeças venenosas. Cortar uma só dá lugar a duas novas, um pesadelo tático.', attackPower: 14, life: 70 },
  "Serpente de Fogo": { descricao: 'Répteis que habitam poços de lava. Suas escamas são quentes como o próprio magma.', attackPower: 18, life: 50 },
  "Servo das Sombras": { descricao: 'Entidade pura do vazio, sem forma, sem voz, existindo apenas para extinguir a luz.', attackPower: 15, life: 65 },
  "Centopeia Anciã": { descricao: 'Um artrópode monstruoso e milenar, blindado, veloz e equipado com pinças letais.', attackPower: 13, life: 80 },
  "Rei Perdido": { descricao: 'Uma criatura desconhecida.', attackPower: 16, life: 75 },
  "Rainha da Praga": { descricao: 'Uma criatura desconhecida.', attackPower: 17, life: 70 },
  "O Segundo Dedo": { descricao: 'Uma criatura desconhecida.', attackPower: 20, life: 100 },
  "Dragão Negro": { descricao: 'Uma criatura desconhecida.', attackPower: 25, life: 120 },
  "O Errante": { descricao: 'Uma criatura desconhecida.', attackPower: 30, life: 150 },

  // =====================================================================
  // MASMORRA ANTIGA — Novos inimigos básicos de masmorras
  // =====================================================================
  "Rato Gigante": { descricao: 'Uma criatura desconhecida.', attackPower: 5, life: 15 },
  "Morcego Raivoso": { descricao: 'Habitantes dos tetos de masmorras. Ficam agressivos e descem em bando quando sentem cheiro de sangue.', attackPower: 14, life: 25 },
  "Goblin": { descricao: 'Pequenos humanóides de pele verde que habitam cavernas e ruínas rasas. São covardes, mas perigosos em bando.', attackPower: 8, life: 30 },
  "Goblin Escoteiro": { descricao: 'Uma criatura desconhecida.', attackPower: 7, life: 25 },
  "Pequeno Troll": { descricao: 'Uma versão imatura dos trolls de montanha. Sua pele é dura como couro grosso e já apresentam forte regeneração.', attackPower: 5, life: 45 },
  "Aranha das Ruínas": { descricao: 'Uma criatura desconhecida.', attackPower: 9, life: 30 },
  "Esqueleto": { descricao: 'Guerreiros do passado trazidos de volta por magias antigas. Atacam tudo que ainda possui o calor da vida.', attackPower: 9, life: 35 },
  "Zumbi": { descricao: 'Corpos em decomposição reanimados. Lentos, mas a infecção em suas garras é um perigo constante.', attackPower: 11, life: 40 },
  "Aranha Gigante": { descricao: 'Monstros tecelões que fazem tocas nas partes mais profundas da masmorra. Suas presas injetam uma forte neurotoxina.', attackPower: 11, life: 40 },
  "Armadura Viva": { descricao: 'Armaduras habitadas por espíritos de soldados caídos. Continuam a patrulhar os corredores vazios eternamente.', attackPower: 11, life: 55 },
  "Esqueleto Arqueiro": { descricao: 'Uma criatura desconhecida.', attackPower: 14, life: 30 },
  "Gosma Ácida": { descricao: 'Uma criatura desconhecida.', attackPower: 10, life: 45 },
  "Gárgula": { descricao: 'Estátuas de pedra que ganham vida nas profundezas. Aguardam imóveis até que a presa esteja perto.', attackPower: 12, life: 50 },
  "Lobo das Cavernas": { descricao: 'Uma criatura desconhecida.', attackPower: 13, life: 35 },
  "Mímico": { descricao: 'Uma criatura desconhecida.', attackPower: 16, life: 60 },
  "Esqueleto Guerreiro": { descricao: 'Uma criatura desconhecida.', attackPower: 13, life: 45 },
  "Golem de Pedra Menor": { descricao: 'Uma criatura desconhecida.', attackPower: 10, life: 55 },
  "Bandido": { descricao: 'Uma criatura desconhecida.', attackPower: 12, life: 40 },
  "Cavaleiro Caído": { descricao: 'Uma criatura desconhecida.', attackPower: 13, life: 50 },
  "Minotauro": { descricao: 'Criaturas de pura fúria e músculos, frequentemente presas em labirintos para destroçar invasores.', attackPower: 16, life: 60 },
  "Armadura Pesada": { descricao: 'Uma criatura desconhecida.', attackPower: 12, life: 70 },
  "Golem de Pedra": { descricao: 'Autômatos maciços criados como os guardiões finais. Não sentem dor nem cansaço.', attackPower: 12, life: 80 },
  "Troll Ancião": { descricao: 'Uma criatura desconhecida.', attackPower: 14, life: 85 },
  "Cavaleiro Corrompido": { descricao: 'Uma criatura desconhecida.', attackPower: 15, life: 65 },
  "Titã Menor": { descricao: 'Uma criatura desconhecida.', attackPower: 13, life: 75 },
  "Dragão das Ruínas Menor": { descricao: 'Uma criatura desconhecida.', attackPower: 18, life: 70 },
  "Elemental de Pedra": { descricao: 'Uma criatura desconhecida.', attackPower: 11, life: 80 },
  "Guarda Real Corrompido": { descricao: 'Uma criatura desconhecida.', attackPower: 17, life: 75 },
  "Behemoth": { descricao: 'Uma criatura desconhecida.', attackPower: 20, life: 90 },
  "Golem de Ferro": { descricao: 'Uma criatura desconhecida.', attackPower: 15, life: 100 },
  // Boss — Masmorra Antiga
  "Rei dos Goblins": { descricao: 'Uma criatura desconhecida.', attackPower: 10, life: 50 },
  "Troll Chefe": { descricao: 'Uma criatura desconhecida.', attackPower: 12, life: 65 },
  "Rainha Aranha": { descricao: 'Uma criatura desconhecida.', attackPower: 14, life: 60 },
  "Campeão Caído": { descricao: 'Uma criatura desconhecida.', attackPower: 15, life: 70 },
  "Golem Guardião": { descricao: 'Uma criatura desconhecida.', attackPower: 14, life: 85 },
  "Rei Perdido": { descricao: 'Uma criatura desconhecida.', attackPower: 16, life: 75 },
  "Minotauro Furioso": { descricao: 'Uma criatura desconhecida.', attackPower: 19, life: 80 },
  "Titã de Pedra": { descricao: 'Uma criatura desconhecida.', attackPower: 16, life: 110 },
  "Dragão das Ruínas": { descricao: 'Uma criatura desconhecida.', attackPower: 23, life: 100 },
  "Senhor da Masmorra": { descricao: 'Uma criatura desconhecida.', attackPower: 25, life: 140 },

  // =====================================================================
  // MONTANHA DE GELO ❄️
  // =====================================================================
  // Monstros
  "Lobo Ártico": { descricao: 'Lobos com pelagem espessa, adaptados para caçar na neve. Seus dentes quebram o gelo puro.', attackPower: 21, life: 60 },
  "Morcego de Gelo": { descricao: 'Morcegos que soltam lufadas de ar frio e congelam a presa antes de morder.', attackPower: 25, life: 48 },
  "Goblin do Gelo": { descricao: 'Goblins nativos de regiões geladas. Usam armaduras de couro grosso e armas improvisadas de estalactites.', attackPower: 16, life: 67 },
  "Esqueleto de Gelo": { descricao: 'Guerreiros mortos no frio extremo, cujos ossos estão cobertos por uma crosta de gelo.', attackPower: 21, life: 84 },
  "Elemental de Gelo Menor": { descricao: 'Espírito do frio que se manifestou em um corpo de puro gelo.', attackPower: 23, life: 72 },
  "Troll Congelado": { descricao: 'Trolls que hibernavam e acordaram com o frio, sua regeneração agora é auxiliada pela resistência glacial.', attackPower: 18, life: 132 },
  "Aranha de Gelo": { descricao: 'Aranhas com exoesqueleto branco que tecem teias congelantes quase invisíveis.', attackPower: 25, life: 84 },
  "Golem de Gelo": { descricao: 'Guardiões construídos com pedaços de geleiras e magia ancestral.', attackPower: 21, life: 144 },
  "Espectro do Frio": { descricao: 'Amas penadas que vagam nas nevascas, sugando o calor de suas vítimas.', attackPower: 29, life: 72 },
  "Yeti": { descricao: 'Primatas gigantes das neves. Muito territoriais e com força suficiente para esmagar rochas.', attackPower: 27, life: 132 },
  "Serpente de Gelo": { descricao: 'Répteis que se movem debaixo da neve sem fazer ruído, atacando quem pisa perto.', attackPower: 29, life: 96 },
  "Cavaleiro do Inverno": { descricao: 'Paladinos caídos e congelados que ainda mantêm sua postura guerreira, empunhando espadas de gelo negro.', attackPower: 31, life: 120 },
  "Wyrm de Gelo": { descricao: 'Dragões primitivos, sem asas, que cavam pelas montanhas geladas criando avalanches.', attackPower: 33, life: 132 },
  "Elemental de Gelo": { descricao: 'A manifestação furiosa das tempestades de inverno, feito inteiramente de cristais afiados.', attackPower: 35, life: 108 },
  "Gigante de Gelo": { descricao: 'Seres antigos de proporções míticas que governavam os picos nevados antes dos homens.', attackPower: 29, life: 192 },
  "Lich do Gelo": { descricao: 'Necromantes que usaram o frio eterno para preservar suas próprias carcaças amaldiçoadas.', attackPower: 39, life: 96 },
  "Valquíria Congelada": { descricao: 'Guerreiras aladas punidas pelas divindades, servindo de sentinelas nos picos gelados.', attackPower: 35, life: 120 },
  "Titã do Gelo": { descricao: 'A personificação das nevascas, gigantes colossais de puro gelo, os seres mais temidos da montanha.', attackPower: 33, life: 204 },
  // Bosses — Montanha de Gelo
  "Alfa dos Lobos Árticos": { descricao: 'Uma criatura desconhecida.', attackPower: 25, life: 120 },
  "Troll Ancião Congelado": { descricao: 'Uma criatura desconhecida.', attackPower: 21, life: 156 },
  "Rainha das Aranhas de Gelo": { descricao: 'Uma criatura desconhecida.', attackPower: 29, life: 132 },
  "Golem Cristalino": { descricao: 'Uma criatura desconhecida.', attackPower: 23, life: 180 },
  "Yeti Patriarca": { descricao: 'Uma criatura desconhecida.', attackPower: 29, life: 168 },
  "Cavaleiro do Inverno Eterno": { descricao: 'Uma criatura desconhecida.', attackPower: 33, life: 156 },
  "Hidra de Gelo": { descricao: 'Uma criatura desconhecida.', attackPower: 35, life: 180 },
  "Gigante de Gelo Ancestral": { descricao: 'Uma criatura desconhecida.', attackPower: 37, life: 216 },
  "Lich do Permafrost": { descricao: 'Uma criatura desconhecida.', attackPower: 46, life: 168 },
  "Dragão de Gelo": { descricao: 'Uma criatura desconhecida.', attackPower: 52, life: 312 },

  // =====================================================================
  // REINO DAS CHAMAS 🔥
  // =====================================================================
  // Monstros
  "Salamandra Menor": { descricao: 'Anfíbios de pele ígnea que se aquecem na lava ardente, cuspindo brasas quando atacadas.', attackPower: 22, life: 70 },
  "Morcego de Fogo": { descricao: 'Asas flamejantes e olhos que brilham na escuridão vulcânica. Atraídos pelo cheiro de cinzas.', attackPower: 32, life: 50 },
  "Goblin do Fogo": { descricao: 'Goblins insanos que adoram o fogo, portando tochas ardentes e bombas rústicas.', attackPower: 20, life: 78 },
  "Elemental de Fogo Menor": { descricao: 'Fagulhas puras de magia vulcânica. Deixam o chão derretido por onde passam.', attackPower: 30, life: 78 },
  "Lagarto de Lava": { descricao: 'Lagartos com escamas espessas o suficiente para mergulhar em lava viva sem sofrer dano.', attackPower: 25, life: 98 },
  "Cavaleiro Flamejante": { descricao: 'Guerreiros que juraram proteger o Reino das Chamas. Suas armaduras emanam um calor insuportável.', attackPower: 35, life: 125 },
  "Fênix Menor": { descricao: 'Pássaros místicos envoltos em chamas constantes, capazes de queimar apenas o que tocam.', attackPower: 32, life: 84 },
  "Cão Infernal": { descricao: 'Cães gigantescos de pelagem flamejante, guardiões dos portões vulcânicos.', attackPower: 37, life: 98 },
  "Golem de Magma": { descricao: 'Colossos construídos de pedras derretidas. Seu toque queima até os ossos.', attackPower: 27, life: 182 },
  "Demônio de Fogo": { descricao: 'Demônios menores do abismo. Sentem prazer em incendiar os mortais.', attackPower: 40, life: 125 },
  "Serpente de Lava": { descricao: 'Serpentes que habitam poços de lava profunda. Suas presas injetam magma derretido nas veias.', attackPower: 35, life: 125 },
  "Efreet": { descricao: 'Entidades caóticas de fogo puro e magia. Conhecidos por seu temperamento explosivo e força bruta.', attackPower: 42, life: 140 },
  "Fênix": { descricao: 'A ave mítica, renascida nas chamas purificadoras. Suas asas incandescentes rasgam o céu com furor.', attackPower: 45, life: 112 },
  "Titã do Vulcão": { descricao: 'Gigantes ancestrais forjados nas chamas. Quando andam, vulcões entram em erupção.', attackPower: 37, life: 224 },
  "Quimera Flamejante": { descricao: 'Uma abominação mística misturando leão, dragão e cabra, todos respirando chamas mortais.', attackPower: 40, life: 168 },
  "Dragão de Fogo Menor": { descricao: 'Jovens dragões já destrutivos. Seu sopro incinera até metais sólidos.', attackPower: 47, life: 154 },
  "Senhor das Cinzas": { descricao: 'Humanoides esqueléticos que comandam exércitos no Reino das Chamas. Emanam fumaça tóxica.', attackPower: 50, life: 140 },
  "Efreet Ancião": { descricao: 'Senhores supremos dos efreets. Manipulam o fogo mágico para incinerar heróis rapidamente.', attackPower: 45, life: 154 },
  "Arauto do Inferno": { descricao: 'Aquele que anuncia a destruição vulcânica. Sua espada carrega as chamas da perdição pura.', attackPower: 42, life: 196 },
  // Bosses — Reino das Chamas
  "Matriarca Salamandra": { descricao: 'Uma criatura desconhecida.', attackPower: 27, life: 140 },
  "Golem de Magma Ancestral": { descricao: 'Uma criatura desconhecida.', attackPower: 30, life: 196 },
  "Cavaleiro das Cinzas": { descricao: 'Uma criatura desconhecida.', attackPower: 37, life: 168 },
  "Cerbero Flamejante": { descricao: 'Uma criatura desconhecida.', attackPower: 40, life: 182 },
  "Serpente de Lava Anciã": { descricao: 'Uma criatura desconhecida.', attackPower: 37, life: 210 },
  "Fênix Ancestral": { descricao: 'Uma criatura desconhecida.', attackPower: 45, life: 168 },
  "Efreet Sultão": { descricao: 'Uma criatura desconhecida.', attackPower: 47, life: 196 },
  "Titã Vulcânico": { descricao: 'Uma criatura desconhecida.', attackPower: 50, life: 237 },
  "Senhor do Inferno": { descricao: 'Uma criatura desconhecida.', attackPower: 57, life: 210 },
  "Dragão de Fogo": { descricao: 'Uma criatura desconhecida.', attackPower: 65, life: 378 },

  // =====================================================================
  // REINO DAS TREVAS 🌑
  // =====================================================================
  // Monstros
  "Sombra Rastejante": { descricao: 'Criaturas disformes de escuridão sólida. Drenam a esperança e a energia da vítima.', attackPower: 24, life: 70 },
  "Morcego Sombrio": { descricao: 'Morcegos gigantescos cujas membranas são puro breu. Se camuflam nos tetos altos.', attackPower: 33, life: 63 },
  "Goblin das Trevas": { descricao: 'Corrompidos pelo reino sombrio. Covardes, atacam com flechas envenenadas pelas costas.', attackPower: 27, life: 87 },
  "Espectro Menor": { descricao: 'Almas atormentadas presas entre as sombras. Seu toque gela a pele e o sangue.', attackPower: 36, life: 77 },
  "Vampiro Menor": { descricao: 'Vampiros famintos, desesperados por sangue fresco. Menos nobres, mas igualmente letais.', attackPower: 39, life: 122 },
  "Esqueleto das Trevas": { descricao: 'Guerreiros cadavéricos envoltos em sombras vivas, mais fortes e rápidos que esqueletos comuns.', attackPower: 33, life: 133 },
  "Assassino Sombrio": { descricao: 'Servos do véu. Treinados nas artes furtivas, costumam desferir o golpe fatal sem serem vistos.', attackPower: 48, life: 105 },
  "Wraith": { descricao: 'O fantasma do ressentimento, uma entidade incorpórea cheia de ódio. Seu toque envelhece a carne.', attackPower: 42, life: 122 },
  "Pesadelo Vivo": { descricao: 'A manifestação dos piores medos. Sua simples presença afeta a sanidade dos guerreiros.', attackPower: 45, life: 140 },
  "Vampiro Nobre": { descricao: 'Aristocratas das trevas. Ágeis, hipnotizantes e caçam com a crueldade de um felino brincando com o rato.', attackPower: 51, life: 157 },
  "Cavaleiro da Escuridão": { descricao: 'Elite militar do Lorde das Trevas. Sua armadura parece engolir qualquer feixe de luz ao redor.', attackPower: 48, life: 192 },
  "Aranha Sombria": { descricao: 'Aracnídeos imensos, invisíveis no escuro. Sua teia suga as forças de quem fica preso.', attackPower: 42, life: 157 },
  "Demônio das Sombras": { descricao: 'Bestas abissais formadas nas partes mais rasas do Submundo. Cruéis e incansáveis.', attackPower: 54, life: 175 },
  "Ceifador": { descricao: 'Entidades que colhem almas, usando lâminas tão frias quanto a foice da própria morte.', attackPower: 60, life: 140 },
  "Lich das Trevas": { descricao: 'Mestres necromantes corrompidos. Seu poder é alimentado pelas sombras infinitas do reino.', attackPower: 57, life: 157 },
  "Arquidemônio": { descricao: 'A elite destrutiva, seres que governam exércitos sombrios inteiros, repletos de pura brutalidade mágica.', attackPower: 54, life: 210 },
  "Devorador de Almas": { descricao: 'Um demônio monstruoso focado em drenar a essência de aventureiros desavisados.', attackPower: 51, life: 245 },
  "Avatar das Trevas": { descricao: 'Uma entidade profana que personifica a escuridão suprema. O pesadelo final de qualquer expedição.', attackPower: 60, life: 192 },
  // Bosses — Reino das Trevas
  "Alfa das Sombras": { descricao: 'Uma criatura desconhecida.', attackPower: 33, life: 157 },
  "Conde Vampiro Menor": { descricao: 'Uma criatura desconhecida.', attackPower: 39, life: 192 },
  "Necromante do Véu": { descricao: 'Uma criatura desconhecida.', attackPower: 45, life: 175 },
  "Assassino Lorde": { descricao: 'Uma criatura desconhecida.', attackPower: 51, life: 192 },
  "Rainha Banshee": { descricao: 'Uma criatura desconhecida.', attackPower: 48, life: 210 },
  "Vampiro Ancestral": { descricao: 'Uma criatura desconhecida.', attackPower: 54, life: 227 },
  "Aracne Sombria": { descricao: 'Uma criatura desconhecida.', attackPower: 51, life: 245 },
  "Lich Supremo": { descricao: 'Uma criatura desconhecida.', attackPower: 60, life: 262 },
  "Arquidemônio Selado": { descricao: 'Uma criatura desconhecida.', attackPower: 69, life: 280 },
  "Senhor das Trevas": { descricao: 'Uma criatura desconhecida.', attackPower: 84, life: 490 },
} 