Olá, esse arquivo irá descrever a implementação do Diário do Explorador.

# Conceito Principal

O diário do explorador, é pra ser um guia para o jogador. Lá ele poderá ver informações sobre as criaturas que ele já encontrou, os itens que ele já coletou, as expedições que ele já explorou, etc. O diário será dividido em várias seções, cada uma com suas próprias informações.

## Informação de Criaturas

Na seção de criaturas, o jogador poderá ver informações sobre as criaturas que ele já encontrou. 
Ele encontrará informações como:

- Nome da Criatura
- Descrição
- Drops (Uma lista de todos os itens que podem ser dropados por essa criatura)
- Características Especiais (Essa parte é opcional, mas ela é aplicada por exemplo, em criaturas que podem deixar o inimigo envenenado, congelado, etc)

## Informação de Itens

Na seção de itens, o jogador poderá ver informações sobre os itens que ele já coletou ou craftou. 
Ele encontrará informações como:

- Nome do Item
- Descrição
- Utilidade (Para que serve o item, por exemplo: Poção de Cura: Serve para curar o jogador)
- Stats (As estatísticas que o item fornece para o jogador)
- Passivas

## Informação de Expedições

Na seção de expedições, o jogador poderá ver informações sobre as expedições que ele já completou. 
Ele encontrará informações como:

- Nome da Expedição
- Descrição
- Inimigos
- Itens Exclusivos
- Bosses


# Estilo Visual

O estilo visual do diário, deve ser como se fosse um livro aberto com as duas páginas abertas, ao lado, uma seta ou indicador de clique, que ao clicar, o jogador passa a página, e aparece outra parte do diário. 
Exemplo: O livro inicia na parte da Enciclopédia de monstros, na página esquerda, terá o nome das criaturas, na parte direita, a descrição expandida dela, seu nome, seus drops, tudo. Quando o jogador clicar em uma criatura na página da direita, ele troca a página da direita para a próxima criatura, mostrando assim, todas as criaturas, uma por uma. Ao lado do livro, terá uma seta/indicador que ao clicar, o jogador passa para outra seção do diário, exemplo: Enciclopédia de Monstros -> Enciclopédia de Itens, etc. As outras páginas seguirão esse modelo de design de página esquerda e direita, exemplo: Enciclopédia de Itens, na página esquerda, terá o nome dos itens, na página direita, a descrição expandida dele, seu nome, seus stats, tudo.

# Funcionalidades

- O diário será dividido em várias seções, cada uma com suas próprias informações.
- As seções serão: Enciclopédia de Monstros, Enciclopédia de Itens, Enciclopédia de Expedições.
- Cada seção terá sua própria página, e o jogador poderá alternar entre as seções clicando na seta/indicador ao lado do livro.

# Divisão

Divida essa tarefa em etapas, em várias fases. O objetivo é criar o diário e todas as suas funcionalidades. Não precisa fazer tudo de uma vez, podemos ir fazendo aos poucos.
