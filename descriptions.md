Olá, criei esse documento pra orientar você a fazer e melhorar as descrições das salas.

Quero que você crie e altere as descrições das Expedições.

Atualmente, possuem descrições, porém elas pecam em varias coisas:

# Falta de conectividade

As descrições parecem mais frases aleatórias do que descrições que conectam umas com as outras e com o tema da expedição. O jogador precisa ter a sensação de que realmente está  explorando algo, que as coisas estão minimamente conectadas e que fazem sentido baseado no tema da expedição. Pense nas descrições como se fossem um mapa que o jogador está montando na cabeça dele.

# Criaturas e resultados não se relacionam com a descrição

Atualmente, a descrição é só uma frasa aleatória que não necessáriamente vai ter relação com o que tem após você escolher ela. Isso deve ser corrigido, por exemplo, eu fui testar uma run na Masmorra Antiga, me deparei com a descrição "Tochas apagadas há séculos ladeiam um salão coberto de teias. Ruídos de passos ecoam ao longe.", porém, acabei encontrando com dois goblins escoteiros. Vendo no roomDescriptions.ts, eu vi que essa descrição realmente tinha a ["Aranha das Ruínas"] como inimigo possível, porém também tinha o "Goblin Escoteiro" como inimigo possivel, e acabou vindo dois deles. As descrições devem contar uma história, ser algo que indica pro jogador o que ele pode encontrar, e isso deve se relacionar com o "mapa" mental dessa expedição e do tema dela. Futuramente, o jogador deve conseguir saber o que ele vai encontrar apenas lendo as descrições, isso com a ajuda da enciclopedia de monstros. No caso da descrição "Tochas apagadas há séculos ladeiam um salão coberto de teias. Ruídos de passos ecoam ao longe.", ela indica que sim, muito provavelmente tem aranhas, e o jogador terá uma noção disso antes de entrar, mas na descrição, onde da uma pista ou indica que terá um "Goblin Escoteiro"? Exatamente, não tem, e é isso que não pode ter.

# Exemplo de como deveria ser:

O jogador encontra a descrição - "Explorando uma sala escura na masmorra, você escuta sons vindo de um quarto, ao espreitar pela fresta da porta, você se depara com a silhueta de uma pequena criatura procurando por algo em um baú.", caso o jogador escolha essa opção, ele encontra "Goblin Saqueador". Entende? Esse é o tipo de coerência e sentido que eu quero pras descrições e pras coisas que tem nas salas delas. O jogador DEVE conseguir saber ou ter uma noção do que ele vai encontrar, se ele encontra uma descrição que fala sobre um local coberto de teias, não faz sentido ele encontrar um esqueleto, mas sim uma aranha. Utilize do cenário e descrições para mostrar para o jogador onde ele está. 

**"Um corredor empoeirado se abre para uma câmara com paredes rachadas. Algo se move nas sombras entre os escombros"** - Esse é o tipo de descrição que **NÃO** pode existir. É uma descrição vazia, não indica nada, não indica criatura específica, recompensa, item, absolutamente nada, só indica que tem uma criatura (O próprio emoji de espada indica isso, e inclusive, quero que remova esses emojis nas descrições). As descrições devem indicar alguma coisa, e essas descrições devem poder serem conectadas na mente do jogador com as características e descrições das criaturas na enciclopédia de monstros futuramente. Por exemplo, se você encontar o "Goblin Saqueador" na enciclopédia de monstros, pode ter algo escrito como "Goblin Saqueador: pequenas criaturas neutras que costumam vasculhar masmorras, fazendo barulhos procurando por espólios e moedas de ouro no meio da escuridão" Dessa forma, quando o jogador ver a descrição "Explorando uma sala escura na masmorra, você escuta sons vindo de um quarto, ao espreitar pela fresta da porta, você se depara com a silhueta de uma pequena criatura procurando por algo em um baú.", ele vai pensar "Ok, provavelmente tem um Goblin Saqueador aqui"

