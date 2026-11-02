# Cadastro → sessões → reserva do cliente

## Instalar por esta ordem

1. Guarde os PHP publicados antes de substituir. Esta versão pressupõe as migrações 007, 008 e 009. Se já estão instaladas, **não existe SQL novo a executar nesta atualização**. O mínimo utiliza `experiencias.min_pessoas`, que já faz parte da estrutura e dos PHP fornecidos; por configuração é guardado no JSON de opções da migração 008.
2. Publique os ficheiros de `backend-alinhamento-experiencias.zip`, mantendo as pastas `/api/` e `/api/experiencia/`. O ZIP não inclui nem substitui `config.php`, os segredos de autenticação ou o bootstrap já instalado das retenções.
3. Ao atualizar `checkout_api.php`, conserve a configuração Stripe já existente no alojamento. O modelo local tem `CHECKOUT_STRIPE_SECRET_KEY` vazio; não substitua a chave publicada por esse valor vazio. Não é necessário enviar essa chave por chat.
4. Publique o conteúdo de `frontend-alinhamento-experiencias.zip` na raiz do site. Inclui a fonte Inter e os restantes assets locais. No projeto fonte a dependência já foi instalada; noutro checkout use `npm install --legacy-peer-deps` para respeitar a combinação existente de React/Recharts.

## PHP da atualização

Em `/api/experiencia/`:

- `modeloRegisto.php`: dois modelos para novos anúncios; valida mínimo entre 1 e máximo; reutiliza o equipamento e o stock.
- `registoComum.php`, `registrar.php`, `atualizar.php`: guardam a capacidade, mínimo, modelo, equipamento e dias.
- `buscar.php`: devolve esses valores na edição, mantendo endereço como objeto e imagem principal. A consulta de edição usa `edicao=1` e a conta proprietária.

Em `/api/`:

- `agendaExperienciasLogica.php`: cálculo partilhado de disponibilidade.
- `agenda_experiencias.php`: carrega capacidade, mínimo e preço do cadastro; valida o modelo e o equipamento associados.
- `agendaPublica.php`: disponibiliza mínimo por sessão, duração, período pelo início e vagas efetivas.
- `agenda_disponibilidade.php`: endpoint de consulta usado no checkout.
- `get_dias_com_sessoes.php`: calendário com datas configuradas e disponíveis no mês, respeitando pausas e exceções.
- `experiencia_pagina_completa.php`: dados públicos e modelo guardado.
- `retencaoExperiencia.php`: cotação calculada no servidor, quantidade exata, stock, capacidade por equipamento e confirmação do preço pago.
- `validar_retencao.php`: verifica prazo, preço e disponibilidade antes de pagar, creditando a própria retenção.
- `checkout_api.php`: exige uma retenção para uma nova reserva de experiência e conserva a confirmação transacional existente.

Os endpoints de criar/libertar/confirmar retenção continuam a utilizar o helper partilhado. Conserve os ficheiros já instalados: `retencaoBootstrap.php`, `reservar_temporariamente.php`, `liberar_retensao.php`, `confirmar_retensao.php` e `reserva-validacao.php`.

## Regras implementadas

Por participante, o primeiro passo tem título, descrições e preço; capacidade e mínimo estão em Disponibilidade. O mínimo representa o total de todas as reservas da sessão. Um mínimo de 3 permite uma compra de apenas 1 lugar. Não foram criados prazos, cancelamentos nem reembolsos automáticos por falta de participantes.

A configuração começa com os preços, capacidade e mínimo do cadastro. Duração, horários, intervalo entre inícios e preparação continuam independentes. O modelo dos novos anúncios é herdado do cadastro. Os grupos privados antigos permanecem compatíveis com reservas históricas; ao voltar a editar o cadastro, é necessário escolher explicitamente um dos dois modelos atuais.

Por equipamento, o nome é preenchido quando a categoria o identifica e pode ser editado. As durações reutilizam o mesmo recurso. Reservas, retenções e manutenção sobrepostas descontam esse stock, incluindo preparação.

O cliente vê durações e sessões com vagas na data escolhida. Uma duração é informativa; várias são selecionáveis. Inicialmente são mostrados até 8 horários, com expansão. O período corresponde ao início; 08:00–16:00 é uma saída de manhã e mantém o intervalo completo. O filtro é omitido quando existe só um período útil.

O cartão segue a referência visual: fonte Inter local, ícones Lucide, cartões com preços por duração, contador de horários, contadores de equipamentos/pessoas e resumo com duração e unidades. Os números da referência são apenas dados de demonstração nos testes; no produto vêm das sessões guardadas.

O cálculo por participante multiplica lugares pelo preço da sessão. Por equipamento multiplica unidades, sem multiplicar pelas pessoas. O servidor volta a conferir a cotação e a disponibilidade no checkout e antes do pagamento. A confirmação verifica o preço pago contra o preço retido. Reservas confirmadas mantêm os seus registos de preço e horário.

## Verificado localmente

- Build de produção e lint dos novos helpers e do cartão de reserva.
- PHP 8.3 em WASM com fixtures SQLite: registo/edição, mínimo, propriedade, stock partilhado, manutenção, calendário, retenções e confirmação idempotente.
- Mínimo 3 com reserva de 1 lugar; reservas sucessivas de 1, 1 e 3 deixam 5 das 10 vagas.
- Cobrança por unidade independente das pessoas, rejeição de totais alterados e preço confirmado preservado.
- Navegador: fonte carregada, quatro cartões de duração/preço, estado sem avaliações, 8/16 horários, atualização de preço/resumo, controlos e largura mobile.

Não houve publicação nem execução na BD MySQL do alojamento. Após publicar, valide um registo/edição e uma reserva de cada modelo no ambiente do alojamento.
