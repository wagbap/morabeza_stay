CREATE TABLE IF NOT EXISTS carro_unidade_bloqueios (
  unidade_id INT NOT NULL,
  data DATE NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  criado_por INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (unidade_id,data),
  KEY bloqueios_data (data,unidade_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
