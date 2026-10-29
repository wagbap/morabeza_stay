# Correcao do pagamento no checkout existente

Publicar `checkout_api.php` atualizado em `/api` e o frontend atualizado.
Manter o `create-payment-intent.php` antigo e o Composer Stripe em `/vendor/autoload.php`.
A chave deve ser colocada em `CHECKOUT_STRIPE_SECRET_KEY`, no inicio do proprio
`checkout_api.php`, usando a mesma conta/modo do intent antigo. O campo fica vazio no projeto.
Nao sao necessarios outro endpoint ou uma tabela SQL nova.

O frontend envia o ID e o client_secret do PaymentIntent concluido, sem os registar em logs.
O checkout consulta o Stripe no servidor e verifica succeeded, valor em EUR, valor recebido e
ausencia de reembolso. Depois grava a reserva, quartos e participantes na mesma transacao.
Nos tres tipos, a reserva paga nasce com status confirmada e pagamento_status pago.
Sem referencia Stripe ou sem cobranca concluida, rejeita o pedido antes de criar a reserva.
Este fluxo cria apenas reservas confirmadas/pagas; nao cria reservas pendentes.

O ID da cobranca usa a coluna idempotency_key que o checkout ja tinha. Pedidos repetidos
sao serializados por GET_LOCK para evitar criar reservas duplicadas ou reutilizar a cobranca
noutra categoria. A resposta devolve os estados reais da reserva, incluindo em repeticoes.
O email e o PDF leem esses estados; o QR continua a verificar datas e uso anterior.
Reservas antigas nao sao alteradas por esta correcao.

Validacao local: `php tests/checkoutStripe.test.php` verifica os criterios da prova Stripe;
`php tests/emailReserva.test.php` verifica os tres documentos; ESLint e build verificam o frontend.
A verificacao MySQL/Stripe em producao nao foi executada localmente. Testar com a conta de teste
antes de utilizar cobrancas reais. O preco enviado pelo cliente continua a seguir a logica
original do checkout; esta alteracao nao implementa recalculo de tarifas no servidor.
