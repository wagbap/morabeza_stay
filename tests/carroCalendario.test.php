<?php
require_once __DIR__.'/../server/api/carroCalendario.php';
class CalendarioDbTeste extends PDO {
    public function __construct() {parent::__construct('sqlite::memory:');$this->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);}
    public function prepare(string $sql,array $options=[]): PDOStatement|false {return parent::prepare(preg_replace('/\s+FOR UPDATE\s*$/i','',$sql),$options);}
}
function calCheck($ok,$message): void {if(!$ok)throw new RuntimeException($message);echo "OK $message\n";}
$db=new CalendarioDbTeste();
$db->exec("CREATE TABLE carros(id INTEGER,usuario_id INTEGER,status TEXT,status_carro TEXT);
CREATE TABLE veiculos_unidades(id INTEGER,carro_id INTEGER,estado TEXT);
CREATE TABLE reservas_carro(id INTEGER,carro_id INTEGER,unidade_id INTEGER,status TEXT,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER);
CREATE TABLE carro_stock_retencoes(token TEXT,carro_id INTEGER,estado TEXT,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER);
CREATE TABLE carro_unidade_bloqueios(unidade_id INTEGER,data TEXT,motivo TEXT,criado_por INTEGER,PRIMARY KEY(unidade_id,data));
INSERT INTO carros VALUES(24,7,'disponivel','aprovado');
INSERT INTO veiculos_unidades VALUES(1,24,'disponivel'),(2,24,'disponivel');");
$a=(new DateTimeImmutable('today'))->modify('+10 days')->format('Y-m-d');
$b=(new DateTimeImmutable($a))->modify('+1 day')->format('Y-m-d');$c=(new DateTimeImmutable($a))->modify('+2 days')->format('Y-m-d');$d=(new DateTimeImmutable($a))->modify('+3 days')->format('Y-m-d');
$guardar=function($unit,$dates,$action='bloquear',$uid=7,$reason='Uso pessoal')use($db){
    $db->beginTransaction();try{carroCalendarioGuardar($db,24,$uid,$unit,$dates,$action,$reason);$db->commit();}catch(Throwable $e){if($db->inTransaction())$db->rollBack();throw $e;}
};
$guardar(1,[$a]);
calCheck(carroStockLer($db,24,$a,$c)['quantidade_disponivel']===1,'manual block affects only selected unit');
calCheck($db->query('SELECT motivo FROM carro_unidade_bloqueios')->fetchColumn()==='Uso pessoal','reason stored');
$guardar(2,[$b]);
calCheck(carroStockLer($db,24,$a,$b)['quantidade_disponivel']===1 && carroStockLer($db,24,$b,$c)['quantidade_disponivel']===1,'each day separately has a spare unit');
calCheck(carroStockLer($db,24,$a,$c)['quantidade_disponivel']===0,'different cars on different days cannot cover the full period');
$month=carroCalendarioPublico($db,24,$a,$d,$a,1);
calCheck($month[$a]['levantamento'] && $month[$b]['devolucao'] && !$month[$c]['devolucao'],'client cannot select invalid continuous rental; return on blocked day allowed');
$guardar(2,[$b],'desbloquear');
calCheck(carroStockLer($db,24,$a,$c)['quantidade_disponivel']===1,'unblock restores continuous free period');
$db->exec("UPDATE veiculos_unidades SET estado='manutencao' WHERE id=2");
$guardar(1,[$a],'desbloquear');
calCheck(carroStockLer($db,24,$a,$c)['quantidade_disponivel']===1,'maintenance removes only affected unit');
$db->exec("UPDATE veiculos_unidades SET estado='manutencao' WHERE id=1");
calCheck(!carroCalendarioPublico($db,24,$a,$d,null,1)[$a]['levantamento'],'all-maintenance listing disables client calendar dates');
$guardar(1,[$a]);$guardar(1,[$a],'desbloquear');
calCheck(carroStockLer($db,24,$a,$c)['quantidade_disponivel']===0,'removing manual block never removes maintenance');
try{$guardar(1,[$a],'bloquear',99);throw new RuntimeException('wrong owner accepted');}catch(DomainException $e){calCheck(true,'another owner cannot change unit calendar');}
try{$guardar(1,[$a],'bloquear',7,'');throw new RuntimeException('empty reason accepted');}catch(InvalidArgumentException $e){calCheck(true,'blocking requires a reason');}
$db->exec("UPDATE veiculos_unidades SET estado='disponivel'");
$s=$db->prepare("INSERT INTO reservas_carro VALUES(1,24,1,'confirmada',?,?,1)");$s->execute([$a,$c]);
try{$guardar(1,[$a]);throw new RuntimeException('booking overwritten');}catch(DomainException $e){calCheck(true,'assigned booking cannot be blocked or erased');}
$db->exec('DELETE FROM reservas_carro');$s=$db->prepare("INSERT INTO reservas_carro VALUES(2,24,NULL,'confirmada',?,?,1)");$s->execute([$a,$c]);
$guardar(1,[$a]);
try{$guardar(2,[$b]);throw new RuntimeException('continuous booking broken');}catch(DomainException $e){calCheck(true,'host cannot fragment availability of an existing unassigned rental');}
calCheck((int)$db->query('SELECT COUNT(*) FROM carro_unidade_bloqueios WHERE unidade_id=2')->fetchColumn()===0,'conflicting period changes roll back atomically');
calCheck((int)$db->query('SELECT COUNT(*) FROM reservas_carro')->fetchColumn()===1,'manual unblock never deletes customer bookings');
