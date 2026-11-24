# Calendários de carros por unidade — ponto 2

Implementado localmente. O pacote `calendarios-carros-pontos1-2.zip` inclui o frontend completo, os endpoints dos pontos 1 e 2 e as migrações. Não contém configurações privadas nem chaves secretas.

## Publicar

1. Fazer cópia dos ficheiros e da base de dados.
2. **Antes de atualizar os endpoints**, executar `sql/calendario_carros.sql`. Cria a tabela de bloqueios manuais por unidade e dia, sem apagar reservas ou alterar estados de unidades. Se o ponto 1 ainda não estiver instalado, rever e aplicar também as migrações existentes `stock_carros.sql` e `caucao_carros.sql`.
3. Publicar todos os ficheiros de `api/` do pacote juntos. Os novos endpoints precisam de `carroCalendario.php`; o cálculo de stock passa a consultar os bloqueios manuais. Não misturar estes endpoints com uma versão anterior de `carroStock.php`.
4. Preservar `config.php`, `auth-secrets.local.php`, `stripe-config.local.php`, `vendor/` e as restantes configurações existentes. A gestão usa o token autenticado do anfitrião e confirma `carros.usuario_id`; não aceita um proprietário indicado pelo cliente como autorização.
5. Publicar todo o conteúdo de `frontend/` na raiz do site, incluindo as novas traduções. Preservar as regras de rotas SPA do servidor.
6. Validar numa conta de teste: abrir `/gest/calendario`, selecionar Carros, anúncio e matrícula; bloquear um período com motivo; verificar a indisponibilidade no calendário público; desbloquear e confirmar o regresso da disponibilidade. Testar também com uma unidade e com duas unidades, manutenção e reservas existentes.

O pacote é cumulativo com o ponto 1 de pagamentos: deve ser usado em vez do ZIP anterior para que o pagamento também respeite os novos bloqueios.

## Comportamento

- A gestão mantém o calendário mensal e permite escolher o anúncio e uma unidade por matrícula. É possível selecionar dias individuais ou um intervalo, incluindo mais de um mês, até 366 dias por operação. A data final do bloqueio manual é incluída.
- Guardar exige motivo entre 3 e 200 caracteres. O motivo é visível no dia e na seleção dos bloqueios existentes. Os pedidos são atómicos: se houver conflito, todo o pedido é recusado.
- Bloqueios de uma unidade não tornam as outras unidades indisponíveis. Desbloquear elimina apenas bloqueios manuais; nunca apaga reservas nem retira manutenção.
- Manutenção aparece no calendário do anfitrião com o motivo do estado. Para terminar manutenção, é necessário alterar o estado na gestão das unidades; o botão de desbloqueio manual não o faz.
- Reservas atribuídas à unidade não podem ser sobrescritas por bloqueios. O servidor também protege a capacidade de reservas sem matrícula e pagamentos em curso, incluindo a necessidade de uma mesma unidade livre durante o período completo.
- O calendário público recebe apenas permissões de levantamento/devolução, sem matrículas, motivos ou dados de clientes. Dias indisponíveis ficam riscados e não podem ser escolhidos.
- Após escolher levantamento, cada possível devolução é validada para o intervalo inteiro. Um carro livre na primeira metade e outro na segunda não constituem uma unidade livre para todo o aluguer. Períodos válidos continuam selecionáveis.
- O stock da reserva e do pagamento usa a mesma regra. A informação do calendário é atualizada ao mudar mês, levantamento ou quantidade, ao recuperar foco e periodicamente. A verificação final do servidor continua obrigatória.
- Mantém-se o contrato diário `[levantamento, devolução)`: devolver no início de um dia bloqueado não ocupa esse dia. Horários intradiários não foram reinterpretados nesta alteração.
- O calendário de alojamentos e a agenda de experiências conservam os fluxos existentes.

## Verificação local

- Testes PHP com SQLite: bloqueio e motivo, duas unidades, continuidade, manutenção, autorização por proprietário, conflitos com reservas, rollback e desbloqueio sem apagar reservas. Testes de pagamento e stock anteriores também passaram.
- Testes JavaScript: datas indisponíveis, devolução sem continuidade, períodos livres, dados em falta e carregamento.
- Navegador com APIs simuladas: bloquear/desbloquear período por matrícula, manutenção visível, datas livres selecionáveis, devolução inválida desativada, todas as unidades em manutenção impedindo seleção. Verificado também o layout do anfitrião em telemóvel.
- Build de produção, lint dos componentes alterados e verificação de whitespace aprovados.

Os testes locais não publicam ficheiros nem modificam reservas reais. Validar a migração e a concorrência MySQL no servidor de teste antes de considerar o ponto concluído na plataforma publicada.
