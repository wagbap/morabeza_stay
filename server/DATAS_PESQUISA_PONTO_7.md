# Datas da pesquisa na ficha e checkout — ponto 7

Alterações locais preparadas para a atualização conjunta até ao ponto 9; sem publicação.

- A pesquisa de carros atualiza os parâmetros `data_levantamento` e `data_devolucao` no URL da listagem. O carregamento inicial, pesquisas seguintes, recarregamentos e navegação anterior/seguinte usam esse mesmo contexto. Pedidos antigos são cancelados para não substituir os resultados de uma pesquisa mais recente.
- Os links existentes dos cartões conservam os parâmetros da pesquisa. A ficha lê e pré-preenche um período completo válido, sem conversão UTC que desloque o dia. Datas impossíveis, passadas, incompletas ou invertidas não são assumidas como períodos reserváveis.
- O hook existente de disponibilidade é executado com o ID do carro escolhido e as datas recebidas. O preço usa a diária desse carro, a quantidade e o número de dias do período. A contagem de dias usa dias civis, sem acrescentar um dia devido a mudanças de hora.
- Alterações feitas pelo cliente no calendário da ficha substituem as datas anteriores. Um intervalo completo atualiza o URL da ficha, conserva os restantes parâmetros e sobrevive a um recarregamento. A disponibilidade é novamente consultada para esse período.
- O botão de reserva mantém a confirmação final no servidor e transmite ao checkout as datas, dias, quantidade e total atualmente selecionados. Um carro sem stock ou com disponibilidade por confirmar não pode avançar.
- Os atalhos de mapa da listagem e o link da ficha a partir do mapa conservam o contexto da pesquisa.

Verificado localmente: testes de datas e fuso horário, intervalos inválidos e substituição de parâmetros; lint sem erros nos componentes principais e utilitário; build de produção aprovado. O ficheiro do mapa conserva um aviso de dependência de hook anterior a esta alteração.

No navegador com chamadas simuladas: pesquisa → cartão → ficha → checkout com período original; alteração para outro período na ficha; atualização do URL; recarregamento; novo preço e período no checkout; segundo carro sem stock impedido de reservar. Não foram criadas reservas nem alterados dados no servidor real.
