-- Diagnostico somente de leitura. Reproduz os filtros do PHP fornecido.
-- Nao altera reservas nem repasses.
SELECT
    u.id AS prestador_id,
    u.nome,
    ROUND(COALESCE(s.bruto, 0), 2) AS bruto_elegivel_no_php_atual,
    ROUND(COALESCE(s.bruto, 0) * 0.90, 2) AS liquido_calculado,
    COALESCE(p.pago, 0) AS repasses_ja_pagos,
    ROUND(COALESCE(s.bruto, 0) * 0.90 - COALESCE(p.pago, 0), 2) AS diferenca_antes_do_max_zero,
    GREATEST(0, ROUND(COALESCE(s.bruto, 0) * 0.90 - COALESCE(p.pago, 0), 2)) AS disponivel,
    COALESCE(s.quantidade, 0) AS reservas_aceites
FROM usuarios u
LEFT JOIN (
    SELECT prestador_id, SUM(preco_total) AS bruto, COUNT(*) AS quantidade
    FROM (
        SELECT a.proprietario_id AS prestador_id, r.preco_total, r.status
        FROM reservas_alojamento r JOIN alojamentos a ON a.id = r.alojamento_id
        UNION ALL
        SELECT c.usuario_id, r.preco_total, r.status
        FROM reservas_carro r JOIN carros c ON c.id = r.carro_id
        UNION ALL
        SELECT e.usuario_id, r.preco_total, r.status
        FROM reservas_experiencia r JOIN experiencias e ON e.id = r.experiencia_id
    ) reservas
    WHERE LOWER(status) IN ('confirmada', 'concluida', 'finalizada', 'completed', 'pago', 'aprovada')
    GROUP BY prestador_id
) s ON s.prestador_id = u.id
LEFT JOIN (
    SELECT prestador_id, SUM(valor) AS pago
    FROM repasses WHERE estado = 'pago' GROUP BY prestador_id
) p ON p.prestador_id = u.id
WHERE s.prestador_id IS NOT NULL OR p.prestador_id IS NOT NULL
ORDER BY u.id;

-- Reservas recentes: confirma o estado, o pagamento e o dono do anuncio.
SELECT r.id, r.codigo_reserva, r.status, r.pagamento_status,
       r.preco_total, r.data_checkout, r.is_bloqueio,
       a.id AS alojamento_id, a.proprietario_id AS prestador_id, u.nome
FROM reservas_alojamento r
JOIN alojamentos a ON a.id = r.alojamento_id
LEFT JOIN usuarios u ON u.id = a.proprietario_id
ORDER BY r.id DESC
LIMIT 20;
