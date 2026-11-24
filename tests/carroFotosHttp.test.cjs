const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65479,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/v');php.mkdir('/v/api');for(const f of ['carroStock.php','carroHorarios.php','carroFotos.php','get_carro_fotos.php'])php.writeFile('/v/api/'+f,fs.readFileSync('server/api/'+f));
 php.writeFile('/v/api/config.php',"<?php $conn=new PDO('sqlite:/v/photos.sqlite');$conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);");
 let r=await php.run({code:`<?php require '/v/api/config.php';$conn->exec("CREATE TABLE carros(id INTEGER,slug TEXT,status TEXT,status_carro TEXT);INSERT INTO carros VALUES(24,'toyota','disponivel','aprovado'),(25,'privado','disponivel','pendente');CREATE TABLE carro_imagens(id INTEGER,carro_id INTEGER,caminho_url TEXT,principal INTEGER,ordem INTEGER,exibir_galeria INTEGER);CREATE TABLE carro_imagem_revisoes(carro_id INTEGER,caminho_url TEXT);INSERT INTO carro_imagens VALUES(27,24,'/uploads/carros/front.jpeg',1,0,1),(32,24,'/uploads/carros/card.png',0,2,1),(40,25,'/uploads/carros/private.jpg',1,0,1);INSERT INTO carro_imagem_revisoes VALUES(24,'/uploads/carros/card.png');");`});assert.equal(r.exitCode,0);
 const req=(method,query)=>php.run({code:`<?php $_SERVER['REQUEST_METHOD']='${method}';$_GET=json_decode('${JSON.stringify(query)}',true);require '/v/api/get_carro_fotos.php';`});
 r=await req('OPTIONS',{});assert.equal(r.httpStatusCode,204);assert.ok(r.headers['access-control-allow-headers'][0].includes('Content-Type'));
 assert.equal((await req('POST',{id:24})).httpStatusCode,405);
 assert.equal((await req('GET',{id:25})).httpStatusCode,404);
 r=await req('GET',{slug:'toyota'});assert.equal(r.httpStatusCode,200);let d=JSON.parse(r.text).data;assert.equal(d.id,24);assert.equal(d.galeria_fonte,'carro_imagens');assert.equal(d.imagens.length,1);assert.equal(d.imagens[0].id,27);assert.equal(r.text.includes('card.png'),false);assert.equal(r.text.includes('private.jpg'),false);
 console.log('PASS HTTP photos: CORS preflight, methods, approved listing scope, own uploaded photos only, reviewed screenshot excluded.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
