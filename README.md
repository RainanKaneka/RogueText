# RogueText

RogueText é um jogo RPG Roguelite baseado em turnos feito em TypeScript. Originalmente planejado como um jogo jogado pelo terminal (CLI), evoluiu para uma aplicação web estática estilizada com uma interface inspirada em clássicos retrô. 

## Como Jogar

Você começará no **Lobby**. A partir dele, você pode acessar a **Loja**, visualizar essa página em **Sobre o Jogo** ou **Iniciar uma Nova Run**.
Ao iniciar uma nova run, você deverá selecionar a sua **Classe**. Novas classes podem ser desbloqueadas subindo andares e evoluindo nas suas partidas!

### Exploração e Batalha
O jogo é dividido por **Andares**. Cada andar possui 10 salas:
- **Salas 1 a 9**: Salas com monstros comuns para você lutar, ganhar Ouro (G) e Experiência (XP).
- **Sala 10 (Boss)**: Uma sala especial de Chefe, com inimigos mais fortes.

Durante a batalha, você pode usar:
- **Atacar**: Usa sua Arma equipada (ou o próprio punho, se estiver sem). Armas possuem chance de Crítico e ganham dano bônus de atributos com base no seu escalonamento (S, A, B, C, D).
- **Habilidades**: Magias e poderes ativos que consomem Mana (MP) ou Energia. Elas podem escalar com atributos específicos (ex: uma habilidade pode escalar com Inteligência, enquanto um ataque físico pesado pode escalar com Força).
- **Inventário**: Mostra consumíveis que curam sua Vida ou Mana/Energia.
- **Fugir (Extração)**: O jogo foca muito em gerenciamento de risco. Você sempre tem a opção de "Fugir" nas batalhas para tentar extrair e voltar ao lobby vivo, levando seu loot (Ouro) intacto. (Chance de falha).

### Permadeath, Extração e Economia (Ouro)
Se a vida do seu personagem chegar a 0, a *run* acaba.
- Quando você morre, você **perde metade do ouro** coletado na run.
- Você pode comprar e desbloquear **Armas e Consumíveis permanentes** na Loja do Lobby usando o ouro guardado! 

### Level Up
Ao derrotar inimigos e juntar experiência (XP), você sobe de nível. Todo level up concede a você:
- Aumentos passivos em Vida, Mana e Energia máximas.
- Uma seleção de 1 nova **Habilidade** sorteada (de Comum a Único).
- **1 Ponto de Atributo** para distribuir entre:
  - **Força (STR)**: Aumenta dano de Armas e habilidades Físicas.
  - **Destreza (DEX)**: Aumenta a Chance de Crítico.
  - **Inteligência (INT)**: Aumenta o dano de Habilidades Mágicas.
  - **Defesa (DEF)**: Reduz o dano sofrido por inimigos.
  - **Sorte (LUK)**: Aumenta a chance de encontrar itens raros em baús!

### Baús
No final de cada andar (ao derrotar o Chefe na Sala 10), você receberá um **Baú**. 
- Baús têm raridades variando de Comum a Único.
- Eles podem lhe conceder Armas poderosas ou Poções Consumíveis. Você tem maior chance de receber itens da mesma raridade do Baú.

## Stack Tecnológico
O projeto é construído 100% no Frontend usando:
- **TypeScript** (Lógica principal, OOP, interfaces)
- **Vite** (Bundler e servidor de desenvolvimento super rápido)
- **HTML / CSS Puro** (UI Responsiva e estilo retro-pixel)

Todo o estado do jogador e as melhorias compradas na loja são salvos localmente utilizando o `localStorage` do navegador, então você nunca perde seu progresso ao recarregar a página!

## Rodando Localmente

Para rodar este projeto na sua própria máquina, é necessário ter o [Node.js](https://nodejs.org/) instalado.

1. Baixe o repositório ou faça o clone:
   ```bash
   git clone https://github.com/RainanKaneka/RogueText.git
   ```
2. Instale as dependências na pasta do projeto:
   ```bash
   npm install
   ```
3. Inicie o servidor local do Vite:
   ```bash
   npm run dev
   ```
4. Acesse pelo navegador acessando o link que aparecerá no terminal (geralmente `http://localhost:5173/`).

## Créditos e Agradecimentos (Música)
A trilha sonora do jogo utiliza o pacote **Free Retro Game Soundtrack** criado por [xDeviruchi (Marllon Silva)](https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack) e é licenciada sob [CC Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). Muito obrigado!
