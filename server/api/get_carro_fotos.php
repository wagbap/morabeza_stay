<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');header('Cache-Control: no-store');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/carroStock.php';require_once __DIR__.'/carroFotos.php';
try {
    if(($_SERVER['REQUEST_METHOD']??'')!=='GET'){http_response_code(405);exit;}
    $db=carroStockConexao();$id=filter_var($_GET['id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);$slug=trim((string)($_GET['slug']??''));
    if(!$id && $slug==='')throw new InvalidArgumentException('Veículo inválido.');
    $s=$db->prepare("SELECT id FROM carros WHERE status='disponivel' AND status_carro='aprovado' AND ".($id?'id=?':'slug=?'));
    $s->execute([$id?:$slug]);$id=$s->fetchColumn();
    if(!$id){http_response_code(404);echo json_encode(['success'=>false,'error'=>'Veículo não encontrado.']);exit;}
    echo json_encode(['success'=>true,'data'=>['id'=>(int)$id,'galeria_fonte'=>'carro_imagens','imagens'=>carroFotosPublicas($db,(int)$id)]],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch(Throwable $e) {
    error_log('[carro-fotos] '.$e->getMessage());http_response_code($e instanceof InvalidArgumentException?422:503);
    echo json_encode(['success'=>false,'error'=>'Não foi possível carregar as fotografias do veículo.'],JSON_UNESCAPED_UNICODE);
}
