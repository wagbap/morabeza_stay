<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: no-store');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/carroCalendario.php';
try {
    $method=$_SERVER['REQUEST_METHOD']??'';if(!in_array($method,['GET','POST'],true)){http_response_code(405);exit;}
    $in=$method==='GET'?$_GET:json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);
    $id=filter_var($in['carro_id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);if(!$id)throw new InvalidArgumentException('Veículo inválido.');
    $db=carroStockConexao();$host=$method==='POST';
    if($host) {require_once __DIR__.'/reserva-validacao.php';$uid=utilizadorReservaQR($db,'host');}
    $db->beginTransaction();$db->prepare('SELECT id FROM carros WHERE id=? FOR UPDATE')->execute([$id]);
    if($host)carroCalendarioProprietario($db,$id,$uid);
    $s=$db->prepare("SELECT 1 FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa' AND expira_em<=UTC_TIMESTAMP() LIMIT 1");$s->execute([$id]);
    if($s->fetchColumn())carroLibertarRetencoesExpiradas($db,$id,carroStripeCliente());
    if($host && ($in['acao']??'listar')!=='listar')carroCalendarioGuardar($db,$id,$uid,(int)($in['unidade_id']??0),$in['datas']??[],$in['acao'],(string)($in['motivo']??''));
    $inicio=(string)($in['inicio']??'');$fim=(string)($in['fim']??'');carroCalendarioDias($inicio,$fim);
    if($host) {
        $s=$db->prepare('SELECT id,matricula,estado,motivo_bloqueio FROM veiculos_unidades WHERE carro_id=? ORDER BY id');$s->execute([$id]);$units=$s->fetchAll(PDO::FETCH_ASSOC);
        $s=$db->prepare('SELECT b.unidade_id,b.data,b.motivo FROM carro_unidade_bloqueios b INNER JOIN veiculos_unidades u ON u.id=b.unidade_id WHERE u.carro_id=? AND b.data>=? AND b.data<?');$s->execute([$id,$inicio,$fim]);$blocks=$s->fetchAll(PDO::FETCH_ASSOC);
        $s=$db->prepare("SELECT unidade_id,data_levantamento,data_devolucao,hora_levantamento,hora_devolucao FROM reservas_carro WHERE carro_id=? AND status IN ('pendente','confirmada') AND data_levantamento<? AND data_devolucao>=?");$s->execute([$id,$fim,$inicio]);
        $out=['unidades'=>$units,'bloqueios'=>$blocks,'reservas'=>$s->fetchAll(PDO::FETCH_ASSOC)];
    } else $out=['dias'=>carroCalendarioPublico($db,$id,$inicio,$fim,empty($in['levantamento'])?null:(string)$in['levantamento'],(int)($in['quantidade']??1))];
    $db->commit();echo json_encode(['success'=>true]+$out,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch(Throwable $e) {
    if(isset($db)&&$db->inTransaction())$db->rollBack();
    http_response_code($e instanceof DomainException?409:($e instanceof InvalidArgumentException?422:503));
    error_log('[calendario-carro] '.$e->getMessage());echo json_encode(['success'=>false,'error'=>($e instanceof DomainException||$e instanceof InvalidArgumentException)?$e->getMessage():'Calendário indisponível.'],JSON_UNESCAPED_UNICODE);
}
