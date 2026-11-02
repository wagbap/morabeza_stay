const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65446,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));php.mkdir('/api');
 php.writeFile('/api/retencaoExperiencia.php',fs.readFileSync('server/api/retencaoExperiencia.php','utf8').replaceAll(' FOR UPDATE',''));
 const result=await php.run({code:`<?php
 require '/api/retencaoExperiencia.php';function ck($v,$m){if(!$v)throw new Exception($m);}
 $c=new PDO('sqlite::memory:');$c->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
 $c->exec("CREATE TABLE experiencias(id INTEGER PRIMARY KEY,preco NUMERIC,min_pessoas INTEGER,modelo_reserva TEXT);INSERT INTO experiencias VALUES(1,2000,3,'por_pessoa');
 CREATE TABLE experiencia_sessoes(id INTEGER PRIMARY KEY,experiencia_id INTEGER,capacidade_maxima INTEGER,vagas_ocupadas INTEGER,reservas_pendentes INTEGER,ativo INTEGER,data TEXT,hora_inicio TEXT,preco_especial NUMERIC);
 INSERT INTO experiencia_sessoes VALUES(1,1,10,0,0,1,'2099-01-01','08:00',2000);
 CREATE TABLE reservas_temporarias(id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,experiencia_id INTEGER,sessao_id INTEGER,quantidade INTEGER,modelo TEXT,token TEXT,dados_reserva TEXT,expira_em TEXT,status TEXT DEFAULT 'pendente',reserva_id INTEGER);
 CREATE TABLE reservas_experiencia(id INTEGER PRIMARY KEY,experiencia_id INTEGER,usuario_id INTEGER,data_participacao TEXT,horario TEXT,quantidade_pessoas INTEGER,quantidade_jet_skis INTEGER,pagamento_status TEXT,status TEXT,preco_total NUMERIC);");
 $c->exec("INSERT INTO experiencia_sessoes VALUES(2,1,10,0,0,1,'2099-01-01','08:00',2000)");
 $one=reservarVagasTemporarias($c,['sessao_id'=>2,'quantidade'=>1,'usuario_id'=>50,'dados_reserva'=>['participantes'=>1]]);
 ck(10-(int)$c->query('SELECT reservas_pendentes FROM experiencia_sessoes WHERE id=2')->fetchColumn()===9,'first person leaves nine');
 $two=reservarVagasTemporarias($c,['sessao_id'=>2,'quantidade'=>2,'usuario_id'=>51,'dados_reserva'=>['participantes'=>2]]);
 ck(10-(int)$c->query('SELECT reservas_pendentes FROM experiencia_sessoes WHERE id=2')->fetchColumn()===7,'two additional people leave seven');
 ck($one['cotacao']['preco_total']===2000.0 && $two['cotacao']['preco_total']===4000.0,'individual bookings priced per person despite minimum three');
 $holds=[];foreach([1,1,3] as $i=>$q){$holds[]=reservarVagasTemporarias($c,['sessao_id'=>1,'quantidade'=>$q,'usuario_id'=>$i+20,'dados_reserva'=>['participantes'=>$q,'preco_unitario'=>2000]]);ck((int)$c->query('SELECT reservas_pendentes FROM experiencia_sessoes WHERE id=1')->fetchColumn()===array_sum(array_slice([1,1,3],0,$i+1)),'each booking consumes exact seats');}
 ck(10-(int)$c->query('SELECT reservas_pendentes FROM experiencia_sessoes WHERE id=1')->fetchColumn()===5,'1+1+3 leaves five seats');
 ck(validarRetencaoComCotacao($c,$holds[0]['token'],2000)['success'],'one seat valid despite session minimum of three');
 ck(validarRetencaoComCotacao($c,$holds[2]['token'],6000)['cotacao']['preco_total']===6000.0,'three people cost 6000');
 try{validarRetencaoComCotacao($c,$holds[2]['token'],2000);throw new Exception('tampered price accepted');}catch(InvalidArgumentException $ok){}
 $c->exec('UPDATE experiencia_sessoes SET preco_especial=2200 WHERE id=1');try{validarRetencaoComCotacao($c,$holds[0]['token'],2000);throw new Exception('changed price accepted');}catch(InvalidArgumentException $ok){}
 $c->exec('UPDATE experiencia_sessoes SET preco_especial=2000 WHERE id=1');
 $c->exec("INSERT INTO reservas_experiencia VALUES(1,1,20,'2099-01-01','08:00',1,0,'pago','confirmada',1)");try{confirmarVagasTemporarias($c,$holds[0]['token'],1);throw new Exception('paid booking with wrong total accepted');}catch(InvalidArgumentException $ok){}
 $c->exec('UPDATE reservas_experiencia SET preco_total=2000 WHERE id=1');confirmarVagasTemporarias($c,$holds[0]['token'],1);ck((int)$c->query('SELECT vagas_ocupadas FROM experiencia_sessoes WHERE id=1')->fetchColumn()===1,'paid seat consumed once');confirmarVagasTemporarias($c,$holds[0]['token'],1);
 $c->exec('UPDATE experiencia_sessoes SET preco_especial=3000 WHERE id=1');ck((int)$c->query('SELECT preco_total FROM reservas_experiencia WHERE id=1')->fetchColumn()===2000,'future price changes do not rewrite confirmed price');
 echo 'PASS: minimum three allows one seat; sequential 1+1+3 bookings leave five seats; exact server prices, stale/tampered price rejection and immutable paid booking.';`});assert.equal(result.errors,'');assert.ok(result.text.startsWith('PASS:'),result.text);console.log(result.text);process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
