const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65463,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/v');php.writeFile('/v/get_carro.php',fs.readFileSync('server/api/get_carro.php'));
 php.writeFile('/v/config.php',`<?php
 class PesquisaDb extends PDO {
  public function __construct(){parent::__construct('sqlite::memory:');}
  public function exec(string $statement): int|false { return str_starts_with($statement,'SET NAMES') ? 0 : parent::exec($statement); }
 }
 $conn=new PesquisaDb();
 $conn->exec("CREATE TABLE carros(id INTEGER,ilha TEXT,status_carro TEXT,status TEXT,localizacao TEXT,preco_dia INTEGER,data_levantamento TEXT,data_devolucao TEXT);
 INSERT INTO carros VALUES(1,'Santiago','aprovado','disponivel','Praia',5000,'2026-11-01','2026-12-01');
 INSERT INTO carros VALUES(2,'Sal','aprovado','disponivel','Santa Maria',5000,'2026-11-01','2026-12-01');
 INSERT INTO carros VALUES(3,'Santiago','pendente','disponivel','Praia',5000,'2026-11-01','2026-12-01');
 INSERT INTO carros VALUES(4,'Santiago','aprovado','manutencao','Praia',5000,'2026-11-01','2026-12-01');
 INSERT INTO carros VALUES(5,'Santiago','aprovado','disponivel','Tarrafal',4000,'2026-11-01','2026-12-01');");`);
 const cases=[['destino=Santiago',[5,1]],['destino=Santiago&localizacao=Praia',[1]],['destino=Santiago&data_levantamento=2026-11-12&data_devolucao=2026-11-14',[5,1]],['id=2&destino=Santiago',[2]]];
 for(const [query,ids] of cases){php.writeFile('/v/test.php',`<?php $_SERVER['REQUEST_METHOD']='GET';parse_str('${query}',$_GET);require '/v/get_carro.php';`);const result=await php.run({scriptPath:'/v/test.php'});assert.equal(result.exitCode,0,result.errors);const data=JSON.parse(result.text);assert.equal(data.success,true,result.text);assert.deepEqual((Array.isArray(data.data)?data.data:[data.data]).map(c=>Number(c.id)),ids,query);}
 console.log('PASS: real PDO SQL filters Santiago with location/dates and approval; existing ID lookup preserved.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
