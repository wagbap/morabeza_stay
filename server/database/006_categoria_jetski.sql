-- Antes de executar, confirme a definição publicada:
SHOW COLUMNS FROM experiencias LIKE 'categoria';

-- Compatível com o ENUM do esquema de referência do projeto.
-- Se existirem outras categorias no servidor, inclua-as também neste ENUM.
-- Não altera a categoria dos anúncios existentes.
ALTER TABLE experiencias
  MODIFY COLUMN categoria ENUM('aventura','cultural','gastronomia','natureza','relax','jetski') NOT NULL;

-- Catálogo usado nas listagens/filtros; evita duplicar o slug.
INSERT INTO experiencia_categorias (nome, slug, icone, descricao, ordem, ativo)
SELECT 'Jet ski', 'jetski', 'Waves', 'Aventura na água com sessões e horários', 6, 1
WHERE NOT EXISTS (SELECT 1 FROM experiencia_categorias WHERE slug = 'jetski');

-- Só leitura: confirmar a alteração e consultar o anúncio mostrado no exemplo.
SHOW COLUMNS FROM experiencias LIKE 'categoria';
SELECT id, nome, slug, ativo FROM experiencia_categorias WHERE slug = 'jetski';
SELECT id, titulo, categoria FROM experiencias WHERE id = 15;
