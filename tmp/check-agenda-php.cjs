const fs=require('fs'),path=require('path');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const Parser=require(path.join(root,'php-parser'));const parser=new Parser({parser:{phpVersion:'8.3',suppressErrors:false}});
 const files=['agendaExperienciasLogica.php','agendaPublica.php','agenda_disponibilidade.php','get_dias_com_sessoes.php','validar_retencao.php','agenda_experiencias.php','retencaoExperiencia.php','retencaoBootstrap.php','reservar_temporariamente.php','liberar_retensao.php','confirmar_retensao.php','validar_retencao.php','get_sessoes_experiencia.php','sessoes_experiencia.php','experiencia_pagina_completa.php','checkout_api.php'];
 for(const f of files)parser.parseCode(fs.readFileSync('server/api/'+f,'utf8'),f);
 console.log('PASS: syntax of '+files.length+' PHP files.');
 const {PHP}=require(path.join(root,'@php-wasm/universal'));const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:65432,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));php.mkdir('/api');php.mkdir('/api/experiencia');php.writeFile('/api/experiencia/modeloRegisto.php',fs.readFileSync('server/api/experiencia/modeloRegisto.php','utf8'));php.writeFile('/api/checkout_api.php',fs.readFileSync('server/api/checkout_api.php','utf8'));php.writeFile('/test.php',fs.readFileSync('tests/checkoutStripe.test.php','utf8').replace("__DIR__ . '/../server/api/checkout_api.php'","'/api/checkout_api.php'"));const r=await php.run({scriptPath:'/test.php'});if(r.errors||!r.text.includes('rejected'))throw Error(r.errors+r.text);console.log('PASS: '+r.text.trim());process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
