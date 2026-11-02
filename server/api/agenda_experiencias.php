<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: no-store');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){http_response_code(204);exit;}
if(($_SERVER['REQUEST_METHOD'] ?? '')!=='POST'){http_response_code(405);echo json_encode(['success'=>false]);exit;}
try {
    require_once __DIR__.'/experiencia/modeloRegisto.php';
    require_once __DIR__.'/agendaExperienciasLogica.php';
    require __DIR__.'/config.php';
    if(!isset($conn) && isset($pdo) && $pdo instanceof PDO)$conn=$pdo;
    if(!isset($conn) || !($conn instanceof PDO))$conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $input=json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);
    if(!is_array($input))throw new InvalidArgumentException('Pedido inválido.');
    require_once __DIR__.'/reserva-validacao.php';$uid=utilizadorReservaQR($conn,'host');
    $id=filter_var($input['experiencia_id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    if(!$id)throw new InvalidArgumentException('Experiência inválida.');
    $conn->beginTransaction();
    $s=$conn->prepare('SELECT * FROM experiencias WHERE id=? AND usuario_id=? FOR UPDATE');$s->execute([$id,$uid]);$exp=$s->fetch(PDO::FETCH_ASSOC);
    if(!$exp)throw new InvalidArgumentException('Experiência não encontrada nesta conta.');
    $action=$input['action'] ?? 'painel';$value=$input['dados'] ?? [];
    $today=(new DateTimeImmutable('today',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    $date=agendaData($input['data'] ?? $today);
    if($action==='reservas_saida') {
        $s=$conn->prepare('SELECT data,hora_inicio FROM experiencia_sessoes WHERE id=? AND experiencia_id=?');$s->execute([(int)($value['sessao_id'] ?? 0),$id]);$slot=$s->fetch(PDO::FETCH_ASSOC);
        if(!$slot)throw new InvalidArgumentException('Saída não encontrada.');
        $s=$conn->prepare('SELECT r.id,r.codigo_reserva,r.quantidade_pessoas,r.preco_total,r.status,u.nome AS cliente FROM reservas_experiencia r LEFT JOIN usuarios u ON u.id=r.usuario_id WHERE r.experiencia_id=? AND r.data_participacao=? AND (EXISTS(SELECT 1 FROM reservas_temporarias rt WHERE rt.reserva_id=r.id AND rt.sessao_id=?) OR (NOT EXISTS(SELECT 1 FROM reservas_temporarias rt WHERE rt.reserva_id=r.id) AND r.horario LIKE ?)) ORDER BY r.id DESC');
        $s->execute([$id,$slot['data'],(int)($value['sessao_id'] ?? 0),'%'.substr($slot['hora_inicio'],0,5).'%']);$bookings=$s->fetchAll(PDO::FETCH_ASSOC);$conn->commit();echo json_encode(['success'=>true,'reservas'=>$bookings],JSON_UNESCAPED_UNICODE);exit;
    }
    if($action==='rever') {
        $s=$conn->prepare('SELECT COUNT(*) FROM experiencia_sessoes WHERE experiencia_id=? AND data>=? AND (vagas_ocupadas>0 OR reservas_pendentes>0)');$s->execute([$id,$today]);
        $review=['saidas_com_reservas'=>(int)$s->fetchColumn()];$conn->commit();echo json_encode(['success'=>true,'revisao'=>$review]);exit;
    }
    if($action==='guardar_agenda') {
        $days=array_values(array_unique(array_map('intval',$value['dias'] ?? [])));sort($days);
        if(!$days || min($days)<1 || max($days)>7)throw new InvalidArgumentException('Selecione os dias de trabalho.');
        $start=agendaData($value['inicio'] ?? '');$end=empty($value['fim']) ? null : agendaData($value['fim']);
        if($end && $end<$start)throw new InvalidArgumentException('A data final deve ser posterior ao início.');
        $repeat=$value['repeticao'] ?? 'semanal';if(!in_array($repeat,['semanal','personalizado'],true))throw new InvalidArgumentException('Repetição inválida.');
        if($repeat==='personalizado' && !$end)throw new InvalidArgumentException('Indique a data final do período personalizado.');
        $min=filter_var($value['minima_horas'] ?? 24,FILTER_VALIDATE_INT);$max=filter_var($value['maxima_dias'] ?? 180,FILTER_VALIDATE_INT);
        if($min===false || $max===false || $min<0 || $min>8760 || $max<1 || $max>365)throw new InvalidArgumentException('Antecedência inválida (máxima entre 1 e 365 dias).');
        $s=$conn->prepare('INSERT INTO experiencia_agendas(experiencia_id,dias_json,repeticao,inicio,fim,minima_horas,maxima_dias) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE dias_json=VALUES(dias_json),repeticao=VALUES(repeticao),inicio=VALUES(inicio),fim=VALUES(fim),minima_horas=VALUES(minima_horas),maxima_dias=VALUES(maxima_dias),atualizado_em=NOW()');
        $s->execute([$id,json_encode($days),$repeat,$start,$end,$min,$max]);
    } elseif($action==='guardar_configuracao') {
        $name=trim((string)($value['nome'] ?? ''));$capacity=filter_var($value['capacidade'] ?? null,FILTER_VALIDATE_INT);$price=$value['preco'] ?? null;
        $unit=$value['unidade'] ?? 'participante';
        $registered=modeloRegistoLerOpcional($conn,$id);
        if($registered && $unit!==($registered['modelo_reserva']==='por_equipamento'?'unidade':'participante'))throw new InvalidArgumentException('O modelo da sessao deve corresponder ao modelo guardado no anuncio. Altere o modelo no registo da experiencia.');

        if(!$name || strlen($name)>150 || !$capacity || $capacity<1 || $capacity>10000 || !is_numeric($price) || !is_finite((float)$price) || (float)$price<0 || (float)$price>999999999 || !in_array($unit,['participante','unidade'],true))throw new InvalidArgumentException('Preencha nome, preço, capacidade e unidade válidos.');
        if(!is_array($value['horarios'] ?? null) || !$value['horarios'])throw new InvalidArgumentException('Selecione pelo menos um horário.');
        $options=$value['opcoes'] ?? ['metodo'=>'saidas','abertura'=>min($value['horarios'] ?? ['08:00']),'fecho'=>'23:59','intervalo'=>(int)($value['duracao_minutos'] ?? 15),'preparacao'=>0];
        if(!is_array($options) || !in_array($options['metodo'] ?? '',['intervalos','saidas'],true) || agendaMinutos($options['abertura'] ?? '')>=agendaMinutos($options['fecho'] ?? '') || filter_var($options['intervalo'] ?? null,FILTER_VALIDATE_INT)===false || (int)$options['intervalo']<1 || (int)$options['intervalo']>1439 || filter_var($options['preparacao'] ?? null,FILTER_VALIDATE_INT)===false || (int)$options['preparacao']<0 || (int)$options['preparacao']>720)throw new InvalidArgumentException('Abertura, fecho, intervalo ou preparação inválidos.');
        $minimum=filter_var($options['minimo_participantes'] ?? $exp['min_pessoas'] ?? 1,FILTER_VALIDATE_INT);
        if($unit==='participante' && ($minimum===false || $minimum<1 || $minimum>$capacity))throw new InvalidArgumentException('O mínimo para realizar a sessão deve ser entre 1 e a capacidade.');
        $options['minimo_participantes']=$unit==='participante' ? $minimum : 1;
        $value['opcoes_json']=json_encode($options,JSON_THROW_ON_ERROR);
        $slots=agendaIntervalos($value);
        foreach($slots as $slot)if($slot['inicio']<$options['abertura'] || $slot['fim']>$options['fecho'])throw new InvalidArgumentException('Os horários devem estar dentro do período de abertura.');$times=array_column($slots,'inicio');
        $resources=array_values(array_unique(array_map('intval',$value['recursos'] ?? [])));
        if(!empty($value['id'])) {
            $old=$conn->prepare('SELECT * FROM experiencia_configuracoes WHERE id=? AND experiencia_id=?');$old->execute([(int)$value['id'],$id]);$previous=$old->fetch(PDO::FETCH_ASSOC);
            if(!$previous)throw new InvalidArgumentException('Configuração não encontrada.');
            $booked=$conn->prepare('SELECT COUNT(*) FROM experiencia_agenda_sessoes l INNER JOIN experiencia_sessoes s ON s.id=l.sessao_id WHERE l.configuracao_id=? AND (s.vagas_ocupadas>0 OR s.reservas_pendentes>0)');$booked->execute([(int)$value['id']]);
            $oldResources=json_decode($previous['recursos_json'],true) ?: [];sort($oldResources);$newResources=$resources;sort($newResources);
            if($booked->fetchColumn() && ($previous['unidade']!==$unit || (int)$previous['duracao_minutos']!==(int)$value['duracao_minutos'] || $oldResources!==$newResources || (int)($options['preparacao'] ?? 0)!==(int)(json_decode(($conn->query('SELECT opcoes_json FROM experiencia_configuracao_opcoes WHERE configuracao_id='.(int)$value['id'])->fetchColumn()) ?: '{}',true)['preparacao'] ?? 0)))throw new InvalidArgumentException('Crie outra configuração para alterar a unidade, a duração, a preparação ou os recursos de saídas com reservas.');
        }
        $available=agendaLer($conn,'experiencia_agenda_recursos',$id);$allowed=array_map('intval',array_column($available,'id'));
        foreach($resources as $resource)if(!in_array($resource,$allowed,true))throw new InvalidArgumentException('Recurso não pertence a esta experiência.');
        foreach(agendaLer($conn,'experiencia_configuracoes',$id) as $other)if((int)$other['id']!==(int)($value['id'] ?? 0) && $other['ativo']) {
            $otherResources=json_decode($other['recursos_json'],true) ?: [];
            foreach($available as $resource)if($resource['tipo']==='guia' && in_array((int)$resource['id'],$resources,true) && in_array((int)$resource['id'],$otherResources,true))foreach($slots as $slot)foreach(agendaIntervalos($other) as $otherSlot)if($slot['min_inicio']<$otherSlot['min_fim_ocupado'] && $slot['min_fim_ocupado']>$otherSlot['min_inicio'])throw new InvalidArgumentException('O guia já está associado a uma saída nesse horário.');
        }
        if($unit==='unidade') {
            $pools=array_filter($available,static fn($r)=>$r['tipo']==='equipamento' && in_array((int)$r['id'],$resources,true));
            if($registered && $registered['modelo_reserva']==='por_equipamento' && !in_array((int)$registered['recurso_id'],$resources,true))throw new InvalidArgumentException('Utilize o stock de equipamento associado ao cadastro.');
            if(count($pools)!==1)throw new InvalidArgumentException('Associe exatamente um recurso de equipamento para o stock partilhado por unidade.');
            if($capacity>(int)array_values($pools)[0]['quantidade'])throw new InvalidArgumentException('A capacidade excede o stock do equipamento associado.');
        }
        $params=[$name,(int)$value['duracao_minutos'],round((float)$price,2),$capacity,$unit,json_encode($times),json_encode($resources),!empty($value['ativo'])?1:0];
        if(!empty($value['id'])){$s=$conn->prepare('UPDATE experiencia_configuracoes SET nome=?,duracao_minutos=?,preco=?,capacidade=?,unidade=?,horarios_json=?,recursos_json=?,ativo=?,atualizado_em=NOW() WHERE id=? AND experiencia_id=?');$s->execute(array_merge($params,[(int)$value['id'],$id]));}
        else{$s=$conn->prepare('INSERT INTO experiencia_configuracoes(nome,duracao_minutos,preco,capacidade,unidade,horarios_json,recursos_json,ativo,experiencia_id) VALUES(?,?,?,?,?,?,?,?,?)');$s->execute(array_merge($params,[$id]));}
        $configId=!empty($value['id']) ? (int)$value['id'] : (int)$conn->lastInsertId();
        $s=$conn->prepare('INSERT INTO experiencia_configuracao_opcoes(configuracao_id,opcoes_json) VALUES(?,?) ON DUPLICATE KEY UPDATE opcoes_json=VALUES(opcoes_json)');$s->execute([$configId,json_encode($options,JSON_THROW_ON_ERROR)]);
    } elseif($action==='alternar_configuracao') {
        $chk=$conn->prepare('SELECT unidade FROM experiencia_configuracoes WHERE id=? AND experiencia_id=?');$chk->execute([(int)($value['id'] ?? 0),$id]);
        if($chk->fetchColumn()===false)throw new InvalidArgumentException('Configuração não encontrada.');
        $s=$conn->prepare('UPDATE experiencia_configuracoes SET ativo=? WHERE id=? AND experiencia_id=?');$s->execute([!empty($value['ativo'])?1:0,(int)($value['id'] ?? 0),$id]);
    } elseif($action==='pausar') {
        $s=$conn->prepare('UPDATE experiencia_agendas SET pausado=? WHERE experiencia_id=?');$s->execute([!empty($value['pausado'])?1:0,$id]);
        if(!$s->rowCount()){ $chk=$conn->prepare('SELECT experiencia_id FROM experiencia_agendas WHERE experiencia_id=?');$chk->execute([$id]);if(!$chk->fetchColumn())throw new InvalidArgumentException('Guarde primeiro a agenda de funcionamento.'); }
    } elseif($action==='guardar_excecao') {
        $start=agendaData($value['inicio'] ?? '');$end=agendaData($value['fim'] ?? '');$type=$value['tipo'] ?? 'fechado';$reason=trim((string)($value['motivo'] ?? ''));
        if($end<$start || !in_array($type,['aberto','fechado'],true) || !$reason || strlen($reason)>255)throw new InvalidArgumentException('Indique datas válidas e o motivo da exceção.');
        if(!empty($value['id'])){$s=$conn->prepare('UPDATE experiencia_agenda_excecoes SET inicio=?,fim=?,tipo=?,motivo=? WHERE id=? AND experiencia_id=?');$s->execute([$start,$end,$type,$reason,(int)$value['id'],$id]);}
        else{$s=$conn->prepare('INSERT INTO experiencia_agenda_excecoes(experiencia_id,inicio,fim,tipo,motivo) VALUES(?,?,?,?,?)');$s->execute([$id,$start,$end,$type,$reason]);}
    } elseif($action==='remover_excecao') {
        $s=$conn->prepare('DELETE FROM experiencia_agenda_excecoes WHERE id=? AND experiencia_id=?');$s->execute([(int)($value['id'] ?? 0),$id]);
    } elseif(in_array($action,['guardar_recurso','rever_recurso'],true)) {
        $name=trim((string)($value['nome'] ?? ''));$type=$value['tipo'] ?? 'equipamento';$qty=filter_var($value['quantidade'] ?? null,FILTER_VALIDATE_INT);
        if(!$name || strlen($name)>150 || !in_array($type,['guia','equipamento'],true) || $qty===false || $qty<1 || $qty>10000)throw new InvalidArgumentException('Recurso inválido.');
        $maintenance=$value['manutencoes'] ?? [];if(!is_array($maintenance) || count($maintenance)>100)throw new InvalidArgumentException('Manutenções inválidas.');
        foreach($maintenance as $m)if(agendaData($m['inicio'] ?? '')>agendaData($m['fim'] ?? '') || agendaMinutos($m['hora_inicio'] ?? '')>=agendaMinutos($m['hora_fim'] ?? '') || (int)($m['quantidade'] ?? 0)<1 || (int)$m['quantidade']>$qty)throw new InvalidArgumentException('Intervalo ou quantidade de manutenção inválidos.');
        if(!empty($value['id'])){$s=$conn->prepare('UPDATE experiencia_agenda_recursos SET nome=?,tipo=?,quantidade=?,manutencoes_json=? WHERE id=? AND experiencia_id=?');$s->execute([$name,$type,$qty,json_encode($maintenance),(int)$value['id'],$id]);}
        else{$s=$conn->prepare('INSERT INTO experiencia_agenda_recursos(experiencia_id,nome,tipo,quantidade,manutencoes_json) VALUES(?,?,?,?,?)');$s->execute([$id,$name,$type,$qty,json_encode($maintenance)]);}
    } elseif($action!=='painel')throw new InvalidArgumentException('Ação inválida.');
    if($action==='rever_recurso') {
        $dates=[];foreach(isset($value['impacto_alvo']) ? [$value['impacto_alvo']] : ($value['manutencoes'] ?? []) as $m){$d=new DateTimeImmutable($m['inicio']);$last=new DateTimeImmutable($m['fim']);for(;$d<=$last;$d=$d->modify('+1 day')){$dates[$d->format('Y-m-d')]=true;if(count($dates)>366)throw new InvalidArgumentException('Reveja bloqueios de até 366 dias de cada vez.');}}
        $impact=['count'=>0,'confirmed'=>0,'pending'=>0];
        $configMap=[];foreach(agendaLer($conn,'experiencia_configuracoes',(int)$id) as $config)$configMap[(int)$config['id']]=$config;
        $target=$value['impacto_alvo'] ?? null;
        foreach(array_keys($dates) as $impactDate)foreach(agendaLinhasDia($conn,(int)$id,$impactDate) as $row){
            $config=$configMap[(int)$row['configuracao_id']] ?? null;if(!$config || !in_array((int)($value['id'] ?? 0),json_decode($config['recursos_json'],true) ?: [],true))continue;
            $prep=(int)(json_decode($config['opcoes_json'] ?? '{}',true)['preparacao'] ?? 0);
            if($target && !($row['hora_inicio']<$target['hora_fim'] && agendaHora(min(1439,agendaMinutos($row['hora_fim'])+$prep))>$target['hora_inicio']))continue;
            $impact['count']++;$impact['confirmed']+=(int)$row['vagas_ocupadas'];
            $pending=$conn->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND status='pendente' AND expira_em>?");$pending->execute([$row['id'],date('Y-m-d H:i:s')]);$impact['pending']+=(int)$pending->fetchColumn();
        }
        $conn->rollBack();echo json_encode(['success'=>true,'impacto'=>$impact],JSON_UNESCAPED_UNICODE);exit;
    }
    try { $targetConfigs=$action==='guardar_configuracao' ? [$configId] : ($action==='alternar_configuracao' ? [(int)$value['id']] : []);$result=agendaMaterializar($conn,(int)$id,is_array($value['ligar_sessoes_legadas'] ?? null) ? $value['ligar_sessoes_legadas'] : [],$targetConfigs); } catch(AgendaConflitoSessoes $e) { if($action!=='painel')throw $e;$result=['criadas'=>0,'preservadas'=>0,'conflitos_pendentes'=>$e->conflitos]; }
    if($action!=='painel'){$s=$conn->prepare('INSERT INTO experiencia_agenda_historico(experiencia_id,usuario_id,acao,detalhes_json) VALUES(?,?,?,?)');$s->execute([$id,$uid,$action,json_encode(['dados'=>$value,'resultado'=>$result],JSON_UNESCAPED_UNICODE)]);}
    $s=$conn->prepare('SELECT * FROM experiencia_agendas WHERE experiencia_id=?');$s->execute([$id]);$agenda=$s->fetch(PDO::FETCH_ASSOC) ?: null;
    $s=$conn->prepare('SELECT * FROM experiencia_agenda_historico WHERE experiencia_id=? ORDER BY id DESC LIMIT 100');$s->execute([$id]);$history=$s->fetchAll(PDO::FETCH_ASSOC);
    $rows=agendaLinhasDia($conn,(int)$id,$date);
    $model=modeloRegistoLerOpcional($conn,$id);
    $resources=agendaLer($conn,'experiencia_agenda_recursos',$id);
    foreach($resources as &$resource)$resource['pessoas_por_unidade']=$model && (int)$resource['id']===(int)$model['recurso_id'] ? max(1,(int)$model['pessoas_por_equipamento']) : 2;unset($resource);
    $response=['success'=>true,'experiencia'=>['id'=>(int)$exp['id'],'titulo'=>$exp['titulo'],'ilha'=>$exp['ilha'],'preco'=>$exp['preco'],'max_pessoas'=>$exp['max_pessoas'],'min_pessoas'=>(int)($exp['min_pessoas'] ?? 1),'categoria'=>$exp['categoria'] ?? ''] + ($model ? array_intersect_key($model,array_flip(['modelo_reserva','equipamento_nome','quantidade_equipamentos','pessoas_por_equipamento','recurso_id'])) : (isset($exp['modelo_reserva']) ? ['modelo_reserva'=>$exp['modelo_reserva']] : [])), 'agenda'=>$agenda,'configuracoes'=>agendaLer($conn,'experiencia_configuracoes',$id),'excecoes'=>agendaLer($conn,'experiencia_agenda_excecoes',$id),'recursos'=>$resources,'historico'=>$history,'sessoes'=>$rows,'data'=>$date,'resultado'=>$result];
    $conn->commit();echo json_encode($response,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}catch(AgendaConflitoSessoes $e){if(isset($conn)&&$conn->inTransaction())$conn->rollBack();http_response_code(409);echo json_encode(['success'=>false,'code'=>'LEGACY_SESSION_CONFLICT','error'=>$e->getMessage(),'conflitos'=>$e->conflitos],JSON_UNESCAPED_UNICODE);
}catch(InvalidArgumentException|JsonException $e){if(isset($conn)&&$conn->inTransaction())$conn->rollBack();http_response_code(422);echo json_encode(['success'=>false,'error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
catch(Throwable $e){
    if(isset($conn)&&$conn instanceof PDO&&$conn->inTransaction())$conn->rollBack();
    $code='AGENDA_SERVER_ERROR';
    $message='Não foi possível carregar a agenda. Consulte o registo de erros do alojamento.';
    if($e instanceof PDOException && (str_contains($e->getMessage(),'experiencia_modelos'))){
        $code='AGENDA_MODEL_SCHEMA';$message='A tabela dos modelos de reserva está ausente ou desatualizada. Instale a migração 009 no alojamento.';
    }elseif(str_contains($e->getMessage(),'modeloRegisto') || str_contains($e->getMessage(),'Failed opening required')){
        $code='AGENDA_DEPENDENCY';$message='Faltam ficheiros da API ou existem versões diferentes. Publique agendaExperienciasLogica.php e experiencia/modeloRegisto.php juntamente com agenda_experiencias.php.';
    }
    error_log('[agenda]['.$code.'] '.$e->getMessage());
    http_response_code(500);echo json_encode(['success'=>false,'code'=>$code,'error'=>$message],JSON_UNESCAPED_UNICODE);
}
