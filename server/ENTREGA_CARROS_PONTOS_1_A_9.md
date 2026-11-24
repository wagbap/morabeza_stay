# Atualização conjunta — carros, pontos 1 a 9

O pacote contém o build completo do frontend, os endpoints PHP envolvidos e as migrações dos nove pontos. As alterações foram preparadas localmente; este pacote não implica publicação automática nem confirmação de configuração do servidor real.

## Instalação

1. Guardar uma cópia do site e da base de dados.
2. Rever e aplicar as migrações em `sql/`, por esta ordem: `stock_carros.sql`, `caucao_carros.sql`, `calendario_carros.sql`, `documentos_condutor.sql`, `horarios_carros.sql`, `galeria_carros.sql`. Confirmar a tabela `reservas_carro_condicoes`, já existente na estrutura de referência do projeto. Não é necessário repetir migrações já aplicadas; as adições são preparadas para repetição.
3. Publicar o conteúdo de `api/` na pasta da API existente. Conservar `config.php`, segredos JWT/Stripe, autenticação administrativa e configurações privadas existentes. Os ficheiros `.example.php` são referências, não credenciais reais. `send_email.php` inclui o template de email e o gerador de comprovativos completos.
4. Configurar a pasta privada dos documentos do condutor fora da área pública e rever os limites de upload/OTP segundo `DOCUMENTOS-PONTO-3.md`. O código não publica documentos em URLs estáticas.
5. Publicar **o conteúdo** de `frontend/` na raiz do site, incluindo os assets do mesmo build. Publicar API e frontend como uma atualização coordenada; os novos endpoints e colunas são necessários ao frontend.
6. Configurar por CLI a limpeza de documentos abandonados e rever a configuração Stripe de teste conforme os documentos dos pontos 1 e 3. Não substituir configurações locais reais por exemplos.

## Conteúdo funcional

1. Pagamento com retenção de cinco minutos, contador persistente, confirmação após aprovação e libertação segura.
2. Calendário de bloqueios por unidade e motivo, manutenção e disponibilidade contínua do cliente.
3. Frente/verso da carta e identificação obrigatórios, formatos de imagem/PDF e acesso privado.
4. Janelas de levantamento e devolução configuráveis, duas horas escolhidas e disponibilidade por data/hora.
5. Caução do anfitrião separada do pagamento online/comissão, com métodos e condições no checkout, email e PDF.
6. Quilometragem vazia durante edição, espaço no título e subtotal com singular/plural.
7. Datas de pesquisa preservadas na ficha e checkout, com novo cálculo após alteração.
8. Ficha adaptada ao iPhone, preço numa linha, total só com datas e regras acessíveis.
9. Origem da captura do Toyota confirmada; exclusão preservando o original, fonte exclusiva de fotografias e galeria no padrão das restantes fichas.

Os detalhes e verificações de cada ponto estão nos documentos incluídos. Foram utilizados testes locais de lógica, PHP, HTTP simulado, navegador e build. A persistência real da quilometragem utiliza o endpoint de edição que está alojado fora deste repositório e foi verificada localmente com API simulada. O WebKit foi testado em Windows com tamanhos de iPhone, sem substituir a verificação final num iPhone físico.

## Verificação após publicação

Usar dados/documentos de teste para confirmar o checkout completo e a autenticação do servidor: cartão de teste aprovado/recusado, retenção observada noutra sessão, calendários, três documentos privados, horas e caução; guardar/reabrir a quilometragem e consultar a ficha; pesquisar com datas e alterar o período; verificar no iPhone e abrir `Ver todas as fotos` no Toyota ID 24. A galeria deve conter as duas fotografias, sem a captura do cartão.

Nenhuma cobrança, reserva, envio de email ou alteração de dados em produção foi realizada durante a preparação.
