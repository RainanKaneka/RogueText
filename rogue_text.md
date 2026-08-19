# RogueText: RPG Roguelike de Extração

## Sobre o Jogo
**RogueText** é um RPG Roguelike de Extração baseado em texto, desenvolvido em TypeScript. 
A proposta principal do projeto é mesclar a experiência clássica de exploração de masmorras e combates em turnos via terminal com mecânicas modernas de jogos de **Extração** (como "Escape from Tarkov"). 

O jogador explora andares gerados proceduralmente e enfrenta inimigos de dificuldade crescente. A grande sacada do jogo é a decisão de risco e recompensa: o jogador deve decidir quando recuar (fugir e extrair) para salvar seus itens, habilidades e manter a meta-progressão, ou se arrisca avançar para o próximo andar em busca de glória, arriscando perder tudo caso seja derrotado.

### O Que Já Foi Construído (Até Agora)
- **Sistema de Progressão em Masmorras:** Andares gerados proceduralmente, com seleção de monstros escalonada e Boss garantido na 10ª sala de cada andar.
- **Sistema de Experiência e Evolução:** XP calculada com base na força dos inimigos derrotados, resultando em Level Ups que melhoram a Força e Vida base.
- **Atributos Dinâmicos de Combate:** Sistema matemático onde Status complexos (Força, Defesa, Chance Crítica, Mana e Energia) impactam ativamente o dano causado, dano mitigado e custos de recursos.
- **Sistema Gacha de Habilidades (Draft):** Ao subir de nível, o jogador sorteia 3 habilidades aleatórias de um catálogo geral. O sistema é baseado em probabilidades escalonadas por nível (habilidades Comuns, Raras, Épicas, etc.).
- **Interface Imersiva de Terminal:** Utilização da biblioteca `chalk` para colorização de eventos (danos, curas, Level Ups) e efeitos de impressão assíncrona (máquina de escrever) para fluidez de leitura.

---

## Requisitos Funcionais do Projeto (Roadmap)

Abaixo está o Backlog de desenvolvimento do jogo. Conforme avançarmos no desenvolvimento, marcaremos os itens como concluídos:

- [ ] **Sistema de Bonfire:** Criar fogueiras/pontos de descanso onde o jogador pode recuperar a vida.
- [ ] **Sistema de Gold e Loja:** Implementar dinheiro in-game dropado de inimigos e um mercador para comprar melhorias/consumíveis.
- [ ] **Sistema de Habilidades e Upgrades:** Expandir o catálogo de habilidades passivas/ativas e permitir upgrades das mesmas.
- [ ] **Sistema de Parry:** Implementar uma mecânica de combate focada em defender no momento exato, punindo o atacante ou negando dano.
- [ ] **Sistema de Artefatos e Consumíveis:** Permitir o uso de itens durante o combate (ex: poções) e equipamentos/relíquias que alteram status passivamente.
- [ ] **Seleção de Alvos no Combate:** Permitir que o jogador escolha especificamente qual inimigo deseja atacar quando houver múltiplos monstros na sala.
- [ ] **Mapeamento Oficial de Status:** Definir documentação final do que cada Status faz (Força, Destreza, Inteligência, etc.) e aplicar essa matemática no loop de combate.
- [ ] **Criação do Lobby (Hub):** Criar a base principal segura onde o jogador inicia antes de entrar na masmorra.
- [ ] **Sistema de Save e Extração:** Implementar a lógica de meta-progressão onde fugir salva consumíveis, itens e algumas habilidades para as próximas "runs", tornando o jogador permanentemente mais forte.
- [ ] **Refatoração do Loop de Combate:** Tornar a arquitetura de combate totalmente modular, responsiva, adaptável e livre de bugs, facilitando a adição de novos status ou eventos de turno.

---
*Documento atualizado conforme o progresso do desenvolvimento.*