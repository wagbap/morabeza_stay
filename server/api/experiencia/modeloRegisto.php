<?php
declare(strict_types=1);

function modeloRegistoLer(PDO $c,int $id): ?array {
    $s=$c->prepare('SELECT * FROM experiencia_modelos WHERE experiencia_id=?');$s->execute([$id]);return $s->fetch(PDO::FETCH_ASSOC) ?: null;
}
function modeloRegistoLerOpcional(PDO $c,int $id): ?array {
    try {return modeloRegistoLer($c,$id);} catch(PDOException $e) {
        if($e->getCode()==='42S02' || str_contains($e->getMessage(),'no such table'))return null;
        throw $e;
    }
}
function modeloRegistoComprimento(string $value): int {return preg_match_all('/./us',$value);}
function modeloRegistoValidar(array $data,?array $previous=null): array {
    $model=$data['modelo_reserva'] ?? $previous['modelo_reserva'] ?? 'por_pessoa';
    if(!in_array($model,['por_pessoa','por_equipamento','grupo_privado'],true))throw new InvalidArgumentException('Selecione um modelo de reserva válido.');
    if($model==='grupo_privado' && ($previous['modelo_reserva'] ?? '')!=='grupo_privado')throw new InvalidArgumentException('Escolha por participante ou por equipamento e duração.');
    $result=['modelo_reserva'=>$model,'equipamento_nome'=>null,'quantidade_equipamentos'=>null,'pessoas_por_equipamento'=>null];
    if($model==='por_equipamento'){
        $name=trim((string)($data['equipamento_nome'] ?? $previous['equipamento_nome'] ?? ''));
        $stock=filter_var($data['quantidade_equipamentos'] ?? $previous['quantidade_equipamentos'] ?? null,FILTER_VALIDATE_INT);
        $people=filter_var($data['pessoas_por_equipamento'] ?? $previous['pessoas_por_equipamento'] ?? null,FILTER_VALIDATE_INT);
        if($name==='' || modeloRegistoComprimento($name)>150 || $stock===false || $stock<1 || $stock>10000 || $people===false || $people<1 || $people>500)throw new InvalidArgumentException('Preencha o nome, o stock e o máximo de pessoas por equipamento.');
        $result['equipamento_nome']=$name;$result['quantidade_equipamentos']=$stock;$result['pessoas_por_equipamento']=$people;
    }else{
        if(!is_numeric($data['preco'] ?? null) || !is_finite((float)$data['preco']) || (float)$data['preco']<=0)throw new InvalidArgumentException('Indique um preço válido para este modelo.');
        $max=filter_var($data['max_pessoas'] ?? null,FILTER_VALIDATE_INT);if($max===false || $max<1 || $max>10000)throw new InvalidArgumentException('Indique a capacidade máxima da sessão.');
    }
    if($model!=='por_equipamento'){
        $min=filter_var($data['min_pessoas'] ?? 1,FILTER_VALIDATE_INT);
        if($min===false || $min<1 || $min>(int)$data['max_pessoas'])throw new InvalidArgumentException('O mínimo para realizar a sessão deve estar entre 1 e a capacidade máxima.');
    }
    $valid=['segunda','terca','quarta','quinta','sexta','sabado','domingo'];$days=$data['dias_disponiveis'] ?? [];
    if(!is_array($days) || !$days || array_diff($days,$valid))throw new InvalidArgumentException('Selecione os dias disponíveis.');
    return $result;
}
function modeloRegistoGuardar(PDO $c,int $id,array $model,array $data,?array $previous): void {
    $resource=$previous['recurso_id'] ?? null;
    if($model['modelo_reserva']==='por_equipamento'){
        if(!$resource){$s=$c->prepare("SELECT id FROM experiencia_agenda_recursos WHERE experiencia_id=? AND tipo='equipamento' ORDER BY id");$s->execute([$id]);$ids=$s->fetchAll(PDO::FETCH_COLUMN);if(count($ids)===1)$resource=(int)$ids[0];}
        if($resource){$s=$c->prepare('UPDATE experiencia_agenda_recursos SET nome=?,quantidade=? WHERE id=? AND experiencia_id=?');$s->execute([$model['equipamento_nome'],$model['quantidade_equipamentos'],$resource,$id]);}
        else{$s=$c->prepare("INSERT INTO experiencia_agenda_recursos(experiencia_id,nome,tipo,quantidade,manutencoes_json,ativo) VALUES(?,?,'equipamento',?,'[]',1)");$s->execute([$id,$model['equipamento_nome'],$model['quantidade_equipamentos']]);$resource=(int)$c->lastInsertId();}
    }
    $s=$c->prepare('INSERT INTO experiencia_modelos(experiencia_id,modelo_reserva,equipamento_nome,quantidade_equipamentos,pessoas_por_equipamento,recurso_id) VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE modelo_reserva=VALUES(modelo_reserva),equipamento_nome=VALUES(equipamento_nome),quantidade_equipamentos=VALUES(quantidade_equipamentos),pessoas_por_equipamento=VALUES(pessoas_por_equipamento),recurso_id=VALUES(recurso_id),atualizado_em=NOW()');
    $s->execute([$id,$model['modelo_reserva'],$model['equipamento_nome'],$model['quantidade_equipamentos'],$model['pessoas_por_equipamento'],$resource]);
    $days=['segunda'=>1,'terca'=>2,'quarta'=>3,'quinta'=>4,'sexta'=>5,'sabado'=>6,'domingo'=>7];$selected=array_values(array_unique(array_map(static fn($d)=>$days[$d],$data['dias_disponiveis'])));sort($selected);
    $today=(new DateTimeImmutable('today',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    $s=$c->prepare("INSERT INTO experiencia_agendas(experiencia_id,dias_json,repeticao,inicio,minima_horas,maxima_dias,pausado) VALUES(?,?,'semanal',?,24,180,0) ON DUPLICATE KEY UPDATE dias_json=VALUES(dias_json),materializado_em=NULL,atualizado_em=NOW()");$s->execute([$id,json_encode($selected),$today]);
}
