# Emails de reserva

Modelo partilhado para alojamentos, carros e experiências, baseado na referência
visual fornecida. Tabelas de apresentação, estilos inline para os blocos principais,
tipografia Georgia/Arial, cores azul-marinho, fotografias, resumo, QR e apoio.
Em ecrãs estreitos, os blocos ficam numa coluna. Outlook recebe uma imagem de fundo
VML com cor sólida de reserva. A renderização varia entre clientes de email.

## Pré-visualizar sem enviar

Abrir os ficheiros em `server/previews/email-alojamento.html`, `email-carro.html`
e `email-experiencia.html`. São exemplos identificados como tal, com imagens de
demonstração. Os botões de PDF desses exemplos são demonstrativos.
Nenhum email foi enviado durante o desenvolvimento.

## Publicar

Fazer cópia do `api/send_email.php` existente e enviar:

- `server/api/send_email.php` para `api/send_email.php`.
- O `send_email.php` j? incorpora HTML, consulta de dados e gerador PDF; n?o precisa da pasta `email/` no servidor.
- `server/api/comprovativo-reserva.php` para `api/comprovativo-reserva.php`.
- A versão local atualizada de `auth-secrets.local.php`, privada e ignorada pelo Git.

Manter `config.php`, `mail/` (PHPMailer), `reserva-validacao.php`, `reserva-jwt.php`
e os ficheiros de autenticação já instalados. A configuração privada reutiliza
SMTP e acrescenta `admin_email` com o destinatário do PHP fornecido.
`support_email` é opcional; por omissão usa o Reply-To já existente no PHP original.
Publicar também o frontend atualizado: Pagamento envia `tipo`, fotos/quartos e
Authorization. A imagem de capa usa `/media/home-beach-29984774-poster.jpg` no
domínio público; publicar o ficheiro já existente em `public/media/` nesse domínio.

## Dados e acesso

O endpoint verifica a sessão e a correspondência `reservas_*.usuario_id` antes
de enviar. O destinatário vem de `usuarios`, nunca de um email arbitrário no POST.
Título/localização/foto/contactos são obtidos do anúncio e do anfitrião.
Código, estado, pagamento, datas, quantidades e total vêm da reserva na base.
Quartos e participantes complementares usam os dados do checkout; por isso não
substituem um histórico imutável de itens na base. A discriminação financeira
só usa subtotal/taxa se estes somarem o total guardado; caso contrário apresenta
o valor da reserva sem inventar parcelas. Não são inventadas horas, contactos,
datas de cancelamento gratuito, referências de pagamento ou camas.

Os três emails e a cópia administrativa usam o mesmo renderer e mostram o estado
guardado na base. O checkout verifica o Stripe antes de gravar «pago» e «confirmada»;
o envio do email não altera o pagamento ou as regras de validação QR.
O intent antigo mantém-se no servidor, sem endpoints adicionais de integração Stripe.

Os botoes da confirmacao e da gestao descarregam este mesmo PDF atraves de
`comprovativo-reserva.php`. Publicar tambem esse endpoint, `checkout_api.php`
e o frontend atualizado. Os links do email continuam assinados; os pedidos
da gestao verificam a sessao e permitem apenas o cliente ou dono do anuncio.
O checkout devolve uma ligacao assinada para a confirmacao, incluindo compras sem sessao.

Os icones do email usam URLs publicas em `https://morabezastay.cv/images/email/`.
Publicar tambem `public/images/email/` no site antes de enviar novos emails.
O logotipo e o mesmo da Navbar, hospedado no Cloudinary. Nao sao embutidos
anexos MIME de icones; apenas o PDF e anexado. As imagens embutidas no PDF mantem-se.

O PDF inclui um resumo textual e vai em anexo. O botão descarrega um PDF através
de ligação assinada válida por sete dias. Não é uma fatura fiscal. A assinatura
protege o código/tipo/prazo, e o endpoint não aceita redirecionamentos externos.
O PDF segue agora o modelo A4 da referência: cabeçalho, linha temporal, QR
vetorial, pagamento, checklist e mapa. As etiquetas adaptam-se às três categorias.
Os exemplos estão em `output/pdf/`, identificados como exemplos sem validade.

O QR é gerado localmente com a biblioteca MIT de Kazuhiko Arase:
https://github.com/kazuhikoarase/qrcode-generator. O código fica incorporado
no send_email.php compilado, sem chamadas externas para produzir o QR.
O mapa usa as coordenadas do anúncio e Mapbox Static Images:
https://docs.mapbox.com/api/maps/static-images/. A configuração privada
mapbox_token foi preenchida com o token público já existente no .env.
Enviar a configuração privada atualizada. Sem coordenadas, token ou acesso
ao serviço, o PDF mostra uma ligação ao mapa no lugar da imagem.

Para publicar o novo PDF: atualizar send_email.php, comprovativo-reserva.php
e auth-secrets.local.php. Não é preciso enviar vendor com o bundle completo.

## Verificação

`php tests/emailReserva.test.php` testa os três modelos, escaping, estados
pendentes, cêntimos, ligações, assinatura e estrutura básica do PDF, sem SMTP.
É necessário PHP >= 7.3 com PDO MySQL, iconv e os requisitos do PHPMailer.
Não havia runtime PHP/MySQL local para executar estes testes. Confirmar no
servidor com uma reserva própria de cada categoria e testar noutro utilizador
(deve ser recusado). Validar Gmail, Outlook e Mail iOS, incluindo imagens
bloqueadas, antes de ativar envios reais.

## Ficheiro completo

`server/api/send_email.php` ? o ficheiro completo de publica??o. Inclui o modelo
HTML e as fun??es de dados/PDF. Mant?m as depend?ncias existentes `config.php`,
`auth-secrets.local.php`, `reserva-validacao.php`, `reserva-jwt.php` e `mail/`.
Para o bot?o PDF, enviar tamb?m `comprovativo-reserva.php`. A pasta `email/` ?
fonte de desenvolvimento; `python server/email-build/gerar.py` recompila o
ficheiro completo ap?s altera??es. Incluir send_email.php a partir do endpoint
PDF s? carrega fun??es; n?o envia emails. Os testes executam este bundle.
