# Carros — ponto 1: disponibilidade e proteção de stock

Implementação local. Publicar e validar em teste antes de considerar o ponto concluído no alojamento.
Não inclui as correções de caução, condições, formulários, galeria ou restantes textos.

## Publicação

1. Fazer cópia dos endpoints atuais e da base de dados.
2. Executar `sql/stock_carros.sql` na mesma base usada pela API. Acrescenta `reservas_carro.quantidade` e cria `carro_stock_retencoes`; não apaga registos.
3. Rever as reservas antigas de várias viaturas: a estrutura anterior não guardava a quantidade. A migração assume um carro por registo antigo; quantidades históricas diferentes precisam de confirmação nos registos existentes, sem inferir pelo preço.
4. No servidor, copiar `api/stripe-config.local.example.php` como `api/stripe-config.local.php` e configurar `secret_key`, ou definir `STRIPE_SECRET_KEY` no ambiente. Usar a chave do mesmo ambiente Stripe do frontend. Não publicar o ficheiro privado no repositório.
5. Publicar, juntos, estes ficheiros de `api/`:
   - `carroStock.php`
   - `carroStripeStock.php`
   - `get_carro_detalhes.php`
   - `verificar_disponibilidade_carro.php`
   - `create-payment-intent.php`
   - `checkout_api.php`
6. Publicar também o novo build do frontend. Não misturar o frontend antigo de pagamentos com estes endpoints: os pedidos de carro passam a exigir quantidade e retenção de stock.

Requer as tabelas existentes `carros`, `veiculos_unidades` e `reservas_carro`, o esquema da migração e o SDK Stripe em `server/vendor/autoload.php` (no alojamento, normalmente `vendor/autoload.php` relativamente à pasta acima de `api`).

## Regras

- Sem unidades, em manutenção ou indisponíveis: zero stock; nunca usar o valor fictício 1 ou 5.
- Estados automáticos reservada/entregue são cruzados com a reserva atribuída. Não bloquear todas as datas futuras só por existir uma reserva noutra data. Um estado automático sem reserva correspondente não liberta stock por suposição.
- Uma matrícula atribuída tem de estar livre durante todo o período pedido. Reservas ainda sem matrícula atribuída descontam a quantidade guardada e o pico de simultaneidade. Esta leitura é conservadora para reservas antigas sem atribuição; não inventa uma matrícula livre quando os dados não a garantem.
- Reservas pendentes e confirmadas ocupam stock. Canceladas e concluídas não ocupam stock futuro. Não existe expiração automática de reservas pendentes antigas porque a estrutura fornecida não tem um prazo para essas reservas.
- Intervalos usam `[levantamento, devolução)`: uma devolução no dia 12 não bloqueia um levantamento no dia 12. As datas são diárias; horários de condições não são alterados neste ponto.
- O frontend atualiza o stock ao mudar datas, recuperar foco e a cada 30 segundos. Durante erros ou verificação, impede avançar.
- Antes de criar um PaymentIntent de carro, o servidor bloqueia o anúncio e as unidades na transação e regista uma retenção de quantidade. Pedidos seguintes descontam essa retenção.
- Ao gravar, o servidor exige a retenção do mesmo PaymentIntent, anúncio, período e quantidade, e volta a confirmar o stock. Reserva e consumo da retenção são gravados na mesma transação. Repetições do mesmo pagamento continuam a usar a idempotência existente.
- Retenções duram 15 minutos. Só são libertadas após confirmar que o intent foi cancelado sem pagamento. Intents pagos, em processamento ou autorizados continuam a bloquear stock até a reserva ser gravada ou haver resolução administrativa. Uma falha de comunicação com Stripe não liberta stock.
- Se o anfitrião retirar unidades de serviço durante um pagamento já em curso, a validação final pode recusar a gravação. O pagamento e a retenção são preservados para resolução; não há reembolso automático nesta alteração. Validar esse cenário com os procedimentos de suporte do negócio.

## Verificação no alojamento de teste

1. ID 24, única unidade em manutenção: disponibilidade 0, Reservar inativo, pedido direto sem stock recusado antes de criar o intent.
2. Voltar a disponível: selecionar datas e confirmar 1 carro disponível.
3. Duas sessões tentam a última unidade: só uma obtém retenção; a outra recebe HTTP 409 antes de cobrar.
4. Uma frota com duas unidades e reserva sobreposta de duas viaturas: stock 0. Uma reserva de uma viatura: stock 1.
5. Reservas consecutivas sem matrícula atribuída descontam o máximo simultâneo, sem somar indevidamente os períodos consecutivos.
6. Reserva cancelada liberta stock; manutenção/indisponibilidade retira a unidade.
7. Repetir a gravação do mesmo pagamento: devolve a reserva existente, sem duplicação.
8. Retenção expirada e intent não pago: cancelar no Stripe e libertar stock. Intent pago/processing: manter bloqueado.

## Testes locais

- `tests/carroStock.test.php`: cálculo de unidades, estados, sobreposições, quantidades, limites e datas inválidas.
- `tests/carroStockDb.test.php`: consultas PDO e conversão de retenção em reserva, com SQLite e Stripe simulado. O adaptador remove apenas `FOR UPDATE`; **não é um teste de concorrência real de MySQL nem de pagamentos reais**.
- `tests/checkoutStripe.test.php`: preserva a validação de cobrança concluída, montante, moeda e prova do pagamento.
- `tests/disponibilidadeCarro.test.mjs`, `tests/pedidoStockCarro.test.mjs`, `tests/publicacaoCarro.test.mjs`: rejeição de erros/incompletos, datas locais, repetição do pedido e aprovação.

Não foram criadas reservas, alterados estados de unidades ou cobrados pagamentos na produção durante o desenvolvimento.
