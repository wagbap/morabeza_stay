# Simular o painel da referência

## Ordem

1. Usar uma base de testes com a estrutura do projeto.
2. Executar `003_repasses_por_reserva.sql`, caso ainda não esteja instalada.
3. Importar `004_seed_repasses_referencia.sql` no phpMyAdmin. O script seleciona a base `u303262922_morabeza_stay`; ajustar esse nome se usar uma cópia com outro nome.
4. Abrir `/admin/repasses` com a conta administrativa habitual e clicar em Atualizar.
5. Pesquisar `MS-EXEMPLO` para ver apenas as linhas da simulação. Se uma reserva atravessar meses, selecionar Todos os períodos.

O seed não precisa de alterar nenhuma reserva real. Cria seis contas desativadas com emails `@example.invalid`, quatro anúncios pendentes e seis reservas. Os IBANs começam por `TESTE-NAO-TRANSFERIR`: são textos fictícios, sem conta bancária associada. Não efetuar transferências para estes dados.

## Cenários

| Código | Prestador | Bruto | Líquido | Estado inicial |
|---|---|---:|---:|---|
| MS-EXEMPLO-001 | Ana Lopes | 10.000 | 9.000 | A aguardar conclusão, check-in validado |
| MS-EXEMPLO-002 | Santiago Rent | 10.000 | 9.000 | Disponível, entrega validada, em atraso |
| MS-EXEMPLO-003 | Mar Azul | 5.000 | 4.500 | Disponível, presença validada, prazo no dia útil atual |
| MS-EXEMPLO-004 | Carlos Silva | 3.000 | 2.700 | Por verificar, sem validação |
| MS-EXEMPLO-005 | Ana Lopes | 10.000 | 9.000 | Pago de simulação no histórico |
| MS-EXEMPLO-006 | Santiago Rent | 10.000 | 9.000 | Pago de simulação no histórico |

Os exemplos pagos são ligados às reservas por `repasse_itens`. Não são pagamentos bancários e não provocam retenção por legado sem correspondência. Não é fabricado nenhum comprovativo: aparecem como sem comprovativo.

Só com estes exemplos, os cartões ficam em 9.000 / 13.500 / 2.700 / 18.000 CVE. Dados reais existentes e filtros de período podem alterar os totais; pesquisar filtra as linhas, não os cartões. Os dias de exemplo são calculados a partir de `CURDATE()`. Ao fim de semana, o prazo do terceiro exemplo é a sexta-feira anterior, pois não existe vencimento em sábado/domingo nesta regra.

## Testar ações

- A primeira reserva não permite repasse enquanto o serviço estiver em curso.
- A segunda e a terceira permitem registar um repasse de teste. Use apenas um ficheiro de teste como comprovativo. O registo muda para o histórico; não transfere dinheiro.
- Na quarta, Validar QR Code abre a pagina de validacao. O QR deve ser validado antes de registar o repasse; nao existe autorizacao manual alternativa.
- Depois de registar, o mesmo valor não pode ser registado novamente para essa reserva.

## Repetir / desfazer

Importar `004_limpar_seed_repasses_referencia.sql` remove as contas de simulação desativadas, os seus anúncios, reservas, validações, notificações e repasses de teste. Inclui os repasses que tenha registado manualmente para estas contas durante a simulação. Não usar essas contas para outros dados que pretenda guardar.

Depois da limpeza, importar novamente o seed para recomeçar. Repetir o seed sem limpeza não duplica os exemplos nem desfaz ações já testadas.

## Verificação efetuada

Os INSERTs foram conferidos com as colunas obrigatórias da estrutura fornecida. O seed foi executado duas vezes numa base SQLite de teste com adaptação das funções MySQL, sem duplicar exemplos. A resposta da API PHP real foi verificada com relógio fixo em 30/10/2026 e autenticação simulada: quatro pendências, dois pagos e totais iguais aos da referência. Ainda é necessária a execução em MariaDB/homologação.


## Atualizacao: QR obrigatorio

No exemplo 004, Verificar abre agora a pagina de validacao do QR. Nao existe autorizacao manual alternativa. So depois de validar o QR e cumprir os restantes requisitos e possivel registar o repasse. As confirmacoes administrativas antigas nao autorizam repasses sem QR.
