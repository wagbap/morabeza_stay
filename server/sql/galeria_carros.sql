-- Ponto 9. Preserva ficheiros e registos; controla apenas a publicacao na galeria.
SET @c=(SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='carro_imagens' AND COLUMN_NAME='exibir_galeria');
SET @q=IF(@c=0,'ALTER TABLE carro_imagens ADD COLUMN exibir_galeria TINYINT(1) NOT NULL DEFAULT 1','SELECT 1');
PREPARE g FROM @q; EXECUTE g; DEALLOCATE PREPARE g;

-- Confirmada visualmente: captura da listagem, com o cartao do anuncio e interface do iPhone.
-- Guarda a origem e so atua sobre o registo exato observado na API publica.
CREATE TABLE IF NOT EXISTS carro_imagem_revisoes (
  imagem_id INT NOT NULL PRIMARY KEY,
  carro_id INT NOT NULL,
  caminho_url VARCHAR(500) NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  revisto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
START TRANSACTION;
INSERT IGNORE INTO carro_imagem_revisoes(imagem_id,carro_id,caminho_url,motivo)
SELECT id,carro_id,caminho_url,'Captura da listagem/cartao de anuncio; nao e fotografia do veiculo.'
FROM carro_imagens WHERE id=32 AND carro_id=24
AND caminho_url IN ('/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png','https://welovepalop.com/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png');
UPDATE carro_imagens SET exibir_galeria=0 WHERE id=32 AND carro_id=24
AND caminho_url IN ('/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png','https://welovepalop.com/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png');
COMMIT;
