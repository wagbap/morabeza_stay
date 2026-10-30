# Notificacoes simples por triggers

1. No phpMyAdmin, abrir SQL e executar TODO o ficheiro `001_notificacoes_contexto.sql`.
2. Publicar `server/api/usuarios/notificacoes.php` em `/api/usuarios/notificacoes.php`.
3. Publicar o frontend atualizado. O sino usa essa API a cada 30 segundos.
4. Se usares a API de documentos preparada aqui, publicar tambem `server/api/admin/solicitar_documento.php`.

A API usa `config.php` e os helpers de autenticacao existentes (`reserva-validacao.php`, JWT/segredos locais). Nao colocar credenciais no frontend. Nao ha uma API publica para instalar triggers: a instalacao e feita uma vez no phpMyAdmin.

## Correcao do HTTP 500 na leitura

Se a versao anterior ja foi instalada, publicar a API de notificacoes corrigida e executar `002_corrigir_foto_experiencias.sql`. A tabela `experiencias` usa `imagem_principal`, enquanto alojamentos e carros usam `imagem_url`. A referencia antiga a uma coluna inexistente fazia falhar a consulta inteira, mesmo so com avisos de alojamentos. A correcao preserva as notificacoes existentes; nao e preciso importar o dump ou recriar a tabela. Para uma instalacao nova, o ficheiro 001 ja inclui esta correcao.

## O que fica automatico

A tabela `notificacoes_anfitriao` recebe avisos de:
- Registo e mudanca de estado de alojamentos, carros e experiencias.
- Nova reserva e mudancas de estado/pagamento nas tres categorias.
- Pedido de documento e mudancas de estado do documento.

O destinatario e o proprietario real do anuncio, ou o prestador do pedido de documento. O trigger funciona mesmo quando esse utilizador esta desligado. A API valida a sessao e so lista/marca as notificacoes desse utilizador. Nao ha avisos de bloqueios de calendario ou reservas temporarias.

Nome e fotografia principal ficam guardados no momento do evento, usando a galeria real e `imagem_url` como alternativa. Assim mantem-se o contexto mesmo se o anuncio mudar depois. Nao ha fotografias de exemplo. Os updates so geram avisos quando o estado muda; guardar novamente o mesmo estado nao duplica o aviso. Cada reserva inserida tem uma chave unica por categoria e ID.

## Compatibilidade

A tabela antiga `notificacoes` fica intacta e deixa de alimentar este sino. Assim, os INSERTs genericos dos PHP antigos nao aparecem duplicados com os triggers. A API de documentos local deixou de criar notificacoes em PHP. Os avisos antigos nao sao copiados: faltam referencias seguras ao anuncio. A lista nova comeca com os eventos ocorridos depois da instalacao.

O SQL pode ser executado novamente: preserva a tabela e os avisos existentes e recria apenas os 14 triggers `ms_notif_*`. Nao executar enquanto estiverem a ser criadas reservas: DDL nao e uma transacao unica. E necessario que o utilizador SQL tenha permissao CREATE/TRIGGER. Outros triggers existentes nao sao removidos.

## API

POST `/usuarios/notificacoes.php`, com `Authorization: Bearer <token>`:
- `{ "action": "listar", "limite": 30 }` devolve `data` e `nao_lidas`.
- `{ "action": "marcar_lida", "id": 123 }` marca apenas um aviso proprio.
- `{ "action": "marcar_todas_lidas" }` marca os avisos proprios.

O nome e a foto sao `anuncio_titulo` e `anuncio_imagem`. Nenhum `usuario_id` enviado pelo cliente decide o destinatario.

## Base de referencia

O dump integral permanece privado em `private/database/morabeza-stay-2026-10-30.sql`, ignorado pelo Git. Nao publicar esta pasta. `estrutura-referencia.sql` e apenas referencia; nao importar por cima da base existente.

A instalacao ainda nao foi executada no servidor MariaDB. Apos instalar, criar uma reserva de teste e confirmar que apenas o dono recebe o aviso, com nome e foto. Guardar o mesmo estado novamente nao deve criar outro aviso. Testar tambem cancelamento, pagamento e documentos. A API de leitura preserva os avisos se um anuncio for apagado; nao existe limpeza automatica.

## Verificacoes locais

`python tests/notificacoesTriggers.test.py`: cinco testes, com os INSERTs e condicoes dos triggers adaptados para SQLite. Verifica destinatario, capas nas tres categorias, estados, documentos, bloqueios e rollback. Isto nao valida a sintaxe DDL MariaDB. A API foi exercitada com SQLite e sessao simulada; o build Vite tambem passou.
