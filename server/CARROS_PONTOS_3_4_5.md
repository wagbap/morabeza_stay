# Carros: pontos 3, 4 e 5

Publicar o frontend atualizado e substituir api/get_carro_detalhes.php pelo ficheiro deste pacote. Manter os helpers e as migrations dos pontos 1 e 2. Nao necessita de SQL adicional.

As condicoes continuam guardadas na linha do anuncio em carros, pelo endpoint condicoes_guardar.php existente. Nao sao copiadas para cada unidade. O endpoint publico inclui os campos guardados de levantamento e condutor. A localizacao geral do anuncio permanece distinta do local de levantamento.

O frontend mostra local, horario e regras no anuncio, checkout e resumo de pagamento. O checkout rele os dados pelo ID. Nao usa valores inventados para regras ausentes. Na compatibilidade com o endpoint antigo, o detalhe consulta get_carro.php para obter as condicoes em falta.

Cartoes: configurar unidades, condicoes, ver, editar e eliminar; ver/editar brancos, eliminar vermelho. Removido acesso repetido a condicoes dentro das unidades.

Formulario de unidade: titulo e ID do anuncio, explicacao de uma matricula por carro no stock, documentos do veiculo e aviso de privacidade. Mantido o fluxo existente de criar primeiro a unidade e depois anexar documentos.

Validar no alojamento: ID 24 com levantamento praia e 08:00-17:00; abrir outro anuncio e confirmar condicoes independentes. Conferir checkout antes de pagar, botoes dos cartoes e formulario de nova unidade. Nao foram feitas alteracoes na base de producao.

Traducoes adicionadas aos sete idiomas; textos novos em PT e EN, com EN temporario nos restantes idiomas.
