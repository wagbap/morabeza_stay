<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(403);exit;}
$api=getenv('CARRO_API_DIR') ?: __DIR__.'/../api';
require_once $api.'/carroStock.php';require_once $api.'/carroDocumentos.php';
// Supply the real site root explicitly; CLI does not populate DOCUMENT_ROOT.
$_SERVER['DOCUMENT_ROOT']=getenv('CARRO_DOCUMENT_ROOT') ?: '';
$dir=carroDocumentosDiretorio();$db=carroStockConexao();
$s=$db->query("SELECT id FROM carro_documento_lotes WHERE reserva_id IS NULL AND expira_em<=UTC_TIMESTAMP() LIMIT 100");
foreach($s->fetchAll(PDO::FETCH_COLUMN) as $id) {
    $db->beginTransaction();
    try {
        $s=$db->prepare('SELECT * FROM carro_documento_lotes WHERE id=? FOR UPDATE');$s->execute([$id]);$lote=$s->fetch(PDO::FETCH_ASSOC);
        if(!$lote || $lote['reserva_id']!==null){$db->commit();continue;}
        $s=$db->prepare("SELECT 1 FROM carro_stock_retencoes WHERE token=? AND estado='ativa'");$s->execute([$lote['token_stock']]);
        if($s->fetchColumn()){$db->commit();continue;}
        $s=$db->prepare('SELECT ficheiro FROM carro_documentos_condutor WHERE lote_id=?');$s->execute([$id]);
        foreach($s->fetchAll(PDO::FETCH_COLUMN) as $key) {
            if(!preg_match('/^[a-f0-9]{32}\.bin$/D',$key))throw new RuntimeException('Invalid private storage key');
            $file=$dir.DIRECTORY_SEPARATOR.$key;if(is_file($file) && !unlink($file))throw new RuntimeException('Cannot remove expired document');
        }
        $db->prepare('DELETE FROM carro_documentos_condutor WHERE lote_id=?')->execute([$id]);
        $db->prepare('DELETE FROM carro_documento_lotes WHERE id=? AND reserva_id IS NULL')->execute([$id]);$db->commit();
    } catch(Throwable $e) {if($db->inTransaction())$db->rollBack();throw $e;}
}
echo "Expired unbooked document batches cleaned; active payments and booked documents preserved.\n";
