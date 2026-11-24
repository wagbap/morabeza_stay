# Padrão das listagens

Carros e experiências seguem a apresentação mobile aprovada nos alojamentos: breadcrumbs, mapa, cartão Filtrar por com contador e botão de expansão, pesquisa sempre visível abaixo de Filtrar por e restantes filtros inicialmente recolhidos, título Explorar com contagem, barra de ordenação e vistas grelha/lista, e aviso de preços.

Os filtros continuam abertos em desktop. Abrir ou recolher conserva os valores. A pesquisa por marca/modelo ou nome permanece visível dentro do cartão, mesmo ao recolher os restantes filtros. O mesmo ajuste aplica-se ao alojamento. Os carros passam também a permitir ordenar por preço e avaliação, mantendo a ordem original em Recomendados. A ordenação ocorre antes da paginação.

Componentes partilhados: PainelFiltrosLista e BarraResultadosLista. Não altera o checkout nem as regras de disponibilidade.

Verificado com dados simulados em Chrome e WebKit: expansão/recolha, ordenação, vistas e ausência de deslocamento horizontal nas larguras 320, 390, 768 e 1280.
