-- Executar depois de 007_agenda_experiencias.sql.
-- Guarda as opções do editor sem alterar sessões ou reservas existentes.
CREATE TABLE IF NOT EXISTS experiencia_configuracao_opcoes (
 configuracao_id INT NOT NULL PRIMARY KEY,
 opcoes_json TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Durações diferentes podem ter o mesmo início; a identidade é sessao_id.
-- A ligação da agenda mantém UNIQUE(configuracao_id,data,hora_inicio).
SET @agenda_tem_indice = (
 SELECT COUNT(*) FROM information_schema.statistics
 WHERE table_schema=DATABASE() AND table_name='experiencia_sessoes' AND index_name='uk_sessao'
);
SET @agenda_sql = IF(@agenda_tem_indice>0,
 'ALTER TABLE experiencia_sessoes DROP INDEX uk_sessao', 'SELECT 1');
PREPARE agenda_stmt FROM @agenda_sql;
EXECUTE agenda_stmt;
DEALLOCATE PREPARE agenda_stmt;

SET @agenda_tem_indice = (
 SELECT COUNT(*) FROM information_schema.statistics
 WHERE table_schema=DATABASE() AND table_name='experiencia_sessoes' AND index_name='idx_agenda_experiencia_data_hora'
);
SET @agenda_sql = IF(@agenda_tem_indice=0,
 'CREATE INDEX idx_agenda_experiencia_data_hora ON experiencia_sessoes(experiencia_id,data,hora_inicio)', 'SELECT 1');
PREPARE agenda_stmt FROM @agenda_sql;
EXECUTE agenda_stmt;
DEALLOCATE PREPARE agenda_stmt;
