<?php
require_once __DIR__.'/../server/api/carroDocumentos.php';
function docCheck($ok,$message): void {if(!$ok)throw new RuntimeException($message);echo "OK $message\n";}
function docReject(callable $f,$message): void {$rejected=false;try{$f();}catch(Throwable $e){$rejected=true;}docCheck($rejected,$message);}
class DocumentoDbTeste extends PDO {
    public function __construct() {parent::__construct('sqlite::memory:');$this->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);$this->sqliteCreateFunction('UTC_TIMESTAMP',fn()=>'2026-11-07 12:00:00');}
    public function prepare(string $sql,array $options=[]): PDOStatement|false {return parent::prepare(preg_replace('/\s+FOR UPDATE\s*$/i','',$sql),$options);}
}
$db=new DocumentoDbTeste();
$db->exec("CREATE TABLE carro_documento_lotes(id TEXT,token_hash TEXT,email TEXT,carro_id INTEGER,inicio TEXT,fim TEXT,token_stock TEXT,reserva_id INTEGER,expira_em TEXT);
CREATE TABLE carro_documentos_condutor(lote_id TEXT,tipo TEXT);");
$ref=['lote'=>str_repeat('a',32),'token'=>str_repeat('b',64)];$stock=str_repeat('c',64);
$db->prepare('INSERT INTO carro_documento_lotes VALUES(?,?,?,?,?,?,NULL,NULL,?)')->execute([$ref['lote'],hash('sha256',$ref['token']),'driver@example.invalid',24,'2026-11-10','2026-11-12','2026-11-07 14:00:00']);
foreach(carroDocumentosTipos() as $tipo)$db->prepare('INSERT INTO carro_documentos_condutor VALUES(?,?)')->execute([$ref['lote'],$tipo]);
$validate=function($r=null,$id=24,$email='driver@example.invalid',$token=null)use($db,$ref,$stock){$db->beginTransaction();try{$v=carroDocumentosValidar($db,$r??$ref,$id,'2026-11-10','2026-11-12',$email,$token??$stock);$db->commit();return $v;}catch(Throwable $e){$db->rollBack();throw $e;}};
docReject(fn()=>$validate([]),'missing upload proof rejected');
docReject(fn()=>$validate(array_replace($ref,['token'=>str_repeat('d',64)])),'forged upload proof rejected');
docReject(fn()=>$validate(null,25),'documents cannot be reused for a different vehicle');
docReject(fn()=>$validate(null,24,'other@example.invalid'),'documents must match verified driver email');
$validate();docCheck($db->query('SELECT token_stock FROM carro_documento_lotes')->fetchColumn()===$stock,'complete private upload bound to payment hold');
docReject(fn()=>$validate(null,24,'driver@example.invalid',str_repeat('e',64)),'cannot bind same documents to another payment hold');
$db->exec("DELETE FROM carro_documentos_condutor WHERE tipo='carta_verso'");docReject(fn()=>$validate(),'server rejects a missing back side');
$booking=['proprietario_id'=>7,'status'=>'confirmada','pagamento_status'=>'pago','data_levantamento'=>'2026-11-10','data_devolucao'=>'2026-11-12'];
docCheck(carroDocumentoPodeAceder($booking,'host',7,'2026-11-09'),'own host has access near handover');
docCheck(!carroDocumentoPodeAceder($booking,'host',8,'2026-11-09'),'other host has no access');
docCheck(!carroDocumentoPodeAceder($booking,'host',7,'2026-10-01'),'owner has no access far before handover');
docCheck(!carroDocumentoPodeAceder($booking,'host',7,'2026-12-01'),'owner has no access after authorized delivery period');
docCheck(!carroDocumentoPodeAceder($booking,'host',7,'2026-11-12'),'rental still active does not extend access beyond handover window');
docCheck(!carroDocumentoPodeAceder(array_replace($booking,['status'=>'cancelada']),'host',7,'2026-11-09'),'cancelled booking denies host access');
docCheck(carroDocumentoPodeAceder($booking,'admin',1,'2026-10-01'),'authenticated admin policy allows verification');
docCheck(!carroDocumentoPodeAceder($booking,'customer',7,'2026-11-09'),'upload capability never grants read access');
$tmp=sys_get_temp_dir().'/driver-doc-test';if(!is_dir($tmp))mkdir($tmp);$web=$tmp.'/public';if(!is_dir($web))mkdir($web);
docReject(fn()=>carroDocumentosDiretorio($web.'/documents',$web),'storage inside public root rejected');
$private=carroDocumentosDiretorio($tmp.'/private',$web);docCheck(is_dir($private),'private storage accepted outside web root');
$path=$private.'/fixture';$pdf="%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF";file_put_contents($path,$pdf);
docCheck(carroDocumentoInspecionar($path,'id.pdf',strlen($pdf))['mime']==='application/pdf','PDF content checked on server');
docReject(fn()=>carroDocumentoInspecionar($path,'front.jpg',strlen($pdf)),'renamed PDF masquerading as JPG rejected');
docReject(fn()=>carroDocumentoInspecionar($path,'id.docx',strlen($pdf)),'Word rejected server-side');
file_put_contents($path,'<script>test</script>');docReject(fn()=>carroDocumentoInspecionar($path,'id.pdf',filesize($path)),'HTML disguised as PDF rejected');
unlink($path);
