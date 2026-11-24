# Ponto 10 — Sessão na gestão de experiências

## Causa confirmada no código

O login emite um JWT válido durante sete dias e um `validation_token` auxiliar válido durante oito horas. A agenda e a leitura da experiência davam prioridade ao token auxiliar. Quando este expirava, a API devolvia AUTH_REQUIRED apesar de o login principal continuar válido.

## Correção

- Agenda, configuração de sessões e dados de edição usam primeiro o token da sessão do anfitrião. O token auxiliar fica como alternativa para instalações legadas sem JWT.
- A seleção ignora aliases JWT expirados ou malformados, para que não escondam outro token de login válido guardado.
- A entrada na área de gestão usa o mesmo leitor de sessão.
- O login permanece no localStorage ao atualizar, navegar ou perante erros de rede/API. Não há ciclo de retries nem utilização do token de administrador como credencial de anfitrião.

O frontend apenas escolhe a credencial a enviar. Assinatura, expiração e propriedade da experiência continuam a ser verificadas pela API. Não se prolonga a validade dos tokens nem se cria uma sessão sem autenticação. Um login realmente expirado continua a precisar de autenticação.

## Validação

Testes unitários e de integração dos serviços; navegador Chromium e WebKit mobile com API simulada: entrada direta em `/gest/experiencia/20/sessoes`, token auxiliar expirado, reload, alias antigo e sessão alternativa válida, painel e botões carregados sem novo login. Os testes não escrevem em produção.

Entrega apenas de frontend: publicar o dist atualizado. Não requer SQL nem alterações às regras de reserva ou aos dados das sessões.
