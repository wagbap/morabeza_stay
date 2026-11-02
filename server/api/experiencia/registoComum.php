<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: no-store');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/modeloRegisto.php';
function registoResponder(int $code,array $data): void {http_response_code($code);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
function registoConexao(): PDO {
    require __DIR__.'/../config.php';
    if(isset($conn) && $conn instanceof PDO)$c=$conn;elseif(isset($pdo) && $pdo instanceof PDO)$c=$pdo;else $c=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    $c->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);$c->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_ASSOC);return $c;
}
function registoUsuario(PDO $c): int {require_once __DIR__.'/../reserva-validacao.php';return utilizadorReservaQR($c,'host');}
function registoSlug(PDO $c,string $title,?int $id): string {
    $slug=preg_replace('~[^\pL\d]+~u','-',$title);if(function_exists('iconv'))$slug=iconv('utf-8','us-ascii//TRANSLIT',$slug) ?: $slug;
    $slug=strtolower(trim(preg_replace('~[^-\w]+~','',$slug),'-')) ?: 'experiencia';
    $s=$c->prepare('SELECT id FROM experiencias WHERE slug=? AND id<>? LIMIT 1');$s->execute([$slug,$id ?? 0]);if($s->fetchColumn())$slug.='-'.bin2hex(random_bytes(4));return $slug;
}
function registoCampos(array $data,array $model): array {
    $title=trim((string)($data['titulo'] ?? ''));$desc=trim((string)($data['descricao_curta'] ?? ''));
    if($title==='' || $desc==='' || modeloRegistoComprimento($desc)>200)throw new InvalidArgumentException('Preencha o título e uma descrição curta de até 200 caracteres.');
    $address=$data['endereco'] ?? '';$nested=is_array($address) ? $address : [];
    $street=trim((string)($nested['morada'] ?? $nested['endereco'] ?? (is_string($address)?$address:($data['morada'] ?? ''))));
    $city=trim((string)($nested['cidade'] ?? $data['cidade'] ?? $data['localizacao'] ?? ''));$island=trim((string)($nested['ilha'] ?? $data['ilha'] ?? ''));
    if($street==='' || $city==='' || $island==='')throw new InvalidArgumentException('Endereço, cidade e ilha são obrigatórios.');
    $unit=$model['modelo_reserva']==='por_equipamento';
    return ['titulo'=>$title,'descricao_curta'=>$desc,'descricao_longa'=>(string)($data['descricao_longa'] ?? ''),'descricao_completa'=>(string)($data['descricao_completa'] ?? ''),'categoria'=>$data['categoria'] ?? 'aventura','localizacao'=>$city,'cidade'=>$city,'endereco'=>$street,'latitude'=>$nested['lat'] ?? $data['latitude'] ?? $data['lat'] ?? null,'longitude'=>$nested['lng'] ?? $data['longitude'] ?? $data['lng'] ?? null,'ilha'=>$island,'preco'=>$unit?0:(float)$data['preco'],'preco_crianca'=>$unit?null:($data['preco_crianca'] ?? null),'preco_bebe'=>$unit?null:($data['preco_bebe'] ?? null),'duracao'=>$data['duracao'] ?? '2 horas','max_pessoas'=>$unit?$model['quantidade_equipamentos']*$model['pessoas_por_equipamento']:(int)$data['max_pessoas'],'min_pessoas'=>(int)($data['min_pessoas'] ?? 1),'inclui_guia'=>(int)!empty($data['inclui_guia']),'inclui_transporte'=>(int)!empty($data['inclui_transporte']),'inclui_refeicao'=>(int)!empty($data['inclui_refeicao']),'ponto_encontro'=>$nested['ponto_encontro'] ?? $data['ponto_encontro'] ?? '','dias_disponiveis'=>implode(',',array_unique($data['dias_disponiveis'])),'horarios_json'=>json_encode($data['horarios'] ?? [],JSON_THROW_ON_ERROR)];
}
function registoFilhos(PDO $c,int $id,array $data): void {
    foreach(['inclusoes','requisitos','idiomas'] as $key){
        if(!array_key_exists($key,$data))continue;if(!is_array($data[$key]))throw new InvalidArgumentException('Lista inválida: '.$key);
        $table=['inclusoes'=>'experiencia_inclusoes','requisitos'=>'experiencia_requisitos','idiomas'=>'experiencia_idiomas'][$key];$s=$c->prepare("DELETE FROM $table WHERE experiencia_id=?");$s->execute([$id]);
        foreach($data[$key] as $index=>$item){
            $a=is_array($item)?$item:[];
            if($key==='inclusoes'){$s=$c->prepare('INSERT INTO experiencia_inclusoes(experiencia_id,item,icone,incluido,ordem) VALUES(?,?,?,?,?)');$s->execute([$id,$a['item'] ?? (is_string($item)?$item:''),$a['icone'] ?? null,(int)($a['incluido'] ?? 1),$index]);}
            elseif($key==='requisitos'){$s=$c->prepare('INSERT INTO experiencia_requisitos(experiencia_id,requisito,obrigatorio,ordem) VALUES(?,?,?,?)');$s->execute([$id,$a['requisito'] ?? (is_string($item)?$item:''),(int)($a['obrigatorio'] ?? 1),$index]);}
            else{$s=$c->prepare('INSERT INTO experiencia_idiomas(experiencia_id,idioma,nivel) VALUES(?,?,?)');$s->execute([$id,$a['idioma'] ?? (is_string($item)?$item:''),$a['nivel'] ?? 'Fluente']);}
        }
    }
    if(array_key_exists('imagens',$data)){
        if(!is_array($data['imagens']))throw new InvalidArgumentException('Lista de imagens inválida.');
        $s=$c->prepare('SELECT id,caminho_url FROM experiencia_imagens WHERE experiencia_id=?');$s->execute([$id]);$old=[];foreach($s->fetchAll() as $row)$old[$row['caminho_url']]=(int)$row['id'];$keep=[];
        foreach($data['imagens'] as $index=>$img){$url=is_array($img)?($img['url'] ?? $img['caminho_url'] ?? ''):$img;if(!is_string($url) || trim($url)==='')continue;
            if(isset($old[$url])){$s=$c->prepare('UPDATE experiencia_imagens SET principal=?,ordem=? WHERE id=? AND experiencia_id=?');$s->execute([$index===0?1:0,$index,$old[$url],$id]);$keep[]=$old[$url];}
            else{$s=$c->prepare('INSERT INTO experiencia_imagens(experiencia_id,caminho_url,principal,ordem) VALUES(?,?,?,?)');$s->execute([$id,$url,$index===0?1:0,$index]);$keep[]=(int)$c->lastInsertId();}
        }
        foreach($old as $imageId)if(!in_array($imageId,$keep,true)){$s=$c->prepare('DELETE FROM experiencia_imagens WHERE id=? AND experiencia_id=?');$s->execute([$imageId,$id]);}
    }
}
function executarRegistoExperiencia(bool $edit): void {
    try{
        $method=$_SERVER['REQUEST_METHOD'] ?? '';if(!in_array($method,$edit?['POST','PUT']:['POST'],true)){registoResponder(405,['success'=>false,'message'=>'Método não permitido.']);}
        $c=registoConexao();$uid=registoUsuario($c);$data=json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);if(!is_array($data))throw new InvalidArgumentException('JSON inválido.');
        $id=$edit?filter_var($_GET['id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]):null;if($edit && !$id)throw new InvalidArgumentException('ID inválido.');
        $c->beginTransaction();$previous=null;
        if($edit){$s=$c->prepare('SELECT * FROM experiencias WHERE id=? AND usuario_id=? FOR UPDATE');$s->execute([$id,$uid]);if(!($existing=$s->fetch(PDO::FETCH_ASSOC)))throw new InvalidArgumentException('Experiência não encontrada nesta conta.');$previous=modeloRegistoLer($c,$id) ?: ['modelo_reserva'=>$existing['modelo_reserva'] ?? 'por_pessoa'];}
        $model=modeloRegistoValidar($data,$previous);$fields=registoCampos($data,$model);$fields['slug']=registoSlug($c,$fields['titulo'],$id);
        if($edit){$assign=implode(',',array_map(static fn($k)=>"$k=?",array_keys($fields)));$s=$c->prepare("UPDATE experiencias SET $assign,updated_at=NOW() WHERE id=? AND usuario_id=?");$s->execute(array_merge(array_values($fields),[$id,$uid]));}
        else{$fields['usuario_id']=$uid;$fields['status']='pendente';$columns=implode(',',array_keys($fields));$marks=implode(',',array_fill(0,count($fields),'?'));$s=$c->prepare("INSERT INTO experiencias($columns,created_at) VALUES($marks,NOW())");$s->execute(array_values($fields));$id=(int)$c->lastInsertId();}
        modeloRegistoGuardar($c,$id,$model,$data,$previous);registoFilhos($c,$id,$data);$c->commit();
        registoResponder(200,['success'=>true,'message'=>$edit?'Experiência atualizada com sucesso!':'Experiência registada com sucesso!','data'=>['experiencia_id'=>$id,'slug'=>$fields['slug'],'modelo_reserva'=>$model['modelo_reserva']]]);
    }catch(InvalidArgumentException|JsonException $e){if(isset($c)&&$c->inTransaction())$c->rollBack();registoResponder(422,['success'=>false,'message'=>$e->getMessage()]);}
    catch(Throwable $e){if(isset($c)&&$c->inTransaction())$c->rollBack();error_log('[registo-experiencia] '.$e->getMessage());registoResponder(500,['success'=>false,'message'=>'Não foi possível guardar a experiência. Confirme as migrações 007, 008 e 009 e tente novamente.']);}
}
