# Caução — ponto 5

No checkout de carros, a caixa existente mostra numa linha os métodos configurados pelo anfitrião. Os métodos conhecidos têm rótulos legíveis; valores personalizados são preservados. Em ecrãs pequenos a linha pode quebrar para não ultrapassar a caixa.

O email e o comprovativo PDF usam a caução guardada em `reservas_carro_condicoes.snapshot_json` no momento da reserva: valor por carro, total para a quantidade reservada, métodos aceites e condições completas de devolução ou retenção quando configuradas. Não consultam as condições atuais do anúncio para substituir as aceites pelo cliente. Reservas antigas sem esse registo não recebem condições inventadas retroativamente.

A instrução indica pagamento diretamente ao proprietário no levantamento. A caução permanece fora do pagamento online, do preço total da reserva e da base da comissão. Não há valor fixo de 500 CVE no código: apresenta o valor configurado.

O desenho do PDF mantém-se. A caução ocupa o espaço livre na coluna de informação da reserva. Textos extensos continuam noutra página, sem cortes. Alojamentos e experiências mantêm os modelos existentes.

## Publicação

O pacote `carros-pontos1-2-3-5.zip` é cumulativo com os pontos 1, 2 e 3. Publicar o conteúdo de `frontend/` no site e os ficheiros de `api/` na API. `api/send_email.php` contém o email e gerador PDF completos, gerados a partir de `server/api/email/` pelo comando `python server/email-build/gerar.py`. Os templates fonte seguem em `api/email/`.

Manter as configurações privadas já existentes. Consultar os documentos dos pontos anteriores para migrações, armazenamento privado dos documentos e Stripe. A tabela `reservas_carro_condicoes` faz parte da estrutura de referência existente; confirmar que existe antes de publicar. A migração `caucao_carros.sql` adiciona o snapshot da tentativa de pagamento às retenções.

Validado localmente: checkout desktop e telemóvel com métodos simulados; email com caracteres especiais escapados; condições guardadas de 500 CVE preservadas após alteração do anúncio para 700 CVE; duas viaturas com caução total de 1.000 CVE sem alterar aluguer/comissão; PDF curto numa página e condições extensas completas em páginas adicionais; build de produção e testes PHP aprovados. Sem envio de emails, reservas ou cobranças reais e sem publicação automática.
