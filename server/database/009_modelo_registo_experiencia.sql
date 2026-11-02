-- Executar depois das migrações 007 e 008. Não altera os ENUM existentes.
CREATE TABLE IF NOT EXISTS experiencia_modelos (
 experiencia_id INT NOT NULL PRIMARY KEY,
 modelo_reserva VARCHAR(32) NOT NULL,
 equipamento_nome VARCHAR(150) NULL,
 quantidade_equipamentos INT NULL,
 pessoas_por_equipamento INT NULL,
 recurso_id INT NULL,
 atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY modelo_recurso (recurso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
