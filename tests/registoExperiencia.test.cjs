const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const Parser=require(path.join(root,'php-parser'));const parser=new Parser({parser:{phpVersion:'8.3',suppressErrors:false}});
 const files=fs.readdirSync('server/api/experiencia').filter(f=>f.endsWith('.php'));
 for(const f of files)parser.parseCode(fs.readFileSync('server/api/experiencia/'+f,'utf8'),f);
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65439,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/api');php.mkdir('/api/experiencia');for(const f of files)php.writeFile('/api/experiencia/'+f,fs.readFileSync('server/api/experiencia/'+f,'utf8'));
 php.writeFile('/api/reserva-validacao.php',"<?php function utilizadorReservaQR(PDO $c,string $scope): int{return 20;}");
 php.writeFile('/api/config.php',`<?php
 class FixturePDO extends PDO {public function prepare(string $q,array $o=[]): PDOStatement|false {
  $q=str_replace([' FOR UPDATE','NOW()'],['',"datetime('now')"],$q);
  if(str_contains($q,'ON DUPLICATE KEY UPDATE')){$q=str_replace('ON DUPLICATE KEY UPDATE','ON CONFLICT(experiencia_id) DO UPDATE SET',$q);$q=preg_replace('/VALUES\\((\\w+)\\)/','excluded.$1',$q);}
  return parent::prepare($q,$o);
 }} $conn=new FixturePDO('sqlite:/registo.sqlite');`);
 const setup=await php.run({code:`<?php
 require '/api/experiencia/registoComum.php';$c=registoConexao();
 $base=['titulo'=>'Tour','descricao_curta'=>'Short description','preco'=>100,'max_pessoas'=>10,'dias_disponiveis'=>['terca'],'endereco'=>['morada'=>'Rua 1','cidade'=>'Praia','ilha'=>'Santiago']];
 $model=modeloRegistoValidar($base);$fields=registoCampos($base,$model);$cols=[];foreach(array_keys($fields) as $key)$cols[]=$key.' TEXT';
 $c->exec('CREATE TABLE experiencias(id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,slug TEXT,status TEXT,created_at TEXT,updated_at TEXT,'.implode(',',$cols).')');
 $c->exec('CREATE TABLE experiencia_modelos(experiencia_id INTEGER PRIMARY KEY,modelo_reserva TEXT,equipamento_nome TEXT,quantidade_equipamentos INTEGER,pessoas_por_equipamento INTEGER,recurso_id INTEGER,atualizado_em TEXT);
 CREATE TABLE experiencia_agenda_recursos(id INTEGER PRIMARY KEY AUTOINCREMENT,experiencia_id INTEGER,nome TEXT,tipo TEXT,quantidade INTEGER,manutencoes_json TEXT,ativo INTEGER);
 CREATE TABLE experiencia_agendas(experiencia_id INTEGER PRIMARY KEY,dias_json TEXT,repeticao TEXT,inicio TEXT,minima_horas INTEGER,maxima_dias INTEGER,pausado INTEGER,materializado_em TEXT,atualizado_em TEXT);
 CREATE TABLE experiencia_inclusoes(id INTEGER PRIMARY KEY,experiencia_id INTEGER,item TEXT,icone TEXT,incluido INTEGER,ordem INTEGER);
 CREATE TABLE experiencia_requisitos(id INTEGER PRIMARY KEY,experiencia_id INTEGER,requisito TEXT,obrigatorio INTEGER,ordem INTEGER);
 CREATE TABLE experiencia_idiomas(id INTEGER PRIMARY KEY,experiencia_id INTEGER,idioma TEXT,nivel TEXT);
 CREATE TABLE experiencia_imagens(id INTEGER PRIMARY KEY AUTOINCREMENT,experiencia_id INTEGER,caminho_url TEXT,principal INTEGER,ordem INTEGER)');echo 'OK';`});assert.equal(setup.errors,'');assert.equal(setup.text,'OK');
 const send=async(file,data,id)=>{php.writeFile('/request.php',`<?php $_GET=${id?"['id'=>"+Number(id)+",'edicao'=>'1']":"[]"};require '/api/experiencia/${file}.php';`);const r=await php.run({scriptPath:'/request.php',method:data?'POST':'GET',body:data?new TextEncoder().encode(JSON.stringify(data)):undefined,headers:{'Content-Type':'application/json'}});assert.equal(r.errors,'');return JSON.parse(r.text);};
 const base={usuario_id:999,titulo:'Tour',descricao_curta:'Short description',preco:100,max_pessoas:10,min_pessoas:3,dias_disponiveis:['terca','quarta'],endereco:{morada:'Rua 1',cidade:'Praia',ilha:'Santiago'},inclusoes:['Guide'],requisitos:['Swim'],idiomas:['PT'],imagens:[{url:'https://example.com/1.jpg'}]};
 const person=await send('registrar',{...base,modelo_reserva:'por_pessoa'});assert.equal(person.success,true);let saved=await send('buscar',null,person.data.experiencia_id);assert.equal(saved.data.usuario_id,20);assert.equal(saved.data.cidade,'Praia');assert.deepEqual(saved.data.endereco,{morada:'Rua 1',cidade:'Praia',ilha:'Santiago',lat:null,lng:null});assert.equal(saved.data.imagem_principal,'https://example.com/1.jpg');assert.equal('horarios_json' in saved.data,false);assert.equal(saved.data.modelo_reserva,'por_pessoa');assert.equal(Number(saved.data.min_pessoas),3);assert.deepEqual(saved.data.dias_disponiveis,base.dias_disponiveis);
 const unit={...base,titulo:'Kayak',modelo_reserva:'por_equipamento',preco:0,equipamento_nome:'Kayak',quantidade_equipamentos:5,pessoas_por_equipamento:3};const created=await send('registrar',unit);assert.equal(created.success,true);const id=created.data.experiencia_id;saved=await send('buscar',null,id);assert.equal(saved.data.pessoas_por_equipamento,3);assert.equal(Number(saved.data.preco),0);assert.equal(Number(saved.data.max_pessoas),15);const resource=saved.data.recurso_id;const image=saved.data.imagens[0].id;
 await php.run({code:`<?php $c=new PDO('sqlite:/registo.sqlite');$c->exec("UPDATE experiencia_agenda_recursos SET manutencoes_json='[{\\"quantidade\\":1}]' WHERE id=${resource}");`});
 const updated=await send('atualizar',{...unit,pessoas_por_equipamento:4},id);assert.equal(updated.success,true);saved=await send('buscar',null,id);assert.equal(saved.data.recurso_id,resource);assert.equal(saved.data.imagens[0].id,image);assert.equal(saved.data.pessoas_por_equipamento,4);
 const check=await php.run({code:`<?php $c=new PDO('sqlite:/registo.sqlite');echo $c->query('SELECT manutencoes_json FROM experiencia_agenda_recursos WHERE id=${resource}')->fetchColumn();`});assert.deepEqual(JSON.parse(check.text),[{quantidade:1}]);
 assert.equal((await send('registrar',{...base,modelo_reserva:'por_pessoa',min_pessoas:11})).success,false);
 assert.equal((await send('registrar',{...unit,quantidade_equipamentos:0})).success,false);assert.equal((await send('registrar',{...base,modelo_reserva:'por_pessoa',preco:0})).success,false);
 const denied=await php.run({code:`<?php $c=new PDO('sqlite:/registo.sqlite');$c->exec('UPDATE experiencias SET usuario_id=21 WHERE id=${id}');`});assert.equal(denied.errors,'');assert.equal((await send('atualizar',unit,id)).success,false);
 php.writeFile('/public.php',`<?php $_GET=['id'=>${id}];require '/api/experiencia/buscar.php';`);const publicResult=await php.run({scriptPath:'/public.php',method:'GET'});const publicData=JSON.parse(publicResult.text);assert.equal(publicData.success,true);assert.equal(publicData.data.slug,saved.data.slug);assert.equal(publicData.data.imagem_principal,'https://example.com/1.jpg');assert.equal('usuario_id' in publicData.data,false);
 console.log('PASS: PHP syntax; actual create/read/update endpoints, canonical models, owner checks, city, weekdays, equipment stock/people, zero equipment base price, stable resource/image IDs and preserved maintenance.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
