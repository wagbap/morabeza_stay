# Repasses por reserva

Esta versão substitui os totais agregados do antigo `admin/repasses.php` por um painel por reserva. Não faz transferências bancárias nem publica alterações automaticamente.

## Publicação

1. Fazer uma cópia de segurança da base de dados e do PHP atual.
2. Executar `003_repasses_por_reserva.sql` na base de dados usada pela API. Cria três tabelas; não altera reservas nem pagamentos antigos.
3. Publicar juntos `server/api/admin/repasses.php` e `server/api/admin/repassesLogica.php` em `/api/admin/`.
4. Publicar também `server/api/usuarios/upload_documento.php` em `/api/usuarios/`. Corrige a geração do URL do comprovativo sem transformar `https://` em `https:///`.
5. Manter `/api/config.php`, `/api/auth_admin.php`, `/api/reserva-validacao.php` e a autenticação administrativa existentes. A API obtém a identidade do token; não aceita `admin_id` enviado pelo browser como autenticação.
6. Publicar o conteúdo do novo `dist/` no alojamento do frontend. O frontend e o PHP novos usam a ação `painel`; devem ser publicados na mesma atualização.

## Regras aplicadas

- Todas as reservas reais das três verticais são consultadas. Bloqueios são excluídos.
- Bruto, comissão de 10% e líquido são calculados em cêntimos. Não há taxa adicional ao cliente nem valores fictícios da referência visual.
- Reserva confirmada e paga, ainda em curso: **A aguardar conclusão**.
- Reserva terminada, paga e sem validação: **Por verificar**. E obrigatorio validar o QR da reserva na pagina Validar reservas.
- Disponibilidade exige estado de reserva aceite, pagamento confirmado, data final passada e QR Code validado em reserva_validacoes.
- O botão de registo exige também IBAN confirmado. O valor é o líquido integral da reserva; esta versão não suporta repasses parciais.
- Registar exige data real da transferência (não futura), referência e URL do comprovativo no servidor de uploads. O administrador deve transferir no banco antes de registar.
- Transação, bloqueios e chave única por `(tipo, reserva_id)` impedem dois pagamentos da mesma reserva. O servidor volta a verificar elegibilidade, IBAN e valor.
- Histórico mantém os pagamentos antigos e distingue pagos, pendentes e cancelados.

## Dados antigos

Repasses pagos sem ligação em `repasse_itens` são identificados como pagamentos antigos por reconciliar. Novos pagamentos desse prestador ficam retidos para não pagar duas vezes o mesmo valor.

Não se deve distribuir automaticamente um repasse antigo por reservas: é necessário confirmar quais reservas abrangia. A associação deve respeitar os valores efetivamente pagos. Cancelar registos apenas se forem testes confirmados ou se o cancelamento for uma correção legítima do registo. Não altera uma transferência já feita no banco.

## Períodos e prazos

- O filtro de mês nas reservas considera o intervalo do serviço; inclui serviços que atravessam o mês. No histórico, considera a data da transferência (ou data de registo nos dados antigos).
- O prazo é de três dias de segunda a sexta a partir da data final ou da validacao QR posterior. Feriados não estão configurados.
- Para não assumir uma hora de conclusão inexistente, o serviço só passa a terminado depois do dia final. Ainda exige QR Code validado.
- Não foi ativado um serviço de lembretes automáticos; a faixa de pendências mostra os atrasos reais ao consultar o painel.

## Validação

Build Vite, análise de sintaxe PHP e testes PHP 8.3/WASM de elegibilidade, QR obrigatorio, centimos e prazos. Testada a consulta real das três verticais com SQLite e autenticação simulada, incluindo a ausência de criação automática de repasses ao consultar o painel.

A validação em MariaDB com duas sessões concorrentes, o upload real, a autenticação administrativa publicada e a comparação visual no navegador devem ser feitos no ambiente de homologação antes da publicação. Não havia navegador ligado na sessão de desenvolvimento.

### Teste manual em homologação

1. Criar uma reserva paga com serviço futuro: deve ficar a aguardar, sem criar linhas em `repasses`.
2. Usar uma reserva de teste terminada sem QR: deve aparecer por verificar.
3. Validar o QR: fica disponivel se o servico terminou e nao existir legado por reconciliar; sem IBAN o botao continua desativado.
4. Registar o líquido com data, referência e comprovativo de teste: surge no histórico como pago.
5. Repetir o mesmo pedido e testar em duas sessões: não pode criar um segundo pagamento da mesma reserva.


## Regra obrigatoria de QR (atualizacao)

O QR Code deve estar validado em `reserva_validacoes`, com a categoria e o ID corretos, antes de qualquer novo repasse. Confirmacoes administrativas antigas nao substituem o QR e nao autorizam pagamento. A acao `confirmar_conclusao` e rejeitada; Verificar abre `/admin/validar-reservas`. Mantem-se pagamento confirmado, fim do servico, IBAN e controlo de duplicacao. Publicar PHP e frontend atualizados juntos. Nao e necessario novo SQL nem repetir o seed.


## Pagina independente de registo

O botao Registar repasse abre agora `/admin/repasses/:tipo/:id/registar`, no componente `src/components/admin/RegistarRepasse.jsx`. O registo deixou de usar o modal da lista. A pagina carrega a reserva novamente pela API e funciona ao atualizar o browser ou abrir o URL diretamente.

O resumo inclui banco e pais dos dados de recebimento confirmados. O IBAN inicia mascarado; Consultar dados autorizados revela os dados apenas dentro da pagina administrativa autenticada.

Data, referencia, comprovativo e confirmacao expressa de transferencia bancaria concluida sao obrigatorios. O frontend envia `transferencia_confirmada: true`, e a API rejeita pedidos sem essa confirmacao. O QR obrigatorio, o fim do servico e os restantes bloqueios continuam ativos.

O upload permite PDF, JPG e PNG ate 10 MB. O valor liquido e a reserva nao sao editaveis. O comprovativo ja enviado e reutilizado se for necessario corrigir outro campo e tentar novamente.

Publicar o PHP e o frontend novos juntos. Nao e necessario SQL adicional. O teste de renderizacao confirmou as quatro secoes, o IBAN mascarado, os campos bloqueados e a ausencia de dialog no componente de registo. A API foi testada a rejeitar pedidos sem confirmacao da transferencia, usando SQLite com autenticacao simulada; e necessaria verificacao final em homologacao/MariaDB.
