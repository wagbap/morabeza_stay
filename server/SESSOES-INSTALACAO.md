# Instalação da nova gestão de sessões

## Várias configurações, incluindo a mesma duração

Foi removida a regra que limitava a experiência a uma configuração por duração. Não há limite de quantidade de configurações definido na aplicação. Ao guardar ou ativar uma configuração, apenas os horários dessa configuração são gerados ou atualizados; um conflito legado noutra configuração não impede guardar novos horários independentes. As outras configurações não são desativadas.

Atualize os PHP de `configuracoes-livres-backend.zip` em `/api/` e publique `frontend-sessoes.zip`. Não há novo SQL nesta correção; mantenha as migrações 007 e 008 já instaladas. Os conflitos que pertencem aos próprios horários propostos continuam a ser identificados para resolução, preservando sessões e reservas.

O frontend mantém os detalhes estruturados do conflito mesmo que o alojamento responda HTTP 200 com `success: false`, para apresentar as ações de ligação em vez de repetir apenas a mensagem de erro.

## Correção da ligação às sessões anteriores

Nesta atualização, publique `agendaExperienciasLogica.php`, `agenda_experiencias.php` e `agendaPublica.php` em `/api/`, seguidos do frontend compilado. Não há migração SQL adicional se 007 e 008 já foram instaladas.

Ao guardar, a API identifica sessões antigas que ocupem os mesmos horários e responde com HTTP 409 e uma lista estruturada. Na janela, «Ligar sessões e guardar» reutiliza os IDs existentes após confirmação explícita. Sessões com reservas mantêm horário, preço, capacidade e retenções; sessões sem reservas podem receber os dados escolhidos. Nenhuma sessão é eliminada. Guardar novamente a configuração reutiliza a ligação e não cria duplicados.

Se a sessão antiga tem reservas por participante, não pode ser reinterpretada como stock de motas. Ajuste o modelo para participante, o horário original e preparação zero para a ligar. Selecione «Por equipamento e duração» para configurações de aluguer por mota sem reservas legadas incompatíveis. O editor mostra esse seletor diretamente.

O erro aparece apenas na janela. Enquanto houver conflito, «Aplicar alterações» é substituído pelas ações de resolução. A página pode continuar a carregar os dados existentes enquanto a ligação estiver pendente.

## Atualização: cartões por duração, editor e manutenção

Para esta versão, execute também `database/008_configuracoes_duracao.sql`, depois da migração 007. A migração 008 cria a tabela de opções do editor e remove apenas o índice único antigo `uk_sessao`; não elimina sessões nem reservas. Isso permite configurações de durações diferentes com o mesmo início. A ligação da agenda continua a impedir duplicados dentro da mesma configuração/data/hora.

Depois do SQL, substitua estes PHP na pasta `/api/`:

1. `agendaExperienciasLogica.php`
2. `agenda_experiencias.php`

Publique por último o frontend completo atualizado. As restantes APIs do pacote anterior continuam necessárias; o ZIP do backend inclui o conjunto completo para instalações novas.

As opções de abertura, fecho, intervalo entre inícios, preparação e método de agendamento ficam guardadas na BD. A duração e o intervalo são independentes. As unidades reservadas continuam ocupadas durante a preparação, incluindo quando a próxima reserva usa outra duração. O editor permite selecionar individualmente os horários oferecidos; não cria os preços ilustrativos das imagens automaticamente.

O modal de equipamentos usa o stock real. «Verificar impacto» simula a alteração dentro de uma transação revertida, mostra as saídas afetadas e só grava após «Confirmar bloqueio». Os bloqueios existentes podem ser editados e removidos; o motivo e a nota interna são guardados no JSON do recurso. Não cancelam reservas confirmadas. Cada jet ski mantém o limite existente de duas pessoas.

Podem ser criadas várias configurações com a mesma duração, sem limite de quantidade de configurações definido na aplicação. Se já houver reservas ou retenções, alterar a duração, a preparação, a unidade de venda ou os recursos exige uma nova configuração, para não reinterpretar as reservas existentes. As datas que já têm reservas preservam os campos da sessão, como na versão anterior.

Validação adicional: intervalos de cinco minutos, oito de doze horários selecionados, durações diferentes ao mesmo início, stock durante a preparação e simulação de impacto sem alterações persistidas. Os testes de estados foram executados em PHP 8.3 WASM/SQLite; a migração e os bloqueios MySQL devem ser conferidos no alojamento.

Destino dos PHP: a pasta `/api/` usada pela aplicação. Crie os ficheiros novos e substitua os existentes pelos ficheiros deste pacote. Faça a instalação numa janela de manutenção, com o frontend publicado por último.

## 1. Base de dados — executar primeiro

Execute `database/007_agenda_experiencias.sql` no phpMyAdmin da base usada por `config.php`. Cria seis tabelas para agenda, configurações, ligação às sessões, exceções, recursos e histórico. Não apaga as reservas ou sessões anteriores.

Mantém as tabelas existentes `experiencias`, `experiencia_sessoes`, `reservas_temporarias` e `reservas_experiencia`. Estas devem ter os campos do backend fornecido, incluindo `reservas_pendentes`, `reserva_id` nas retenções e `quantidade_jet_skis` nas reservas de experiência. Não execute scripts de demonstração de repasses para esta instalação.

## 2. Criar os auxiliares

1. `api/agendaExperienciasLogica.php` — recorrência, geração das saídas e stock partilhado.
2. `api/agendaPublica.php` — disponibilidade pública, antecedência e crédito da própria retenção.
3. `api/retencaoExperiencia.php` — substituir se já existir: retenção de 300 segundos, renovação e confirmação após pagamento.
4. `api/retencaoBootstrap.php` — substituir se já existir: ligação à BD, JSON e CORS.

## 3. Criar as novas APIs

5. `api/agenda_experiencias.php` — gestão autenticada da agenda, configurações, exceções, recursos, manutenção e histórico.
6. `api/agenda_disponibilidade.php` — disponibilidade real por data; aceita GET público ou POST com o token da própria retenção.
7. `api/validar_retencao.php` — valida a retenção antes de iniciar o pagamento.

## 4. Substituir as APIs existentes

8. `api/sessoes_experiencia.php` — gestão das sessões anteriores; passa a exigir autenticação do proprietário e a contar retenções.
9. `api/get_sessoes_experiencia.php` — compatibilidade com a nova disponibilidade.
10. `api/experiencia_pagina_completa.php` — detalhes públicos com a disponibilidade e antecedência da agenda.
11. `api/reservar_temporariamente.php` — cria ou renova a retenção sem descontar a própria reserva duas vezes.
12. `api/liberar_retensao.php` — liberta uma retenção de forma idempotente.
13. `api/confirmar_retensao.php` — só confirma uma retenção associada a uma reserva paga e correspondente.
14. `api/checkout_api.php` — guarda a quantidade de jet skis e confirma as vagas na mesma transação da reserva paga.

**No `checkout_api.php`, preserve a sua chave secreta Stripe em `CHECKOUT_STRIPE_SECRET_KEY`. O ficheiro do pacote tem esse valor vazio.** Mantenha o SDK Stripe existente em `server/vendor/` (um nível acima de `/api/`).

## 5. Dependências já existentes — conferir

- `api/config.php`: manter a ligação real da sua base; não está no ZIP.
- `api/reserva-validacao.php` e `api/reserva-jwt.php`: incluídos como dependências da autenticação do anfitrião; publicar se faltarem ou forem versões antigas.
- `api/auth-secrets.local.php`: manter a configuração privada existente. `jwt_secret` deve ser o mesmo usado para assinar o JWT emitido no login; não inventar outra chave. Não está no ZIP.
- `api/send_email.php` e dependências de email: manter os ficheiros existentes usados pelo checkout.

## 6. Publicar o frontend

Extraia o conteúdo de `frontend-sessoes.zip` na raiz pública do site: `index.html` e a pasta `assets/` pertencem à mesma compilação. Publique ambos juntos. A configuração da API continua a ser a usada no build do projeto.

A nova página abre em `/gest/experiencia/ID/sessoes`. As sessões antigas continuam acessíveis em `/gest/experiencia/ID/sessoes/anterior`.

## 7. Configurar e conferir

1. Guarde os dias da agenda, o período e a antecedência.
2. Para jet skis, crie o recurso de equipamento com o stock total e associe-o às configurações vendidas por unidade. Cada jet ski admite até dois participantes no checkout.
3. Crie as durações, preços e horas de início. O fim é calculado; são permitidos intervalos de qualquer minuto, incluindo cinco minutos.
4. Consulte a tabela por data: livres = saldo da saída limitado pelo stock partilhado disponível, descontando reservas, retenções e manutenção sobrepostas. Horários adjacentes não consomem stock simultaneamente.
5. Confirme uma reserva de teste paga e volte à tabela. Deve mover a quantidade de «Em pagamento» para «Reservadas» uma única vez. Abandonar o checkout não confirma vagas; a retenção dura cinco minutos.

Alterar ou pausar a agenda preserva as reservas confirmadas. Uma configuração com reservas não permite mudar a unidade de venda ou os recursos: crie outra configuração. Um horário legado com o mesmo início é identificado na janela de conflitos e só é ligado mediante confirmação explícita, mantendo a sua identidade.

## Validação realizada

Build Vite concluído. Testes locais cobrem recorrência, exceções, preservação de preços reservados, intervalos, manutenção, stock partilhado, crédito da própria retenção, expiração, renovação, confirmação paga idempotente e validação Stripe. PHP executado em PHP 8.3 WASM com SQLite; os bloqueios MySQL de produção permanecem no código. Renderização dos componentes e do modal verificada com dados de teste.

Não foi feita publicação no alojamento, execução no MySQL remoto, cobrança real ou comparação visual em navegador. Estes passos precisam de validação após instalar.
