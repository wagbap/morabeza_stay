CREATE TABLE IF NOT EXISTS carro_documento_lotes (
  id CHAR(32) PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  email VARCHAR(254) NOT NULL,
  carro_id INT NOT NULL,
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  token_stock CHAR(64) DEFAULT NULL,
  reserva_id INT DEFAULT NULL,
  expira_em DATETIME NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY documento_reserva (reserva_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS carro_documentos_condutor (
  id CHAR(32) PRIMARY KEY,
  lote_id CHAR(32) NOT NULL,
  tipo ENUM('carta_frente','carta_verso','identificacao') NOT NULL,
  ficheiro CHAR(36) NOT NULL,
  mime VARCHAR(32) NOT NULL,
  tamanho INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  UNIQUE KEY documento_tipo (lote_id,tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS carro_documento_acessos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  documento_id CHAR(32) NOT NULL,
  utilizador_id INT NOT NULL,
  contexto VARCHAR(10) NOT NULL,
  finalidade VARCHAR(100) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
