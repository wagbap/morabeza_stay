<?php
require_once __DIR__ . '/../server/api/send_email.php';
function exigirCaucaoConfirmacao($ok, string $msg): void { if (!$ok) throw new RuntimeException($msg); }
$db = new PDO('sqlite::memory:');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("CREATE TABLE reservas_carro(id INTEGER, codigo_reserva TEXT, carro_id INTEGER, usuario_id INTEGER, status TEXT, pagamento_status TEXT, preco_total REAL, dias INTEGER, data_levantamento TEXT, data_devolucao TEXT);
CREATE TABLE carros(id INTEGER, usuario_id INTEGER, titulo TEXT, caucao_valor REAL);
CREATE TABLE usuarios(id INTEGER,nome TEXT,email TEXT,phone TEXT);
CREATE TABLE reservas_carro_condicoes(reserva_id INTEGER,snapshot_json TEXT);
INSERT INTO reservas_carro VALUES(77,'RES-CAUCAO',24,1,'confirmada','pago',20000,2,'2026-11-07','2026-11-09');
INSERT INTO carros VALUES(24,2,'Carro de teste',700);
INSERT INTO usuarios VALUES(1,'Cliente','cliente@example.test','123'),(2,'Proprietario','host@example.test','456');");
$c = ['exige_caucao'=>1,'caucao_valor'=>500,'quantidade'=>2,'caucao_total'=>1000,'caucao_formas'=>['dinheiro','transferencia'],'caucao_condicoes'=>"Devolução após inspeção.\nRetenção por danos <script>alert(1)</script>."];
$db->prepare('INSERT INTO reservas_carro_condicoes VALUES(?,?)')->execute([77,json_encode(['caucao'=>$c])]);
$d = carregarDadosEmailReserva($db,'carro','RES-CAUCAO');
$d['receipt_url']='https://example.test/receipt';
exigirCaucaoConfirmacao($d['caucao']===$c,'Usa condições da reserva, não os 700 CVE atuais do anúncio');
exigirCaucaoConfirmacao((float)$d['preco_total']===20000.0 && (float)$d['linhas_pagamento'][0]['valor']===20000.0,'Caução não entra no total online');
$html=renderizarConfirmacaoReserva($d);
foreach(['500 CVE','1.000 CVE','Dinheiro','Transferência bancária','Devolução após inspeção.','Retenção por danos','ao proprietário no levantamento','nem na comissão','&lt;script&gt;'] as $texto) exigirCaucaoConfirmacao(strpos($html,$texto)!==false,'Email inclui: '.$texto);
exigirCaucaoConfirmacao(strpos($html,'<script>')===false && strpos($html,'{{')===false,'Texto escapado e tokens resolvidos');
$d['caucao']['exige_caucao']=0;
$html=renderizarConfirmacaoReserva($d);
exigirCaucaoConfirmacao(strpos($html,'não exige caução')!==false && strpos($html,'500 CVE')===false,'Sem caução não mostra montantes antigos');
foreach(['alojamento','experiencia'] as $tipo) { $d['tipo']=$tipo; exigirCaucaoConfirmacao(emailReservaCaucaoLinhas($d)===[],'Não altera outras verticais'); }
$db->exec('DELETE FROM reservas_carro_condicoes');
exigirCaucaoConfirmacao(carregarDadosEmailReserva($db,'carro','RES-CAUCAO')['caucao']===null,'Reserva antiga não inventa condições atuais');
echo "Caução: snapshot, total online, email completo e privacidade HTML verificados.\n";
