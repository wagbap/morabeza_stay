<?php
require_once __DIR__.'/../server/api/carroStock.php';
function horasCheck($ok,string $msg): void {if(!$ok)throw new RuntimeException($msg);echo "OK $msg\n";}
$j=carroJanelas(['levantamento_hora_inicio'=>'10:00:00','levantamento_hora_fim'=>'14:00:00']);
horasCheck($j['devolucao_hora_inicio']==='10:00' && $j['devolucao_hora_fim']==='14:00','same return window follows pickup');
$j=carroJanelas(['levantamento_hora_inicio'=>'10:00','levantamento_hora_fim'=>'14:00','devolucao_mesmo_horario'=>0,'devolucao_hora_inicio'=>'16:30','devolucao_hora_fim'=>'19:45']);
horasCheck(carroHorariosValidar($j,'10:00','19:45')['hora_devolucao']==='19:45','independent windows include boundary minutes');
foreach([['','18:00'],['09:59','18:00'],['14:01','18:00'],['10:00','16:29'],['10:00','19:46'],['10:00','25:00']] as [$a,$b]) {
 try{carroHorariosValidar($j,$a,$b);throw new RuntimeException('Invalid time accepted');}catch(InvalidArgumentException $e){horasCheck(true,'reject missing or outside-window time');}
}
try{carroJanelas(['levantamento_hora_inicio'=>'14:00','levantamento_hora_fim'=>'10:00']);throw new RuntimeException('Inverted window accepted');}catch(InvalidArgumentException $e){horasCheck(true,'reject inverted window');}
$u=[['id'=>1,'estado'=>'disponivel']];
$r=['status'=>'confirmada','unidade_id'=>1,'quantidade'=>1,'data_levantamento'=>'2026-11-10','data_devolucao'=>'2026-11-12','hora_levantamento'=>'11:00','hora_devolucao'=>'14:00'];
$stock=fn($a,$b,$rs=[])=>calcularStockCarro($u,$rs?:[$r],[],'2026-11-12','2026-11-14',[],false,$a,$b);
horasCheck($stock('13:59','18:00')===0,'pickup before previous return on same day is unavailable');
horasCheck($stock('14:00','18:00')===1,'pickup exactly at previous return is available');
horasCheck($stock('14:01','18:00')===1,'pickup after return is available');
$r['unidade_id']=null;
horasCheck($stock('13:59','18:00',[$r])===0 && $stock('14:00','18:00',[$r])===1,'unassigned reservations also use exact times');
$hold=$r;unset($hold['status']);
horasCheck(calcularStockCarro($u,[],[$hold],'2026-11-12','2026-11-14',[],false,'13:59','18:00')===0,'active payment holds block their exact times');
$r['hora_devolucao']=null;
horasCheck($stock('18:00','18:00',[$r])===0,'legacy unknown return time never invents 10:00 or frees early');
horasCheck(calcularStockCarro($u,[],[],'2026-11-12','2026-11-14',[['unidade_id'=>1,'data'=>'2026-11-14']],false,'11:00','18:00')===0,'full-day manual block includes return day until selected return time');
horasCheck(calcularStockCarro([['id'=>1,'estado'=>'manutencao']],[],[],'2026-11-12','2026-11-14',[],false,'11:00','18:00')===0,'exact hours cannot bypass maintenance');
