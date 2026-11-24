# Ajustes de formulário e texto — ponto 6

Alterações locais preparadas para a atualização conjunta até ao ponto 9. Não foram publicadas.

- `Especificacoes.jsx`: a quilometragem conserva a string vazia enquanto o utilizador apaga/edita o campo. Um número introduzido volta a ser guardado no estado como número. O formulário mantém o valor zero quando este existe; deixa de repor zero ao apagar. O envio existente continua a converter um campo vazio para zero apenas ao guardar, sem mudar o contrato da API.
- `InformacoesBasicas.jsx`: o título tem espaço à esquerda para o ícone de etiqueta, com cor no wrapper e sem interferir nos cliques do campo.
- Ambos os resumos de carros usam o plural do i18next: `Subtotal (1 dia)` e `Subtotal (2 dias)`. Foram acrescentadas as variantes singular/plural nos sete idiomas.

Verificação: lint dos quatro componentes e build aprovados. No navegador, com API simulada, apagou-se o único zero, confirmou-se o campo vazio após perder foco, introduziu-se 45231, guardou-se e reabriu-se a edição com o mesmo valor. A ficha pública mostrou a quilometragem correspondente. Verificado o espaço entre ícone e texto em desktop e telemóvel e os subtotais com um e dois dias.

O teste não escreveu no servidor real. A persistência efetiva na base de produção deve ser confirmada após a atualização conjunta, usando o endpoint existente `/carro/atualizar.php`, cujo código não está neste repositório.
