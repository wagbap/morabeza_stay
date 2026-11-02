# Verificação administrativa dos repasses

1. Execute `005_verificacao_repasses.sql` na base de dados do projeto (cria apenas o hist?rico; não altera reservas).
2. Publique `api/admin/repasses.php` e `api/admin/repassesLogica.php` em conjunto com o frontend atualizado.
3. Em Repasses, clique em Verificar numa reserva por verificar ou retida.

A confirma??o exige pagamento, QR validado e fim do serviço. A decisão não substitui QR, não altera a reserva e não executa transfer?ncias. Uma retenção permanece bloqueada até nova análise: a data de revisão não a liberta automaticamente. O hist?rico guarda administrador, motivo, mensagem, evidência e data de revisão. A mensagem ? enviada atrav?s da tabela notificacoes, na mesma transa??o da decisão. Não ? enviado e-mail por este endpoint; não existe agendador autom?tico de lembretes nesta entrega.

As migra??es anteriores (003) continuam necessárias. A migration 005 ? obrigatéria antes de publicar a nova API, incluindo para carregar o painel. A evidência usa o endpoint de upload j? existente.

## Detalhes do repasse

A lista abre agora uma pagina independente em /admin/repasses/:tipo/:id. Atualize tambem a API repasses.php para incluir o cliente e o nome do validador. Nao exige nova migracao alem das existentes (003 e 005). O link Ver reserva completa abre os detalhes na area administrativa por tipo e ID. Os horarios de confirmacao so aparecem quando existem; a conclusao pela data prevista e identificada como calculada.
