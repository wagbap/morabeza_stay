-- Executar uma vez antes de publicar a nova pagina de repasses.
-- Nao apaga nem distribui automaticamente os pagamentos antigos.
CREATE TABLE IF NOT EXISTS repasse_itens (
  tipo VARCHAR(20) NOT NULL,
  reserva_id INT NOT NULL,
  repasse_id INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (tipo, reserva_id),
  KEY idx_repasse (repasse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repasse_confirmacoes (
  tipo VARCHAR(20) NOT NULL,
  reserva_id INT NOT NULL,
  confirmado_por INT NOT NULL,
  confirmado_em DATETIME NOT NULL,
  motivo VARCHAR(500) NOT NULL,
  PRIMARY KEY (tipo, reserva_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repasse_transferencias (
  repasse_id INT NOT NULL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,
  reserva_id INT NOT NULL,
  data_transferencia DATE NOT NULL,
  referencia VARCHAR(150) NOT NULL,
  pedido_chave VARCHAR(64) NOT NULL,
  UNIQUE KEY uk_pedido (pedido_chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
