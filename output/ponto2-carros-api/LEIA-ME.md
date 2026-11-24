# Carros — ponto 2: caução

## Diagnóstico confirmado

O anúncio ID 24 devolveu `exige_caucao=1` e `caucao_valor=500.00` na API pública. O endpoint `carro/condicoes_guardar.php` fornecido também atualiza esses campos corretamente. O anúncio lia `valor_caucao` e usava um valor fixo de 20000 quando esse campo não vinha na resposta. O checkout também descartava os campos da caução ao construir o estado da reserva.

## Comportamento implementado

- O anúncio, o checkout, a página de pagamento e a confirmação usam `exige_caucao`, `caucao_valor`, `caucao_formas` e `caucao_condicoes`.
- O anúncio ID 24 mostra **500 CVE por carro**. Duas viaturas representam uma caução de 1000 CVE, separada do total online. Não se multiplica a caução pelos dias.
- Sem caução, o valor é zero e a interface diz que o veículo não exige caução. Dados ausentes ou inválidos não recuperam valores fictícios.
- Ao guardar no painel, relê os dados do anúncio e confirma flag, valor, formas e condições antes de apresentar sucesso. Atualiza também a lista em memória, evitando recuperar dados antigos ao trocar de veículo.
- O preço cobrado pelo Stripe e o `preco_total` da reserva incluem apenas preço diário × dias × quantidade. A caução não é acrescentada a esse valor. A comissão existente de 10% usa o aluguer como base.
- Os dados da caução são registados separadamente em `reservas_carro_condicoes.snapshot_json.caucao`. Não são somados a `reservas_carro.preco_total`.
- A retenção de stock do ponto 1 guarda as condições apresentadas antes da cobrança. Uma alteração posterior no painel não reescreve retroativamente a caução de uma reserva.
- Se a caução mudar antes de criar o pagamento, o servidor responde `CAUCAO_ALTERADA` sem cobrar; o resumo é atualizado e o cliente tem de confirmar novamente.

## Publicação

Esta alteração usa a retenção de stock do ponto 1. Se ainda não publicaste esse ponto, aplica-o primeiro.

1. Fazer cópia da base e dos endpoints atuais.
2. Executar `sql/caucao_carros.sql`, depois de `sql/stock_carros.sql`. Acrescenta `caucao_json` à tabela de retenções.
3. Publicar juntos os quatro ficheiros de `api/` deste pacote:
   - `carroCaucao.php` (novo)
   - `get_carro_detalhes.php`
   - `create-payment-intent.php`
   - `checkout_api.php`
4. Manter `carroStock.php`, `carroStripeStock.php`, a configuração Stripe privada e as dependências do ponto 1 no servidor.
5. Publicar o novo build do frontend. O pedido de criação de pagamento passa a enviar também os campos da caução apresentada ao cliente.

Não é necessário substituir `carro/condicoes_guardar.php` por causa do defeito dos 20000: o código fornecido já grava os campos corretos. Não foi alterado nesta entrega.

## Validação antes de concluir no alojamento

- ID 24: painel e anúncio devem mostrar 500 CVE por carro.
- Reabrir o painel após guardar: o valor tem de permanecer igual; trocar de anúncio não pode recuperar dados antigos.
- Selecionar duas viaturas: caução 1000 CVE fora do total; exemplo de aluguer 5000 × 2 dias × 2 carros = 20000 CVE online e comissão 2000 CVE, sem os 1000 CVE da caução.
- Desativar caução: mostrar sem caução e guardar zero.
- Alterar o valor no painel antes de criar o pagamento: atualizar o resumo e exigir nova confirmação antes de cobrar.
- Confirmar uma reserva em Stripe de teste e consultar o snapshot: caução separada e total da reserva apenas com o aluguer.

## Testes locais

`tests/caucaoCarro.test.mjs` e `tests/carroCaucao.test.php` cobrem os 500 CVE guardados, quantidades, ausência de caução, dados inválidos, exclusão dos totais/comissão e persistência do snapshot. O teste PDO usa SQLite; não substitui a validação no MySQL/Stripe de teste do alojamento. Os testes de stock do ponto 1 também foram repetidos.

Não foram feitas gravações na base de produção nem cobranças durante o desenvolvimento deste ponto.
