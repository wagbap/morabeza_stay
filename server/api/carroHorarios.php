<?php
declare(strict_types=1);

function carroHora(string $hora): string {
    if (!preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::00)?$/D', $hora)) throw new InvalidArgumentException('Hora inválida.');
    return substr($hora,0,5);
}
function carroJanelas(array $carro): array {
    $a=carroHora((string)($carro['levantamento_hora_inicio'] ?? '08:00'));
    $b=carroHora((string)($carro['levantamento_hora_fim'] ?? '20:00'));
    $mesmo=(int)($carro['devolucao_mesmo_horario'] ?? 1);
    if(!in_array($mesmo,[0,1],true))throw new InvalidArgumentException('Horário de devolução inválido.');
    $c=$mesmo?$a:carroHora((string)($carro['devolucao_hora_inicio'] ?? ''));
    $d=$mesmo?$b:carroHora((string)($carro['devolucao_hora_fim'] ?? ''));
    if($a>$b || $c>$d)throw new InvalidArgumentException('O fim do intervalo deve ser igual ou posterior ao início.');
    return ['levantamento_hora_inicio'=>$a,'levantamento_hora_fim'=>$b,'devolucao_mesmo_horario'=>$mesmo,'devolucao_hora_inicio'=>$c,'devolucao_hora_fim'=>$d];
}
function carroHorariosValidar(array $janelas,string $levantamento,string $devolucao): array {
    $a=carroHora($levantamento);$b=carroHora($devolucao);
    if($a<$janelas['levantamento_hora_inicio'] || $a>$janelas['levantamento_hora_fim'] || $b<$janelas['devolucao_hora_inicio'] || $b>$janelas['devolucao_hora_fim'])throw new InvalidArgumentException('Escolha as horas dentro dos intervalos permitidos.');
    return array_replace($janelas,['hora_levantamento'=>$a,'hora_devolucao'=>$b]);
}
function carroHorariosLer(PDO $db,int $id): array {
    $s=$db->prepare('SELECT * FROM carros WHERE id=?');$s->execute([$id]);$carro=$s->fetch(PDO::FETCH_ASSOC);
    if(!$carro)throw new InvalidArgumentException('Veículo não encontrado.');
    return carroJanelas($carro);
}

/** Exact local civil time in Cabo Verde; no browser/UTC conversion. */
function carroInstante(string $data,?string $hora,bool $fim=false): string {
    if($hora!==null && preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/D',$hora))return $data.' '.$hora;
    return $data.' '.($hora!==null && $hora!==''?carroHora($hora).':00':($fim?'23:59:59':'00:00:00'));
}
