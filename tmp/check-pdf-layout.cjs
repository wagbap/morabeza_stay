const fs=require('fs'),path=require('path');
const root=path.join(process.env.TEMP,'morabeza-email-php-check/node_modules');
(async()=>{
 const {PHP}=require(path.join(root,'@php-wasm/universal'));
 const {loadNodeRuntime}=require(path.join(root,'@php-wasm/node'));
 const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:59483,wasmBinary:fs.readFileSync(path.join(root,'@php-wasm/node-8-3/asyncify/8_3_33/php_8_3.wasm'))}}));
 php.mkdir('/v');php.writeFile('/v/send_email.php',fs.readFileSync('server/api/send_email.php'));
 php.writeFile('/v/fixtures.json',fs.readFileSync('server/previews/reservas-exemplo.json'));
 const r=await php.run({code:`<?php require '/v/send_email.php'; $out=[];
 foreach(json_decode(file_get_contents('/v/fixtures.json'),true) as $d) {
 $out[$d['tipo']]=base64_encode(gerarPdfComprovativoReserva($d));
 if($d['tipo']==='carro') {
  $case=$d;$case['titulo']='Testar yha mesmo';$case['localizacao']='Praia de Santa Maria';
  $case['inicio']='2026-11-07';$case['fim']='2026-11-08';$case['hora_inicio']='10:00:00';$case['hora_fim']='10:00:00';
  $case['morada']='Praia de Santa Maria';$case['codigo_reserva']='RES-6AEF059CC8C6C-20261107';
  $case['detalhes']='1 dia(s) de aluguer - tefdddsd - sdsdsd - Automatico - Diesel';
  $case['itens']=[['nome'=>'Testar yha mesmo','descricao'=>$case['detalhes']]];
  $case['participante_principal']['nome_completo']='Wagner Baptista';$case['pessoas_resumo']='1 pessoa(s)';
  $out['carro-captura-longo']=base64_encode(gerarPdfComprovativoReserva($case));
 }
 $d['titulo']=str_repeat('Reserva com nome extenso e detalhes completos ',5);
 $d['codigo_reserva']='RES-6AEF059CC8C6C-20261107100000';
 $d['morada']=str_repeat('Rua de Santa Maria, Cabo Verde, ',8);
 $d['participante_principal']['nome_completo']=str_repeat('Nome completo do cliente ',6);
 $d['itens']=array_fill(0,12,['nome'=>str_repeat('Veiculo quarto ou atividade ',6),'descricao'=>str_repeat('Detalhes da reserva e equipamento incluido ',12)]);
 $out[$d['tipo'].'-longo']=base64_encode(gerarPdfComprovativoReserva($d));
 } echo json_encode($out);`});
 if(r.exitCode) throw Error(r.errors);
 fs.mkdirSync('output/pdf',{recursive:true});fs.mkdirSync('tmp/pdfs',{recursive:true});
 for(const [name,data] of Object.entries(JSON.parse(r.text))) {
  const bytes=Buffer.from(data,'base64');
  const dest=(name.endsWith('-longo')?'tmp/pdfs/':'output/pdf/')+'comprovativo-'+name+'.pdf';
  fs.writeFileSync(dest,bytes);console.log(dest,bytes.length);
 }
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});

