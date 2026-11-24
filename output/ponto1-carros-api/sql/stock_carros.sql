-- Executar antes de publicar os endpoints do ponto 1. Não apaga dados.
-- Reservas antigas representam um carro por registo.
SET @existe_quantidade = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='reservas_carro' AND COLUMN_NAME='quantidade');
SET @alterar_stock = IF(@existe_quantidade=0,
  'ALTER TABLE reservas_carro ADD COLUMN quantidade INT UNSIGNED NOT NULL DEFAULT 1',
  'SELECT 1');
PREPARE alterar_stock FROM @alterar_stock;
EXECUTE alterar_stock;
DEALLOCATE PREPARE alterar_stock;

CREATE TABLE IF NOT EXISTS carro_stock_retencoes (
  token CHAR(64) NOT NULL PRIMARY KEY,
  carro_id INT NOT NULL,
  data_levantamento DATE NOT NULL,
  data_devolucao DATE NOT NULL,
  quantidade INT UNSIGNED NOT NULL,
  stripe_id VARCHAR(255) DEFAULT NULL,
  estado ENUM('ativa','consumida','libertada') NOT NULL DEFAULT 'ativa',
  expira_em DATETIME NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY stock_stripe (stripe_id),
  KEY stock_carro_periodo (carro_id,estado,data_levantamento,data_devolucao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
