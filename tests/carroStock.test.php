<?php
require_once __DIR__ . '/../server/api/carroStock.php';
function igualStock($esperado, $real, string $caso): void {
    if ($esperado !== $real) throw new RuntimeException("$caso: esperado $esperado, obtido $real");
    echo "OK $caso\n";
}
function unidadeStock(int $id, string $estado = 'disponivel'): array { return ['id'=>$id,'estado'=>$estado]; }
function reservaStock(string $a, string $b, int $qtd=1, string $status='confirmada', ?int $unidade=null): array {
    return ['data_levantamento'=>$a,'data_devolucao'=>$b,'quantidade'=>$qtd,'status'=>$status,'unidade_id'=>$unidade];
}
$a = '2026-11-10'; $b = '2026-11-15';
igualStock(0, calcularStockCarro([],[],[],$a,$b), 'sem unidades não inventa stock');
igualStock(0, calcularStockCarro([unidadeStock(1,'manutencao')],[],[],$a,$b), 'ID 24: única unidade em manutenção');
igualStock(0, calcularStockCarro([unidadeStock(1,'indisponivel')],[],[],$a,$b), 'unidade indisponível');
igualStock(1, calcularStockCarro([unidadeStock(1)],[],[],$a,$b), 'unidade operacional');
$frota = [unidadeStock(1),unidadeStock(2),unidadeStock(3)];
igualStock(1, calcularStockCarro($frota,[reservaStock($a,$b,2)],[],$a,$b), 'duas viaturas numa reserva');
igualStock(1, calcularStockCarro($frota,[reservaStock($a,'2026-11-13'),reservaStock('2026-11-12',$b)],[],$a,$b), 'pico de duas reservas sobrepostas');
igualStock(2, calcularStockCarro($frota,[reservaStock($a,'2026-11-12'),reservaStock('2026-11-12',$b)],[],$a,$b), 'reservas consecutivas não somam como simultâneas');
igualStock(3, calcularStockCarro($frota,[reservaStock('2026-11-01',$a),reservaStock($b,'2026-11-18')],[],$a,$b), 'datas nos limites não se sobrepõem');
igualStock(3, calcularStockCarro($frota,[reservaStock($a,$b,2,'cancelada'),reservaStock($a,$b,1,'concluida')],[],$a,$b), 'canceladas e concluídas não ocupam stock');
igualStock(2, calcularStockCarro($frota,[reservaStock($a,$b,1,'pendente')],[],$a,$b), 'reserva pendente desconta stock');
igualStock(0, calcularStockCarro([unidadeStock(1,'reservada')],[reservaStock($a,$b,1,'confirmada',1)],[],$a,$b), 'reservada é descontada pela reserva, sem dupla contagem');
igualStock(1, calcularStockCarro([unidadeStock(1,'reservada')],[reservaStock('2026-11-01',$a,1,'confirmada',1)],[],$a,$b), 'unidade reservada noutras datas volta a estar livre');
igualStock(0, calcularStockCarro([unidadeStock(1,'entregue')],[],[],$a,$b), 'estado automático sem reserva correspondente não liberta carro');
igualStock(0, calcularStockCarro([unidadeStock(1),unidadeStock(2)], [reservaStock($a,'2026-11-12',1,'confirmada',1),reservaStock('2026-11-12',$b,1,'confirmada',2)], [], $a, $b), 'a mesma matrícula tem de estar livre durante todo o período');
igualStock(0, calcularStockCarro([unidadeStock(1,'manutencao'),unidadeStock(2)],[reservaStock($a,$b,1,'confirmada',1)],[],$a,$b), 'manutenção não apaga compromissos já reservados');
$hold = ['data_levantamento'=>$a,'data_devolucao'=>$b,'quantidade'=>2];
igualStock(1, calcularStockCarro($frota,[],[$hold],$a,$b), 'retenção antes de pagar ocupa duas viaturas');
igualStock(0, calcularStockCarro($frota,[reservaStock($a,$b)],[$hold],$a,$b), 'reserva mais retenção esgotam a frota');
igualStock(0, calcularStockCarro([unidadeStock(1)],[reservaStock($a,$b,4)],[],$a,$b), 'stock nunca é negativo');
igualStock(0, calcularStockCarro([unidadeStock(1,'manutencao')],[],[],null,null), 'resumo sem datas também respeita manutenção');
foreach ([['2026-02-30',$b],[$a,$a],[$b,$a],[$a,null]] as [$inicio,$fim]) {
    try { carroPeriodoStock($inicio,$fim); throw new RuntimeException('Aceitou período inválido'); }
    catch (InvalidArgumentException $e) { echo "OK período inválido rejeitado\n"; }
}
