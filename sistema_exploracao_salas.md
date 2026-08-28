# 🗺️ Proposta de Design: Sistema de Escolha de Salas & Exploração Dinâmica (RogueText)

Este documento detalha o funcionamento, estrutura matemática, tipos de salas e alternativas de design para transformar a progressão de salas do **RogueText** em uma experiência tática estilo roguelike (onde cada avanço exige uma tomada de decisão com risco e recompensa).

---

## 📌 1. O Problema Atual vs. O Novo Objetivo

### Como funciona hoje:
* O jogador vence um combate e clica em **"Avançar para próxima sala"**.
* A progressão é 100% linear: 10 Andares x 10 Salas = **100 combates sequenciais**.
* O jogo pode se tornar repetitivo porque o jogador não tem agência sobre *onde ir* ou *o que enfrentar*.

### O Novo Objetivo:
* Ao vencer uma sala, o jogador é apresentado a **2 ou 3 caminhos / portas**, gerados proceduralmente.
* Cada porta tem uma **identidade visual**, um **tipo de sala** (Combate, Tesouro, Altar de Sacrifício, Evento Misterioso, Fogueira, Mercador) e um **nível de risco/recompensa**.
* O jogador escolhe ativamente sua rota com base no seu estado atual de Vida, Mana, Ouro e Build.

---

## 🧭 2. Como Estruturar as Salas e Andares (A Grande Dúvida)

Abaixo estão as duas melhores abordagens de arquitetura para resolver a dinâmica de andares e salas:

---

### 🔹 Abordagem A: "O Sistema das 3 Portas" (Recomendada para o RogueText)
> **Como funciona:** Linear com Ramificação Imediata. É o sistema usado em jogos como *Hades*, *Dead Cells* e *Vampire Survivors*.

1. Ao limpar a sala atual, a tela de vitória mostra **2 a 3 portas**:
   * *Exemplo:*
     * 🚪 **Porta 1:** ⚔️ *Combate Comum* (Recompensa: XP + Ouro + Chance de Drop)
     * 🚪 **Porta 2:** 🩸 *Altar dos Pactos* (Sacrifício por Grande Poder)
     * 🚪 **Porta 3:** 🎁 *Sala do Tesouro* (Baú sem combate)
2. O contador continua claro e intuitivo: `Andar 1 - Sala 3/7`.
3. **Pacing sugerido:**
   * Reduzir de **10 salas por andar** para **6 ou 7 salas por andar**.
   * *Por quê?* 7 salas com eventos e decisões são muito mais rápidas, dinâmicas e prazerosas do que 10 combates lentos. Em 10 andares, uma run completa terá ~70 salas com ritmo perfeito.

```
[Sala 1: Combate Inicial]
         |
         +---> [Porta A: ⚔️ Combate]
         +---> [Porta B: ❓ Mistério]
                   |
                   +---> [Porta A: 🩸 Altar]
                   +---> [Porta B: 🎁 Baú]
                             |
                   ... (Salas 4, 5, 6) ...
                             |
                   [Sala 7: 👑 BOSS DO ANDAR]
```

---

### 🔹 Abordagem B: "Minimapa de Nós / Grafo" (Estilo *Slay the Spire* / *FTL*)
> **Como funciona:** No início de cada andar, é gerada uma árvore com 3 a 4 colunas de caminhos interligados.

* O jogador visualiza todo o andar desde a Sala 1 até a Sala 7.
* Permite planejamento a longo prazo: *"Se eu for pela esquerda, pego 2 fogueiras e evito elites antes do boss"*.
* **Interface:** Pode ser renderizado como um minimapa vertical de texto/ícones interativos clicáveis.

---

## 🏛️ 3. Catálogo de Tipos de Salas Propostas

Aqui está a lista de tipos de salas que darão vida ao sistema:

### 1. ⚔️ Sala de Combate Comum
* **Ícone:** ⚔️
* **Descrição:** Inimigos normais daquele andar (1 a 3 monstros).
* **Recompensa:** XP padrão, Ouro padrão e chance de drop de consumíveis/armas.

### 2. 💀 Sala de Combate de Elite (Alto Risco)
* **Ícone:** 💀
* **Descrição:** Inimigos com modificadores especiais (ex: +30% HP, +20% Dano, ou bando reforçado).
* **Recompensa:** Ouro e XP dobrados + **Garantia de Drop de Arma Rara/Épica ou Acessório**.

### 3. 🎁 Sala do Tesouro (Baú)
* **Ícone:** 🎁
* **Descrição:** Sem combate obrigatório!
* **Mecânica:**
  * **Baú Comum:** Abre direto e pega 1 item + ouro.
  * **Baú Trancado/Armadilhado:** Pode tentar abrir fazendo um mini-game de Parry/Destreza para ganhar itens melhores, mas se falhar, toma dano de armadilha ou enfrenta um Mímico!

### 4. 🩸 Altar dos Pactos Sombrios (Mecânica de Sacrifício)
* **Ícone:** 🩸
* **Descrição:** Uma estátua sombria oferece poderes proibidos em troca de um tributo severo.
* **Exemplos de Pactos:**
  * **Pacto de Sangue:** Sacrifica 30% da sua Vida Máxima atual permanentemente nesta run ➔ Ganha **+8 em Força, Destreza ou Inteligência**.
  * **Pacto do Caniçal:** Perde 50% da Vida Máxima atual ➔ Todos os seus ataques causam **+50% de Dano** e curam 5% do dano causado.
  * **Pacto da Ganância:** Todos os monstros do andar causam +25% de dano ➔ Você ganha **+100% de Ouro** até o fim do andar.
  * **Pacto do Eremita:** Perde toda a Mana Máxima (fica com 0) ➔ Ganha **+20% de Chance de Crítico** e **+10 de Defesa**.
  * **Pacto de Purificação:** Paga 40% do seu Ouro atual ➔ Cura 100% de Vida/Mana e ganha uma bênção protetora.

### 5. ❓ Eventos Misteriosos (Encontros Aleatórios)
* **Ícone:** ❓
* **Descrição:** Situações narrativas com 2 ou 3 escolhas morais ou apostas.
* **Exemplos de Eventos:**
  * **A Fonte Brilhante:**
    * *Opção 1:* Beber da água (70% chance de curar 50% de HP / 30% de sofrer Envenenamento).
    * *Opção 2:* Jogar uma moeda de ouro (Ganha buff de +5% de Crítico temporário).
    * *Opção 3:* Ignorar e seguir em frente.
  * **O Ladrão Goblin Encurralado:**
    * *Opção 1:* Executar o goblin (Ganha 150G na hora).
    * *Opção 2:* Curar as feridas dele com 1 poção (Ele te promete uma recompensa rara no próximo andar).
  * **A Forja Esquecida:**
    * *Opção 1:* Amolar sua arma (+10% de dano base permanente na run).
    * *Opção 2:* Reforçar sua armadura (+4 de DEF permanente na run).
  * **O Jogo de Dados do Demônio:**
    * Apostar 100G: Se tirar 4, 5 ou 6 ganha 250G. Se tirar 1, 2 ou 3 perde o ouro e toma 20 de dano.

### 6. 🏕️ Fogueira / Acampamento Seguro
* **Ícone:** 🏕️
* **Descrição:** Sala pacífica para respirar e recuperar recursos antes de salas perigosas.
* **Escolha entre:**
  * 🍖 **Descansar:** Recupera 40% do HP Máximo e 50% da Mana.
  * 🧘 **Meditar:** Ganha +1 Ponto de Atributo livre para distribuir.
  * 🛡️ **Polir Equipamento:** Ganha um escudo temporário de 30 de vida para a próxima batalha.

### 7. 🛒 Mercador Ambulante
* **Ícone:** 🛒
* **Descrição:** Um comerciante misterioso que aceita o Ouro acumulado na expedição.
* **Oferece:**
  * 3 Poções/Consumíveis aleatórios com preço justo.
  * 1 Arma ou Acessório de alta qualidade.
  * Serviço de Remoção de Maldições ou Compra de Vidas Extras.

### 8. 👑 Sala do Boss (Sala Final)
* **Ícone:** 👑
* **Descrição:** Sempre fixa como a última sala do andar (Sala 7 ou Sala 10).
* Vencendo o Boss: Ganha Baú do Boss, XP em massa e abre o portal para o próximo Andar (ou Extração).

---

## 📊 4. Estrutura Matemática & Regras de Geração (Garantindo o Balanceamento)

Para que a geração aleatória não crie situações quebradas (ex: 5 baús seguidos sem combate, ou o jogador chegar fraco no Boss):

1. **Regra da Sala 1:** A Sala 1 de qualquer andar é **sempre Combate Comum** (aquecimento).
2. **Regras das Salas Intermediárias (Salas 2 a 5):**
   * Cada uma das 3 portas tem pesos probabilísticos:
     * ⚔️ Combate Comum: **45%**
     * 💀 Combate de Elite: **15%**
     * ❓ Evento Misterioso: **15%**
     * 🩸 Altar de Sacrifício: **10%**
     * 🎁 Baú do Tesouro: **10%**
     * 🛒 Mercador: **5%**
   * *Prevenção de Repetição:* O algoritmo nunca gera 3 portas do mesmo tipo.
3. **Regra da Penúltima Sala (Sala 6):**
   * Pelo menos uma das portas é garantida de ser **🏕️ Fogueira** ou **🛒 Mercador** para o jogador se preparar para o Boss.
4. **Regra da Última Sala (Sala 7):**
   * Todas as portas se fundem na única opção: **👑 🚪 PORTA DO BOSS**.

---

## 💡 5. Como a Interface Pode Mostrar Isso

Ao vencer uma sala, ao invés do botão único, exibimos um painel elegante com as opções:

```
+-------------------------------------------------------------------+
|                     ESCOLHA SEU PRÓXIMO CAMINHO                   |
|                        [ Andar 1 • Sala 3/7 ]                     |
+-------------------------------------------------------------------+
|                                                                   |
|  [ 🚪 PORTA ESQUERDA ]     [ 🚪 PORTA CENTRAL ]     [ 🚪 PORTA DIREITA ]   |
|     ⚔️ Combate Comum         🩸 Altar Sombrio         ❓ Sala Misteriosa   |
|   "Goblins e Ratos"       "Pacto de Sangue"        "Ruídos estranhos..."  |
|                                                                   |
|   [ Escolher Caminho ]     [ Escolher Caminho ]     [ Escolher Caminho ]  |
+-------------------------------------------------------------------+
```

---

## ❓ 6. Pontos Para Discutirmos Juntos

1. **Quantas salas por andar você acha ideal?**
   * Manter **10 salas** (com várias não-combate no meio) ou enxugar para **6 ou 7 salas** para a run ficar mais ágil?
2. **Você prefere o Sistema das 3 Portas (escolha imediata a cada sala) ou o Mapa Completo visível (estilo Slay the Spire)?**
3. **Quais pactos de sacrifício você mais gostaria de ver no jogo além da troca de Vida por Atributos?**
4. **Gostaria que o Sistema de Pontos de Extração fosse integrado a essas portas (ex: uma porta de portal de fuga que surge em salas raras)?**
