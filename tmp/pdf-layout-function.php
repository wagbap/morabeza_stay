function gerarPdfComprovativoReserva(array $d): string {
    $p=new ComprovativoReservaPDF();$tipo=$d['tipo'];$blue='#0755b1';$gray='#575a60';$paid=emailReservaEstaPaga($d);
    $labels=[
        'alojamento'=>['Alojamento','Check-in','Check-out','Hóspede principal','Quartos e alojamento','Para a sua estadia','check-in'],
        'carro'=>['Aluguer de veículo','Levantamento','Devolução','Condutor principal','Veículos reservados','Para o seu aluguer','levantamento'],
        'experiencia'=>['Experiência','Início da atividade','Fim / duração','Participante principal','Atividades reservadas','Para a sua atividade','início da atividade'],
    ][$tipo];
    $code=(string)$d['codigo_reserva'];$page=1;$y=0;
    $header=function() use($p,$labels,$code,&$page,&$y): void {
        $p->text(32,40,'MORABEZA STAY',18,true,'#071b40');
        $p->text(32,60,'COMPROVATIVO DE RESERVA - '.$labels[0],9,false,'#575a60');
        $p->line(32,74,563,74,'#dce6f1');
        $p->text(32,798,'Morabeza Stay | Comprovativo de reserva',8,false,'#575a60');
        $p->text(505,798,'Pág. '.$page,8,false,'#575a60');
        $y=100;
    };
    $ensure=function(float $height) use($p,&$y,&$page,$header): void {
        if($y+$height>770) {$p->newPage();$page++;$header();}
    };
    // All body text flows within a single column, including long references and names.
    $paragraph=function(string $text,float $size=10,bool $bold=false,string $color='#36383d') use($p,&$y,$ensure): void {
        foreach($p->wrap($text,503,$size) as $line) {
            $ensure($size+8);$p->text(44,$y,$line,$size,$bold,$color);$y+=$size+5;
        }
        $y+=5;
    };
    $section=function(string $title) use($p,&$y,$ensure): void {
        $ensure(72);$y+=10;
        $p->box(32,$y-15,531,29,'#edf5fb','#edf5fb',4);
        $p->text(44,$y+4,$title,11,true,'#0755b1');$y+=34;
    };
    $header();
    $paragraph((string)$d['titulo'],18,true,'#071b40');
    if(!empty($d['localizacao'])) $paragraph((string)$d['localizacao'],11);
    $paragraph('Número de reserva: '.$code,10,true);
    $ensure(116);
    $p->box(32,$y-6,531,110,'#dce6f1','#f5f9fd',6);
    $p->text(46,$y+15,'ESTADO DO PAGAMENTO',9,false,$gray);
    $p->text(46,$y+36,$paid?'PAGO':'PENDENTE',16,true,$paid?'#087f46':'#995500');
    $p->text(46,$y+62,$paid?'Total pago':'Total da reserva',10,false,$gray);
    $p->text(46,$y+83,emailReservaDinheiro($d['preco_total']),18,true,'#071b40');
    $p->qr($code,455,$y-1,94);$y+=124;
    $section('Datas e horários');
    $paragraph($labels[1].': '.emailReservaData($d['inicio']??'').(!empty($d['hora_inicio'])?' - '.$d['hora_inicio']:''),11,true);
    $end=$tipo==='experiencia'?($d['duracao']??$d['horario']??'Consultar a reserva'):emailReservaData($d['fim']??'').(!empty($d['hora_fim'])?' - '.$d['hora_fim']:'');
    $paragraph($labels[2].': '.$end,11,true);
    if(!empty($d['detalhes'])) $paragraph((string)$d['detalhes']);
    if(!empty($d['pessoas_resumo'])) $paragraph('Pessoas: '.$d['pessoas_resumo']);
    $section($labels[4]);
    $items=$d['itens']??[];
    if(!$items) $items=[['nome'=>$d['titulo'],'descricao'=>$d['detalhes']??'']];
    foreach($items as $item) {
        $ensure(55);$paragraph((string)($item['nome']??$d['titulo']),11,true);
        if(!empty($item['descricao'])) $paragraph((string)$item['descricao']);
    }
    $section($labels[3]);
    $main=$d['participante_principal']??[];
    foreach([$main['nome_completo']??$d['nome_cliente'],$main['email']??$d['email_cliente']??'',$main['phone']??$d['phone_cliente']??''] as $value) if($value!=='') $paragraph((string)$value);
    foreach($d['participantes_adicionais']??[] as $person) if(!empty($person['nome_completo'])) $paragraph('Participante: '.$person['nome_completo']);
    $section('Pagamento');
    foreach($d['linhas_pagamento']??[] as $row) $paragraph($row['descricao'].' - '.emailReservaDinheiro($row['valor']));
    $reference=implode(' - ',array_filter([$d['metodo_pagamento']??'',$d['referencia_pagamento']??'']));
    if($reference!=='') $paragraph('Referência: '.$reference);
    $paragraph(($paid?'Total pago: ':'Total da reserva: ').emailReservaDinheiro($d['preco_total']),12,true);
    $section($tipo==='carro'?'Local de levantamento e contacto':($tipo==='experiencia'?'Ponto de encontro e contacto':'Morada e contacto do alojamento'));
    $address=(string)($d['morada']??$d['localizacao']??'');
    if($address!=='') $paragraph($address);
    foreach(['anfitriao_nome','anfitriao_phone','anfitriao_email','instrucoes'] as $field) if(!empty($d[$field])) $paragraph((string)$d[$field]);
    $lat=$d['latitude']??null;$lng=$d['longitude']??null;
    $mapUrl=is_numeric($lat)&&is_numeric($lng)?'https://www.google.com/maps/search/?api=1&query='.rawurlencode($lat.','.$lng):'https://www.google.com/maps/search/?api=1&query='.rawurlencode($address?:$d['titulo']);
    $ensure(165);$mapY=$y;
    $hasMap=!empty($d['mapa_jpeg']) && $p->jpeg($d['mapa_jpeg'],44,$mapY,240,132);
    $illustrative=false;
    if(!$hasMap) {
        $assets=emailReservaAssets();$fallback=base64_decode($assets['map-example']??'',true);
        if($fallback) {$hasMap=$p->jpeg($fallback,44,$mapY,240,132);$illustrative=$hasMap;}
    }
    if($hasMap) {
        $p->link(44,$mapY,240,132,$mapUrl);$y+=146;
        if($illustrative) $paragraph('Mapa ilustrativo - Praia, Cabo Verde',8,false,$gray);
    }
    $p->text(44,$y,'Abrir localização no Google Maps',10,true,$blue);$p->link(44,$y-12,300,18,$mapUrl);$y+=22;
    $section($labels[5]);
    $paragraph($tipo==='carro'?'Leve a carta de condução e um documento de identificação.':'Leve um documento de identificação.');
    $paragraph('Guarde este comprovativo e apresente o QR no '.$labels[6].'.');
    $paragraph($tipo==='experiencia'?'Confirme o ponto de encontro, o horário e os requisitos da atividade.':($tipo==='carro'?'Confirme o local de levantamento, a caução e as condições de devolução.':'Confirme o horário de chegada e as instruções de acesso com o anfitrião.'));
    $booking='https://morabezastay.cv/gest/reserva/'.rawurlencode((string)$d['reserva_id']).'/'.$tipo;
    $ensure(35);$p->text(44,$y,'Ver e gerir a minha reserva',11,true,$blue);$p->link(44,$y-12,300,20,$booking);$y+=28;
    if(!empty($d['support_email'])) $paragraph('Apoio: '.$d['support_email'],9);
    if(!empty($d['cancelamento'])) $paragraph('Cancelamento: '.$d['cancelamento'],9);
    $paragraph('Aplicam-se as condições de cancelamento aceites na reserva. Não substitui uma fatura fiscal.',8,false,$gray);
    if(!empty($d['exemplo'])) $paragraph('MODELO COM DADOS DE EXEMPLO. Não constitui reserva válida.',8,true,$gray);
    return $p->output();
}
