# Documentos privados do condutor — ponto 3

O pacote é cumulativo com os pontos 1 e 2. Inclui frontend completo, código PHP e migrações. Não inclui documentos reais, chaves nem configurações privadas.

## Publicar e configurar

1. Fazer cópia dos ficheiros e da base de dados.
2. Aplicar `sql/documentos_condutor.sql` antes de atualizar a API. Se necessário, rever e aplicar também as migrações dos pontos 1 e 2 incluídas no pacote.
3. Criar uma pasta privada **fora do document root e de quaisquer aliases públicos do servidor**. Exemplo de estrutura: o site em `/home/conta/public_html` e os documentos em `/home/conta/morabeza-documentos-privados`. O PHP tem de conseguir escrever nessa pasta.
4. Definir `CARRO_DOCUMENTOS_DIR` com o caminho absoluto dessa pasta ou copiar `api/documentos-config.local.example.php` para `api/documentos-config.local.php` e preencher `directory`. O diretório pai deve existir. Nunca usar `public/`, `uploads/` ou `api/`. O código recusa uma pasta dentro do document root; não existe fallback para uploads públicos.
5. Rever os limites PHP e do proxy: cada ficheiro tem limite de 10 MB; permitir pelo menos 3 uploads, `upload_max_filesize=10M` e `post_max_size=40M`, com margem para os três ficheiros e multipart. São necessárias as extensões PHP `fileinfo` e cURL.
6. Publicar juntos os ficheiros de `api/`, preservando `config.php`, `auth-secrets.local.php`, `auth_admin.php`, as configurações Stripe e `vendor/`. Os novos endpoints de leitura reutilizam a autenticação assinada do anfitrião e a autenticação administrativa existentes.
7. Publicar todo o conteúdo de `frontend/`, incluindo traduções. Este frontend deve acompanhar a nova API: o pagamento de carro passa a exigir prova dos três documentos privados.
8. Validar o OTP em ambiente de teste. O envio multipart verifica o código uma única vez, no servidor, através do endpoint existente `https://welovepalop.com/api/send_otp.php`. O browser deixa de verificar esse mesmo código antes do upload. O alojamento precisa de conseguir fazer essa chamada HTTPS.
9. Para limpar tentativas abandonadas, instalar `bin/limpar_documentos_condutor.php` fora de uma rota pública e executá-lo periodicamente por CLI com `CARRO_API_DIR` (pasta dos endpoints), `CARRO_DOCUMENT_ROOT` e `CARRO_DOCUMENTOS_DIR` configurados. Remove apenas lotes expirados sem reserva e sem retenção ativa. Documentos de reservas e pagamentos em curso são preservados.

## Formulário e validação

- Três campos obrigatórios: frente da carta de condução, verso da carta de condução e identificação oficial (CNI, passaporte ou equivalente).
- Aceita JPG/JPEG, PNG e PDF. Word, SVG, outros formatos, ficheiros vazios e ficheiros acima de 10 MB são recusados.
- O browser verifica os três campos antes de pedir o OTP e volta a verificar antes de enviar. O servidor exige os três uploads reais, valida tamanho, MIME efetivo, correspondência com extensão, dimensões/estrutura da imagem ou assinatura PDF e final de ficheiro.
- Todos os ficheiros são validados antes de consumir o OTP. Os três são guardados numa transação lógica; falha num deles impede a passagem ao pagamento e remove os ficheiros já movidos nessa tentativa.
- O pagamento exige um lote completo e verificado, associado ao veículo, às datas, ao email verificado do condutor e ao token de retenção. Um nome de ficheiro ou uma declaração do browser não substituem um upload.
- A confirmação final liga esse mesmo lote à reserva na transação de gravação. A coluna antiga de nome/URL da carta não recebe os novos documentos.
- No sessionStorage ficam apenas identificadores e uma prova aleatória de associação; não ficam os ficheiros nem URLs de leitura. Essa prova não permite descarregar documentos.

## Privacidade e acesso

- Os ficheiros têm nomes aleatórios, são guardados como `.bin` fora da área pública, com permissões de ficheiro `0600`. Não são publicados no site, nos emails, no PDF ou nos detalhes públicos da reserva.
- Download apenas por POST autenticado no endpoint privado. Cada download volta a verificar a autorização e é registado com utilizador, contexto e finalidade. Respostas usam `no-store`, `nosniff` e `Content-Disposition: attachment`.
- Administradores autenticados podem verificar documentos na janela de detalhe de reservas de carros.
- O proprietário tem acesso na página de detalhe da sua própria reserva confirmada e paga, **desde dois dias antes do levantamento até um dia depois do levantamento**, para preparação e entrega. Uma reserva cancelada ou outra matrícula/anúncio de outro proprietário não dá acesso. A duração restante do aluguer não prolonga a janela.
- Fora dessa janela, a administração conserva o acesso. O bloqueio da interface não substitui a autorização no servidor.
- As novas regras aplicam-se aos novos envios do condutor. Os endpoints genéricos usados por outros pedidos de documentos da plataforma não são utilizados neste fluxo.

## Verificação realizada

- Testes PHP de formatos, ficheiros disfarçados, pasta pública recusada, lote incompleto, prova falsa, associação a outro veículo/email/pagamento e janela de entrega.
- Testes HTTP do endpoint privado: GET público recusado; pedidos anónimos, JWT falso, outro proprietário e tentativa de usar contexto administrativo com token de anfitrião recusados. Download autorizado e cancelamento também verificados, com autenticação e base simuladas.
- Teste no navegador do build: três campos obrigatórios, Word recusado, multipart com os três ficheiros, OTP sem verificação duplicada no browser e passagem apenas da prova privada ao pagamento. Verificado em desktop e telemóvel.
- Testes de regressão dos pagamentos, stock e calendários, lint dos ficheiros novos e build de produção aprovados. O ficheiro existente de detalhes da reserva mantém um aviso de dependência de hook anterior a esta alteração.

Não foram enviados documentos reais nem criadas reservas/cobranças em produção. Antes de considerar o ponto concluído no site publicado, validar o diretório privado, o OTP e a autenticação real do servidor com documentos fictícios.
