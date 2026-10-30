-- Correcao para quem ja instalou 001_notificacoes_contexto.sql.
-- A coluna real de experiencias e imagem_principal. Preserva todos os avisos.
-- Executar o ficheiro completo no phpMyAdmin. Recria apenas seis triggers.
DELIMITER $$

DROP TRIGGER IF EXISTS ms_notif_experiencia_novo$$
CREATE TRIGGER ms_notif_experiencia_novo AFTER INSERT ON experiencias
FOR EACH ROW
BEGIN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT a.usuario_id,'anuncio','Anúncio registado','O teu anúncio foi registado.',a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NULL,NULL,CONCAT('anuncio:experiencia:',NEW.id,':novo')
    FROM experiencias a WHERE a.id=NEW.id AND a.usuario_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END$$

DROP TRIGGER IF EXISTS ms_notif_experiencia_estado$$
CREATE TRIGGER ms_notif_experiencia_estado AFTER UPDATE ON experiencias
FOR EACH ROW
BEGIN
IF NOT (OLD.status <=> NEW.status) THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT a.usuario_id,'anuncio',CASE NEW.status WHEN 'aprovado' THEN 'Anúncio aprovado' WHEN 'rejeitado' THEN 'Anúncio rejeitado' ELSE 'Anúncio em análise' END,CASE NEW.status WHEN 'aprovado' THEN 'O teu anúncio foi aprovado.' WHEN 'rejeitado' THEN CONCAT('O teu anúncio foi rejeitado. ',COALESCE(NEW.motivo_rejeicao,'')) ELSE 'O teu anúncio voltou para análise.' END,a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NULL,NULL,CONCAT('anuncio:experiencia:',NEW.id,':',UUID())
    FROM experiencias a WHERE a.id=NEW.id AND a.usuario_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END IF;
END$$

DROP TRIGGER IF EXISTS ms_notif_experiencia_reserva$$
CREATE TRIGGER ms_notif_experiencia_reserva AFTER INSERT ON reservas_experiencia
FOR EACH ROW
BEGIN
IF NEW.usuario_id>0 AND COALESCE(NEW.status,'')<>'bloqueado' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT a.usuario_id,'reserva','Novo pedido de reserva','Recebeste uma nova reserva para este anúncio.',a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NEW.id,NULL,CONCAT('reserva:experiencia:',NEW.id,':nova')
    FROM experiencias a WHERE a.id=NEW.experiencia_id AND a.usuario_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END IF;
END$$

DROP TRIGGER IF EXISTS ms_notif_experiencia_reserva_estado$$
CREATE TRIGGER ms_notif_experiencia_reserva_estado AFTER UPDATE ON reservas_experiencia
FOR EACH ROW
BEGIN
IF NEW.usuario_id>0 AND COALESCE(NEW.status,'')<>'bloqueado' AND (NOT (OLD.status <=> NEW.status) OR NOT (OLD.pagamento_status <=> NEW.pagamento_status)) THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT a.usuario_id,'reserva','Reserva atualizada',CONCAT('Estado: ',COALESCE(NEW.status,'pendente'),'. Pagamento: ',COALESCE(NEW.pagamento_status,'aguardando'),'.'),a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NEW.id,NULL,CONCAT('reserva:experiencia:',NEW.id,':',UUID())
    FROM experiencias a WHERE a.id=NEW.experiencia_id AND a.usuario_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END IF;
END$$

DROP TRIGGER IF EXISTS ms_notif_documento_novo$$
CREATE TRIGGER ms_notif_documento_novo AFTER INSERT ON pedidos_documentos
FOR EACH ROW
BEGIN
IF NEW.anuncio_tipo='alojamento' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'alojamento',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM alojamento_imagens g WHERE g.alojamento_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_url),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':novo')
    FROM alojamentos a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
ELSEIF NEW.anuncio_tipo='carro' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'carro',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM carro_imagens g WHERE g.carro_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_url),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':novo')
    FROM carros a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
ELSEIF NEW.anuncio_tipo='experiencia' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':novo')
    FROM experiencias a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END IF;
END$$

DROP TRIGGER IF EXISTS ms_notif_documento_estado$$
CREATE TRIGGER ms_notif_documento_estado AFTER UPDATE ON pedidos_documentos
FOR EACH ROW
BEGIN
IF NOT (OLD.estado <=> NEW.estado) THEN
IF NEW.anuncio_tipo='alojamento' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'alojamento',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM alojamento_imagens g WHERE g.alojamento_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_url),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':',UUID())
    FROM alojamentos a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
ELSEIF NEW.anuncio_tipo='carro' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'carro',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM carro_imagens g WHERE g.carro_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_url),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':',UUID())
    FROM carros a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
ELSEIF NEW.anuncio_tipo='experiencia' THEN
INSERT INTO notificacoes_anfitriao
        (usuario_id,tipo,titulo,mensagem,anuncio_id,tipo_anuncio,anuncio_titulo,anuncio_imagem,reserva_id,pedido_id,evento_chave)
    SELECT NEW.prestador_id,'documento',CASE NEW.estado WHEN 'pendente' THEN 'Documento solicitado' WHEN 'enviado' THEN 'Documento enviado' WHEN 'aprovado' THEN 'Documento aprovado' WHEN 'rejeitado' THEN 'Documento rejeitado' ELSE 'Pedido de documento atualizado' END,CONCAT('Documento: ',NEW.tipo_documento,'. Estado: ',NEW.estado,'.', CASE WHEN NEW.estado='rejeitado' THEN CONCAT(' ',COALESCE(NEW.motivo_rejeicao,'')) WHEN NEW.estado='pendente' THEN CONCAT(' Prazo: ',COALESCE(CAST(NEW.prazo AS CHAR),''),'. ',COALESCE(NEW.motivo,'')) ELSE '' END),a.id,'experiencia',a.titulo,COALESCE((SELECT NULLIF(TRIM(g.caminho_url),'') FROM experiencia_imagens g WHERE g.experiencia_id=a.id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),NULLIF(TRIM(a.imagem_principal),''),''),NULL,NEW.id,CONCAT('documento:',NEW.id,':',UUID())
    FROM experiencias a WHERE a.id=NEW.anuncio_id AND NEW.prestador_id>0
    ON DUPLICATE KEY UPDATE id=notificacoes_anfitriao.id;
END IF;
END IF;
END$$

DELIMITER ;
