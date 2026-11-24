-- Ponto 4: executar antes de publicar a API. Preserva reservas antigas sem hora de devolucao.
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carros' AND COLUMN_NAME='devolucao_mesmo_horario');
SET @q = IF(@c=0,'ALTER TABLE carros ADD COLUMN devolucao_mesmo_horario TINYINT(1) NOT NULL DEFAULT 1','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carros' AND COLUMN_NAME='devolucao_hora_inicio');
SET @q = IF(@c=0,'ALTER TABLE carros ADD COLUMN devolucao_hora_inicio TIME NULL','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carros' AND COLUMN_NAME='devolucao_hora_fim');
SET @q = IF(@c=0,'ALTER TABLE carros ADD COLUMN devolucao_hora_fim TIME NULL','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='reservas_carro' AND COLUMN_NAME='hora_devolucao');
SET @q = IF(@c=0,'ALTER TABLE reservas_carro ADD COLUMN hora_devolucao TIME NULL','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carro_stock_retencoes' AND COLUMN_NAME='hora_levantamento');
SET @q = IF(@c=0,'ALTER TABLE carro_stock_retencoes ADD COLUMN hora_levantamento TIME NULL','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carro_stock_retencoes' AND COLUMN_NAME='hora_devolucao');
SET @q = IF(@c=0,'ALTER TABLE carro_stock_retencoes ADD COLUMN hora_devolucao TIME NULL','SELECT 1');
PREPARE h FROM @q; EXECUTE h; DEALLOCATE PREPARE h;
