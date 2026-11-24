-- Executar na base de dados da API. As notificações são removidas na mesma
-- transação que o anúncio, independentemente de onde a eliminação ocorreu.
DELIMITER $$

DROP TRIGGER IF EXISTS ms_notif_alojamento_apagado$$
CREATE TRIGGER ms_notif_alojamento_apagado AFTER DELETE ON alojamentos
FOR EACH ROW
BEGIN
    DELETE FROM notificacoes_anfitriao WHERE tipo_anuncio = 'alojamento' AND anuncio_id = OLD.id;
END$$

DROP TRIGGER IF EXISTS ms_notif_carro_apagado$$
CREATE TRIGGER ms_notif_carro_apagado AFTER DELETE ON carros
FOR EACH ROW
BEGIN
    DELETE FROM notificacoes_anfitriao WHERE tipo_anuncio = 'carro' AND anuncio_id = OLD.id;
END$$

DROP TRIGGER IF EXISTS ms_notif_experiencia_apagada$$
CREATE TRIGGER ms_notif_experiencia_apagada AFTER DELETE ON experiencias
FOR EACH ROW
BEGIN
    DELETE FROM notificacoes_anfitriao WHERE tipo_anuncio = 'experiencia' AND anuncio_id = OLD.id;
END$$

DELIMITER ;

-- Limpar notificações de anúncios que já tinham sido apagados.
DELETE n FROM notificacoes_anfitriao n
LEFT JOIN alojamentos a ON n.tipo_anuncio = 'alojamento' AND a.id = n.anuncio_id
LEFT JOIN carros c ON n.tipo_anuncio = 'carro' AND c.id = n.anuncio_id
LEFT JOIN experiencias e ON n.tipo_anuncio = 'experiencia' AND e.id = n.anuncio_id
WHERE (n.tipo_anuncio = 'alojamento' AND a.id IS NULL)
   OR (n.tipo_anuncio = 'carro' AND c.id IS NULL)
   OR (n.tipo_anuncio = 'experiencia' AND e.id IS NULL);
