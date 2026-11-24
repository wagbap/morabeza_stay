# Pesquisa de carros em Santiago

A barra dos carros segue o padrão compacto da plataforma. O menu de sugestões apresenta Toyota (Marca), Renault Clio (Modelo), SUV (Categoria) e 7 lugares (Categoria), com seleção por clique ou teclado. A pesquisa aceita também texto livre.

O período, o local de levantamento e o termo escolhido seguem na URL. Os resultados continuam limitados a Santiago ao pesquisar, limpar filtros, atualizar a página ou abrir um endereço com outra ilha. Na pesquisa inicial, escolher Carros fixa o destino em Santiago.

Publicar o conteúdo de `frontend/` na raiz do site e atualizar `api/get_carro.php`. Este endpoint passa a filtrar a ilha quando recebe `destino`; as consultas por ID mantêm o comportamento anterior. Não há migração de base de dados.

Verificação local: testes das sugestões e capacidade, SQL real com PDO/SQLite, navegação com dados simulados, teclado, persistência após atualização, datas e larguras de 320, 390, 768 e 1280 px.
