-- Hist?rico administrativo; n?o valida QR nem altera reservas.
CREATE TABLE IF NOT EXISTS repasse_revisoes (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 tipo VARCHAR(20) NOT NULL, reserva_id INT NOT NULL,
 resultado VARCHAR(20) NOT NULL, motivo TEXT NOT NULL,
 mensagem TEXT NOT NULL, evidencia_url TEXT NULL,
 proxima_revisao DATE NULL, administrador_id INT NOT NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY idx_reserva (tipo,reserva_id,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
