<?php
declare(strict_types=1);

function carroFotoUrl($valor): ?string {
    if(!is_string($valor))return null;
    $url=trim(str_replace('\\','/',$valor));
    if($url==='' || preg_match('/^(null|undefined)$/i',$url))return null;
    if(str_starts_with($url,'//'))$url='https:'.$url;
    if(preg_match('#^https?://#i',$url))return filter_var($url,FILTER_VALIDATE_URL)?$url:null;
    if(preg_match('#^[a-z][a-z0-9+.-]*:#i',$url))return null;
    if(str_starts_with($url,'/') || str_starts_with($url,'uploads/') || str_starts_with($url,'api/'))return 'https://welovepalop.com/'.ltrim($url,'/');
    return 'https://welovepalop.com/uploads/carros/'.$url;
}

/** Only the vehicle's own uploaded and publishable photos, in host order. */
function carroFotosPublicas(PDO $db,int $id): array {
    $r=$db->prepare('SELECT caminho_url FROM carro_imagem_revisoes WHERE carro_id=?');$r->execute([$id]);$excluidas=[];
    foreach($r->fetchAll(PDO::FETCH_COLUMN) as $url) {$url=carroFotoUrl($url);if($url!==null)$excluidas[$url]=true;}
    $s=$db->prepare('SELECT id,caminho_url,principal,ordem FROM carro_imagens WHERE carro_id=? AND exibir_galeria=1 AND caminho_url IS NOT NULL AND TRIM(caminho_url)<>\'\' ORDER BY principal DESC,ordem,id');
    $s->execute([$id]);$fotos=[];$urls=[];
    foreach($s->fetchAll(PDO::FETCH_ASSOC) as $foto) {
        $url=carroFotoUrl($foto['caminho_url']);
        if($url!==null && !isset($excluidas[$url]) && !isset($urls[$url])) {$urls[$url]=true;$foto['caminho_url']=$url;$fotos[]=$foto;}
    }
    return $fotos;
}
