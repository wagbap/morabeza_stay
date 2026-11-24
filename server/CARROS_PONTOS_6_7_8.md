# Carros: pontos 6, 7 e 8

Alteracoes apenas no frontend; nao exigem SQL nem novos endpoints.

- Registo e edicao: cidade e local especifico sao independentes. Sugestoes preenchem ilha, cidade e zona. Mantidos os campos esperados pela API: ilha, cidade e localizacao.
- Removido o icone de dolar do preco diario; a etiqueta continua a indicar CVE.
- Galeria: foto principal com miniaturas selecionaveis e acesso a todas as fotos, mesmo com uma unica imagem. A capa da listagem e apenas fallback quando nao existem fotografias carregadas.
- Antes do pagamento: Total a pagar. Contagem com singular/plural e estado sem stock. Sem avaliacoes em vez de nota zero na pagina e cartoes de carros; painel de notas oculto sem avaliacoes.

Publicar o frontend depois de gerar o build. Nao foi feita publicacao remota. Validar registo/edicao com cidade Praia e zona Plato, galeria com 1 e varias fotografias, zero avaliacoes e contagens 0/1/2.
