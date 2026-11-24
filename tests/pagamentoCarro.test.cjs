const fs=require('fs'),path=require('path');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65462,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 for(const d of ['/v','/v/server','/v/server/api','/v/server/sql','/v/tests'])php.mkdir(d);
 const files=['server/api/get_carro_detalhes.php','server/api/carroFotos.php','server/api/get_carro_fotos.php','tests/carroFotos.test.php','server/api/carroHorarios.php','server/api/carroDocumentos.php','server/api/carroCalendario.php','server/api/carroPagamento.php','server/api/carroStock.php','server/api/carroStripeStock.php','server/api/carroCaucao.php','server/api/checkout_api.php','tests/carroDocumentos.test.php','tests/carroCalendario.test.php','tests/carroPagamento.test.php','tests/carroStock.test.php','tests/carroStockDb.test.php','tests/checkoutStripe.test.php'];
 files.push('tests/carroHorarios.test.php','server/api/send_email.php','tests/carroCaucao.test.php','tests/caucaoConfirmacao.test.php');
 php.writeFile('/v/server/sql/galeria_carros.sql',fs.readFileSync('server/sql/galeria_carros.sql'));
 for(const f of files)php.writeFile('/v/'+f,fs.readFileSync(f));
 for(const f of ['carroFotos.test.php','carroHorarios.test.php','carroCaucao.test.php','caucaoConfirmacao.test.php']) {
  const r=await php.run({scriptPath:'/v/tests/'+f});console.log(f,r.text,r.errors);if(r.exitCode)throw Error(f);
 }
 for(const f of ['carroDocumentos.test.php','carroCalendario.test.php','carroPagamento.test.php','carroStock.test.php','carroStockDb.test.php','checkoutStripe.test.php']) {
  const r=await php.run({scriptPath:'/v/tests/'+f});console.log(f,r.text,r.errors);if(r.exitCode)throw Error(f);
 }
 const Parser=require(path.join(root,'php-parser'));const parser=new Parser({parser:{phpVersion:'8.3'}});
 for(const f of ['server/bin/limpar_documentos_condutor.php','server/api/documentos-config.local.example.php','server/api/documentos_condutor.php','server/api/documentos_condutor_upload.php','server/api/horarios_carro.php','server/api/calendario_carro.php','server/api/create-payment-intent.php',...files.filter(f=>f.startsWith('server/'))])parser.parseCode(fs.readFileSync(f,'utf8'),f);
 console.log('PHP syntax checks passed');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
