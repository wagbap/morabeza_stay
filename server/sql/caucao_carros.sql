-- Ponto 2. Executar depois da migração stock_carros.sql do ponto 1.
-- Guarda as condições conhecidas antes do pagamento, sem cobrar a caução.
SET @existe_snapshot_caucao = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carro_stock_retencoes' AND COLUMN_NAME='caucao_json');
SET @alterar_caucao = IF(@existe_snapshot_caucao=0,
  'ALTER TABLE carro_stock_retencoes ADD COLUMN caucao_json LONGTEXT DEFAULT NULL',
  'SELECT 1');
PREPARE alterar_caucao FROM @alterar_caucao;
EXECUTE alterar_caucao;
DEALLOCATE PREPARE alterar_caucao;
