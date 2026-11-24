# Pesquisa de experiências com uma data

A barra escolhe um único dia, sem exigir uma segunda data para submeter. Usa `data=AAAA-MM-DD`, combinada com ilha, zona, tipo e pesquisa por nome. Os endereços antigos com `data_inicio` e `data_fim` são normalizados para o primeiro dia.

A data mantém-se ao atualizar e nos links dos anúncios. A ficha inicializa o dia da atividade a partir da pesquisa para consultar as suas disponibilidades. Limpar remove a data selecionada. O catálogo cancela pedidos anteriores para evitar substituir uma pesquisa recente por uma resposta antiga.

Verificação com API simulada em Chrome e WebKit: seleção de um dia, submissão, tipo/zona, parâmetros da API, links das fichas, atualização e limpeza. Sem alterações SQL ou pagamentos.
