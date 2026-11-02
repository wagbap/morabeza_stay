-- Nova agenda. Não apaga sessões, reservas, retenções ou pagamentos existentes.
CREATE TABLE IF NOT EXISTS experiencia_agendas (
 experiencia_id INT NOT NULL PRIMARY KEY,
 dias_json TEXT NOT NULL, repeticao VARCHAR(20) NOT NULL DEFAULT 'semanal',
 inicio DATE NOT NULL, fim DATE NULL, minima_horas INT NOT NULL DEFAULT 24,
 maxima_dias INT NOT NULL DEFAULT 180, pausado TINYINT NOT NULL DEFAULT 0, materializado_em DATE NULL,
 atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS experiencia_configuracoes (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, experiencia_id INT NOT NULL,
 nome VARCHAR(150) NOT NULL, duracao_minutos INT NOT NULL,
 preco DECIMAL(12,2) NOT NULL, capacidade INT NOT NULL,
 unidade VARCHAR(20) NOT NULL DEFAULT 'participante',
 horarios_json TEXT NOT NULL, recursos_json TEXT NOT NULL,
 ativo TINYINT NOT NULL DEFAULT 1, atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY exp_config (experiencia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS experiencia_agenda_sessoes (
 sessao_id INT NOT NULL PRIMARY KEY, configuracao_id INT NOT NULL,
 data DATE NOT NULL, hora_inicio TIME NOT NULL,
 UNIQUE KEY configuracao_dia_hora (configuracao_id,data,hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS experiencia_agenda_excecoes (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, experiencia_id INT NOT NULL,
 inicio DATE NOT NULL, fim DATE NOT NULL, tipo VARCHAR(20) NOT NULL,
 motivo VARCHAR(255) NOT NULL, KEY exp_excecoes (experiencia_id,inicio,fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS experiencia_agenda_recursos (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, experiencia_id INT NOT NULL,
 nome VARCHAR(150) NOT NULL, tipo VARCHAR(20) NOT NULL, quantidade INT NOT NULL,
 manutencoes_json TEXT NOT NULL, ativo TINYINT NOT NULL DEFAULT 1,
 KEY exp_recursos (experiencia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS experiencia_agenda_historico (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, experiencia_id INT NOT NULL,
 usuario_id INT NOT NULL, acao VARCHAR(50) NOT NULL, detalhes_json TEXT NOT NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY exp_historico (experiencia_id,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
