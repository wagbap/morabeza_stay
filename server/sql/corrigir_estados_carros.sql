-- Executar uma vez no phpMyAdmin da base de dados Morabeza Stay.
-- Corrige valores vazios deixados pelo endpoint antigo.
-- Mantém indisponibilidade e manutenção existentes.
UPDATE carros
SET status = 'disponivel'
WHERE status = '' OR status IS NULL;

-- Sem aprovação válida, o anúncio deve regressar à análise.
UPDATE carros
SET status_carro = 'pendente'
WHERE status_carro = '' OR status_carro IS NULL;

-- Valores iniciais para INSERTs que não enviem estes campos.
ALTER TABLE carros ALTER COLUMN status SET DEFAULT 'disponivel';
ALTER TABLE carros ALTER COLUMN status_carro SET DEFAULT 'pendente';

-- Confirmar o resultado.
SELECT id, titulo, status, status_carro FROM carros ORDER BY id DESC;
