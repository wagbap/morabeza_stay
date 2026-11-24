<?php
require_once __DIR__.'/../server/api/carroPagamento.php';
class PagamentoDbTeste extends PDO {
    public string $agora='2026-11-07 12:00:00';
    public function __construct() {
        parent::__construct('sqlite::memory:');$this->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
        $this->sqliteCreateFunction('UTC_TIMESTAMP',fn()=>$this->agora);
    }
    public function prepare(string $sql,array $options=[]): PDOStatement|false {
        return parent::prepare(preg_replace('/\s+FOR UPDATE\s*$/i','',$sql),$options);
    }
}
function pagarCheck($ok,string $message): void {if(!$ok)throw new RuntimeException($message);echo "OK $message\n";}
class IntentServicoTeste {
    public array $intents=[];
    public bool $corrida=false;
    public bool $rede=false;
    public function create($options,$request): object {
        $id='pi_'.(count($this->intents)+1);
        return $this->intents[$id]=(object)['id'=>$id,'client_secret'=>$id.'_secret','status'=>'requires_payment_method','amount'=>$options['amount'],'currency'=>'eur','last_payment_error'=>null];
    }
    public function retrieve($id): object {return clone $this->intents[$id];}
    public function cancel($id): object {
        if($this->rede) throw new RuntimeException('Network unavailable');
        $this->intents[$id]->status=$this->corrida?'processing':'canceled';
        return clone $this->intents[$id];
    }
}
$db=new PagamentoDbTeste();$stripe=(object)['paymentIntents'=>new IntentServicoTeste()];
$db->exec("CREATE TABLE carros(id INTEGER,status TEXT,status_carro TEXT,preco_dia REAL,exige_caucao INTEGER,caucao_valor REAL,caucao_formas TEXT,caucao_condicoes TEXT);
CREATE TABLE carro_unidade_bloqueios(unidade_id INTEGER,data TEXT,motivo TEXT,criado_por INTEGER,PRIMARY KEY(unidade_id,data));
CREATE TABLE veiculos_unidades(id INTEGER,carro_id INTEGER,estado TEXT);
CREATE TABLE reservas_carro(id INTEGER,unidade_id INTEGER,carro_id INTEGER,status TEXT,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER);
CREATE TABLE carro_stock_retencoes(token TEXT PRIMARY KEY,carro_id INTEGER,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER,expira_em TEXT,stripe_id TEXT,caucao_json TEXT,estado TEXT DEFAULT 'ativa');
INSERT INTO carros VALUES(24,'disponivel','aprovado',5000,0,0,'','');
INSERT INTO veiculos_unidades VALUES(1,24,'disponivel');");
$data=['tipo'=>'carro','amount'=>(int)round(10000/110.265*100),'currency'=>'eur','pedido_stock'=>str_repeat('a',64),
    'reserva'=>['carro_id'=>24,'quantidade'=>1,'checkIn'=>'2026-11-10','checkOut'=>'2026-11-12','exige_caucao'=>0,'caucao_valor'=>0]];
$db->exec("CREATE TABLE carro_documento_lotes(id TEXT PRIMARY KEY,token_hash TEXT,email TEXT,carro_id INTEGER,inicio TEXT,fim TEXT,token_stock TEXT,reserva_id INTEGER,expira_em TEXT); CREATE TABLE carro_documentos_condutor(lote_id TEXT,tipo TEXT);");
$seedDocs=function(array &$request)use($db): void {
    $lote=substr($request['pedido_stock'],0,32);$token=str_repeat('f',64);
    $db->prepare('INSERT OR REPLACE INTO carro_documento_lotes VALUES(?,?,?,?,?,?,NULL,NULL,?)')->execute([$lote,hash('sha256',$token),'driver@example.invalid',24,'2026-11-10','2026-11-12','2026-11-08 12:00:00']);
    foreach(carroDocumentosTipos() as $tipo)$db->prepare('INSERT INTO carro_documentos_condutor VALUES(?,?)')->execute([$lote,$tipo]);
    $request['documentos_condutor']=['lote'=>$lote,'token'=>$token,'email'=>'driver@example.invalid'];
};
$db->exec('ALTER TABLE carro_stock_retencoes ADD COLUMN hora_levantamento TEXT; ALTER TABLE carro_stock_retencoes ADD COLUMN hora_devolucao TEXT');
$data['reserva']['hora_levantamento']='10:00';$data['reserva']['hora_devolucao']='14:00';
$seedDocs($data);
$badTime=$data;$badTime['reserva']['hora_devolucao']='23:00';
try{carroPagamentoPreparar($db,$stripe,$badTime);throw new RuntimeException('Outside-window time accepted');}
catch(CarroPagamentoException $e){pagarCheck($e->codigo==='CARRO_HORARIOS_INVALIDOS' && count($stripe->paymentIntents->intents)===0,'outside-window time rejected before Stripe intent');}
$withoutDocs=$data;unset($withoutDocs['documentos_condutor']);
try{carroPagamentoPreparar($db,$stripe,$withoutDocs);throw new RuntimeException('payment without documents accepted');}
catch(CarroPagamentoException $e){pagarCheck($e->codigo==='CARRO_DOCUMENTOS_INVALIDOS' && count($stripe->paymentIntents->intents)===0,'missing private documents rejected before creating a payment intent');}
$first=carroPagamentoPreparar($db,$stripe,$data);
$changedTime=$data;$changedTime['reserva']['hora_devolucao']='15:00';
try{carroPagamentoPreparar($db,$stripe,$changedTime);throw new RuntimeException('Changed hold time accepted');}
catch(CarroPagamentoException $e){pagarCheck($e->codigo==='CARRO_HORARIOS_INVALIDOS','hold cannot be reused with another selected time');}
$snapshot=json_decode($db->query("SELECT caucao_json FROM carro_stock_retencoes WHERE stripe_id='pi_1'")->fetchColumn(),true);
pagarCheck($snapshot['horarios']['hora_levantamento']==='10:00' && $snapshot['horarios']['hora_devolucao']==='14:00','selected hours and permitted windows frozen with payment');
pagarCheck($first['expiresAt']==='2026-11-07T12:05:00Z','entry blocks stock for exactly five minutes');
pagarCheck(carroStockLer($db,24,'2026-11-10','2026-11-12')['quantidade_disponivel']===0,'other session sees last vehicle blocked on entry');
$db->agora='2026-11-07 12:02:00';
$refresh=carroPagamentoPreparar($db,$stripe,$data);
pagarCheck($refresh['expiresAt']===$first['expiresAt'] && $refresh['clientSecret']===$first['clientSecret'],'refresh reuses deadline and intent');
$second=$data;$second['pedido_stock']=str_repeat('b',64);$seedDocs($second);
try {carroPagamentoPreparar($db,$stripe,$second);throw new RuntimeException('second request accepted');}
catch(CarroPagamentoException $e) {pagarCheck($e->codigo==='CARRO_SEM_STOCK','second checkout is refused before a second intent');}
pagarCheck(count($stripe->paymentIntents->intents)===1,'no duplicate charge intent');
$db->agora='2026-11-07 12:05:00';
try {carroPagamentoPreparar($db,$stripe,$data);throw new RuntimeException('expired request accepted');}
catch(CarroPagamentoException $e) {pagarCheck($e->codigo==='CARRO_RETENCAO_EXPIRADA','expired token cannot obtain a fresh deadline');}
pagarCheck($db->query("SELECT estado FROM carro_stock_retencoes WHERE stripe_id='pi_1'")->fetchColumn()==='libertada','expiry commits release even when returning an error');
$data['pedido_stock']=str_repeat('c',64);$seedDocs($data);$db->agora='2026-11-07 12:06:00';
carroPagamentoPreparar($db,$stripe,$data);
$stripe->paymentIntents->intents['pi_2']->last_payment_error=(object)['code'=>'card_declined'];$data['acao']='falha';
try {carroPagamentoPreparar($db,$stripe,$data);throw new RuntimeException('failed payment retained');}
catch(CarroPagamentoException $e) {pagarCheck($e->codigo==='CARRO_PAGAMENTO_FALHOU','definitive card decline releases before expiry');}
foreach(['processing','requires_action','requires_capture','succeeded'] as $index=>$status) {
    $db->exec("UPDATE carro_stock_retencoes SET estado='consumida'");
    $data['pedido_stock']=str_repeat(dechex($index+4),64);$seedDocs($data);$data['acao']='iniciar';$db->agora='2026-11-07 13:00:00';
    $start=carroPagamentoPreparar($db,$stripe,$data);$id=explode('_secret',$start['clientSecret'])[0];
    $stripe->paymentIntents->intents[$id]->status=$status;$db->agora='2026-11-07 13:06:00';
    $after=carroPagamentoPreparar($db,$stripe,$data);
    pagarCheck($after['paymentStatus']===$status && carroStockLer($db,24,'2026-11-10','2026-11-12')['quantidade_disponivel']===0,"expiry preserves $status payment");
}
$db->exec("UPDATE carro_stock_retencoes SET estado='consumida'");
$data['pedido_stock']=str_repeat('e',64);$seedDocs($data);$db->agora='2026-11-07 14:00:00';$start=carroPagamentoPreparar($db,$stripe,$data);
$db->agora='2026-11-07 14:06:00';$stripe->paymentIntents->corrida=true;
$after=carroPagamentoPreparar($db,$stripe,$data);
pagarCheck($after['paymentStatus']==='processing','confirmation winning the cancel race keeps the hold');
$stripe->paymentIntents->corrida=false;$stripe->paymentIntents->rede=true;
$id=explode('_secret',$start['clientSecret'])[0];$stripe->paymentIntents->intents[$id]->status='requires_payment_method';
try {carroPagamentoPreparar($db,$stripe,$data);} catch(RuntimeException $e) {}
pagarCheck(carroStockLer($db,24,'2026-11-10','2026-11-12')['quantidade_disponivel']===0,'network failure never frees uncertain payment');
