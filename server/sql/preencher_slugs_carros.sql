-- Execute in the same database used by public_html/api/config.php.
-- Preview records which need slugs.
SELECT id, titulo, slug
FROM carros
WHERE (slug IS NULL OR TRIM(slug) = '')
  AND titulo IS NOT NULL AND TRIM(titulo) <> '';

-- Preserve existing links; generate a unique ID-based slug for missing ones.
UPDATE carros
SET slug = CONCAT(
  'carro-', id, '-',
  LOWER(REPLACE(REPLACE(REPLACE(TRIM(titulo), ' ', '-'), '/', '-'), '.', ''))
)
WHERE (slug IS NULL OR TRIM(slug) = '')
  AND titulo IS NOT NULL AND TRIM(titulo) <> '';

-- Diagnose the specific failing address without changing unrelated cars.
SELECT id, titulo, slug, status
FROM carros
WHERE slug = 'teste-carro-mvp-01'
   OR titulo LIKE '%MVP%'
   OR titulo LIKE '%gelson%';
