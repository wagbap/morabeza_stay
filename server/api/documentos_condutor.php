<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');header('Access-Control-Allow-Methods: POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: private, no-store');header('X-Content-Type-Options: nosniff');ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){http_response_code(405);exit;}
require_once __DIR__.'/carroStock.php';require_once __DIR__.'/carroDocumentos.php';require_once __DIR__.'/reserva-validacao.php';
try {
    $in=json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);$scope=$in['contexto']??'host';
    if(!in_array($scope,['host','admin'],true))throw new DomainException('Forbidden');
    $db=carroStockConexao();$uid=utilizadorReservaQR($db,$scope);
    $id=filter_var($in['reserva_id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);if(!$id)throw new DomainException('Forbidden');
    $s=$db->prepare('SELECT r.*,c.usuario_id AS proprietario_id FROM reservas_carro r INNER JOIN carros c ON c.id=r.carro_id WHERE r.id=?');$s->execute([$id]);$booking=$s->fetch(PDO::FETCH_ASSOC);
    if(!$booking || !carroDocumentoPodeAceder($booking,$scope,$uid))throw new DomainException('Forbidden');
    if(($in['acao']??'listar')==='listar') {
        $s=$db->prepare('SELECT d.id,d.tipo,d.mime FROM carro_documentos_condutor d INNER JOIN carro_documento_lotes l ON l.id=d.lote_id WHERE l.reserva_id=?');$s->execute([$id]);
        echo json_encode(['success'=>true,'documentos'=>$s->fetchAll(PDO::FETCH_ASSOC)],JSON_THROW_ON_ERROR);exit;
    }
    if(($in['acao']??'')!=='descarregar' || !preg_match('/^[a-f0-9]{32}$/D',$in['documento_id']??''))throw new DomainException('Forbidden');
    $s=$db->prepare('SELECT d.* FROM carro_documentos_condutor d INNER JOIN carro_documento_lotes l ON l.id=d.lote_id WHERE d.id=? AND l.reserva_id=?');$s->execute([$in['documento_id'],$id]);$doc=$s->fetch(PDO::FETCH_ASSOC);
    if(!$doc || !preg_match('/^[a-f0-9]{32}\.bin$/D',$doc['ficheiro']))throw new DomainException('Forbidden');
    $ext=['image/jpeg'=>'jpg','image/png'=>'png','application/pdf'=>'pdf'][$doc['mime']]??null;if(!$ext)throw new RuntimeException('Invalid metadata');
    $dir=carroDocumentosDiretorio();$path=realpath($dir.DIRECTORY_SEPARATOR.$doc['ficheiro']);
    if(!$path || realpath(dirname($path))!==realpath($dir) || !hash_equals($doc['sha256'],hash_file('sha256',$path)))throw new RuntimeException('Document unavailable');
    $db->prepare('INSERT INTO carro_documento_acessos(documento_id,utilizador_id,contexto,finalidade) VALUES(?,?,?,?)')->execute([$doc['id'],$uid,$scope,$scope==='host'?'Entrega do veículo':'Verificação administrativa']);
    header('Content-Type: '.$doc['mime']);header('Content-Disposition: attachment; filename="'.$doc['tipo'].'.'.$ext.'"');header('Content-Length: '.filesize($path));
    readfile($path);exit;
} catch(Throwable $e) {
    http_response_code($e instanceof DomainException?403:503);error_log('[driver-documents-read] '.get_class($e));echo json_encode(['success'=>false,'code'=>'DOCUMENT_ACCESS_UNAVAILABLE']);
}
