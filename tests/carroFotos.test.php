<?php
require_once __DIR__.'/../server/api/carroFotos.php';
function fotosCheck($ok,string $msg): void {if(!$ok)throw new RuntimeException($msg);echo "OK $msg\n";}
$db=new PDO('sqlite::memory:');$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
$db->exec("CREATE TABLE carro_imagens(id INTEGER PRIMARY KEY,carro_id INTEGER,caminho_url TEXT,principal INTEGER,ordem INTEGER,exibir_galeria INTEGER DEFAULT 1);
CREATE TABLE carro_imagem_revisoes(imagem_id INTEGER PRIMARY KEY,carro_id INTEGER,caminho_url TEXT,motivo TEXT);
INSERT INTO carro_imagens VALUES(27,24,'https://welovepalop.com/uploads/carros/front.jpeg',1,0,1),(28,24,'/uploads/carros/side.jpeg',0,1,1),(32,24,'/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png',0,2,1),(40,25,'/uploads/carros/carro_6ae9bf8a1dc89_1793703818.png',0,0,1),(41,24,'/uploads/carros/other-real.png',0,3,1);");
$sql=file_get_contents(__DIR__.'/../server/sql/galeria_carros.sql');
preg_match('/INSERT IGNORE INTO carro_imagem_revisoes.*?;\s*(?=UPDATE carro_imagens)/s',$sql,$rev);$db->exec(str_replace('INSERT IGNORE','INSERT OR IGNORE',$rev[0]));
preg_match('/UPDATE carro_imagens SET exibir_galeria=0[^;]+;/s',$sql,$m);$db->exec($m[0]);$db->exec($m[0]);
$fotos=carroFotosPublicas($db,24);
fotosCheck(array_column($fotos,'id')===[27,28,41],'known screenshot excluded; genuine PNG retained; order preserved');
fotosCheck((int)$db->query('SELECT exibir_galeria FROM carro_imagens WHERE id=40')->fetchColumn()===1,'migration cannot hide a different vehicle image');
fotosCheck((int)$db->query('SELECT COUNT(*) FROM carro_imagens WHERE id=32')->fetchColumn()===1,'original upload record preserved, not deleted');
$db->exec('UPDATE carro_imagens SET exibir_galeria=1 WHERE id=32');
fotosCheck(!in_array(32,array_column(carroFotosPublicas($db,24),'id'),true),'reviewed source stays hidden if a legacy save resets the flag');
$db->exec("UPDATE carro_imagens SET exibir_galeria=1,caminho_url='/uploads/carros/replacement.png' WHERE id=32");$db->exec($m[0]);
fotosCheck((int)$db->query('SELECT exibir_galeria FROM carro_imagens WHERE id=32')->fetchColumn()===1,'migration does not hide a replacement image at the same record ID');
fotosCheck(carroFotosPublicas($db,99)===[],'empty gallery has no generic stock photo or cover fallback');
fotosCheck(carroFotoUrl('javascript:alert(1)')===null && carroFotoUrl('null')===null,'invalid public image URLs rejected');
