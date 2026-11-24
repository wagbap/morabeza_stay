# Galeria de fotografias — ponto 9

## Origem confirmada

Na consulta pública de 7 de novembro de 2026, o anúncio **Teste toyota 2**, ID **24**, slug `teste-toyota-2`, tinha três registos em `/api/carro/buscar.php?id=24`. A ficha pública devolvia as mesmas três URLs em `/api/get_carro_detalhes.php?id=24`.

O terceiro registo é a imagem **32**, ordem **2**, caminho `/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png`. A imagem foi descarregada e inspecionada: é uma captura do iPhone com a listagem, o cartão do próprio anúncio e os controlos da página. Não foi criada pelo componente da galeria. As duas primeiras imagens, registos 27 e 28, mostram fotografias do Toyota.

## Correção preparada

- `galeria_carros.sql` marca exclusivamente o registo identificado para não aparecer e conserva a origem/motivo em `carro_imagem_revisoes`. O UPDATE exige ID, veículo e caminho exatos. Não apaga o registo nem o ficheiro. Não esconde uma imagem diferente que venha a substituir esse caminho no mesmo ID.
- A fonte revista continua excluída mesmo que um formulário legado regrave os registos com a opção de publicação reposta. A exclusão é limitada a esse veículo e caminho normalizado, sem rejeitar todas as imagens PNG ou capturas por proporção/dimensões.
- A ficha e os cartões usam a mesma fonte de fotografias publicáveis de `carro_imagens`. O endpoint dedicado `/get_carro_fotos.php` expõe apenas fotografias de anúncios públicos aprovados, sem os dados do proprietário. O endpoint de detalhes inclui a mesma origem explicitamente identificada.
- A galeria não mistura essa lista com `imagens_extra`, capas de cartões ou outros aliases antigos. Galerias vazias ou indisponíveis mostram uma indicação local; não recebem fotografias genéricas de outros carros nem capas de anúncios.
- A disposição visual segue o padrão de alojamentos e experiências: fotografia principal e fotografias secundárias, cantos arredondados, contador e botão `Ver todas as fotos`. Apenas aparecem os lugares correspondentes a imagens existentes; duas fotografias não produzem uma terceira miniatura fictícia. O botão e o modal permitem percorrer todas as fotografias, mesmo quando há mais de quatro.
- O formulário de fotografias lembra que os envios devem ser fotografias do veículo, sem capturas da interface ou cartões de anúncio. A revisão não é um classificador automático de conteúdo; novos envios continuam a exigir fotografias adequadas e revisão quando necessário.

## Validação

Testes PHP com a instrução SQL real: a captura identificada é excluída, os registos são preservados, outra imagem PNG permanece, outro veículo não é afetado, a repetição é segura e uma substituição no mesmo ID não é ocultada. Teste HTTP do novo endpoint: métodos e CORS, anúncio aprovado, isolamento por veículo e exclusão da captura revista.

Testes JavaScript: fonte autoritativa, aliases antigos, duplicados, ordem, imagens ocultas e ausência de fallback de capa. No WebKit: galeria com duas fotografias, abertura da segunda, navegação circular e `Ver todas as fotos`; casos com zero, uma e cinco imagens e falha da API; larguras de 320, 375 e 1280 px. As URLs públicas reais serviram de referência e as respostas de API foram simuladas após a alteração. A captura não entrou na galeria nem no modal.

**Nada foi alterado na produção.** A exclusão efetiva da captura depende de aplicar `sql/galeria_carros.sql` e publicar os ficheiros API e frontend do pacote conjunto.
