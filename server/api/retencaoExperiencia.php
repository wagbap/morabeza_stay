<?php
declare(strict_types=1);

function cotacaoSessaoExperiencia(array $experience,array $slot,int $quantity,string $model,string $unit): array {
    $price=$slot['preco_especial'] ?? ($model==='grupo_privado' ? ($experience['preco_grupo'] ?? $experience['preco'] ?? 0) : ($experience['preco'] ?? 0));
    if(!is_numeric($price) || !is_finite((float)$price) || (float)$price<0)throw new InvalidArgumentException('Preço da sessão inválido.');
    $price=round((float)$price,2);
    return ['sessao_id'=>(int)$slot['id'],'preco_unitario'=>$price,'preco_total'=>round($price*($model==='grupo_privado'?1:$quantity),2),'unidade'=>$unit,'quantidade'=>$quantity];
}

function validarRetencaoComCotacao(PDO $c,string $token,?float $expected=null): array {
    if(!preg_match('/^[a-f0-9]{64}$/D',$token))throw new InvalidArgumentException('Token inválido.');
    $s=$c->prepare('SELECT experiencia_id,sessao_id FROM reservas_temporarias WHERE token=?');$s->execute([$token]);$info=$s->fetch(PDO::FETCH_ASSOC);
    if(!$info)throw new InvalidArgumentException('Retenção não encontrada.');
    $ownTransaction=!$c->inTransaction();if($ownTransaction)$c->beginTransaction();
    try{
        $s=$c->prepare('SELECT * FROM experiencias WHERE id=? FOR UPDATE');$s->execute([$info['experiencia_id']]);$exp=$s->fetch(PDO::FETCH_ASSOC);
        $s=$c->prepare('SELECT * FROM experiencia_sessoes WHERE id=? FOR UPDATE');$s->execute([$info['sessao_id']]);$slot=$s->fetch(PDO::FETCH_ASSOC);
        $s=$c->prepare('SELECT * FROM reservas_temporarias WHERE token=? FOR UPDATE');$s->execute([$token]);$hold=$s->fetch(PDO::FETCH_ASSOC);
        if(!$exp || !$slot || !$slot['ativo'] || !$hold || $hold['status']!=='pendente' || strtotime($hold['expira_em'])<=time())throw new InvalidArgumentException('A retenção expirou ou a sessão deixou de estar disponível. Escolha novamente.');
        $dados=json_decode($hold['dados_reserva'] ?? '{}',true) ?: [];
        $quote=cotacaoSessaoExperiencia($exp,$slot,(int)$hold['quantidade'],$hold['modelo'],$dados['unidade'] ?? 'participante');
        if(isset($dados['preco_unitario']) && abs($quote['preco_unitario']-(float)$dados['preco_unitario'])>0.005)throw new InvalidArgumentException('O preço da sessão mudou. Reveja a reserva antes de pagar.');
        if($expected!==null && (!is_finite($expected) || abs($expected-$quote['preco_total'])>0.005))throw new InvalidArgumentException('O total não corresponde ao preço e à quantidade da sessão.');
        $available=null;
        if(is_file(__DIR__.'/agendaExperienciasLogica.php')){
            require_once __DIR__.'/agendaExperienciasLogica.php';
            try{$s=$c->prepare('SELECT * FROM experiencia_agendas WHERE experiencia_id=?');$s->execute([$info['experiencia_id']]);$agenda=$s->fetch(PDO::FETCH_ASSOC);}catch(PDOException $missing){$agenda=false;}
            if($agenda){
                if(!agendaAberta($slot['data'],$agenda,agendaLer($c,'experiencia_agenda_excecoes',(int)$info['experiencia_id'])))throw new InvalidArgumentException('Esta data está fechada para novas reservas.');
                $now=new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde'));$start=new DateTimeImmutable($slot['data'].' '.$slot['hora_inicio'],new DateTimeZone('Atlantic/Cape_Verde'));
                if($start<$now->modify('+'.(int)$agenda['minima_horas'].' hours') || $start>$now->modify('+'.(int)$agenda['maxima_dias'].' days'))throw new InvalidArgumentException('Sessão fora do prazo de reserva.');
                foreach(agendaLinhasDia($c,(int)$info['experiencia_id'],$slot['data'],[(int)$hold['id']]) as $row)if((int)$row['id']===(int)$slot['id']){$available=(int)$row['livres'];break;}
            }
        }
        if($available===null){$s=$c->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND id<>? AND status='pendente' AND expira_em>?");$s->execute([$slot['id'],$hold['id'],date('Y-m-d H:i:s')]);$available=max(0,(int)$slot['capacidade_maxima']-(int)$slot['vagas_ocupadas']-(int)$s->fetchColumn());}
        if($available<(int)$hold['quantidade'])throw new InvalidArgumentException('A disponibilidade mudou. Reveja a reserva antes de pagar.');
        if($ownTransaction)$c->commit();
        return ['success'=>true,'segundos_restantes'=>max(0,strtotime($hold['expira_em'])-time()),'cotacao'=>$quote];
    }catch(Throwable $e){if($ownTransaction && $c->inTransaction())$c->rollBack();throw $e;}
}

function sincronizarPendentesSessao(PDO $conn, int $sessaoId): void {
    $stmt = $conn->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND status='pendente'");
    $stmt->execute([$sessaoId]);
    $total = (int)$stmt->fetchColumn();
    $stmt = $conn->prepare('UPDATE experiencia_sessoes SET reservas_pendentes=? WHERE id=?');
    $stmt->execute([$total, $sessaoId]);
}

function reservarVagasTemporarias(PDO $conn, array $input): array {
    $sid = filter_var($input['sessao_id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    $qtd = filter_var($input['quantidade'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    if (!$sid || !$qtd) throw new InvalidArgumentException('sessao_id e quantidade devem ser inteiros positivos.');
    $uid = !empty($input['usuario_id']) ? filter_var($input['usuario_id'], FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]) : null;
    if ($uid === false) throw new InvalidArgumentException('Utilizador inválido.');
    $modelo = $input['modelo'] ?? 'por_pessoa';
    if (!in_array($modelo, ['por_pessoa','grupo_privado'], true)) throw new InvalidArgumentException('Modelo inválido.');
    $now = date('Y-m-d H:i:s');
    $expires = date('Y-m-d H:i:s', time() + 300);
    $conn->beginTransaction();
    try {
        // All reservation and release operations lock the session first.
        $lookup=$conn->prepare('SELECT experiencia_id FROM experiencia_sessoes WHERE id=?');$lookup->execute([$sid]);$expLock=$lookup->fetchColumn();
        $experience=[];
        if($expLock){$lock=$conn->prepare('SELECT * FROM experiencias WHERE id=? FOR UPDATE');$lock->execute([$expLock]);$experience=$lock->fetch(PDO::FETCH_ASSOC) ?: [];}
        $stmt = $conn->prepare('SELECT * FROM experiencia_sessoes WHERE id=? FOR UPDATE');
        $stmt->execute([$sid]); $sessao = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$sessao || empty($sessao['ativo'])) throw new InvalidArgumentException('Sessão não encontrada ou inativa.');
        if (!empty($input['experiencia_id']) && (int)$input['experiencia_id'] !== (int)$sessao['experiencia_id']) throw new InvalidArgumentException('Esta sessão não pertence à experiência.');
        $stmt = $conn->prepare("UPDATE reservas_temporarias SET status='expirada' WHERE sessao_id=? AND status='pendente' AND expira_em<=?");
        $stmt->execute([$sid,$now]);
        $stmt = $conn->prepare("SELECT * FROM reservas_temporarias WHERE sessao_id=? AND status='pendente' ORDER BY id DESC FOR UPDATE");
        $stmt->execute([$sid]); $holds = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $own = []; $other = 0;
        $tokenInput = is_string($input['token'] ?? null) ? $input['token'] : '';
        foreach ($holds as $hold) {
            if (($uid && (int)$hold['usuario_id'] === $uid) || ($tokenInput !== '' && hash_equals((string)$hold['token'], $tokenInput))) $own[] = $hold;
            else $other += (int)$hold['quantidade'];
        }
        // The customer's own existing hold is credited BEFORE checking stock.
        $available = max(0, (int)$sessao['capacidade_maxima'] - (int)$sessao['vagas_ocupadas'] - $other);
        $linked=false;
        if (is_file(__DIR__.'/agendaExperienciasLogica.php')) {
            // Optional migration: existing installations remain compatible.
            $linked=false;
            try {
                $pause=$conn->prepare('SELECT * FROM experiencia_agendas WHERE experiencia_id=?');$pause->execute([$sessao['experiencia_id']]);$agenda=$pause->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $missingAgenda) { $agenda=false; }
            if($agenda){
                require_once __DIR__.'/agendaExperienciasLogica.php';
                if(!agendaAberta(substr($sessao['data'],0,10),$agenda,agendaLer($conn,'experiencia_agenda_excecoes',(int)$sessao['experiencia_id'])))throw new InvalidArgumentException('Esta data está fechada para novas reservas.');
                $nowLocal=new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde'));
                $startLocal=new DateTimeImmutable($sessao['data'].' '.$sessao['hora_inicio'],new DateTimeZone('Atlantic/Cape_Verde'));
                if($startLocal<$nowLocal->modify('+'.(int)$agenda['minima_horas'].' hours') || $startLocal>$nowLocal->modify('+'.(int)$agenda['maxima_dias'].' days'))throw new InvalidArgumentException('Sessão fora do prazo de antecedência permitido.');
            }
            try {
                $check=$conn->prepare('SELECT c.unidade FROM experiencia_agenda_sessoes l INNER JOIN experiencia_configuracoes c ON c.id=l.configuracao_id WHERE l.sessao_id=?');
                $check->execute([$sid]);$linked=$check->fetchColumn();
            } catch (PDOException $missingAgenda) { $linked=false; }
            require_once __DIR__.'/experiencia/modeloRegisto.php';
            $registered=modeloRegistoLerOpcional($conn,(int)$sessao['experiencia_id']);
            if($registered && ($linked!==false ? $linked : 'participante')!==($registered['modelo_reserva']==='por_equipamento'?'unidade':'participante'))throw new InvalidArgumentException('Sessao incompativel com o modelo do anuncio. Selecione outra sessao.');
            if ($linked!==false) {
                $input['dados_reserva']['unidade']=$linked;
                require_once __DIR__.'/agendaExperienciasLogica.php';
                foreach (agendaLinhasDia($conn,(int)$sessao['experiencia_id'],substr($sessao['data'],0,10),$linked==='unidade' ? array_column($own,'id') : []) as $slot) if ((int)$slot['id']===(int)$sid) {
                    if($linked==='unidade') {
                        $people=max(1,(int)($slot['pessoas_por_unidade'] ?? 2));
                        $participants=(int)($input['dados_reserva']['participantes'] ?? 1);
                        if($participants<1 || $participants>$qtd*$people)throw new InvalidArgumentException('O número de participantes excede a capacidade dos equipamentos selecionados.');
                        $available=max(0,min((int)$sessao['capacidade_maxima'],(int)$slot['livres']));
                    }else $available=max(0,$available-(int)$slot['bloqueados']);
                    break;
                }
            }
        }
        if ($qtd > $available) throw new InvalidArgumentException("Vagas insuficientes. Apenas {$available} disponíveis.");
        if ($modelo === 'grupo_privado' && ($other > 0 || (int)$sessao['vagas_ocupadas'] > 0)) throw new InvalidArgumentException('Esta sessão já tem outras reservas.');
        foreach ($holds as $hold) if (!in_array($hold, $own, true) && $hold['modelo'] === 'grupo_privado') throw new InvalidArgumentException('Esta sessão está reservada para um grupo privado.');
        $unit=$linked!==false ? $linked : 'participante';
        if($linked!==false && $modelo==='grupo_privado' && ($experience['modelo_reserva'] ?? '')!=='grupo_privado')throw new InvalidArgumentException('Modelo de reserva incompatível com a sessão.');
        $quote=cotacaoSessaoExperiencia($experience,$sessao,(int)$qtd,$modelo,$unit);
        if(isset($input['dados_reserva']['preco_unitario']) && abs((float)$input['dados_reserva']['preco_unitario']-$quote['preco_unitario'])>0.005)throw new InvalidArgumentException('O preço da sessão mudou. Volte a escolher a sessão.');
        $input['dados_reserva']=array_merge($input['dados_reserva'] ?? [],$quote);
        $dados = json_encode($input['dados_reserva'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        if ($own) {
            $keep = $own[0]; $token = (string)$keep['token'];
            $stmt = $conn->prepare("UPDATE reservas_temporarias SET quantidade=?, modelo=?, dados_reserva=?, expira_em=? WHERE id=?");
            $stmt->execute([$qtd,$modelo,$dados,$expires,$keep['id']]);
            // Collapse duplicate active holds left by older checkout versions.
            foreach (array_slice($own,1) as $duplicate) {
                $stmt = $conn->prepare("UPDATE reservas_temporarias SET status='cancelada' WHERE id=?");
                $stmt->execute([$duplicate['id']]);
            }
        } else {
            $token = bin2hex(random_bytes(32));
            $stmt = $conn->prepare("INSERT INTO reservas_temporarias(usuario_id,experiencia_id,sessao_id,quantidade,modelo,token,dados_reserva,expira_em,status) VALUES(?,?,?,?,?,?,?,?,'pendente')");
            $stmt->execute([$uid,(int)$sessao['experiencia_id'],$sid,$qtd,$modelo,$token,$dados,$expires]);
        }
        sincronizarPendentesSessao($conn,(int)$sid);
        $conn->commit();
        return ['success'=>true,'token'=>$token,'expira_em'=>$expires,'segundos_restantes'=>300,'renovada'=>(bool)$own,'cotacao'=>$quote];
    } catch (Throwable $e) { if ($conn->inTransaction()) $conn->rollBack(); throw $e; }
}

function libertarVagasTemporarias(PDO $conn, string $token): array {
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) throw new InvalidArgumentException('Token inválido.');
    $stmt = $conn->prepare('SELECT sessao_id FROM reservas_temporarias WHERE token=?');
    $stmt->execute([$token]); $sid = $stmt->fetchColumn();
    if (!$sid) return ['success'=>true,'message'=>'Nada a libertar.'];
    $conn->beginTransaction();
    try {
        $lookup=$conn->prepare('SELECT experiencia_id FROM experiencia_sessoes WHERE id=?');$lookup->execute([$sid]);$expLock=$lookup->fetchColumn();
        if($expLock){$lock=$conn->prepare('SELECT id FROM experiencias WHERE id=? FOR UPDATE');$lock->execute([$expLock]);}
        $stmt = $conn->prepare('SELECT id FROM experiencia_sessoes WHERE id=? FOR UPDATE');
        $stmt->execute([$sid]);
        $stmt = $conn->prepare("UPDATE reservas_temporarias SET status='cancelada' WHERE token=? AND status='pendente'");
        $stmt->execute([$token]);
        $stmt = $conn->prepare("UPDATE reservas_temporarias SET status='expirada' WHERE sessao_id=? AND status='pendente' AND expira_em<=?");
        $stmt->execute([$sid,date('Y-m-d H:i:s')]);
        sincronizarPendentesSessao($conn,(int)$sid);
        $conn->commit();
        return ['success'=>true,'message'=>'Retenção libertada.'];
    } catch (Throwable $e) { if ($conn->inTransaction()) $conn->rollBack(); throw $e; }
}

function confirmarVagasTemporarias(PDO $conn,string $token,int $reservaId,bool $manageTransaction=true): array {
    if(!preg_match('/^[a-f0-9]{64}$/D',$token) || $reservaId<1)throw new InvalidArgumentException('Token e reserva válidos são obrigatórios.');
    $lookup=$conn->prepare('SELECT experiencia_id,sessao_id FROM reservas_temporarias WHERE token=?');$lookup->execute([$token]);$info=$lookup->fetch(PDO::FETCH_ASSOC);
    if(!$info)throw new InvalidArgumentException('Retenção não encontrada.');
    if($manageTransaction)$conn->beginTransaction();
    try{
        $s=$conn->prepare('SELECT id FROM experiencias WHERE id=? FOR UPDATE');$s->execute([$info['experiencia_id']]);
        $s=$conn->prepare('SELECT * FROM experiencia_sessoes WHERE id=? FOR UPDATE');$s->execute([$info['sessao_id']]);$slot=$s->fetch(PDO::FETCH_ASSOC);
        $s=$conn->prepare('SELECT * FROM reservas_temporarias WHERE token=? FOR UPDATE');$s->execute([$token]);$hold=$s->fetch(PDO::FETCH_ASSOC);
        $s=$conn->prepare('SELECT * FROM reservas_experiencia WHERE id=? FOR UPDATE');$s->execute([$reservaId]);$booking=$s->fetch(PDO::FETCH_ASSOC);
        if(!$slot || !$booking || (int)$booking['experiencia_id']!==(int)$hold['experiencia_id'] || $booking['data_participacao']!==$slot['data'] || !str_contains((string)$booking['horario'],substr($slot['hora_inicio'],0,5)) || (!empty($hold['usuario_id']) && (int)$hold['usuario_id']!==(int)$booking['usuario_id']))throw new InvalidArgumentException('A reserva não corresponde à retenção.');
        if(!in_array($booking['pagamento_status'],['pago','paid'],true) || !in_array($booking['status'],['confirmada','concluida'],true))throw new InvalidArgumentException('O pagamento deve estar confirmado antes de ocupar as vagas.');
        if($hold['status']==='confirmada') {
            if((int)$hold['reserva_id']!==$reservaId)throw new InvalidArgumentException('Esta retenção já pertence a outra reserva.');
            if($manageTransaction)$conn->commit();return ['success'=>true,'idempotente'=>true,'quantidade_confirmada'=>(int)$hold['quantidade']];
        }
        if($hold['status']!=='pendente' || strtotime($hold['expira_em'])<time()-120)throw new InvalidArgumentException('A retenção expirou. Contacte o suporte se o pagamento já foi efetuado.');
        $dados=json_decode($hold['dados_reserva'] ?? '{}',true) ?: [];
        $expected=($dados['unidade'] ?? '')==='unidade' ? (int)($booking['quantidade_jet_skis'] ?? 0) : (int)$booking['quantidade_pessoas'];
        if($expected!==(int)$hold['quantidade'])throw new InvalidArgumentException('A quantidade da reserva não corresponde à retenção.');
        if(isset($dados['participantes']) && (int)$dados['participantes']!==(int)$booking['quantidade_pessoas'])throw new InvalidArgumentException('O número de participantes não corresponde à retenção.');
        if(isset($dados['preco_total']) && isset($booking['preco_total']) && abs((float)$dados['preco_total']-(float)$booking['preco_total'])>0.005)throw new InvalidArgumentException('O preço da reserva não corresponde à retenção.');
        // Under the experience lock, an expired hold must never reclaim stock
        // that another overlapping duration has already reserved.
        $free=null;
        if(is_file(__DIR__.'/agendaExperienciasLogica.php')){
            require_once __DIR__.'/agendaExperienciasLogica.php';
            try{$s=$conn->prepare('SELECT configuracao_id FROM experiencia_agenda_sessoes WHERE sessao_id=?');$s->execute([$slot['id']]);$linked=$s->fetchColumn();}catch(PDOException $missing){$linked=false;}
            if($linked!==false)foreach(agendaLinhasDia($conn,(int)$hold['experiencia_id'],$slot['data'],[(int)$hold['id']],true) as $row)if((int)$row['id']===(int)$slot['id']){$free=(int)$row['livres'];break;}
        }
        if($free===null){$s=$conn->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND id<>? AND status='pendente' AND expira_em>?");$s->execute([$slot['id'],$hold['id'],date('Y-m-d H:i:s')]);$free=max(0,(int)$slot['capacidade_maxima']-(int)$slot['vagas_ocupadas']-(int)$s->fetchColumn());}
        if($free<(int)$hold['quantidade'])throw new InvalidArgumentException('A retenção já não tem stock disponível. Contacte o suporte se o pagamento foi efetuado.');
        $s=$conn->prepare("UPDATE reservas_temporarias SET status='confirmada',reserva_id=? WHERE id=?");$s->execute([$reservaId,$hold['id']]);
        $s=$conn->prepare('UPDATE experiencia_sessoes SET vagas_ocupadas=vagas_ocupadas+? WHERE id=?');$s->execute([(int)$hold['quantidade'],$hold['sessao_id']]);
        sincronizarPendentesSessao($conn,(int)$hold['sessao_id']);
        if($manageTransaction)$conn->commit();return ['success'=>true,'idempotente'=>false,'quantidade_confirmada'=>(int)$hold['quantidade']];
    }catch(Throwable $e){if($manageTransaction && $conn->inTransaction())$conn->rollBack();throw $e;}
}
