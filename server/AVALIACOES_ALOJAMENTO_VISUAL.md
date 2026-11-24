# Avaliações de alojamentos

O mesmo padrão está agora aplicado a carros e experiências através de `src/components/AvaliacoesServico.jsx`. Cada vertical mantém o seu endpoint e campos próprios: `data_estadia`, `data_aluguer` ou `data_experiencia`. As experiências continuam a mostrar apenas avaliações aprovadas e a impedir novo envio quando o utilizador já avaliou. O formulário de experiência permite escolher a data da atividade.

Validação adicional: testes com respostas simuladas para as três APIs, incluindo os identificadores e datas enviados; Chrome e WebKit para carros e experiências; verificação visual dos modais.

Secção e modal ajustados à referência 7.jpg: resumo da nota, estrelas laranja, botão azul de largura completa, detalhes recolhíveis, comentários com avatar e data, dois comentários iniciais e expansão por pares.

O formulário abre num modal com nota, data da estadia, comentário, envio, cancelar e fechar. Mantém a integração de avaliações existente, usando a instância partilhada de API. Os controlos Útil e Reportar mantêm o comportamento anterior; esta atualização não cria serviços de votos ou denúncias.

A distribuição de classificações usa os comentários recebidos, substituindo as notas de categorias fixas anteriores. Não são criadas avaliações de demonstração no produto.

Tipografia de sistema, incluindo -apple-system no iPhone, e ícones Lucide já instalados. Sem novas dependências ou alteração da fonte global.

Verificação local: Chrome e WebKit, larguras 320/390/768/1280, abrir e fechar modal, retorno de foco, estrelas, calendário Limpar/Fechar, expansão e submissão com API simulada. Nenhuma avaliação enviada para produção.
