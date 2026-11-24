# Ficha pública no iPhone — ponto 8

Alterações locais preparadas para a atualização conjunta até ao ponto 9; não publicadas.

- O preço diário é apresentado numa única linha, com agrupamento por espaço: `5 000 CVE/dia`. A avaliação pode ocupar a linha seguinte sem comprimir ou quebrar o preço.
- Sem um intervalo completo, o painel apresenta `Selecione as datas para calcular o total`, sem mostrar um total artificial de zero. O botão `Selecionar datas` fica junto ao preço e abre o calendário.
- Com datas recebidas da pesquisa, o painel conserva o período e o total calculado no ponto 7 e apresenta `Alterar datas`. As alterações continuam a atualizar o URL e o checkout.
- As regras permanecem publicadas antes da reserva. O painel inclui um atalho `Ver regras do aluguer`, utilizável com ou sem datas, que desloca a página até às condições já existentes.
- Em telemóveis, o calendário abre dentro da largura do painel, com sete colunas adaptáveis. Textos longos das condições e caução podem quebrar linha. A faixa de fotografias mantém o seu próprio deslocamento horizontal, sem alargar a página.
- O cabeçalho das avaliações passa a reorganizar os elementos quando a largura é insuficiente. Foi identificada nesta área uma origem do excesso horizontal; não se aplicou um bloqueio global de overflow para esconder conteúdo.

## Verificação

Reproduzido no WebKit: viewport de 375 px com página a atingir 442 px antes dos ajustes. Após os ajustes, verificado sem deslocamento horizontal em 320, 375, 390 e 430 px, e também em 768 e 1280 px, com calendário aberto e fechado. Confirmados preço numa linha, sete colunas do calendário dentro da janela, acesso às regras, ausência de total zero sem datas, pré-preenchimento da pesquisa e alteração do período. Foram utilizadas respostas de API simuladas e uma galeria com oito fotografias.

Build aprovado e novas traduções verificadas nos sete idiomas. Os componentes alterados passam o lint sem erros; o componente de avaliações mantém o aviso de dependência de hook que já existia antes desta alteração.

Foi utilizado o motor WebKit em Windows com viewport e interação móvel. Esta verificação não equivale a um teste num iPhone físico com Safari/iOS; confirmar nesse dispositivo após a publicação conjunta. Não houve reservas nem alterações de dados reais.
