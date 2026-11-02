-- Somente leitura: identifica o processo que pode inserir repasses.
SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE, ACTION_TIMING,
       EVENT_MANIPULATION, ACTION_STATEMENT
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
  AND (LOWER(ACTION_STATEMENT) LIKE '%repasses%'
       OR EVENT_OBJECT_TABLE = 'repasses');

SELECT rp.id, rp.prestador_id, rp.reserva_id, rp.valor, rp.estado,
       rp.registado_em, rp.registado_por,
       u.nome AS nome_de_quem_registou,
       rp.observacoes,
       CASE WHEN NULLIF(TRIM(rp.comprovativo_url), '') IS NULL
            THEN 'Sem comprovativo' ELSE 'Com comprovativo' END AS comprovativo
FROM repasses rp
LEFT JOIN usuarios u ON u.id = rp.registado_por
ORDER BY rp.id DESC
LIMIT 15;
