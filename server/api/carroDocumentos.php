<?php
declare(strict_types=1);

function carroDocumentosTipos(): array {return ['carta_frente','carta_verso','identificacao'];}

function carroDocumentoInspecionar(string $path,string $nome,int $tamanho): array {
    $ext=strtolower(pathinfo($nome,PATHINFO_EXTENSION));
    if($ext !== 'pdf' || $tamanho<1 || $tamanho>10*1024*1024 || !is_file($path) || filesize($path)!==$tamanho)throw new InvalidArgumentException('Formato ou tamanho inv?lido. Use apenas PDF at? 10 MB.');
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($path);
    if($mime !== 'application/pdf')throw new InvalidArgumentException('O conte?do n?o corresponde a um PDF.');
    $f=fopen($path,'rb');$head=fread($f,5);fseek($f,max(0,$tamanho-2048));$tail=stream_get_contents($f);fclose($f);
    if($head!=='%PDF-' || strpos($tail,'%%EOF')===false)throw new InvalidArgumentException('PDF inv?lido.');
    return ['mime'=>$mime,'tamanho'=>$tamanho,'sha256'=>hash_file('sha256',$path)];
}

function carroDocumentosDiretorio(?string $directory=null,?string $documentRoot=null): string {
    if($directory===null) {
        $config=is_file(__DIR__.'/documentos-config.local.php')?require __DIR__.'/documentos-config.local.php':[];
        $directory=getenv('CARRO_DOCUMENTOS_DIR') ?: ($config['directory']??'');
    }
    $documentRoot=$documentRoot??($_SERVER['DOCUMENT_ROOT']??'');
    if(!$directory || !$documentRoot || !preg_match('~^(?:/|[A-Za-z]:[\\\\/])~',$directory))throw new RuntimeException('Private document storage not configured');
    // Resolve and validate before creating anything; the parent must already exist.
    $parent=realpath(dirname($directory));$web=realpath($documentRoot);
    if(!$parent || !$web)throw new RuntimeException('Private document storage unavailable');
    $candidate=is_dir($directory)?realpath($directory):$parent.DIRECTORY_SEPARATOR.basename($directory);
    $normalize=static fn($v)=>strtolower(rtrim(str_replace('\\','/',$v),'/'));
    $target=$normalize($candidate);$public=$normalize($web);
    if($target==='' || $target===$public || strpos($target,$public.'/')===0)throw new RuntimeException('Documents must be outside the web root');
    if(!is_dir($candidate) && !mkdir($candidate,0700))throw new RuntimeException('Private document storage unavailable');
    if(!is_writable($candidate))throw new RuntimeException('Private document storage not writable');
    return $candidate;
}

function carroDocumentosValidar(PDO $db,array $ref,int $carro,string $inicio,string $fim,string $email,string $stock): array {
    if(!$db->inTransaction())throw new RuntimeException('Transaction required');
    if(!preg_match('/^[a-f0-9]{32}$/D',$ref['lote']??'') || !preg_match('/^[a-f0-9]{64}$/D',$ref['token']??''))throw new DomainException('Envie os três documentos do condutor.');
    $s=$db->prepare('SELECT * FROM carro_documento_lotes WHERE id=? FOR UPDATE');$s->execute([$ref['lote']]);$lote=$s->fetch(PDO::FETCH_ASSOC);
    $now=(string)$db->query('SELECT UTC_TIMESTAMP()')->fetchColumn();
    if(!$lote || !hash_equals($lote['token_hash'],hash('sha256',$ref['token'])) || $lote['reserva_id']!==null
        || (int)$lote['carro_id']!==$carro || $lote['inicio']!==$inicio || $lote['fim']!==$fim || strtolower($lote['email'])!==strtolower(trim($email))
        || (!empty($lote['token_stock']) && !hash_equals($lote['token_stock'],$stock))
        || (empty($lote['token_stock']) && $lote['expira_em']<=$now))throw new DomainException('Documentos inválidos para esta reserva.');
    $s=$db->prepare('SELECT tipo FROM carro_documentos_condutor WHERE lote_id=?');$s->execute([$lote['id']]);$tipos=$s->fetchAll(PDO::FETCH_COLUMN);sort($tipos);$expected=carroDocumentosTipos();sort($expected);
    if($tipos!==$expected)throw new DomainException('Os três documentos são obrigatórios.');
    $db->prepare('UPDATE carro_documento_lotes SET token_stock=? WHERE id=?')->execute([$stock,$lote['id']]);
    return $lote;
}

/** Hosts only see their confirmed, paid bookings near handover. Admins are authenticated separately. */
function carroDocumentoPodeAceder(array $reserva,string $contexto,int $uid,?string $hoje=null): bool {
    if($contexto==='admin')return $uid>0;
    if($contexto!=='host' || $uid<1 || (int)$reserva['proprietario_id']!==$uid || $reserva['status']!=='confirmada' || $reserva['pagamento_status']!=='pago')return false;
    $hoje=$hoje??(new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    $a=(new DateTimeImmutable($reserva['data_levantamento']))->modify('-2 days')->format('Y-m-d');
    $b=(new DateTimeImmutable($reserva['data_levantamento']))->modify('+1 day')->format('Y-m-d');
    return $hoje>=$a && $hoje<=$b;
}
