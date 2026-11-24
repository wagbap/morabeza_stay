<?php
declare(strict_types=1);
require_once __DIR__.'/carroStripeStock.php';

function carroCalendarioDias(string $inicio,string $fim,int $max=62): array {
    carroPeriodoStock($inicio,$fim);$days=[];
    for($d=new DateTimeImmutable($inicio);$d->format('Y-m-d')<$fim;$d=$d->modify('+1 day')) {
        if(count($days)>=$max) throw new InvalidArgumentException('Período demasiado longo.');
        $days[]=$d->format('Y-m-d');
    }
    return $days;
}
function carroCalendarioPublico(PDO $db,int $id,string $inicio,string $fim,?string $levantamento,int $quantidade): array {
    $days=carroCalendarioDias($inicio,$fim);
    if($levantamento!==null) {carroDataStock($levantamento);if(abs((new DateTimeImmutable($levantamento))->diff(new DateTimeImmutable($fim))->days)>730)throw new InvalidArgumentException('Período demasiado longo.');}
    if($quantidade<1 || $quantidade>100)throw new InvalidArgumentException('Quantidade inválida.');
    $result=[];$snapshot=carroStockSnapshot($db,$id);
    $stock=static fn($a,$b)=>calcularStockCarro($snapshot['unidades'],$snapshot['reservas'],$snapshot['retencoes'],$a,$b,$snapshot['bloqueios']);
    foreach($days as $date) {
        $next=(new DateTimeImmutable($date))->modify('+1 day')->format('Y-m-d');
        $free=$stock($date,$next);
        $result[$date]=['levantamento'=>$free>=$quantidade,'devolucao'=>$levantamento!==null && $date>$levantamento
            ?$stock($levantamento,$date)>=$quantidade:false];
    }
    return $result;
}
function carroCalendarioProprietario(PDO $db,int $id,int $uid): void {
    $s=$db->prepare('SELECT id FROM carros WHERE id=? AND usuario_id=? FOR UPDATE');$s->execute([$id,$uid]);
    if(!$s->fetchColumn())throw new DomainException('Veículo não encontrado nesta conta.');
}
function carroCalendarioGuardar(PDO $db,int $id,int $uid,int $unidade,array $datas,string $acao,string $motivo): void {
    if(!$db->inTransaction())throw new RuntimeException('Transação necessária.');
    carroCalendarioProprietario($db,$id,$uid);
    $s=$db->prepare('SELECT id,estado FROM veiculos_unidades WHERE id=? AND carro_id=? FOR UPDATE');$s->execute([$unidade,$id]);$unit=$s->fetch(PDO::FETCH_ASSOC);
    if(!$unit || !in_array($acao,['bloquear','desbloquear'],true) || !$datas || count($datas)>366)throw new InvalidArgumentException('Pedido inválido.');
    $motivo=trim($motivo);$length=preg_match_all('/./us',$motivo);
    if($acao==='bloquear' && ($length===false || $length<3 || $length>200))throw new InvalidArgumentException('Indique um motivo entre 3 e 200 caracteres.');
    $today=(new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    foreach(array_unique($datas) as $date) {
        carroDataStock($date);if($date<$today)throw new InvalidArgumentException('Não pode alterar dias passados.');
        if($acao==='bloquear') {
            $s=$db->prepare('SELECT * FROM reservas_carro WHERE carro_id=? AND unidade_id=? AND status IN (\'pendente\',\'confirmada\') AND data_levantamento<=? AND data_devolucao>=?');$s->execute([$id,$unidade,$date,$date]);
            foreach($s->fetchAll(PDO::FETCH_ASSOC) as $r) {
                if(carroInstante($r['data_devolucao'],$r['hora_devolucao']??null,true)>$date.' 00:00:00')throw new DomainException('A unidade já tem uma reserva neste período.');
            }
            $s=$db->prepare('SELECT 1 FROM carro_unidade_bloqueios WHERE unidade_id=? AND data=?');$s->execute([$unidade,$date]);$exists=(bool)$s->fetchColumn();
            $next=(new DateTimeImmutable($date))->modify('+1 day')->format('Y-m-d');
            if(!$exists && in_array($unit['estado'],['disponivel','reservada','entregue'],true) && carroStockLer($db,$id,$date,$next,true,null,true,'00:00','00:00')['quantidade_disponivel']<1)throw new DomainException('Este bloqueio entraria em conflito com uma reserva ou pagamento em curso.');
            if($exists)$db->prepare('UPDATE carro_unidade_bloqueios SET motivo=?,criado_por=? WHERE unidade_id=? AND data=?')->execute([$motivo,$uid,$unidade,$date]);
            else $db->prepare('INSERT INTO carro_unidade_bloqueios(unidade_id,data,motivo,criado_por) VALUES(?,?,?,?)')->execute([$unidade,$date,$motivo,$uid]);
        } else $db->prepare('DELETE FROM carro_unidade_bloqueios WHERE unidade_id=? AND data=?')->execute([$unidade,$date]);
    }
    if($acao==='bloquear') {
        // Daily spare capacity alone cannot protect a multi-day unassigned booking.
        $snapshot=carroStockSnapshot($db,$id,true,null,true);
        foreach(array_merge($snapshot['reservas'],$snapshot['retencoes']) as $period) {
            if($period['data_devolucao']<min($datas) || $period['data_levantamento']>max($datas))continue;
            $preciso=!empty($period['hora_levantamento']) && !empty($period['hora_devolucao']);
            if(calcularStockCarro($snapshot['unidades'],$snapshot['reservas'],$snapshot['retencoes'],$period['data_levantamento'],$period['data_devolucao'],$snapshot['bloqueios'],true,$preciso?$period['hora_levantamento']:null,$preciso?$period['hora_devolucao']:null)<0)throw new DomainException('Este bloqueio impediria uma unidade de cumprir uma reserva ou pagamento em curso.');
        }
    }
}
