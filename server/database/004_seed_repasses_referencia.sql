USE `u303262922_morabeza_stay`;

-- Simulacao isolada dos cenarios da imagem. Executar depois da migracao 003.

-- Contas desativadas, anuncios pendentes e IBANs ficticios: nao transferir dinheiro.

-- Pode repetir: os identificadores abaixo evitam criar os mesmos exemplos duas vezes.

SET NAMES utf8mb4;

START TRANSACTION;

SET @seed_base = CURDATE();

SET @seed_hoje_util = SUBDATE(@seed_base, GREATEST(WEEKDAY(@seed_base)-4,0));

SET @seed_fim_hoje = SUBDATE(@seed_hoje_util, CASE WEEKDAY(@seed_hoje_util) WHEN 0 THEN 5 WHEN 1 THEN 5 WHEN 2 THEN 5 ELSE 3 END);

SET @seed_fim_atraso = SUBDATE(@seed_fim_hoje, CASE WEEKDAY(@seed_fim_hoje) WHEN 0 THEN 3 ELSE 1 END);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Ana Lopes', 'seed-repasses-ana@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'proprietario', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-ana@example.invalid');

SET @seed_ana = (SELECT id FROM usuarios WHERE email='seed-repasses-ana@example.invalid' LIMIT 1);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Santiago Rent', 'seed-repasses-rent@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'proprietario', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-rent@example.invalid');

SET @seed_rent = (SELECT id FROM usuarios WHERE email='seed-repasses-rent@example.invalid' LIMIT 1);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Mar Azul', 'seed-repasses-mar@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'proprietario', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-mar@example.invalid');

SET @seed_mar = (SELECT id FROM usuarios WHERE email='seed-repasses-mar@example.invalid' LIMIT 1);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Carlos Silva', 'seed-repasses-carlos@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'proprietario', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-carlos@example.invalid');

SET @seed_carlos = (SELECT id FROM usuarios WHERE email='seed-repasses-carlos@example.invalid' LIMIT 1);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Cliente de simulacao', 'seed-repasses-cliente@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'hospede', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-cliente@example.invalid');

SET @seed_cliente = (SELECT id FROM usuarios WHERE email='seed-repasses-cliente@example.invalid' LIMIT 1);

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_conta`, `category`, `online_status`, `last_seen`, `ativo`)
SELECT 'Operador de simulacao', 'seed-repasses-operador@example.invalid', '!SIMULACAO-SEM-LOGIN!', 'proprietario', 'simulacao', 'offline', '', 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `usuarios` WHERE email='seed-repasses-operador@example.invalid');

SET @seed_operador = (SELECT id FROM usuarios WHERE email='seed-repasses-operador@example.invalid' LIMIT 1);

INSERT INTO `dados_recebimento` (`usuario_id`, `titular`, `iban`, `banco`, `pais`, `confirmado`)
SELECT @seed_ana, 'Ana Lopes', 'TESTE-NAO-TRANSFERIR-01', 'SIMULACAO - NAO TRANSFERIR', 'Cabo Verde', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `dados_recebimento` WHERE usuario_id=@seed_ana);

INSERT INTO `dados_recebimento` (`usuario_id`, `titular`, `iban`, `banco`, `pais`, `confirmado`)
SELECT @seed_rent, 'Santiago Rent', 'TESTE-NAO-TRANSFERIR-02', 'SIMULACAO - NAO TRANSFERIR', 'Cabo Verde', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `dados_recebimento` WHERE usuario_id=@seed_rent);

INSERT INTO `dados_recebimento` (`usuario_id`, `titular`, `iban`, `banco`, `pais`, `confirmado`)
SELECT @seed_mar, 'Mar Azul', 'TESTE-NAO-TRANSFERIR-03', 'SIMULACAO - NAO TRANSFERIR', 'Cabo Verde', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `dados_recebimento` WHERE usuario_id=@seed_mar);

INSERT INTO `dados_recebimento` (`usuario_id`, `titular`, `iban`, `banco`, `pais`, `confirmado`)
SELECT @seed_carlos, 'Carlos Silva', 'TESTE-NAO-TRANSFERIR-04', 'SIMULACAO - NAO TRANSFERIR', 'Cabo Verde', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `dados_recebimento` WHERE usuario_id=@seed_carlos);

INSERT INTO `alojamentos` (`proprietario_id`, `titulo`, `slug`, `localizacao`, `cidade`, `preco_noite`, `status`)
SELECT @seed_ana, 'Casa Tarrafal', 'seed-repasses-casa-tarrafal', 'Tarrafal', 'Tarrafal', 10000, 'pendente'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `alojamentos` WHERE slug='seed-repasses-casa-tarrafal');

SET @seed_aloj = (SELECT id FROM alojamentos WHERE slug='seed-repasses-casa-tarrafal' AND proprietario_id=@seed_ana LIMIT 1);

INSERT INTO `carros` (`usuario_id`, `titulo`, `marca`, `modelo`, `lugares`, `slug`, `localizacao`, `cidade`, `ilha`, `preco_dia`, `imagem_url`, `data_levantamento`, `data_devolucao`, `status`, `status_carro`)
SELECT @seed_rent, 'Toyota Yaris', 'Toyota', 'Yaris', '5', 'seed-repasses-toyota-yaris', 'Praia', 'Praia', 'Santiago', 10000, '', SUBDATE(@seed_base,10), ADDDATE(@seed_base,10), 'indisponivel', 'pendente'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `carros` WHERE slug='seed-repasses-toyota-yaris');

SET @seed_carro = (SELECT id FROM carros WHERE slug='seed-repasses-toyota-yaris' AND usuario_id=@seed_rent LIMIT 1);

INSERT INTO `experiencias` (`usuario_id`, `titulo`, `slug`, `categoria`, `localizacao`, `cidade`, `preco`, `duracao`, `status`)
SELECT @seed_mar, 'Passeio de barco', 'seed-repasses-passeio-barco', 'cultural', 'Praia', 'Praia', 5000, '2 horas', 'pendente'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `experiencias` WHERE slug='seed-repasses-passeio-barco');

SET @seed_exp_mar = (SELECT id FROM experiencias WHERE slug='seed-repasses-passeio-barco' AND usuario_id=@seed_mar LIMIT 1);

INSERT INTO `experiencias` (`usuario_id`, `titulo`, `slug`, `categoria`, `localizacao`, `cidade`, `preco`, `duracao`, `status`)
SELECT @seed_carlos, 'Tour cultural', 'seed-repasses-tour-cultural', 'cultural', 'Praia', 'Praia', 3000, '2 horas', 'pendente'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `experiencias` WHERE slug='seed-repasses-tour-cultural');

SET @seed_exp_carlos = (SELECT id FROM experiencias WHERE slug='seed-repasses-tour-cultural' AND usuario_id=@seed_carlos LIMIT 1);

INSERT INTO `reservas_alojamento` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `alojamento_id`, `data_checkin`, `data_checkout`, `noites`, `quantidade_hospedes`)
SELECT @seed_cliente, 'MS-EXEMPLO-001', 'confirmada', 'pago', 10000, 1000.0, @seed_aloj, SUBDATE(@seed_base,1), ADDDATE(@seed_base,3), DATEDIFF(ADDDATE(@seed_base,3),SUBDATE(@seed_base,1)), 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_alojamento` WHERE codigo_reserva='MS-EXEMPLO-001');

SET @seed_r001 = (SELECT id FROM reservas_alojamento WHERE codigo_reserva='MS-EXEMPLO-001' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reserva_validacoes` (`categoria`, `reserva_id`, `codigo_reserva`, `validado_por`, `validado_em`)
SELECT 'alojamento', @seed_r001, 'MS-EXEMPLO-001', @seed_operador, CONCAT(SUBDATE(@seed_base,1),' 09:00:00')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reserva_validacoes` WHERE categoria='alojamento' AND reserva_id=@seed_r001);

INSERT INTO `reservas_carro` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `carro_id`, `data_levantamento`, `data_devolucao`, `dias`)
SELECT @seed_cliente, 'MS-EXEMPLO-002', 'concluida', 'pago', 10000, 1000.0, @seed_carro, SUBDATE(@seed_fim_atraso,1), @seed_fim_atraso, 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_carro` WHERE codigo_reserva='MS-EXEMPLO-002');

SET @seed_r002 = (SELECT id FROM reservas_carro WHERE codigo_reserva='MS-EXEMPLO-002' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reserva_validacoes` (`categoria`, `reserva_id`, `codigo_reserva`, `validado_por`, `validado_em`)
SELECT 'carro', @seed_r002, 'MS-EXEMPLO-002', @seed_operador, CONCAT(@seed_fim_atraso,' 09:00:00')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reserva_validacoes` WHERE categoria='carro' AND reserva_id=@seed_r002);

INSERT INTO `reservas_experiencia` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `experiencia_id`, `data_participacao`, `horario`, `quantidade_pessoas`)
SELECT @seed_cliente, 'MS-EXEMPLO-003', 'concluida', 'pago', 5000, 500.0, @seed_exp_mar, @seed_fim_hoje, '14:00', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_experiencia` WHERE codigo_reserva='MS-EXEMPLO-003');

SET @seed_r003 = (SELECT id FROM reservas_experiencia WHERE codigo_reserva='MS-EXEMPLO-003' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reserva_validacoes` (`categoria`, `reserva_id`, `codigo_reserva`, `validado_por`, `validado_em`)
SELECT 'experiencia', @seed_r003, 'MS-EXEMPLO-003', @seed_operador, CONCAT(@seed_fim_hoje,' 09:00:00')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reserva_validacoes` WHERE categoria='experiencia' AND reserva_id=@seed_r003);

INSERT INTO `reservas_experiencia` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `experiencia_id`, `data_participacao`, `horario`, `quantidade_pessoas`)
SELECT @seed_cliente, 'MS-EXEMPLO-004', 'confirmada', 'pago', 3000, 300.0, @seed_exp_carlos, SUBDATE(@seed_base,1), '14:00', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_experiencia` WHERE codigo_reserva='MS-EXEMPLO-004');

SET @seed_r004 = (SELECT id FROM reservas_experiencia WHERE codigo_reserva='MS-EXEMPLO-004' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reservas_alojamento` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `alojamento_id`, `data_checkin`, `data_checkout`, `noites`, `quantidade_hospedes`)
SELECT @seed_cliente, 'MS-EXEMPLO-005', 'concluida', 'pago', 10000, 1000.0, @seed_aloj, SUBDATE(@seed_base,11), SUBDATE(@seed_base,10), DATEDIFF(SUBDATE(@seed_base,10),SUBDATE(@seed_base,11)), 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_alojamento` WHERE codigo_reserva='MS-EXEMPLO-005');

SET @seed_r005 = (SELECT id FROM reservas_alojamento WHERE codigo_reserva='MS-EXEMPLO-005' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reserva_validacoes` (`categoria`, `reserva_id`, `codigo_reserva`, `validado_por`, `validado_em`)
SELECT 'alojamento', @seed_r005, 'MS-EXEMPLO-005', @seed_operador, CONCAT(SUBDATE(@seed_base,10),' 09:00:00')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reserva_validacoes` WHERE categoria='alojamento' AND reserva_id=@seed_r005);

INSERT INTO `reservas_carro` (`usuario_id`, `codigo_reserva`, `status`, `pagamento_status`, `preco_total`, `comissao`, `carro_id`, `data_levantamento`, `data_devolucao`, `dias`)
SELECT @seed_cliente, 'MS-EXEMPLO-006', 'concluida', 'pago', 10000, 1000.0, @seed_carro, SUBDATE(@seed_base,13), SUBDATE(@seed_base,12), 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reservas_carro` WHERE codigo_reserva='MS-EXEMPLO-006');

SET @seed_r006 = (SELECT id FROM reservas_carro WHERE codigo_reserva='MS-EXEMPLO-006' AND usuario_id=@seed_cliente LIMIT 1);

INSERT INTO `reserva_validacoes` (`categoria`, `reserva_id`, `codigo_reserva`, `validado_por`, `validado_em`)
SELECT 'carro', @seed_r006, 'MS-EXEMPLO-006', @seed_operador, CONCAT(SUBDATE(@seed_base,12),' 09:00:00')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `reserva_validacoes` WHERE categoria='carro' AND reserva_id=@seed_r006);

INSERT INTO `repasses` (`prestador_id`, `reserva_id`, `valor`, `metodo`, `iban_destino`, `comprovativo_url`, `registado_por`, `registado_em`, `observacoes`, `estado`)
SELECT @seed_ana, @seed_r005, 9000, 'transferencia', 'TESTE-NAO-TRANSFERIR', NULL, @seed_operador, CONCAT(@seed_base,' 10:00:00'), 'MS-REPASS-DEMO-V1:005', 'pago'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasses` WHERE observacoes='MS-REPASS-DEMO-V1:005' AND prestador_id=@seed_ana);

SET @seed_p005 = (SELECT id FROM repasses WHERE observacoes='MS-REPASS-DEMO-V1:005' AND prestador_id=@seed_ana ORDER BY id LIMIT 1);

INSERT INTO `repasse_itens` (`tipo`, `reserva_id`, `repasse_id`, `valor`)
SELECT 'alojamento', @seed_r005, @seed_p005, 9000
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasse_itens` WHERE tipo='alojamento' AND reserva_id=@seed_r005);

INSERT INTO `repasse_transferencias` (`repasse_id`, `tipo`, `reserva_id`, `data_transferencia`, `referencia`, `pedido_chave`)
SELECT @seed_p005, 'alojamento', @seed_r005, @seed_base, 'SIMULACAO-005', 'seed-repasses-v1-pedido-005'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasse_transferencias` WHERE repasse_id=@seed_p005);

INSERT INTO `repasses` (`prestador_id`, `reserva_id`, `valor`, `metodo`, `iban_destino`, `comprovativo_url`, `registado_por`, `registado_em`, `observacoes`, `estado`)
SELECT @seed_rent, @seed_r006, 9000, 'transferencia', 'TESTE-NAO-TRANSFERIR', NULL, @seed_operador, CONCAT(@seed_base,' 10:00:00'), 'MS-REPASS-DEMO-V1:006', 'pago'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasses` WHERE observacoes='MS-REPASS-DEMO-V1:006' AND prestador_id=@seed_rent);

SET @seed_p006 = (SELECT id FROM repasses WHERE observacoes='MS-REPASS-DEMO-V1:006' AND prestador_id=@seed_rent ORDER BY id LIMIT 1);

INSERT INTO `repasse_itens` (`tipo`, `reserva_id`, `repasse_id`, `valor`)
SELECT 'carro', @seed_r006, @seed_p006, 9000
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasse_itens` WHERE tipo='carro' AND reserva_id=@seed_r006);

INSERT INTO `repasse_transferencias` (`repasse_id`, `tipo`, `reserva_id`, `data_transferencia`, `referencia`, `pedido_chave`)
SELECT @seed_p006, 'carro', @seed_r006, @seed_base, 'SIMULACAO-006', 'seed-repasses-v1-pedido-006'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `repasse_transferencias` WHERE repasse_id=@seed_p006);

COMMIT;

SELECT 'Exemplos criados. Pesquise MS-EXEMPLO no painel e escolha Todos os periodos se necessario.' AS resultado;
