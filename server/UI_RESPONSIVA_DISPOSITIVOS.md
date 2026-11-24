# Interface responsiva

Correção para janelas de desktop/Mac: as barras de pesquisa dos três serviços passam ao formato horizontal a partir de 1024 px, em vez de 1280 px. Carros e experiências mantêm cinco colunas compactas, com Buscar ao lado. A tipografia do banner de experiências é limitada para evitar a apresentação excessiva observada na captura do cliente.

Verificação específica: pesquisa com cinco colunas e altura máxima de 110 px nas larguras 1024, 1100, 1180, 1280, 1440 e 1920, além dos tamanhos mobile/tablet. A largura medida é a da janela em CSS; a escala do sistema e o zoom do navegador podem alterar essa largura.

Ajustes na pesquisa e listagens públicas, mantendo o padrão visual aprovado:

- Menos espaço entre Filtrar por e a pesquisa; o campo continua sempre visível.
- Campos com pelo menos 44 px de altura, áreas de toque dos controlos da pesquisa e navegação dos calendários reforçadas.
- Barra de ordenação cabe numa linha com grelha/lista. Mantém o seletor nativo acessível, com texto visual compacto e campo nativo de 16 px.
- Maior contraste no placeholder e ajuda da pesquisa; foco visível ao navegar com teclado.
- Preferência do sistema por movimento reduzido respeitada. Zoom do utilizador continua disponível.

Validação local com dados simulados: Chromium e WebKit com toque e larguras 320, 360, 375, 390, 412, 600, 768, 820, 1024, 1180 e 1366 px. Verificados filtros, ordenação, vistas e ausência de deslocamento horizontal; pesquisa e calendário de alojamentos e menu inicial também verificados.

São simulações de navegador e dimensões de dispositivos. Não representam testes físicos de todos os modelos de iPhone, Android ou iPad, nem uma auditoria de segurança do backend.
