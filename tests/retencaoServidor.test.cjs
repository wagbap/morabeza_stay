const fs=require('fs'),path=require('path');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));
 const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65418,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/api');
 for(const file of ['retencaoExperiencia.php','retencaoBootstrap.php','reservar_temporariamente.php','liberar_retensao.php','confirmar_retensao.php','validar_retencao.php'])php.writeFile('/api/'+file,fs.readFileSync('server/api/'+file,'utf8').replaceAll(' FOR UPDATE',''));
 php.writeFile('/test.php',`<?php
 require '/api/retencaoExperiencia.php';
 function check($v,$m){if(!$v)throw new Exception($m);}
 $c=new PDO('sqlite::memory:');$c->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
 $c->exec("CREATE TABLE experiencias(id INTEGER PRIMARY KEY);INSERT INTO experiencias VALUES(7);
 CREATE TABLE reservas_experiencia(id INTEGER PRIMARY KEY,experiencia_id INTEGER,usuario_id INTEGER,data_participacao TEXT,horario TEXT,quantidade_pessoas INTEGER,quantidade_jet_skis INTEGER,pagamento_status TEXT,status TEXT);
 CREATE TABLE experiencia_sessoes(id INTEGER PRIMARY KEY,experiencia_id INTEGER,capacidade_maxima INTEGER,vagas_ocupadas INTEGER,reservas_pendentes INTEGER,ativo INTEGER,data TEXT,hora_inicio TEXT);
 CREATE TABLE reservas_temporarias(id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,experiencia_id INTEGER,sessao_id INTEGER,quantidade INTEGER,modelo TEXT,token TEXT,dados_reserva TEXT,expira_em TEXT,status TEXT,reserva_id INTEGER);
 INSERT INTO experiencia_sessoes VALUES(1,7,2,0,0,1,'2099-01-01','08:00');");
 function pending($c){return (int)$c->query('SELECT reservas_pendentes FROM experiencia_sessoes WHERE id=1')->fetchColumn();}
 $p=['sessao_id'=>1,'experiencia_id'=>7,'quantidade'=>2,'usuario_id'=>1];
 $first=reservarVagasTemporarias($c,$p);check($first['segundos_restantes']===300,'hold duration must be five minutes');check(abs(strtotime($first['expira_em'])-time()-300)<3,'server expiry must be five minutes');check(pending($c)===2,'first hold count');
 $again=reservarVagasTemporarias($c,$p);check($again['token']===$first['token']&&pending($c)===2&&$again['renovada'],'full-session renewal must reuse own hold');
 try{reservarVagasTemporarias($c,array_merge($p,['usuario_id'=>2,'quantidade'=>1]));throw new Exception('overbooking accepted');}catch(InvalidArgumentException $ok){}
 reservarVagasTemporarias($c,array_merge($p,['quantidade'=>1]));check(pending($c)===1,'reduce quantity');
 reservarVagasTemporarias($c,$p);check(pending($c)===2,'increase quantity must use exact difference');
 libertarVagasTemporarias($c,$first['token']);libertarVagasTemporarias($c,$first['token']);check(pending($c)===0,'release twice must stay zero');
 $expired=reservarVagasTemporarias($c,$p);$c->exec("UPDATE reservas_temporarias SET expira_em='2000-01-01 00:00:00' WHERE status='pendente'");
 $fresh=reservarVagasTemporarias($c,array_merge($p,['usuario_id'=>2]));check(pending($c)===2&&$fresh['token']!==$expired['token'],'expired holds must not consume capacity');
 libertarVagasTemporarias($c,$fresh['token']);
 $c->exec('UPDATE experiencia_sessoes SET reservas_pendentes=99 WHERE id=1');
 $repair=reservarVagasTemporarias($c,array_merge($p,['quantidade'=>1]));check(pending($c)===1,'repair drifted counter using real holds');
 $c->exec("INSERT INTO reservas_temporarias(usuario_id,experiencia_id,sessao_id,quantidade,modelo,token,expira_em,status) VALUES(1,7,1,1,'por_pessoa','duplicate','2099-01-01 00:00:00','pendente')");
 $dedup=reservarVagasTemporarias($c,$p);check(pending($c)===2,'deduplicate same-user holds');check((int)$c->query("SELECT COUNT(*) FROM reservas_temporarias WHERE status='pendente'")->fetchColumn()===1,'one active user hold');
 libertarVagasTemporarias($c,$dedup['token']);
 try{reservarVagasTemporarias($c,array_merge($p,['experiencia_id'=>8]));throw new Exception('wrong experience accepted');}catch(InvalidArgumentException $ok){}
 $paidHold=reservarVagasTemporarias($c,$p);
 $c->exec("INSERT INTO reservas_experiencia VALUES(10,7,1,'2099-01-01','Manha 08:00',2,0,'pago','confirmada')");
 $confirmed=confirmarVagasTemporarias($c,$paidHold['token'],10);check($confirmed['success']&&pending($c)===0,'confirmation moves pending once');
 $confirmedAgain=confirmarVagasTemporarias($c,$paidHold['token'],10);check($confirmedAgain['idempotente']&&(int)$c->query('SELECT vagas_ocupadas FROM experiencia_sessoes WHERE id=1')->fetchColumn()===2,'confirmation idempotence');
 echo 'PASS: full-session renewal, stock limits, quantity increases/decreases, idempotent release, expiry, drift repair, duplicate holds and experience ownership. SQLite state tests; production keeps FOR UPDATE locks.';
 `);
 // The duplicate fixture uses the same format as real bearer tokens.
 php.writeFile('/test.php',php.readFileAsText('/test.php').replace("'duplicate'","'"+'d'.repeat(64)+"'"));
 const result=await php.run({scriptPath:'/test.php'});if(result.errors||!result.text.startsWith('PASS:'))throw Error(result.errors+result.text);console.log(result.text);
 const preflight=await php.run({scriptPath:'/api/liberar_retensao.php',method:'OPTIONS'});if(preflight.httpStatusCode!==204)throw Error('CORS preflight failed: '+JSON.stringify(preflight));console.log('PASS: release endpoint handles OPTIONS without database access.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
