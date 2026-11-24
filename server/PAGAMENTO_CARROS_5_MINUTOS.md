# Pagamento de carros e bloqueio por 5 minutos

Implementado e verificado localmente. O ZIP contém um build completo do frontend em `frontend/`, os endpoints em `api/` e as migrações existentes em `sql/`. Não contém chaves secretas nem acesso à base de dados.

## Publicação

1. Fazer cópia dos ficheiros atuais e da base de dados.
2. Se ainda não foram aplicadas, executar as migrações `stock_carros.sql` e `caucao_carros.sql`. Não executar novamente alterações sem rever o estado da base.
3. Publicar juntos os ficheiros de `api/`, incluindo o novo `carroPagamento.php`. Preservar `config.php`, `stripe-config.local.php`, `vendor/` e os restantes ficheiros existentes.
4. Configurar `STRIPE_SECRET_KEY` ou `api/stripe-config.local.php` com a chave **de teste da mesma conta Stripe** da chave pública do frontend. O ficheiro `.example.php` é apenas um modelo; não substitui a configuração privada existente.
5. O SDK Stripe PHP tem de estar em `vendor/autoload.php` acima de `api/` ou em `api/vendor/autoload.php`. Ambos os caminhos são suportados para criar e validar o pagamento.
6. Publicar o conteúdo de `frontend/` na raiz do site, incluindo todas as traduções. O ficheiro de configuração do servidor para rotas SPA deve ser preservado.
7. Validar no ambiente de teste: entrar no pagamento com a última unidade; confirmar indisponibilidade noutra sessão; atualizar a página e conferir que o prazo não aumenta; testar aprovação, recusa e expiração. Não considerar concluída a integração Stripe publicada sem este teste real.

## Comportamento

- O pedido ao entrar no pagamento obtém um bloqueio por 300 segundos e um PaymentIntent. Usa transação e o mesmo bloqueio de anúncio dos restantes caminhos de stock.
- O servidor devolve `expiresAt` e `serverNow`. O contador usa esse prazo; o relógio do browser não determina se o servidor aceita o pagamento.
- Refresh e consultas periódicas reutilizam o token e o prazo existentes. Um token expirado ou libertado não cria outro bloqueio automaticamente. O utilizador tem de rever a disponibilidade para iniciar uma nova tentativa.
- O servidor valida novamente a retenção antes de confirmar o cartão. Após recusa, o browser pede a verificação da falha; só um estado de falha confirmado pelo Stripe permite cancelar e libertar imediatamente.
- Expiração sem pagamento em curso cancela o PaymentIntent antes de libertar stock. A consulta de disponibilidade também faz essa limpeza, mesmo que o utilizador tenha fechado a página.
- Pagamentos `processing`, `requires_action`, `requires_capture` e `succeeded` continuam protegidos após o prazo. Uma corrida entre cancelamento e confirmação não deve colocar o mesmo carro novamente à venda. Erros de comunicação mantêm a retenção até ser possível verificar o resultado.
- A reserva final só é gravada após `succeeded`, com validação de montante, moeda e prova da cobrança. Uma tentativa falhada não é criada como reserva confirmada em Minhas reservas.
- Erros de configuração distinguem chave ausente, SDK ausente, autenticação e mistura de ambientes. Não é possível corrigir uma chave privada ausente apenas com o frontend; consultar o código do erro e os logs PHP no servidor.

## Verificação realizada

- Testes PHP de ciclo completo de retenção com SQLite e Stripe simulado: entrada, última unidade, refresh, expiração, libertação persistida mesmo em resposta de erro, recusa, estados em curso, corrida de confirmação e falha de rede.
- Testes existentes de stock, consultas PDO e prova de pagamento aprovados.
- Testes JavaScript do prazo com relógios diferentes e testes dos sete idiomas aprovados.
- Teste de navegador do build local: bloqueio pedido antes de clicar Pagar, texto traduzido, refresh de 05:00 para 02:00 sem novo token, recusa e botão desativado na expiração. Chamadas externas simuladas.
- Lint dos ficheiros React alterados e build de produção aprovados.

Os testes SQLite não substituem um teste concorrente de MySQL. Nenhuma reserva nem cobrança de produção foi criada na validação local.
