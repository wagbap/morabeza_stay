<?php
declare(strict_types=1);
require_once __DIR__ . '/confirmacao.php';
require_once __DIR__ . '/../vendor/qrcode.php';

/** A4 vector drawing. Coordinates are points measured from the top left. */
class ComprovativoReservaPDF {
    public $stream = '';
    public $links = [];
    public $images = [];
    public function color(string $hex, bool $fill = true): void {
        $rgb = sscanf(ltrim($hex, '#'), '%02x%02x%02x');
        $this->stream .= sprintf('%.3f %.3f %.3f %s ', $rgb[0]/255, $rgb[1]/255, $rgb[2]/255, $fill ? 'rg' : 'RG');
    }
    public function line(float $x,float $y,float $x2,float $y2,string $color='#bfc3c8',float $width=.6,bool $dash=false): void {
        $this->color($color,false);
        $this->stream .= sprintf('%.2f w %s %.2f %.2f m %.2f %.2f l S [] 0 d ', $width,$dash?'[2 2] 0 d':'[] 0 d',$x,842-$y,$x2,842-$y2);
    }
    public function box(float $x,float $y,float $w,float $h,string $stroke='#ffffff',?string $fill=null,float $radius=0): void {
        $this->color($stroke,false); if($fill!==null) $this->color($fill);
        $this->stream .= '.9 w '; $b=842-$y-$h;
        if(!$radius) $this->stream .= sprintf('%.2f %.2f %.2f %.2f re ',$x,$b,$w,$h);
        else {
            $r=min($radius,$w/2,$h/2);$k=.55228475*$r;
            $this->stream .= sprintf('%.2f %.2f m %.2f %.2f l %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f l %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f l %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f l %.2f %.2f %.2f %.2f %.2f %.2f c h ',
                $x+$r,$b,$x+$w-$r,$b,$x+$w-$r+$k,$b,$x+$w,$b+$r-$k,$x+$w,$b+$r,
                $x+$w,$b+$h-$r,$x+$w,$b+$h-$r+$k,$x+$w-$r+$k,$b+$h,$x+$w-$r,$b+$h,
                $x+$r,$b+$h,$x+$r-$k,$b+$h,$x,$b+$h-$r+$k,$x,$b+$h-$r,
                $x,$b+$r,$x,$b+$r-$k,$x+$r-$k,$b,$x+$r,$b);
        }
        $this->stream .= $fill===null?'S ':'B ';
    }
    public function text(float $x,float $y,string $text,float $size=10,bool $bold=false,string $color='#13151b'): void {
        $this->color($color);
        $latin=iconv('UTF-8','Windows-1252//TRANSLIT',$text);
        $latin=preg_replace('/[\x00-\x1f\x7f]/',' ',$latin===false?'':$latin);
        $latin=str_replace(['\\','(',')'],['\\\\','\\(','\\)'],$latin);
        $this->stream .= sprintf('BT /%s %.2f Tf 1 0 0 1 %.2f %.2f Tm (%s) Tj ET ',$bold?'F2':'F1',$size,$x,842-$y,$latin);
    }
    public function width(string $s,float $size): float {
        $latin=iconv('UTF-8','Windows-1252//TRANSLIT',$s);$w=0;
        foreach(str_split($latin===false?'':$latin) as $c) $w+=strpos(' ilI.,:;!|',$c)!==false?.26:(strpos('MW@%',$c)!==false?.86:.53);
        return $w*$size;
    }
    public function wrap(string $s,float $width,float $size): array {
        $lines=[];$line='';
        foreach(preg_split('/\s+/u',trim($s))?:[] as $word) {
            if($line!=='' && $this->width($line.' '.$word,$size)>$width) {$lines[]=$line;$line='';}
            $line.=($line===''?'':' ').$word;
        }
        if($line!=='') $lines[]=$line;
        return $lines;
    }
    public function paragraph(float $x,float $y,string $s,float $w,float $size=10,float $leading=14,bool $bold=false,string $color='#36383d'): float {
        foreach($this->wrap($s,$w,$size) as $line) {$this->text($x,$y,$line,$size,$bold,$color);$y+=$leading;}
        return $y;
    }
    public function link(float $x,float $y,float $w,float $h,string $url): void {$this->links[]=[$x,842-$y-$h,$x+$w,842-$y,$url];}
    public function bed(float $x,float $y,string $color='#0755b1'): void {
        $this->box($x,$y+6,17,8,$color,null,1);$this->box($x+1,$y,15,7,$color,null,1);
        $this->line($x,$y+13,$x,$y+18,$color,1.5);$this->line($x+17,$y+13,$x+17,$y+18,$color,1.5);
    }
    public function icon(int $kind,float $x,float $y): void {
        $c='#666a70';
        if($kind===0 || $kind===4) {
            $this->box($x,$y,13,10,$c,null,1);$this->line($x,$y+3,$x+13,$y+3,$c,1.3);
            $this->line($x+2,$y+7,$x+5,$y+7,$c,.8);
        } elseif($kind===1) {
            $this->box($x+2,$y-1,9,13,$c,null,1);
            foreach([3,6,9] as $dy) $this->line($x+4,$y+$dy,$x+9,$y+$dy,$c,.7);
        } elseif($kind===2) $this->text($x,$y+11,'#',18,false,$c);
        elseif($kind===3) {
            $this->box($x,$y+5,9,6,$c,null,3);$this->box($x+6,$y-1,9,6,$c,null,3);
            $this->line($x+5,$y+7,$x+10,$y+2,$c,1);
        } else {$this->box($x-1,$y-2,15,15,$c,null,7.5);$this->text($x+3,$y+9,'?',12,false,$c);}
    }
    public function itemIcon(string $tipo,float $x,float $y,string $color='#0755b1'): void {
        if($tipo==='alojamento') {$this->bed($x,$y,$color);return;}
        if($tipo==='carro') {
            $this->box($x,$y+5,18,9,$color,null,2);$this->box($x+3,$y,12,7,$color,null,2);
            $this->box($x+2,$y+12,4,4,$color,'#ffffff',2);$this->box($x+12,$y+12,4,4,$color,'#ffffff',2);
        } else {
            $this->box($x,$y,18,18,$color,null,9);$this->line($x+5,$y+13,$x+12,$y+5,$color,1.4);
            $this->line($x+12,$y+5,$x+12,$y+10,$color,1);$this->line($x+5,$y+13,$x+5,$y+8,$color,1);
        }
    }
    public function qr(string $code,float $x,float $y,float $size): void {
        $qr=QRCode::getMinimumQRCode($code,QR_ERROR_CORRECT_LEVEL_M);
        $count=$qr->getModuleCount();$cell=$size/($count+8);
        $this->box($x,$y,$size,$size,'#ffffff','#ffffff');$this->color('#000000');
        for($row=0;$row<$count;$row++) for($col=0;$col<$count;$col++) if($qr->isDark($row,$col))
            $this->stream.=sprintf('%.3f %.3f %.3f %.3f re f ',$x+($col+4)*$cell,842-$y-($row+5)*$cell,$cell+.015,$cell+.015);
    }
    public function jpeg(string $bytes,float $x,float $y,float $w,float $h): bool {
        if(substr($bytes,0,8)==="\x89PNG\r\n\x1a\n") {
            $i=8;$data='';$palette='';$info=null;
            while($i+12<=strlen($bytes)) {
                $n=unpack('N',substr($bytes,$i,4))[1];$type=substr($bytes,$i+4,4);$chunk=substr($bytes,$i+8,$n);
                if(strlen($chunk)!==$n) return false;
                if($type==='IHDR') $info=unpack('Nwidth/Nheight/Cbits/Ctype/Ccompression/Cfilter/Cinterlace',$chunk);
                elseif($type==='PLTE') $palette=$chunk;
                elseif($type==='IDAT') $data.=$chunk;
                elseif($type==='IEND') break;
                $i+=$n+12;
            }
            if(!$info || $info['interlace']!==0 || !in_array($info['type'],[0,2,3],true) || $data==='') return false;
            if($info['type']===3 && $palette==='') return false;
            $info['channels']=$info['type']===2?3:1;
            $info['space']=$info['type']===3?'[/Indexed /DeviceRGB '.((int)(strlen($palette)/3)-1).' <'.bin2hex($palette).'>]':($info['type']===2?'/DeviceRGB':'/DeviceGray');
            $info['png']=true;
            $name='Im'.(count($this->images)+1);$this->images[$name]=[$data,$info];
            $this->stream.=sprintf('q %.2f 0 0 %.2f %.2f %.2f cm /%s Do Q ',$w,$h,$x,842-$y-$h,$name);return true;
        }
        if(substr($bytes,0,2)!=="\xff\xd8") return false;
        $i=2;$length=strlen($bytes);$info=null;
        while($i+9<$length) {
            if(ord($bytes[$i])!==255) {$i++;continue;}
            $marker=ord($bytes[$i+1]);$i+=2;
            if($marker===217 || $marker===218) break;
            if($marker===216 || $marker===1 || ($marker>=208 && $marker<=215)) continue;
            $n=unpack('n',substr($bytes,$i,2))[1];if($n<2) break;
            if(in_array($marker,[192,193,194],true)) {$info=unpack('Cbits/nheight/nwidth/Cchannels',substr($bytes,$i+2,6));break;}
            $i+=$n;
        }
        if(!$info || !in_array($info['channels'],[1,3],true)) return false;
        $name='Im'.(count($this->images)+1);$this->images[$name]=[$bytes,$info];
        $this->stream.=sprintf('q %.2f 0 0 %.2f %.2f %.2f cm /%s Do Q ',$w,$h,$x,842-$y-$h,$name);return true;
    }
    public function output(): string {
        $objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
            '<< /Length '.strlen($this->stream).">>\nstream\n".$this->stream."\nendstream"];
        $resources='';$annotations=[];
        foreach($this->images as $name=>[$bytes,$info]) {
            $id=count($objects)+1;$resources.='/'.$name.' '.$id.' 0 R ';
            $png=!empty($info['png']);
            $space=$png?$info['space']:'/'.($info['channels']===1?'DeviceGray':'DeviceRGB');
            $filter=$png?'/FlateDecode /DecodeParms << /Predictor 15 /Colors '.$info['channels'].' /BitsPerComponent '.$info['bits'].' /Columns '.$info['width'].' >>':'/DCTDecode';
            $objects[]='<< /Type /XObject /Subtype /Image /Width '.$info['width'].' /Height '.$info['height'].' /ColorSpace '.$space.' /BitsPerComponent '.($png?$info['bits']:8).' /Filter '.$filter.' /Length '.strlen($bytes).">>\nstream\n".$bytes."\nendstream";
        }
        foreach($this->links as [$x,$y,$x2,$y2,$url]) {
            $id=count($objects)+1;$annotations[]=$id.' 0 R';
            $url=str_replace(['\\','(',')'],['\\\\','\\(','\\)'],$url);
            $objects[]=sprintf('<< /Type /Annot /Subtype /Link /Rect [%.2f %.2f %.2f %.2f] /Border [0 0 0] /A << /S /URI /URI (%s) >> >>',$x,$y,$x2,$y2,$url);
        }
        $objects[2]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << '.$resources.' >> >> /Contents 6 0 R /Annots ['.implode(' ',$annotations).'] >>';
        $pdf="%PDF-1.4\n";$offsets=[0];
        foreach($objects as $i=>$object) {$offsets[]=strlen($pdf);$pdf.=($i+1)." 0 obj\n".$object."\nendobj\n";}
        $xref=strlen($pdf);$count=count($objects)+1;$pdf.="xref\n0 ".$count."\n0000000000 65535 f \n";
        foreach(array_slice($offsets,1) as $offset) $pdf.=sprintf("%010d 00000 n \n",$offset);
        return $pdf."trailer\n<< /Size ".$count." /Root 1 0 R >>\nstartxref\n".$xref."\n%%EOF";
    }
}

/** Fetch only a fixed map provider, never an arbitrary request URL. */
function mapaComprovativoReserva(array $d,array $settings): string {
    $lat=filter_var($d['latitude']??null,FILTER_VALIDATE_FLOAT);$lng=filter_var($d['longitude']??null,FILTER_VALIDATE_FLOAT);
    $token=$settings['mapbox_token']??getenv('MAPBOX_TOKEN');
    if($lat===false || $lng===false || abs($lat)>85 || abs($lng)>180 || !$token || !function_exists('curl_init')) return '';
    $point=sprintf('%.6F,%.6F',$lng,$lat);
    $url='https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+0755b1('.$point.')/'.$point.',14/640x470.png?access_token='.rawurlencode($token);
    $curl=curl_init($url);curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>6,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true]);
    $bytes=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_HTTP_CODE);curl_close($curl);
    return $status===200 && is_string($bytes) && strlen($bytes)<2500000?$bytes:'';
}

function gerarPdfComprovativoReserva(array $d): string {
    $p=new ComprovativoReservaPDF();$tipo=$d['tipo'];$blue='#0755b1';$gray='#575a60';$paid=emailReservaEstaPaga($d);
    $startLabel=['alojamento'=>'Check-in','carro'=>'Levantamento','experiencia'=>'Atividade'][$tipo];
    $endLabel=['alojamento'=>'Check-out','carro'=>'Devolução','experiencia'=>'Fim / duração'][$tipo];
    $personLabel=['alojamento'=>'Hóspede principal','carro'=>'Condutor principal','experiencia'=>'Participante principal'][$tipo];
    $arrival=['alojamento'=>'check-in','carro'=>'levantamento','experiencia'=>'início da atividade'][$tipo];
    $booking='https://morabezastay.cv/gest/reserva/'.rawurlencode((string)$d['reserva_id']).'/'.$tipo;
    $p->text(20,46,'MORABEZA.',21,true,'#071b40');$p->text(147,46,'STAY',21,false,'#071b40');
    $p->text(218,31,'NÚMERO DE RESERVA',10);
    $code=(string)$d['codigo_reserva'];
    if(strlen($code)>28) {
        foreach(str_split($code,28) as $i=>$part) $p->text(218,45+$i*9,$part,6.5,false,'#36383d');
    } else $p->text(218,47,$code,min(9,107/max(1,$p->width($code,1))),false,'#36383d');
    $p->text(349,32,'COMPROVATIVO DE RESERVA',10);$p->text(349,47,'Apresente no '.$arrival.', impresso ou digital',9);
    $p->line(18,62,578,62,'#8d939b');$p->line(337,8,337,403,'#c3c7cc',.7,true);
    $title=$d['titulo'].(!empty($d['localizacao'])?' - '.$d['localizacao']:'');
    $endTitle=$p->paragraph(20,97,$title,305,16,19,true,'#10131b');
    $monthNames=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    $startDate=DateTimeImmutable::createFromFormat('!Y-m-d',substr($d['inicio'],0,10));
    $endDate=DateTimeImmutable::createFromFormat('!Y-m-d',substr($d['fim'],0,10));
    $period=emailReservaData($d['inicio']).' a '.emailReservaData($d['fim']);
    if($startDate && $endDate && $startDate->format('Y-m')===$endDate->format('Y-m')) $period=$startDate->format('j').' a '.$endDate->format('j').' de '.$monthNames[(int)$startDate->format('n')-1].' de '.$startDate->format('Y');
    if($tipo==='experiencia') $period=emailReservaData($d['inicio']).(!empty($d['horario'])?' · '.$d['horario']:'');
    $p->text(20,$endTitle+1,$period,13);
    $shift=max(0,$endTitle-116);$y1=143+$shift;$y2=258+$shift;
    $p->line(74,$y1,74,$y2,$blue,1.6);
    foreach([$y1,$y2] as $cy) $p->box(66,$cy-8,16,16,$blue,'#ffffff',8);
    $p->text(20,$y1+5,(string)($d['hora_inicio']??''),13);$p->text(93,$y1+5,$startLabel.' · '.emailReservaData($d['inicio']),12.5);
    $p->paragraph(93,$y1+21,(string)($d['morada']??''),230,10,13,false,$gray);
    $item=$d['itens'][0]??['nome'=>$d['titulo'],'descricao'=>$d['detalhes']];
    $p->box(93,184+$shift,233,47,$blue,'#ffffff',4);$p->itemIcon($tipo,110,199+$shift);
    $nameSize=$p->width($item['nome'],11)>175?9.5:11;
    $nameLines=$p->wrap($item['nome'],176,$nameSize);
    $p->paragraph(142,(count($nameLines)>1?197:203)+$shift,$item['nome'],176,$nameSize,11,true);
    $p->text(142,219+$shift,$item['descricao']??'',9,false,$gray);
    $p->text(20,$y2+5,(string)($d['hora_fim']??''),13);
    $endText=$tipo==='experiencia'?($d['duracao']??'Consultar a reserva'):emailReservaData($d['fim']);
    $p->text(93,$y2+5,$endLabel.' · '.$endText,12.5);$p->paragraph(93,$y2+22,$d['detalhes'],230,10,13,false,$gray);
    $p->qr($d['codigo_reserva'],424,81,82);$p->text(437,175,'QR da reserva',8,false,$gray);
    $p->text(357,201,$personLabel,10,false,$gray);$p->text(508,201,'Estado',10,false,$gray);
    $p->paragraph(357,219,$d['participante_principal']['nome_completo']??$d['nome_cliente'],142,11.5,14,true);
    $p->text(508,219,$paid?'PAGO':'PENDENTE',11.5,true);$p->itemIcon($tipo,358,251,'#575a60');
    $count=(int)($d['quartos_quantidade']??0);
    $summary=$tipo==='alojamento'?($count?($count===1?'1 quarto reservado':$count.' quartos reservados'):'Alojamento reservado'):($tipo==='carro'?'Veículo reservado':'Atividade reservada');
    $p->text(384,262,$summary,9.5,true);
    if(!empty($d['pessoas_resumo'])) {
        $p->box(499,251,6,6,$gray,null,3);$p->box(497,258,10,6,$gray,null,2);
        $p->text(514,262,$d['pessoas_resumo'],9.5,true);
    }
    $p->line(12,403,583,403,'#c3c7cc',.7,true);$p->line(309,403,309,831,'#c3c7cc',.7,true);
    $p->text(20,432,'Informação da reserva',12,true);$p->text(321,432,['alojamento'=>'Checklist da sua estadia','carro'=>'Checklist do seu aluguer','experiencia'=>'Checklist da sua atividade'][$tipo],12,true);
    $breakdown=implode(' · ',array_column($d['linhas_pagamento']??[],'descricao'))?:$d['detalhes'];
    $info=[[$paid?'Total pago: ':'Total da reserva: ',emailReservaDinheiro($d['preco_total'])],
        [$tipo==='alojamento'?'Estadia: ':'Reserva: ',$breakdown],['Código: ',$d['codigo_reserva']],['Gerir a reserva: ','morabezastay.cv'],
        ['Pagamento: ',implode(' · ',array_filter([$d['metodo_pagamento']??'',$d['referencia_pagamento']??'']))?:'Consultar a reserva'],
        ['Apoio: ',$d['support_email']??'morabezastay.cv']];
    $iy=459;
    foreach($info as $index=>[$label,$value]) {
        $p->icon($index,24,$iy-9);
        if($index===0) {
            $p->text(54,$iy,$label,10,false,'#36383d');
            $p->text(54+$p->width($label,10),$iy,$value,10,true,'#36383d');$iy+=29;
        } else $iy=$p->paragraph(54,$iy,$label.$value,240,10,13,false,'#36383d')+16;
        if($index===3) $p->link(54,$iy-28,230,17,$booking);
    }
    $checks=[$tipo==='carro'?'Leve a carta de condução e um documento de identificação.':'Leve um documento de identificação.',
        'Guarde este comprovativo e apresente o QR no '.$arrival.'.','Confirme com o anfitrião o horário e as instruções de chegada.'];
    $cy=459;
    foreach($checks as $check) {$p->box(322,$cy-10,14,14,'#5e6165',null,1);$cy=$p->paragraph(350,$cy,$check,224,10,13)+13;}
    $p->text(321,574,['alojamento'=>'O seu alojamento','carro'=>'O seu veículo','experiencia'=>'A sua experiência'][$tipo],12,true);
    $dy=$p->paragraph(321,594,$title,256,10.5,13,true);
    $addressEnd=$p->paragraph(321,$dy+2,(string)($d['morada']??''),256,9,11);
    $contact=implode(' · ',array_filter([$d['anfitriao_phone']??'',$d['anfitriao_email']??'']));
    if($contact!=='') $addressEnd=$p->paragraph(321,$addressEnd,$contact,256,8,10);
    $mapY=max(620,$addressEnd+10);$mapH=max(80,807-$mapY);
    $lat=$d['latitude']??null;$lng=$d['longitude']??null;
    $mapUrl=is_numeric($lat)&&is_numeric($lng)?'https://www.google.com/maps/search/?api=1&query='.rawurlencode($lat.','.$lng):'https://www.google.com/maps/search/?api=1&query='.rawurlencode($d['morada']??$title);
    $hasMap=!empty($d['mapa_jpeg']) && $p->jpeg($d['mapa_jpeg'],321,$mapY,256,$mapH);
    $illustrative=false;
    if(!$hasMap) {
        $assets=emailReservaAssets();
        $fallback=base64_decode($assets['map-example']??'',true);
        if($fallback!==false && $fallback!=='') {
            $hasMap=$p->jpeg($fallback,321,$mapY,256,$mapH);
            $illustrative=$hasMap;
        }
    }
    if($illustrative) {
        $p->box(327,$mapY+6,218,16,'#ffffff','#ffffff',2);
        $p->text(333,$mapY+17,'Mapa ilustrativo - Praia, Cabo Verde',8,true,'#0755b1');
    }
    if(!$hasMap) {
        $p->box(321,$mapY,256,$mapH,'#e2e6eb','#f3f6f9',3);$p->text(343,$mapY+40,'Ver localização no mapa',13,true,$blue);
        $p->paragraph(343,$mapY+63,'Abra este link para consultar a localização confirmada da sua reserva.',210,10,14);
    }
    $p->link(321,$mapY,256,$mapH,$mapUrl);
    if(!empty($d['exemplo'])) $p->text(20,805,'MODELO COM DADOS DE EXEMPLO. Não constitui reserva válida.',6.5,false,$gray);
    $p->paragraph(20,816,'Aplicam-se as condições de cancelamento aceites na reserva. Não substitui uma fatura fiscal.',280,6.5,8,false,$gray);
    return $p->output();
}
