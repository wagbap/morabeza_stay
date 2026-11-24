from pathlib import Path
import subprocess
p=Path('server/api/email/comprovativo.php')
current=p.read_text(encoding='utf-8')
original=subprocess.check_output(['git','show','HEAD:server/api/email/comprovativo.php']).decode('utf-8')
start='function gerarPdfComprovativoReserva(array $d): string {'
s=original[original.index(start):]
s=s.replace("    $p=new ComprovativoReservaPDF();", """    $overflow=[];
    $p=new ComprovativoReservaPDF();""",1)
needle="    $booking='https://morabezastay.cv/gest/reserva/'"
pos=s.index(needle)
s=s[:pos]+"""    // Keep the original two-column design. Only wrap and resize occupied areas.
    $fit=function(float $x,float $y,string $text,float $w,float $size,float $leading,int $maxLines,bool $bold=false,string $color='#36383d') use($p,&$overflow): float {
        $lines=$p->wrap($text,$w,$size);
        if(count($lines)>$maxLines) $overflow[]=implode(' ',array_slice($lines,$maxLines));
        foreach(array_slice($lines,0,$maxLines) as $line) {$p->text($x,$y,$line,$size,$bold,$color);$y+=$leading;}
        return $y;
    };
    $time=static function($value): string {
        $value=(string)$value;
        return preg_match('/^(\\d{2}:\\d{2})(?::\\d{2})?$/',$value,$m)?$m[1]:$value;
    };
"""+s[pos:]
a=s.index('    if(strlen($code)>28)')
b=s.index("    $p->line(18,62",a)
s=s[:a]+"""    $fit(218,45,$code,107,7,8,2,false,'#36383d');
    $p->text(349,32,'COMPROVATIVO DE RESERVA',10);
    $fit(349,47,'Apresente no '.$arrival.', impresso ou digital',225,9,11,1);
"""+s[b:]
s=s.replace("$endTitle=$p->paragraph(20,97,$title,305,16,19,true,'#10131b');", "$endTitle=$fit(20,97,$title,305,16,19,2,true,'#10131b');")
a=s.index('    $p->text(20,$endTitle+1,$period,13);')
b=s.index("    $p->qr($d['codigo_reserva']",a)
s=s[:a]+"""    $periodEnd=$fit(20,$endTitle+1,$period,305,13,15,1);
    $y1=max(143,$periodEnd+12);
    $p->text(20,$y1+5,$time($d['hora_inicio']??''),10);
    $fit(93,$y1+5,$startLabel.' · '.emailReservaData($d['inicio']),230,12.5,15,1);
    $addressEnd=$fit(93,$y1+21,(string)($d['morada']??''),230,10,13,2,false,$gray);
    $item=$d['itens'][0]??['nome'=>$d['titulo'],'descricao'=>$d['detalhes']??''];
    $cardY=max(184,$addressEnd+8);
    $nameSize=$p->width($item['nome'],11)>175?9.5:11;
    $nameLines=min(2,count($p->wrap($item['nome'],176,$nameSize)));
    $descLines=min(3,count($p->wrap($item['descricao']??'',176,9)));
    $cardH=max(47,18+$nameLines*12+$descLines*11);
    $p->box(93,$cardY,233,$cardH,$blue,'#ffffff',4);$p->itemIcon($tipo,110,$cardY+15);
    $nameEnd=$fit(142,$cardY+17,$item['nome'],176,$nameSize,12,2,true);
    $fit(142,$nameEnd+3,$item['descricao']??'',176,9,11,3,false,$gray);
    foreach(array_slice($d['itens']??[],1) as $extra) $overflow[]=($extra['nome']??'').' - '.($extra['descricao']??'');
    $y2=max(258,$cardY+$cardH+26);
    $p->line(74,$y1,74,$y2,$blue,1.6);
    foreach([$y1,$y2] as $cy) $p->box(66,$cy-8,16,16,$blue,'#ffffff',8);
    $p->text(20,$y2+5,$time($d['hora_fim']??''),10);
    $endText=$tipo==='experiencia'?($d['duracao']??'Consultar a reserva'):emailReservaData($d['fim']);
    $endY=$fit(93,$y2+5,$endLabel.' · '.$endText,230,12.5,15,1);
    $fit(93,$endY+7,$d['detalhes']??'',230,10,13,3,false,$gray);
"""+s[b:]
s=s.replace("$p->paragraph(357,219,$d['participante_principal']['nome_completo']??$d['nome_cliente'],142,11.5,14,true);", "$personEnd=$fit(357,219,$d['participante_principal']['nome_completo']??$d['nome_cliente'],142,11.5,14,3,true);")
s=s.replace("$p->text(508,219,$paid?'PAGO':'PENDENTE',11.5,true);$p->itemIcon($tipo,358,251,'#575a60');", "$p->text(508,219,$paid?'PAGO':'PENDENTE',10,true);\n    $summaryY=max(251,$personEnd+16);$p->itemIcon($tipo,358,$summaryY,'#575a60');")
s=s.replace("$p->text(384,262,$summary,9.5,true);", "$fit(384,$summaryY+11,$summary,105,9.5,12,3,true);")
s=s.replace("$p->box(499,251,6,6,$gray,null,3);$p->box(497,258,10,6,$gray,null,2);", "$p->box(499,$summaryY,6,6,$gray,null,3);$p->box(497,$summaryY+7,10,6,$gray,null,2);")
s=s.replace("$p->text(514,262,$d['pessoas_resumo'],9.5,true);", "$fit(514,$summaryY+11,$d['pessoas_resumo'],62,9.5,12,3,true);")
s=s.replace("} else $iy=$p->paragraph(54,$iy,$label.$value,240,10,13,false,'#36383d')+16;", "} else $iy=$fit(54,$iy,$label.$value,240,10,13,4,false,'#36383d')+16;")
s=s.replace("$cy=$p->paragraph(350,$cy,$check,224,10,13)+13;", "$cy=$fit(350,$cy,$check,224,10,13,3)+13;")
s=s.replace("    $p->text(321,574,", "    $detailY=max(574,$cy+10);\n    $p->text(321,$detailY,")
s=s.replace("$dy=$p->paragraph(321,594,$title,256,10.5,13,true);", "$dy=$fit(321,$detailY+20,$title,256,10.5,13,2,true);")
s=s.replace("$addressEnd=$p->paragraph(321,$dy+2,(string)($d['morada']??''),256,9,11);", "$addressEnd=$fit(321,$dy+2,(string)($d['morada']??''),256,9,11,2);")
s=s.replace("$addressEnd=$p->paragraph(321,$addressEnd,$contact,256,8,10);", "$addressEnd=$fit(321,$addressEnd,$contact,256,8,10,2);")
s=s.replace("    return $p->output();", """    // Exceptional overflow continues on extra pages; the normal receipt stays one page.
    if($overflow) {
        $p->newPage();$column=0;$oy=100;
        $continuationHeader=function() use($p): void {
            $p->text(20,46,'MORABEZA.',21,true,'#071b40');$p->text(147,46,'STAY',21,false,'#071b40');
            $p->text(20,78,'Detalhes adicionais da reserva',12,true);
            $p->line(18,62,578,62,'#8d939b');$p->line(300,90,300,810,'#c3c7cc',.7,true);
        };
        $continuationHeader();
        foreach($overflow as $text) {
            foreach($p->wrap($text,255,10) as $line) {
                if($oy>790) {
                    if($column===0) {$column=1;$oy=100;}
                    else {$p->newPage();$continuationHeader();$column=0;$oy=100;}
                }
                $p->text($column===0?20:320,$oy,$line,10);$oy+=14;
            }
            $oy+=12;
        }
    }
    return $p->output();""")
p.write_text(current[:current.index(start)]+s,encoding='utf-8')
