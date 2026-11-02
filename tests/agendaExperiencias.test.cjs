const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65431,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));php.mkdir('/api');php.mkdir('/api/experiencia');php.writeFile('/api/experiencia/modeloRegisto.php',fs.readFileSync('server/api/experiencia/modeloRegisto.php','utf8'));
 for(const f of ['agendaExperienciasLogica.php','agendaPublica.php','retencaoExperiencia.php'])php.writeFile('/api/'+f,fs.readFileSync('server/api/'+f,'utf8').replaceAll(' FOR UPDATE',''));
 php.writeFile('/test.php',`<?php
 require '/api/agendaExperienciasLogica.php';
 function ck($v,$m){if(!$v)throw new Exception($m);}
 ck(agendaIntervalos(['duracao_minutos'=>15,'horarios'=>['08:00','08:15']])[1]['fim']==='08:30','minute intervals');
 try{agendaIntervalos(['duracao_minutos'=>30,'horarios'=>['08:00','08:15']]);throw new Exception('overlap accepted');}catch(InvalidArgumentException $ok){}
 ck(agendaLivre(5,2,1,1)===1,'stock split');ck(agendaLivre(5,3,1,1)===0,'no negative stock');
 $peak=agendaPico('09:00','10:00',[['inicio'=>'09:00','fim'=>'09:30','tipo'=>'confirmados','quantidade'=>2],['inicio'=>'09:30','fim'=>'10:00','tipo'=>'confirmados','quantidade'=>3],['inicio'=>'09:00','fim'=>'09:45','tipo'=>'bloqueados','quantidade'=>1]]);
 ck($peak['confirmados']===3 && $peak['bloqueados']===1,'shared stock uses overlapping peak, not sum of adjacent slots');
 $c=new PDO('sqlite:/agenda-fixture.sqlite');$c->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
 $c->exec("CREATE TABLE experiencia_agendas(experiencia_id INTEGER PRIMARY KEY,dias_json TEXT,repeticao TEXT,inicio TEXT,fim TEXT,minima_horas INTEGER,maxima_dias INTEGER,pausado INTEGER,materializado_em TEXT);
 CREATE TABLE experiencia_configuracoes(id INTEGER PRIMARY KEY,experiencia_id INTEGER,nome TEXT,duracao_minutos INTEGER,preco NUMERIC,capacidade INTEGER,unidade TEXT,horarios_json TEXT,recursos_json TEXT,ativo INTEGER);
 CREATE TABLE experiencia_configuracao_opcoes(configuracao_id INTEGER PRIMARY KEY,opcoes_json TEXT);
 CREATE TABLE experiencia_agenda_excecoes(id INTEGER PRIMARY KEY,experiencia_id INTEGER,inicio TEXT,fim TEXT,tipo TEXT,motivo TEXT);
 CREATE TABLE experiencia_agenda_recursos(id INTEGER PRIMARY KEY,experiencia_id INTEGER,nome TEXT,tipo TEXT,quantidade INTEGER,manutencoes_json TEXT,ativo INTEGER);
 CREATE TABLE experiencia_sessoes(id INTEGER PRIMARY KEY AUTOINCREMENT,experiencia_id INTEGER,data TEXT,hora_inicio TEXT,hora_fim TEXT,periodo TEXT,capacidade_maxima INTEGER,vagas_ocupadas INTEGER DEFAULT 0,reservas_pendentes INTEGER DEFAULT 0,preco_especial NUMERIC,ativo INTEGER);
 CREATE TABLE experiencia_agenda_sessoes(sessao_id INTEGER PRIMARY KEY,configuracao_id INTEGER,data TEXT,hora_inicio TEXT,UNIQUE(configuracao_id,data,hora_inicio));
 CREATE TABLE reservas_temporarias(id INTEGER PRIMARY KEY,experiencia_id INTEGER,sessao_id INTEGER,quantidade INTEGER,status TEXT,expira_em TEXT);");
 $today=(new DateTimeImmutable('today',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
 $s=$c->prepare("INSERT INTO experiencia_agendas VALUES(1,'[1,2,3,4,5,6,7]','semanal',?,NULL,0,2,0,NULL)");$s->execute([$today]);
 $s=$c->prepare('INSERT INTO experiencia_configuracoes VALUES(?,?,?,?,?,?,?,?,?,?)');$s->execute([1,1,'Dive',120,2000,5,'participante',json_encode(['09:00','14:00']),'[]',1]);
 $a=agendaMaterializar($c,1);ck($a['criadas']===6,'three days and two departures');$b=agendaMaterializar($c,1);ck($b['criadas']===0,'idempotent generation');
 $c->exec('UPDATE experiencia_sessoes SET vagas_ocupadas=1 WHERE id=1');$c->exec('UPDATE experiencia_configuracoes SET preco=2500,capacidade=8 WHERE id=1');agendaMaterializar($c,1);
 ck((int)$c->query('SELECT preco_especial FROM experiencia_sessoes WHERE id=1')->fetchColumn()===2000,'preserve booked price');ck((int)$c->query('SELECT preco_especial FROM experiencia_sessoes WHERE id=2')->fetchColumn()===2500,'update unbooked price');
 $s=$c->prepare("INSERT INTO experiencia_agenda_excecoes VALUES(1,1,?,?,'fechado','Vacation')");$s->execute([$today,$today]);agendaMaterializar($c,1);ck((int)$c->query('SELECT ativo FROM experiencia_sessoes WHERE id=1')->fetchColumn()===0,'closed day stops new reservations');ck((int)$c->query('SELECT vagas_ocupadas FROM experiencia_sessoes WHERE id=1')->fetchColumn()===1,'confirmed bookings retained');
 $s=$c->prepare("INSERT INTO experiencia_agenda_excecoes VALUES(2,1,?,?,'aberto','Exception')");$s->execute([$today,$today]);agendaMaterializar($c,1);ck((int)$c->query('SELECT ativo FROM experiencia_sessoes WHERE id=1')->fetchColumn()===1,'latest exception opens day');
 $c->exec('UPDATE experiencia_agendas SET pausado=1');agendaMaterializar($c,1);ck((int)$c->query('SELECT COUNT(*) FROM experiencia_sessoes WHERE ativo=1')->fetchColumn()===0,'pause departures');
 $c->exec('UPDATE experiencia_agendas SET pausado=0');agendaMaterializar($c,1);
 $s=$c->prepare("INSERT INTO reservas_temporarias VALUES(1,1,1,2,'pendente',?)");$s->execute([date('Y-m-d H:i:s',time()+300)]);
 $rows=agendaLinhasDia($c,1,$today);ck($rows[0]['confirmados']===1&&$rows[0]['em_pagamento']===2&&$rows[0]['livres']===2,'actual confirmed and live holds are distinct');

 require '/api/retencaoExperiencia.php';require '/api/agendaPublica.php';
 $c->exec("CREATE TABLE experiencias(id INTEGER PRIMARY KEY,usuario_id INTEGER);INSERT INTO experiencias VALUES(2,20);
 ALTER TABLE reservas_temporarias ADD COLUMN usuario_id INTEGER;ALTER TABLE reservas_temporarias ADD COLUMN modelo TEXT;
 ALTER TABLE reservas_temporarias ADD COLUMN token TEXT;ALTER TABLE reservas_temporarias ADD COLUMN dados_reserva TEXT;ALTER TABLE reservas_temporarias ADD COLUMN reserva_id INTEGER;
 CREATE TABLE reservas_experiencia(id INTEGER PRIMARY KEY,experiencia_id INTEGER,usuario_id INTEGER,data_participacao TEXT,horario TEXT,quantidade_pessoas INTEGER,quantidade_jet_skis INTEGER,pagamento_status TEXT,status TEXT);");
 $tomorrow=date('Y-m-d',strtotime($today.' +1 day'));
 $s=$c->prepare("INSERT INTO experiencia_agendas VALUES(2,'[1,2,3,4,5,6,7]','semanal',?,NULL,0,2,0,NULL)");$s->execute([$tomorrow]);
 $s=$c->prepare('INSERT INTO experiencia_agenda_recursos VALUES(1,2,?,?,5,?,1)');$s->execute(['Jet skis','equipamento',json_encode([['inicio'=>$tomorrow,'fim'=>$tomorrow,'hora_inicio'=>'08:00','hora_fim'=>'08:30','quantidade'=>1]])]);
 $s=$c->prepare('INSERT INTO experiencia_configuracoes VALUES(?,?,?,?,?,?,?,?,?,?)');
 $s->execute([2,2,'Short',15,100,5,'unidade',json_encode(['08:00']),'[1]',1]);$s->execute([3,2,'Long',30,180,5,'unidade',json_encode(['08:00']),'[1]',1]);
 $s->execute([4,2,'Later',15,100,5,'unidade',json_encode(['08:30']),'[1]',1]);
 $o=$c->prepare('INSERT INTO experiencia_configuracao_opcoes VALUES(?,?)');$o->execute([3,json_encode(['preparacao'=>15])]);agendaMaterializar($c,2);
 $rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['livres']===4,'maintenance subtracts one actual unit');
 $short=(int)$rows[0]['id'];$long=(int)$rows[1]['id'];
 $c->exec("CREATE TABLE experiencia_modelos(experiencia_id INTEGER PRIMARY KEY,modelo_reserva TEXT,recurso_id INTEGER,pessoas_por_equipamento INTEGER,equipamento_nome TEXT,quantidade_equipamentos INTEGER,atualizado_em TEXT);INSERT INTO experiencia_modelos(experiencia_id,modelo_reserva,recurso_id,pessoas_por_equipamento) VALUES(2,'por_equipamento',1,3)");
 ck(agendaLinhasDia($c,2,$tomorrow)[0]['pessoas_por_unidade']===3,'registered people limit reaches availability');
 $capacityHold=reservarVagasTemporarias($c,['sessao_id'=>$long,'quantidade'=>1,'usuario_id'=>29,'dados_reserva'=>['participantes'=>3]]);
 libertarVagasTemporarias($c,$capacityHold['token']);
 try{reservarVagasTemporarias($c,['sessao_id'=>$long,'quantidade'=>1,'usuario_id'=>29,'dados_reserva'=>['participantes'=>4]]);throw new Exception('registered equipment people limit ignored');}catch(InvalidArgumentException $ok){}

 // Exact acceptance scenario: the same five jet skis serve 15-minute and two-hour options.
 $c->exec('INSERT INTO experiencias VALUES(99,20)');
 $a=$c->prepare("INSERT INTO experiencia_agendas VALUES(99,'[1,2,3,4,5,6,7]','semanal',?,NULL,0,2,0,NULL)");$a->execute([$tomorrow]);
 $c->exec("INSERT INTO experiencia_agenda_recursos VALUES(99,99,'Jet ski','equipamento',5,'[]',1);INSERT INTO experiencia_modelos(experiencia_id,modelo_reserva,recurso_id,pessoas_por_equipamento) VALUES(99,'por_equipamento',99,2)");
 $a=$c->prepare('INSERT INTO experiencia_configuracoes VALUES(?,?,?,?,?,?,?,?,?,?)');
 $times=['08:45','09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15'];
 $a->execute([990,99,'15 minutes',15,2000,5,'unidade',json_encode($times),'[99]',1]);
 $a->execute([991,99,'2 hours',120,8000,5,'unidade','["09:00"]','[99]',1]);
 $a=$c->prepare('INSERT INTO experiencia_configuracao_opcoes VALUES(?,?)');$a->execute([991,'{"preparacao":15}']);agendaMaterializar($c,99);
 $exactRows=agendaLinhasDia($c,99,$tomorrow);$twoHour=null;foreach($exactRows as $r)if((int)$r['configuracao_id']===991)$twoHour=$r;
 $exactHold=reservarVagasTemporarias($c,['sessao_id'=>$twoHour['id'],'quantidade'=>1,'usuario_id'=>990,'dados_reserva'=>['participantes'=>2]]);
 ck($exactHold['cotacao']['preco_total']===8000.0,'one jet ski costs one unit price for two participants');
 try{reservarVagasTemporarias($c,['sessao_id'=>$twoHour['id'],'quantidade'=>1,'usuario_id'=>991,'dados_reserva'=>['participantes'=>3]]);throw new Exception('three people fit on one jet ski');}catch(InvalidArgumentException $ok){}
 $a=$c->prepare('INSERT INTO reservas_experiencia VALUES(990,99,990,?,?,2,1,?,?)');$a->execute([$tomorrow,'Morning 09:00','pago','confirmada']);confirmarVagasTemporarias($c,$exactHold['token'],990);
 foreach(agendaLinhasDia($c,99,$tomorrow) as $r){
   $expected=($r['hora_inicio']>='09:00' && $r['hora_inicio']<'11:15') ? 4 : 5;
   ck($r['livres']===$expected,'09-11 shared stock and preparation at '.$r['hora_inicio'].' config '.$r['configuracao_id']);
 }
 $publicExact=agendaSessoesPublicas($c,99,$tomorrow);ck(count($publicExact)>0,'actual public jet ski slots returned');foreach($publicExact as $r){ck($r['unidade_venda']==='unidade' && $r['minimo_participantes']===1 && $r['pessoas_por_unidade']===2,'public unit model, no participant minimum, two people per unit');}
 echo 'PASS: exact 5-jet-ski scenario, one paid 09:00-11:00 booking leaves 4 across both durations, preparation until 11:15, then 5 again. ';
 $h=reservarVagasTemporarias($c,['sessao_id'=>$long,'quantidade'=>3,'usuario_id'=>20,'dados_reserva'=>['participantes'=>5]]);
 ck($h['cotacao']['preco_total']===540.0,'three units at 180 cost 540 regardless of five participants');
 ck(validarRetencaoComCotacao($c,$h['token'],540.0)['success'],'quote revalidated with own shared stock credit');
 try{validarRetencaoComCotacao($c,$h['token'],900.0);throw new Exception('participant multiplication accepted for units');}catch(InvalidArgumentException $ok){}
 $later=agendaLinhasDia($c,2,$tomorrow)[2];ck($later['livres']===2,'preparation consumes shared stock after service ends');
 $rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['em_pagamento']===3&&$rows[0]['livres']===1,'shared equipment hold affects overlapping duration');
 $own=agendaSessoesPublicas($c,2,$tomorrow,null,$h['token']);ck($own[1]['vagas_disponiveis']===4,'owner can select own held slot without losing availability');
 try{reservarVagasTemporarias($c,['sessao_id'=>$short,'quantidade'=>2,'usuario_id'=>21]);throw new Exception('shared stock overbooking accepted');}catch(InvalidArgumentException $ok){}
 $c->exec('UPDATE experiencia_sessoes SET capacidade_maxima=2 WHERE id='.$short);
 $rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['livres']===1,'departure cap and shared pool cap are independent');
 $c->exec("UPDATE experiencia_agenda_recursos SET manutencoes_json='[]' WHERE id=1");
 $rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['livres']===2,'other departure bookings reduce pool, not departure cap twice');
 $s=$c->prepare('UPDATE experiencia_agenda_recursos SET manutencoes_json=? WHERE id=1');$s->execute([json_encode([['inicio'=>$tomorrow,'fim'=>$tomorrow,'hora_inicio'=>'08:00','hora_fim'=>'08:30','quantidade'=>1]])]);
 $s=$c->prepare('INSERT INTO reservas_experiencia VALUES(20,2,20,?,?,5,3,?,?)');$s->execute([$tomorrow,'Manha 08:00','pendente','pendente']);
 try{confirmarVagasTemporarias($c,$h['token'],20);throw new Exception('unpaid booking confirmed');}catch(InvalidArgumentException $ok){}
 ck((int)$c->query('SELECT vagas_ocupadas FROM experiencia_sessoes WHERE id='.$long)->fetchColumn()===0,'unpaid confirmation rolls back stock');
 $c->exec("UPDATE reservas_experiencia SET pagamento_status='pago',status='confirmada' WHERE id=20");confirmarVagasTemporarias($c,$h['token'],20);
 $rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['confirmados']===3&&$rows[0]['em_pagamento']===0&&$rows[0]['livres']===1,'paid unit confirmation moves held stock exactly once');
 confirmarVagasTemporarias($c,$h['token'],20);$rows=agendaLinhasDia($c,2,$tomorrow);ck($rows[0]['livres']===1,'paid confirmation retry stays idempotent');
 $s=$c->prepare("INSERT INTO experiencia_agenda_excecoes VALUES(3,2,?,?,'fechado','Closed')");$s->execute([$tomorrow,$tomorrow]);
 try{reservarVagasTemporarias($c,['sessao_id'=>$short,'quantidade'=>1,'usuario_id'=>21]);throw new Exception('closed date booked');}catch(InvalidArgumentException $ok){}

 $c->exec('INSERT INTO experiencias VALUES(3,30);INSERT INTO experiencias VALUES(4,40)');
 $s=$c->prepare("INSERT INTO experiencia_agendas VALUES(?,'[1,2,3,4,5,6,7]','semanal',?,NULL,0,1,0,NULL)");$s->execute([3,$today]);$s->execute([4,$today]);
 $s=$c->prepare('INSERT INTO experiencia_configuracoes VALUES(?,?,?,?,?,?,?,?,?,?)');$s->execute([10,3,'Legacy dive',15,350,8,'participante',json_encode(['09:00']),'[]',1]);$s->execute([11,4,'Legacy unit',15,100,5,'unidade',json_encode(['09:00']),'[]',1]);
 $s=$c->prepare('INSERT INTO experiencia_sessoes(experiencia_id,data,hora_inicio,hora_fim,periodo,capacidade_maxima,vagas_ocupadas,reservas_pendentes,preco_especial,ativo) VALUES(?,?,?,?,?,?,?,?,?,?)');$s->execute([3,$tomorrow,'09:00','09:15','Morning',4,1,1,120,1]);$legacy=(int)$c->lastInsertId();$s->execute([4,$tomorrow,'09:00','09:15','Morning',5,1,0,100,1]);$incompatible=(int)$c->lastInsertId();
 $s=$c->prepare('INSERT INTO reservas_experiencia VALUES(30,3,30,?,?,1,0,?,?)');$s->execute([$tomorrow,'Morning 09:00','pago','confirmada']);
 $s=$c->prepare("INSERT INTO reservas_temporarias(id,experiencia_id,sessao_id,quantidade,status,expira_em,usuario_id,modelo,token,dados_reserva) VALUES(70,3,?,1,'pendente',?,31,'por_pessoa',?,?)");$s->execute([$legacy,date('Y-m-d H:i:s',time()+300),str_repeat('a',64),'{}']);
 $before=(int)$c->query('SELECT COUNT(*) FROM experiencia_sessoes WHERE experiencia_id=3')->fetchColumn();
 try{agendaMaterializar($c,3);throw new Exception('legacy row linked without explicit choice');}catch(AgendaConflitoSessoes $e){ck(count($e->conflitos)===1&&$e->conflitos[0]['id']===$legacy&&$e->conflitos[0]['pode_ligar'],'legacy identity and compatibility reported');}
 ck((int)$c->query('SELECT COUNT(*) FROM experiencia_sessoes WHERE experiencia_id=3')->fetchColumn()===$before,'conflict preflight performs no partial generation');
 $adopted=agendaMaterializar($c,3,[$legacy]);ck($adopted['ligadas']===1,'explicit adoption links exactly one row');
 $row=$c->query('SELECT * FROM experiencia_sessoes WHERE id='.$legacy)->fetch(PDO::FETCH_ASSOC);ck((int)$row['preco_especial']===120&&(int)$row['capacidade_maxima']===4&&(int)$row['vagas_ocupadas']===1&&(int)$row['reservas_pendentes']===1,'adopted booked row preserves price capacity confirmed and held places');
 ck((int)$c->query('SELECT sessao_id FROM experiencia_agenda_sessoes WHERE sessao_id='.$legacy)->fetchColumn()===$legacy,'adoption retains the session ID');
 $count=(int)$c->query('SELECT COUNT(*) FROM experiencia_sessoes WHERE experiencia_id=3')->fetchColumn();agendaMaterializar($c,3);agendaMaterializar($c,3);ck((int)$c->query('SELECT COUNT(*) FROM experiencia_sessoes WHERE experiencia_id=3')->fetchColumn()===$count,'repeated save updates without duplicating adopted or generated departures');
 try{agendaMaterializar($c,4,[$incompatible]);throw new Exception('booked participants converted to units');}catch(AgendaConflitoSessoes $e){ck(!$e->conflitos[0]['pode_ligar'],'booked participant stock cannot be reinterpreted as equipment');}
 ck((int)$c->query('SELECT COUNT(*) FROM experiencia_agenda_sessoes WHERE sessao_id='.$incompatible)->fetchColumn()===0,'incompatible session remains unmodified');
 $c->exec('UPDATE experiencia_sessoes SET vagas_ocupadas=0 WHERE id='.$incompatible);$c->exec('UPDATE experiencia_configuracoes SET duracao_minutos=30 WHERE id=11');
 agendaMaterializar($c,4,[$incompatible]);ck($c->query('SELECT hora_fim FROM experiencia_sessoes WHERE id='.$incompatible)->fetchColumn()==='09:30','empty legacy row can be reused with explicitly approved duration');

 $c->exec('INSERT INTO experiencias VALUES(9,90)');
 $s=$c->prepare("INSERT INTO experiencia_agendas(experiencia_id,dias_json,repeticao,inicio,minima_horas,maxima_dias,pausado) VALUES(9,'[1,2,3,4,5,6,7]','semanal',?,0,2,0)");$s->execute([$today]);
 $c->exec("INSERT INTO experiencia_agenda_recursos(id,experiencia_id,nome,tipo,quantidade,manutencoes_json,ativo) VALUES(9,9,'Shared single unit','equipamento',1,'[]',1)");
 $s=$c->prepare('INSERT INTO experiencia_configuracoes VALUES(?,?,?,?,?,?,?,?,?,?)');$s->execute([90,9,'Short',15,100,1,'unidade','["08:00"]','[9]',1]);$s->execute([91,9,'Long',30,100,1,'unidade','["08:00"]','[9]',1]);agendaMaterializar($c,9);
 $sharedRows=agendaLinhasDia($c,9,$tomorrow);$oldHold=reservarVagasTemporarias($c,['sessao_id'=>$sharedRows[1]['id'],'quantidade'=>1,'usuario_id'=>90,'dados_reserva'=>['participantes'=>1]]);
 $s=$c->prepare('UPDATE reservas_temporarias SET expira_em=? WHERE token=?');$s->execute([date('Y-m-d H:i:s',time()-10),$oldHold['token']]);
 $newHold=reservarVagasTemporarias($c,['sessao_id'=>$sharedRows[0]['id'],'quantidade'=>1,'usuario_id'=>91,'dados_reserva'=>['participantes'=>1]]);
 $s=$c->prepare("INSERT INTO reservas_experiencia(id,experiencia_id,usuario_id,data_participacao,horario,quantidade_pessoas,quantidade_jet_skis,pagamento_status,status) VALUES(90,9,90,?,'08:00',1,1,'pago','confirmada')");$s->execute([$tomorrow]);
 try{confirmarVagasTemporarias($c,$oldHold['token'],90);throw new Exception('expired paid hold reclaimed shared unit already allocated to another duration');}catch(InvalidArgumentException $ok){}
 ck((int)$c->query('SELECT SUM(vagas_ocupadas) FROM experiencia_sessoes WHERE experiencia_id=9')->fetchColumn()===0,'failed late confirmation rolls back occupied stock');
 echo 'PASS: minute intervals, overlap rejection, shared-stock peak, recurrence idempotence, preserved bookings/prices, close/open exceptions, pause actual payment holds, shared equipment maintenance, overlapping holds, own-hold credit and payment-only idempotent confirmation.';
 `);
 const result=await php.run({scriptPath:'/test.php'});if(result.errors||!result.text.startsWith('PASS:'))throw Error(result.errors+result.text);console.log(result.text);
 php.writeFile('/api/config.php',`<?php
 class TestAgendaPDO extends PDO { public function prepare(string $query,array $options=[]): PDOStatement|false{if(str_contains($query,'INSERT INTO experiencia_modelos')){$query=str_replace('ON DUPLICATE KEY UPDATE','ON CONFLICT(experiencia_id) DO UPDATE SET',$query);$query=preg_replace('/VALUES\\((\\w+)\\)/','excluded.$1',$query);}return parent::prepare(str_replace([' FOR UPDATE','ON DUPLICATE KEY UPDATE opcoes_json=VALUES(opcoes_json)','NOW()'],['','ON CONFLICT(configuracao_id) DO UPDATE SET opcoes_json=excluded.opcoes_json',"datetime('now')"],$query),$options);} }
 $conn=new TestAgendaPDO('sqlite:/agenda-fixture.sqlite');
 `);
 php.writeFile('/api/reserva-validacao.php','<?php function utilizadorReservaQR(PDO $conn,string $scope): int{return 20;}');
 php.writeFile('/api/agenda_experiencias.php',fs.readFileSync('server/api/agenda_experiencias.php','utf8'));
 const tomorrow=new Date(Date.now()+86400000).toLocaleDateString('en-CA',{timeZone:'Atlantic/Cape_Verde'});
 const candidate={id:1,nome:'Jet skis',tipo:'equipamento',quantidade:5,manutencoes:[{inicio:tomorrow,fim:tomorrow,hora_inicio:'08:30',hora_fim:'09:00',quantidade:2}],impacto_alvo:{inicio:tomorrow,fim:tomorrow,hora_inicio:'08:30',hora_fim:'09:00'}};
 const preview=await php.run({scriptPath:'/api/agenda_experiencias.php',method:'POST',body:JSON.stringify({experiencia_id:2,action:'rever_recurso',dados:candidate,data:tomorrow}),headers:{'Content-Type':'application/json'}});
 const data=JSON.parse(preview.text);if(!data.success || data.impacto.count!==2 || data.impacto.confirmed!==3)throw Error('Impact preview: '+preview.text+preview.errors);
 const after=await php.run({code:"<?php $c=new PDO('sqlite:/agenda-fixture.sqlite');echo $c->query('SELECT manutencoes_json FROM experiencia_agenda_recursos WHERE id=1')->fetchColumn();"});
 const original=JSON.parse(after.text);if(original.length!==1 || original[0].quantidade!==1 || original[0].hora_inicio!=='08:00')throw Error('Preview persisted changes');
 console.log('PASS: actual impact endpoint counts affected departures without double-counting stock and rolls back the proposed maintenance.');
 const setup=await php.run({code:`<?php
 $c=new PDO('sqlite:/agenda-fixture.sqlite');$c->exec("ALTER TABLE experiencias ADD COLUMN titulo TEXT DEFAULT 'Test';ALTER TABLE experiencias ADD COLUMN ilha TEXT DEFAULT 'Santiago';ALTER TABLE experiencias ADD COLUMN preco NUMERIC DEFAULT 100;ALTER TABLE experiencias ADD COLUMN max_pessoas INTEGER DEFAULT 5;ALTER TABLE experiencias ADD COLUMN categoria TEXT DEFAULT 'Jet ski';ALTER TABLE experiencia_configuracoes ADD COLUMN atualizado_em TEXT;CREATE TABLE experiencia_agenda_historico(id INTEGER PRIMARY KEY,experiencia_id INTEGER,usuario_id INTEGER,acao TEXT,detalhes_json TEXT,criado_em TEXT DEFAULT CURRENT_TIMESTAMP)");
 $c->exec('DELETE FROM experiencia_agenda_excecoes WHERE experiencia_id=2');
 $day=$c->query('SELECT inicio FROM experiencia_agendas WHERE experiencia_id=2')->fetchColumn();$s=$c->prepare('INSERT INTO experiencia_sessoes(experiencia_id,data,hora_inicio,hora_fim,periodo,capacidade_maxima,vagas_ocupadas,reservas_pendentes,preco_especial,ativo) VALUES(2,?,?,?,?,5,0,0,100,1)');$s->execute([$day,'08:00','08:15','Morning']);
 `});if(setup.errors)throw Error(setup.errors);
 const cfg={nome:'Another fifteen minutes',duracao_minutos:15,preco:140,capacidade:5,unidade:'unidade',horarios:['12:00'],recursos:[1],ativo:1,opcoes:{metodo:'intervalos',abertura:'12:00',fecho:'12:15',intervalo:15,preparacao:0}};
 const send=async value=>{const r=await php.run({scriptPath:'/api/agenda_experiencias.php',method:'POST',body:new TextEncoder().encode(JSON.stringify({experiencia_id:2,action:'guardar_configuracao',dados:value,data:tomorrow})),headers:{'Content-Type':'application/json'}});const d=JSON.parse(r.text);if(!d.success)throw Error(r.text+r.errors);return d;};
 const firstSave=await send(cfg);const added=firstSave.configuracoes.find(c=>c.nome===cfg.nome);if(firstSave.sessoes.some(s=>[2,3,4].includes(Number(s.configuracao_id)) && !Number(s.ativo)))throw Error('Unrelated configuration deactivated');if(!added || firstSave.configuracoes.filter(c=>Number(c.duracao_minutos)===15).length<3)throw Error('Same-duration configuration rejected');
 const ids=firstSave.sessoes.filter(s=>Number(s.configuracao_id)===Number(added.id)).map(s=>s.id);if(ids.length!==1)throw Error('New configuration did not materialize independently');
 const incompatible=await php.run({scriptPath:'/api/agenda_experiencias.php',method:'POST',body:new TextEncoder().encode(JSON.stringify({experiencia_id:2,action:'guardar_configuracao',dados:{...cfg,unidade:'participante'},data:tomorrow})),headers:{'Content-Type':'application/json'}});
 assert.equal(incompatible.httpStatusCode,422);assert.equal(JSON.parse(incompatible.text).success,false);
 const canonical=await php.run({code:"<?php $c=new PDO('sqlite:/agenda-fixture.sqlite');echo $c->query('SELECT modelo_reserva FROM experiencia_modelos WHERE experiencia_id=2')->fetchColumn();"});assert.equal(canonical.text,'por_equipamento');
 const repeat=await send({...cfg,id:added.id,preco:150});const idsAgain=repeat.sessoes.filter(s=>Number(s.configuracao_id)===Number(added.id)).map(s=>s.id);if(JSON.stringify(ids)!==JSON.stringify(idsAgain))throw Error('Repeated save duplicated sessions');
 if(!repeat.sessoes.some(s=>s.configuracao_id===null && s.hora_inicio==='08:00'))throw Error('Unrelated legacy session was modified');
 console.log('PASS: actual save endpoint creates another configuration of the same duration despite unrelated legacy conflicts, preserves other sessions and reuses IDs on edit.');
 php.writeFile('/api/get_dias_com_sessoes.php',fs.readFileSync('server/api/get_dias_com_sessoes.php','utf8'));
 const month=tomorrow.slice(0,7);php.writeFile('/calendar.php',`<?php $_GET=['experiencia_id'=>2,'mes'=>'${month}'];require '/api/get_dias_com_sessoes.php';`);
 let calendar=await php.run({scriptPath:'/calendar.php',method:'GET'});let days=JSON.parse(calendar.text);if(!days.success || !days.dias_disponiveis.includes(tomorrow) || days.dias_disponiveis.some(d=>!d.startsWith(month)))throw Error('Calendar dates: '+calendar.text+calendar.errors);
 await php.run({code:"<?php $c=new PDO('sqlite:/agenda-fixture.sqlite');$c->exec('UPDATE experiencia_agendas SET pausado=1 WHERE experiencia_id=2');"});
 calendar=await php.run({scriptPath:'/calendar.php',method:'GET'});days=JSON.parse(calendar.text);if(!days.success || days.dias_disponiveis.length)throw Error('Paused calendar: '+calendar.text);
 console.log('PASS: actual calendar endpoint returns configured available dates for the requested month and omits paused experience dates.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
