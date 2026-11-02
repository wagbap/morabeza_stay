<?php
declare(strict_types=1);
require_once __DIR__.'/experiencia/modeloRegisto.php';

function agendaData($value): string {
    $d=is_string($value) ? DateTimeImmutable::createFromFormat('!Y-m-d',$value) : false;
    if (!$d || $d->format('Y-m-d')!==$value) throw new InvalidArgumentException('Data inválida.');
    return $value;
}
function agendaMinutos($value): int {
    if (!is_string($value) || !preg_match('/^(\d{2}):(\d{2})$/D',$value,$m) || (int)$m[1]>23 || (int)$m[2]>59) throw new InvalidArgumentException('Horário inválido.');
    return (int)$m[1]*60+(int)$m[2];
}
function agendaHora(int $minutes): string { return sprintf('%02d:%02d',intdiv($minutes,60),$minutes%60); }
function agendaIntervalos(array $config): array {
    $duration=(int)($config['duracao_minutos'] ?? 0);
    if ($duration<1 || $duration>1440) throw new InvalidArgumentException('A duração deve ser entre 1 e 1440 minutos.');
    $starts=$config['horarios'] ?? json_decode($config['horarios_json'] ?? '[]',true);
    if (!is_array($starts) || !$starts || count($starts)>96) throw new InvalidArgumentException('Adicione entre 1 e 96 saídas.');
    $options=json_decode($config['opcoes_json'] ?? '{}',true) ?: [];
    $prep=(int)($options['preparacao'] ?? 0);
    if($prep<0 || $prep>720)throw new InvalidArgumentException('Preparação inválida.');
    if(count(array_unique($starts))!==count($starts))throw new InvalidArgumentException('Existem horários repetidos.');
    $rows=[];
    foreach ($starts as $start) {
        $begin=agendaMinutos($start); $end=$begin+$duration;
        if ($end+$prep>=1440) throw new InvalidArgumentException('As saídas devem terminar antes da meia-noite.');
        $rows[]=['inicio'=>agendaHora($begin),'fim'=>agendaHora($end),'min_inicio'=>$begin,'min_fim'=>$end,'fim_ocupado'=>agendaHora($end+$prep),'min_fim_ocupado'=>$end+$prep];
    }
    usort($rows,static fn($a,$b)=>$a['min_inicio']<=>$b['min_inicio']);
    foreach ($rows as $i=>$r) if (($config['unidade'] ?? 'participante')!=='unidade' && $i && $r['min_inicio']<$rows[$i-1]['min_fim_ocupado']) throw new InvalidArgumentException('Existem saídas sobrepostas nesta configuração.');
    return $rows;
}
function agendaAberta(string $date,array $agenda,array $exceptions): bool {
    if (!empty($agenda['pausado']) || $date<$agenda['inicio'] || (!empty($agenda['fim']) && $date>$agenda['fim'])) return false;
    // The last matching exception is the most recent administrative decision.
    $override=null;
    foreach ($exceptions as $e) if ($date>=$e['inicio'] && $date<=$e['fim']) $override=$e['tipo']==='aberto';
    if ($override!==null) return $override;
    return in_array((int)(new DateTimeImmutable($date))->format('N'),json_decode($agenda['dias_json'],true) ?: [],true);
}
function agendaLivre(int $capacity,int $confirmed,int $pending,int $blocked): int {
    return max(0,$capacity-max(0,$confirmed)-max(0,$pending)-max(0,$blocked));
}
function agendaPico(string $inicio,string $fim,array $intervals): array {
    $events=[];
    foreach($intervals as $slot){
        $a=max($inicio,$slot['inicio']);$b=min($fim,$slot['fim']);
        if($a>=$b)continue;
        $kind=$slot['tipo'];$n=max(0,(int)$slot['quantidade']);
        $events[$a][$kind]=($events[$a][$kind] ?? 0)+$n;
        $events[$b][$kind]=($events[$b][$kind] ?? 0)-$n;
    }
    ksort($events);$current=['confirmados'=>0,'em_pagamento'=>0,'bloqueados'=>0];$peak=$current;$max=0;
    foreach($events as $changes){foreach($changes as $kind=>$delta)$current[$kind]+=$delta;$total=array_sum($current);if($total>$max){$max=$total;$peak=$current;}}
    return $peak;
}
function agendaLer(PDO $c,string $table,int $id): array {
    $allowed=['experiencia_configuracoes','experiencia_agenda_excecoes','experiencia_agenda_recursos'];
    if (!in_array($table,$allowed,true)) throw new InvalidArgumentException('Tabela inválida.');
    if($table==='experiencia_configuracoes') {
        try{$s=$c->prepare('SELECT c.*,o.opcoes_json FROM experiencia_configuracoes c LEFT JOIN experiencia_configuracao_opcoes o ON o.configuracao_id=c.id WHERE c.experiencia_id=? ORDER BY c.id');$s->execute([$id]);return $s->fetchAll(PDO::FETCH_ASSOC);}
        catch(PDOException $e){if($e->getCode()!=='42S02' && !str_contains($e->getMessage(),'no such table'))throw $e;}
    }
    $s=$c->prepare("SELECT * FROM $table WHERE experiencia_id=? ORDER BY id");$s->execute([$id]);return $s->fetchAll(PDO::FETCH_ASSOC);
}
final class AgendaConflitoSessoes extends InvalidArgumentException {
    public array $conflitos;
    public function __construct(array $conflitos) {
        parent::__construct('Existem sessões da gestão anterior nestes horários. Reveja a ligação antes de aplicar.');
        $this->conflitos=$conflitos;
    }
}

/** Identify legacy rows before any generation or update is performed. */
function agendaConflitosLegados(PDO $c,int $id,array $agenda,array $configs,array $exceptions,DateTimeImmutable $start,DateTimeImmutable $end): array {
    $s=$c->prepare('SELECT s.* FROM experiencia_sessoes s LEFT JOIN experiencia_agenda_sessoes l ON l.sessao_id=s.id WHERE s.experiencia_id=? AND s.data>=? AND s.data<=? AND l.sessao_id IS NULL ORDER BY s.data,s.hora_inicio,s.id');
    $s->execute([$id,$start->format('Y-m-d'),$end->format('Y-m-d')]);$legacy=$s->fetchAll(PDO::FETCH_ASSOC);$conflicts=[];
    foreach($legacy as $old){
        if(!agendaAberta($old['data'],$agenda,$exceptions))continue;
        foreach($configs as $config){
            if(!$config['ativo'])continue;
            foreach(agendaIntervalos($config) as $slot){
                if($slot['inicio']!==substr($old['hora_inicio'],0,5))continue;
                $p=$c->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND status='pendente' AND expira_em>?");$p->execute([$old['id'],date('Y-m-d H:i:s')]);$pending=(int)$p->fetchColumn();
                $b=$c->prepare("SELECT COUNT(*) AS total,COALESCE(SUM(r.quantidade_pessoas),0) AS pessoas FROM reservas_experiencia r WHERE r.experiencia_id=? AND r.data_participacao=? AND r.horario LIKE ? AND r.status IN ('confirmada','concluida') AND (NOT EXISTS(SELECT 1 FROM reservas_temporarias rt WHERE rt.reserva_id=r.id) OR EXISTS(SELECT 1 FROM reservas_temporarias rt WHERE rt.reserva_id=r.id AND rt.sessao_id=?))");$b->execute([$id,$old['data'],'%'.substr($old['hora_inicio'],0,5).'%',(int)$old['id']]);$booking=$b->fetch(PDO::FETCH_ASSOC);$booked=(int)$booking['total'];
                $occupied=max((int)$old['vagas_ocupadas'],(int)$booking['pessoas']);$hasBookings=$occupied>0 || $pending>0 || $booked>0;
        $options=json_decode($config['opcoes_json'] ?? '{}',true) ?: [];
                $compatible=!$hasBookings || ($config['unidade']==='participante' && substr($old['hora_fim'],0,5)===$slot['fim'] && (int)($options['preparacao'] ?? 0)===0);
                $conflicts[]=['id'=>(int)$old['id'],'configuracao_id'=>(int)$config['id'],'configuracao_nome'=>$config['nome'],'data'=>$old['data'],'hora_inicio'=>substr($old['hora_inicio'],0,5),'hora_fim'=>substr($old['hora_fim'],0,5),'novo_fim'=>$slot['fim'],'capacidade'=>(int)$old['capacidade_maxima'],'confirmados'=>$occupied,'reservas_confirmadas'=>$booked,'em_pagamento'=>$pending,'tem_reservas'=>$hasBookings,'pode_ligar'=>$compatible,'unidade_proposta'=>$config['unidade']];
            }
        }
    }
    // One legacy row cannot be claimed by two different configurations.
    $claims=array_count_values(array_column($conflicts,'id'));
    $targets=array_count_values(array_map(static fn($r)=>$r['configuracao_id'].':'.$r['data'].':'.$r['hora_inicio'],$conflicts));
    foreach($conflicts as &$row)if($claims[$row['id']]>1 || $targets[$row['configuracao_id'].':'.$row['data'].':'.$row['hora_inicio']]>1)$row['pode_ligar']=false;
    unset($row);return $conflicts;
}

function agendaMaterializar(PDO $c,int $id,array $ligarLegadas=[],array $apenasConfiguracoes=[]): array {
    $s=$c->prepare('SELECT * FROM experiencia_agendas WHERE experiencia_id=?');$s->execute([$id]);$agenda=$s->fetch(PDO::FETCH_ASSOC);
    if (!$agenda) return ['criadas'=>0,'preservadas'=>0];
    $configs=agendaLer($c,'experiencia_configuracoes',$id);
    $apenasConfiguracoes=array_map('intval',$apenasConfiguracoes);
    if($apenasConfiguracoes)$configs=array_values(array_filter($configs,static fn($cfg)=>in_array((int)$cfg['id'],$apenasConfiguracoes,true)));
    $exceptions=agendaLer($c,'experiencia_agenda_excecoes',$id);
    $start=new DateTimeImmutable('today',new DateTimeZone('Atlantic/Cape_Verde'));
    $end=$start->modify('+'.(int)$agenda['maxima_dias'].' days');
    $conflicts=agendaConflitosLegados($c,$id,$agenda,$configs,$exceptions,$start,$end);
    $allowed=array_map('intval',$ligarLegadas);
    foreach($conflicts as $conflict)if(!$conflict['pode_ligar'] || !in_array($conflict['id'],$allowed,true))throw new AgendaConflitoSessoes($conflicts);
    foreach($conflicts as $conflict){
        $link=$c->prepare('INSERT INTO experiencia_agenda_sessoes(sessao_id,configuracao_id,data,hora_inicio) VALUES(?,?,?,?)');$link->execute([$conflict['id'],$conflict['configuracao_id'],$conflict['data'],$conflict['hora_inicio']]);
        $sync=$c->prepare('UPDATE experiencia_sessoes SET reservas_pendentes=?,vagas_ocupadas=? WHERE id=?');$sync->execute([$conflict['em_pagamento'],$conflict['confirmados'],$conflict['id']]);
    }
    $s=$c->prepare('SELECT es.* , l.configuracao_id FROM experiencia_sessoes es INNER JOIN experiencia_agenda_sessoes l ON l.sessao_id=es.id WHERE es.experiencia_id=? AND es.data>=?');
    $s->execute([$id,$start->format('Y-m-d')]);$existing=[];
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $row) if(!$apenasConfiguracoes || in_array((int)$row['configuracao_id'],$apenasConfiguracoes,true))$existing[$row['configuracao_id'].':'.$row['data'].':'.substr($row['hora_inicio'],0,5)]=$row;
    $created=0;$kept=0;$wanted=[];
    foreach ($configs as $config) {
        if (!$config['ativo']) continue;
        $intervals=agendaIntervalos($config);
        for ($d=$start;$d<=$end;$d=$d->modify('+1 day')) {
            $date=$d->format('Y-m-d');if (!agendaAberta($date,$agenda,$exceptions)) continue;
            foreach ($intervals as $slot) {
                $key=$config['id'].':'.$date.':'.$slot['inicio'];$wanted[$key]=true;
                $period=$slot['min_inicio']<720 ? 'Manhã' : ($slot['min_inicio']<960 ? 'Meio dia' : 'Tarde');
                if (isset($existing[$key])) {
                    $old=$existing[$key];
                    if ((int)$old['vagas_ocupadas']>0 || (int)$old['reservas_pendentes']>0) { $u=$c->prepare('UPDATE experiencia_sessoes SET ativo=1 WHERE id=?');$u->execute([$old['id']]);$kept++; continue; }
                    $u=$c->prepare('UPDATE experiencia_sessoes SET hora_fim=?,periodo=?,capacidade_maxima=?,preco_especial=?,ativo=1 WHERE id=?');
                    $u->execute([$slot['fim'],$period,$config['capacidade'],$config['preco'],$old['id']]);
                } else {
                    $u=$c->prepare('INSERT INTO experiencia_sessoes(experiencia_id,data,hora_inicio,hora_fim,periodo,capacidade_maxima,preco_especial,ativo) VALUES(?,?,?,?,?,?,?,1)');
                    $u->execute([$id,$date,$slot['inicio'],$slot['fim'],$period,$config['capacidade'],$config['preco']]);$sid=(int)$c->lastInsertId();
                    $u=$c->prepare('INSERT INTO experiencia_agenda_sessoes(sessao_id,configuracao_id,data,hora_inicio) VALUES(?,?,?,?)');$u->execute([$sid,$config['id'],$date,$slot['inicio']]);$created++;
                }
            }
        }
    }
    foreach ($existing as $key=>$old) if (!isset($wanted[$key])) {
        // Closing a departure never cancels or deletes its confirmed bookings.
        $u=$c->prepare('UPDATE experiencia_sessoes SET ativo=0 WHERE id=?');$u->execute([$old['id']]);
        if ((int)$old['vagas_ocupadas']>0) $kept++;
    }
    if(!$apenasConfiguracoes){$u=$c->prepare('UPDATE experiencia_agendas SET materializado_em=? WHERE experiencia_id=?');$u->execute([$start->format('Y-m-d'),$id]);}
    return ['criadas'=>$created,'preservadas'=>$kept,'ligadas'=>count($conflicts)];
}

function agendaAtualizarHorizonte(PDO $c,int $id): void {
    $s=$c->prepare('SELECT materializado_em FROM experiencia_agendas WHERE experiencia_id=?');$s->execute([$id]);$day=$s->fetchColumn();
    $today=(new DateTimeImmutable('today',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    if($day===false || $day===$today)return;
    $c->beginTransaction();
    try{$s=$c->prepare('SELECT id FROM experiencias WHERE id=? FOR UPDATE');$s->execute([$id]);agendaMaterializar($c,$id);$c->commit();}
    catch(AgendaConflitoSessoes $e){if($c->inTransaction())$c->rollBack();return;}
    catch(Throwable $e){if($c->inTransaction())$c->rollBack();throw $e;}
}

function agendaLinhasDia(PDO $c,int $id,string $date,array $excludeHolds=[],bool $confirmacaoPaga=false): array {
    $s=$c->prepare('SELECT s.*, l.configuracao_id FROM experiencia_sessoes s LEFT JOIN experiencia_agenda_sessoes l ON l.sessao_id=s.id WHERE s.experiencia_id=? AND s.data=? ORDER BY s.hora_inicio,s.id');
    $s->execute([$id,$date]);$rows=$s->fetchAll(PDO::FETCH_ASSOC);
    $excludeHolds=array_map('intval',$excludeHolds);
    $skip=$excludeHolds ? ' AND id NOT IN ('.implode(',',array_fill(0,count($excludeHolds),'?')).')' : '';
    $s=$c->prepare("SELECT sessao_id,SUM(quantidade) AS quantidade FROM reservas_temporarias WHERE experiencia_id=? AND status='pendente' AND expira_em>?$skip GROUP BY sessao_id");
    $s->execute(array_merge([$id,date('Y-m-d H:i:s')],$excludeHolds));$pending=[];foreach($s->fetchAll(PDO::FETCH_ASSOC) as $p)$pending[(int)$p['sessao_id']]=(int)$p['quantidade'];
    $resources=agendaLer($c,'experiencia_agenda_recursos',$id);$configs=agendaLer($c,'experiencia_configuracoes',$id);$map=[];foreach($configs as $config)$map[(int)$config['id']]=$config;
    $model=modeloRegistoLerOpcional($c,$id);
    $rawRows=$rows;
    foreach ($rows as &$row) {
        $row['hora_inicio']=substr($row['hora_inicio'],0,5);$row['hora_fim']=substr($row['hora_fim'],0,5);
        $row['confirmados']=(int)$row['vagas_ocupadas'];$row['em_pagamento']=$pending[(int)$row['id']] ?? 0;$row['bloqueados']=0;
        $config=$map[(int)$row['configuracao_id']] ?? null;$assigned=$config ? json_decode($config['recursos_json'],true) : [];
        $row['pessoas_por_unidade']=$model && in_array((int)$model['recurso_id'],array_map('intval',$assigned ?: []),true) ? max(1,(int)$model['pessoas_por_equipamento']) : 2;
        $options=json_decode($config['opcoes_json'] ?? '{}',true) ?: [];
        $occupiedEnd=agendaHora(min(1439,agendaMinutos($row['hora_fim'])+(int)($options['preparacao'] ?? 0)));
        $capacity=(int)$row['capacidade_maxima'];
        $freeLimit=agendaLivre($capacity,$row['confirmados'],$row['em_pagamento'],0);
        $shared=false;
        foreach($resources as $resource) if(in_array((int)$resource['id'],$assigned ?: [],true)) {
            $events=[];
            foreach(json_decode($resource['manutencoes_json'],true) ?: [] as $m) if($date>=$m['inicio'] && $date<=$m['fim']) {
                $events[]=['inicio'=>$m['hora_inicio'],'fim'=>$m['hora_fim'],'tipo'=>'bloqueados','quantidade'=>$resource['tipo']==='guia' ? $capacity : (int)$m['quantidade']];
            }
            if($config && $config['unidade']==='unidade' && $resource['tipo']==='equipamento') {
                $shared=true;
                foreach($rawRows as $other){
                    $oc=$map[(int)$other['configuracao_id']] ?? null;
                    if(!$oc || !in_array((int)$resource['id'],json_decode($oc['recursos_json'],true) ?: [],true))continue;
                    $otherOptions=json_decode($oc['opcoes_json'] ?? '{}',true) ?: [];
                    $otherEnd=agendaHora(min(1439,agendaMinutos(substr($other['hora_fim'],0,5))+(int)($otherOptions['preparacao'] ?? 0)));
                    foreach(['confirmados'=>(int)$other['vagas_ocupadas'],'em_pagamento'=>$pending[(int)$other['id']] ?? 0] as $kind=>$qty)$events[]=['inicio'=>substr($other['hora_inicio'],0,5),'fim'=>$otherEnd,'tipo'=>$kind,'quantidade'=>$qty];
                }
                $peak=agendaPico($row['hora_inicio'],$occupiedEnd,$events);
                $freeLimit=min($freeLimit,agendaLivre((int)$resource['quantidade'],$peak['confirmados'],$peak['em_pagamento'],$peak['bloqueados']));
                if(array_sum($peak)>$row['confirmados']+$row['em_pagamento']+$row['bloqueados'])foreach($peak as $key=>$value)$row[$key]=$value;
            }else{$peak=agendaPico($row['hora_inicio'],$occupiedEnd,$events);$row['bloqueados']+=$peak['bloqueados'];}
        }
        $row['bloqueados']=min($capacity,$row['bloqueados']);
        $row['livres']=($row['ativo'] || $confirmacaoPaga) ? ($shared ? $freeLimit : agendaLivre($capacity,$row['confirmados'],$row['em_pagamento'],$row['bloqueados'])) : 0;
    }unset($row);
    return $rows;
}
