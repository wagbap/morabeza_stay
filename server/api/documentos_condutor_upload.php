<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');header('Access-Control-Allow-Methods: POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type');header('Cache-Control: no-store');ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){http_response_code(405);exit;}
require_once __DIR__.'/carroStock.php';require_once __DIR__.'/carroDocumentos.php';
$moved=[];
try {
    $files=[];
    foreach(carroDocumentosTipos() as $tipo) {
        $f=$_FILES[$tipo]??null;
        if(!is_array($f) || ($f['error']??-1)!==UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name']??''))throw new InvalidArgumentException('Envie os três ficheiros completos.');
        $files[$tipo]=['upload'=>$f,'meta'=>carroDocumentoInspecionar($f['tmp_name'],$f['name'],(int)$f['size'])];
    }
    $email=strtolower(trim((string)($_POST['email']??'')));$otp=(string)($_POST['otp']??'');
    $id=filter_var($_POST['carro_id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $inicio=(string)($_POST['inicio']??'');$fim=(string)($_POST['fim']??'');carroPeriodoStock($inicio,$fim);
    if(!$id || !filter_var($email,FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/D',$otp))throw new InvalidArgumentException('Dados inválidos.');
    $dir=carroDocumentosDiretorio();$db=carroStockConexao();
    $s=$db->prepare("SELECT id FROM carros WHERE id=? AND status_carro='aprovado' AND status='disponivel'");$s->execute([$id]);if(!$s->fetchColumn())throw new InvalidArgumentException('Veículo inválido.');
    // Check migrations before consuming the driver's one-time code.
    $db->query('SELECT id FROM carro_documento_lotes LIMIT 0');$db->query('SELECT id FROM carro_documentos_condutor LIMIT 0');
    // Verify the existing OTP ONCE, on the server. Browser declarations never authenticate uploads.
    if(!function_exists('curl_init'))throw new RuntimeException('OTP verification unavailable');
    $c=curl_init('https://welovepalop.com/api/send_otp.php');curl_setopt_array($c,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode(['action'=>'verify_otp','email'=>$email,'otp'=>$otp]),CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>15,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true]);
    $raw=curl_exec($c);$http=curl_getinfo($c,CURLINFO_HTTP_CODE);curl_close($c);$verified=is_string($raw)?json_decode($raw,true):null;
    if($http===0 || $http>=500 || !is_array($verified))throw new RuntimeException('OTP verification unavailable');
    if($http!==200 || ($verified['status']??'')!=='success')throw new DomainException('Código inválido ou expirado.');
    $lote=bin2hex(random_bytes(16));$token=bin2hex(random_bytes(32));$db->beginTransaction();
    $db->prepare('INSERT INTO carro_documento_lotes(id,token_hash,email,carro_id,inicio,fim,expira_em) VALUES(?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 2 HOUR))')->execute([$lote,hash('sha256',$token),$email,$id,$inicio,$fim]);
    foreach($files as $tipo=>$f) {
        $doc=bin2hex(random_bytes(16));$key=$doc.'.bin';$path=$dir.DIRECTORY_SEPARATOR.$key;
        if(!move_uploaded_file($f['upload']['tmp_name'],$path))throw new RuntimeException('Private document write failed');
        $moved[]=$path;if(!chmod($path,0600))throw new RuntimeException('Private document permissions unavailable');
        $db->prepare('INSERT INTO carro_documentos_condutor(id,lote_id,tipo,ficheiro,mime,tamanho,sha256) VALUES(?,?,?,?,?,?,?)')->execute([$doc,$lote,$tipo,$key,$f['meta']['mime'],$f['meta']['tamanho'],$f['meta']['sha256']]);
    }
    $db->commit();echo json_encode(['success'=>true,'documentos'=>['lote'=>$lote,'token'=>$token,'email'=>$email]],JSON_THROW_ON_ERROR);
} catch(Throwable $e) {
    if(isset($db)&&$db->inTransaction())$db->rollBack();foreach($moved as $path)if(is_file($path))unlink($path);
    http_response_code($e instanceof DomainException?403:($e instanceof InvalidArgumentException?422:503));
    error_log('[driver-documents-upload] '.get_class($e));echo json_encode(['success'=>false,'code'=>$e instanceof DomainException?'OTP_INVALID':($e instanceof InvalidArgumentException?'DOCUMENT_INVALID':'DOCUMENT_STORAGE_UNAVAILABLE')]);
}
