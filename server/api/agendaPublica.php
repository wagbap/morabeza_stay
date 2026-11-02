<?php
    declare(strict_types=1);
    require_once __DIR__.'/agendaExperienciasLogica.php';

    function agendaSessoesPublicas(PDO $c,int $id,string $date,?string $periodo=null,?string $token=null): array {
        agendaData($date);
        $s=$c->prepare('SELECT * FROM experiencias WHERE id=?');$s->execute([$id]);$exp=$s->fetch(PDO::FETCH_ASSOC);
        if(!$exp)throw new InvalidArgumentException('Experiência não encontrada.');
        agendaAtualizarHorizonte($c,$id);
        $s=$c->prepare('SELECT * FROM experiencia_agendas WHERE experiencia_id=?');$s->execute([$id]);$agenda=$s->fetch(PDO::FETCH_ASSOC);
        if($agenda && !agendaAberta($date,$agenda,agendaLer($c,'experiencia_agenda_excecoes',$id)))return [];
        $now=new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde'));
        $minimum=(int)($agenda['minima_horas'] ?? $exp['antecedencia_minima_horas'] ?? 24);
        $maximum=(int)($agenda['maxima_dias'] ?? $exp['antecedencia_maxima_dias'] ?? 180);
        $registered=modeloRegistoLerOpcional($c,$id);
        $configs=[];foreach(agendaLer($c,'experiencia_configuracoes',$id) as $config)$configs[(int)$config['id']]=$config;
        $excluded=[];
        if($token && preg_match('/^[a-f0-9]{64}$/D',$token)){
            $hold=$c->prepare("SELECT id FROM reservas_temporarias WHERE token=? AND experiencia_id=? AND status='pendente' AND expira_em>?");
            $hold->execute([$token,$id,date('Y-m-d H:i:s')]);$excluded=$hold->fetchAll(PDO::FETCH_COLUMN);
        }
        $result=[];
        foreach(agendaLinhasDia($c,$id,$date,$excluded) as $row){
            if(!$row['ativo'])continue;
            $start=new DateTimeImmutable($date.' '.$row['hora_inicio'],new DateTimeZone('Atlantic/Cape_Verde'));
            if($start<$now->modify('+'.$minimum.' hours') || $start>$now->modify('+'.$maximum.' days'))continue;
            $config=$configs[(int)$row['configuracao_id']] ?? null;
            $row['unidade_venda']=$config['unidade'] ?? 'participante';
            if($registered && $row['unidade_venda']!==($registered['modelo_reserva']==='por_equipamento'?'unidade':'participante'))continue;
            if($row['unidade_venda']==='unidade'){
                $ids=json_decode($config['recursos_json'] ?? '[]',true) ?: [];
                foreach(agendaLer($c,'experiencia_agenda_recursos',$id) as $resource){
                    if($resource['tipo']==='equipamento' && in_array((int)$resource['id'],array_map('intval',$ids),true)){
                        $row['equipamento_nome']=$resource['nome'];break;
                    }
                }
            }

            $options=json_decode($config['opcoes_json'] ?? '{}',true) ?: [];
            $row['minimo_participantes']=$row['unidade_venda']==='participante' ? max(1,(int)($options['minimo_participantes'] ?? $exp['min_pessoas'] ?? 1)) : 1;
            $row['duracao_minutos']=(int)($config['duracao_minutos'] ?? (agendaMinutos($row['hora_fim'])-agendaMinutos($row['hora_inicio'])));
            $startMinutes=agendaMinutos($row['hora_inicio']);
            $row['periodo']=$startMinutes<720 ? 'Manhã' : ($startMinutes<960 ? 'Meio dia' : 'Tarde');
            if($periodo!==null && $periodo!=='' && $row['periodo']!==$periodo)continue;
            $row['vagas_disponiveis']=$row['livres'];
            $row['preco_especial']=$row['preco_especial']===null ? null : (float)$row['preco_especial'];
            $result[]=$row;
        }
        return $result;
    }
