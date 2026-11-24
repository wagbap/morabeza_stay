# Pesquisa móvel de alojamentos

O formulário apresenta Ilha (Santiago), Cidade ou zona, Check-in / Check-out e Hóspedes, com campos empilhados no telemóvel e botão Buscar a toda a largura. Mantém os controlos existentes de adultos, crianças, quartos e animais.

A cidade escolhida segue no parâmetro `zona` da URL e filtra os resultados pela localização, cidade ou zona do alojamento, em conjunto com a ilha. Datas e hóspedes mantêm os parâmetros anteriores. Atualizar a página repõe os valores da pesquisa.

Publicar o conteúdo atualizado de `frontend/`. Esta alteração não requer migração nem atualização adicional de PHP.

O painel de filtros inclui “Procurar por nome”, com pesquisa imediata no título do alojamento, ignorando maiúsculas e acentos. O parâmetro `nome` mantém a pesquisa ao atualizar a página e ao submeter a barra principal; limpar os filtros também limpa este campo. Não gera pedidos de API por cada letra.
