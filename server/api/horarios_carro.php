<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: no-store');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/carroStock.php';
try {
    $method=$_SERVER['REQUEST_METHOD']??'';if(!in_array($method,['GET','POST'],true)){http_response_code(405);exit;}
    $in=$method==='GET'?$_GET:json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);
    $id=filter_var($in['carro_id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);if(!$id)throw new InvalidArgumentException('Veículo inválido.');
    $db=carroStockConexao();
    if($method==='POST') {
        require_once __DIR__.'/reserva-validacao.php';$uid=utilizadorReservaQR($db,'host');
        $db->beginTransaction();$s=$db->prepare('SELECT id FROM carros WHERE id=? AND usuario_id=? FOR UPDATE');$s->execute([$id,$uid]);
        if(!$s->fetchColumn())throw new DomainException('Veículo não encontrado nesta conta.');
        if(($in['acao']??'listar')==='guardar') {
            $j=carroJanelas($in);
            $db->prepare('UPDATE carros SET levantamento_hora_inicio=?,levantamento_hora_fim=?,devolucao_mesmo_horario=?,devolucao_hora_inicio=?,devolucao_hora_fim=? WHERE id=?')->execute([...array_values($j),$id]);
        } elseif(($in['acao']??'listar')!=='listar')throw new InvalidArgumentException('Ação inválida.');
    } else {
        $s=$db->prepare("SELECT id FROM carros WHERE id=? AND status='disponivel' AND status_carro='aprovado'");$s->execute([$id]);
        if(!$s->fetchColumn())throw new DomainException('Veículo indisponível.');
    }
    $j=carroHorariosLer($db,$id);if($db->inTransaction())$db->commit();
    echo json_encode(['success'=>true,'horarios'=>$j],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch(Throwable $e) {
    if(isset($db)&&$db->inTransaction())$db->rollBack();http_response_code($e instanceof DomainException?403:($e instanceof InvalidArgumentException?422:503));
    error_log('[horarios-carro] '.$e->getMessage());echo json_encode(['success'=>false,'error'=>($e instanceof DomainException||$e instanceof InvalidArgumentException)?$e->getMessage():'Horários indisponíveis.'],JSON_UNESCAPED_UNICODE);
}
