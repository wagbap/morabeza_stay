USE `u303262922_morabeza_stay`;

-- Limpeza apenas dos exemplos isolados MS-EXEMPLO. Nao apaga pagamentos reais.

START TRANSACTION;

DELETE tr FROM repasse_transferencias tr JOIN repasses rp ON rp.id=tr.repasse_id WHERE rp.prestador_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE ri FROM repasse_itens ri JOIN repasses rp ON rp.id=ri.repasse_id WHERE rp.prestador_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM repasses WHERE prestador_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM repasse_confirmacoes WHERE tipo='alojamento' AND reserva_id IN (SELECT id FROM reservas_alojamento WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reserva_validacoes WHERE categoria='alojamento' AND reserva_id IN (SELECT id FROM reservas_alojamento WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reservas_alojamento WHERE id IN (SELECT id FROM (SELECT id FROM reservas_alojamento WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006')) AS exemplos);

DELETE FROM repasse_confirmacoes WHERE tipo='carro' AND reserva_id IN (SELECT id FROM reservas_carro WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reserva_validacoes WHERE categoria='carro' AND reserva_id IN (SELECT id FROM reservas_carro WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reservas_carro WHERE id IN (SELECT id FROM (SELECT id FROM reservas_carro WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006')) AS exemplos);

DELETE FROM repasse_confirmacoes WHERE tipo='experiencia' AND reserva_id IN (SELECT id FROM reservas_experiencia WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reserva_validacoes WHERE categoria='experiencia' AND reserva_id IN (SELECT id FROM reservas_experiencia WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006'));

DELETE FROM reservas_experiencia WHERE id IN (SELECT id FROM (SELECT id FROM reservas_experiencia WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0) AND codigo_reserva IN ('MS-EXEMPLO-001','MS-EXEMPLO-002','MS-EXEMPLO-003','MS-EXEMPLO-004','MS-EXEMPLO-005','MS-EXEMPLO-006')) AS exemplos);

SET @seed_cleanup_sql = IF(EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notificacoes_anfitriao'), 'DELETE FROM notificacoes_anfitriao WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN (''seed-repasses-ana@example.invalid'', ''seed-repasses-rent@example.invalid'', ''seed-repasses-mar@example.invalid'', ''seed-repasses-carlos@example.invalid'', ''seed-repasses-cliente@example.invalid'', ''seed-repasses-operador@example.invalid'') AND category=''simulacao'' AND ativo=0)', 'SELECT 1');

PREPARE seed_cleanup FROM @seed_cleanup_sql;

EXECUTE seed_cleanup;

DEALLOCATE PREPARE seed_cleanup;

SET @seed_cleanup_sql = IF(EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notificacoes'), 'DELETE FROM notificacoes WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN (''seed-repasses-ana@example.invalid'', ''seed-repasses-rent@example.invalid'', ''seed-repasses-mar@example.invalid'', ''seed-repasses-carlos@example.invalid'', ''seed-repasses-cliente@example.invalid'', ''seed-repasses-operador@example.invalid'') AND category=''simulacao'' AND ativo=0)', 'SELECT 1');

PREPARE seed_cleanup FROM @seed_cleanup_sql;

EXECUTE seed_cleanup;

DEALLOCATE PREPARE seed_cleanup;

DELETE FROM dados_recebimento WHERE usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM alojamentos WHERE slug='seed-repasses-casa-tarrafal' AND proprietario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM carros WHERE slug='seed-repasses-toyota-yaris' AND usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM experiencias WHERE slug IN ('seed-repasses-passeio-barco','seed-repasses-tour-cultural') AND usuario_id IN (SELECT id FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid') AND category='simulacao' AND ativo=0);

DELETE FROM usuarios WHERE email IN ('seed-repasses-ana@example.invalid', 'seed-repasses-rent@example.invalid', 'seed-repasses-mar@example.invalid', 'seed-repasses-carlos@example.invalid', 'seed-repasses-cliente@example.invalid', 'seed-repasses-operador@example.invalid') AND category='simulacao' AND ativo=0;

COMMIT;
