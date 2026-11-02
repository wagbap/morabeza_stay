<?php
require_once __DIR__.'/registoComum.php';
try{
    if(($_SERVER['REQUEST_METHOD'] ?? '')!=='GET')registoResponder(405,['success'=>false]);
    $c=registoConexao();$editing=($_GET['edicao'] ?? '')==='1';$uid=$editing?registoUsuario($c):null;$id=filter_var($_GET['id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    if(!$id && empty($_GET['slug']))throw new InvalidArgumentException('Indique o ID ou slug.');
    $s=$c->prepare('SELECT * FROM experiencias WHERE '.($id?'id=?':'slug=?').($editing?' AND usuario_id=?':'').' LIMIT 1');$s->execute($editing?[$id ?: $_GET['slug'],$uid]:[$id ?: $_GET['slug']]);$data=$s->fetch();
    if(!$data)registoResponder(404,['success'=>false,'message'=>'Experiência não encontrada nesta conta.']);$id=(int)$data['id'];
    $model=modeloRegistoLer($c,$id);if($model){unset($model['experiencia_id'],$model['atualizado_em']);$data=array_merge($data,$model);}
    $data['dias_disponiveis']=is_array($data['dias_disponiveis'] ?? null)?$data['dias_disponiveis']:array_values(array_filter(explode(',',$data['dias_disponiveis'] ?? '')));
    $data['horarios']=json_decode($data['horarios_json'] ?? '[]',true) ?: [];
    foreach(['inclusoes'=>'experiencia_inclusoes','requisitos'=>'experiencia_requisitos','idiomas'=>'experiencia_idiomas','imagens'=>'experiencia_imagens'] as $key=>$table){$s=$c->prepare("SELECT * FROM $table WHERE experiencia_id=?".($key==='idiomas'?'':' ORDER BY ordem,id'));$s->execute([$id]);$data[$key]=$s->fetchAll();}
    $data['imagem_principal']=null;
    foreach($data['imagens'] as $image)if((int)$image['principal']===1){$data['imagem_principal']=$image['caminho_url'];break;}
    $data['endereco']=['morada'=>$data['endereco'] ?? '', 'cidade'=>$data['localizacao'] ?? $data['cidade'] ?? '', 'ilha'=>$data['ilha'] ?? '', 'lat'=>$data['latitude'] ?? null, 'lng'=>$data['longitude'] ?? null];
    unset($data['horarios_json']);
    if(!$editing)$data=array_intersect_key($data,array_flip(['id','slug','titulo','descricao_curta','descricao_longa','descricao_completa','categoria','localizacao','cidade','endereco','ilha','latitude','longitude','preco','preco_crianca','preco_bebe','duracao','max_pessoas','min_pessoas','inclui_guia','inclui_transporte','inclui_refeicao','ponto_encontro','dias_disponiveis','horarios','imagem_principal','imagens','inclusoes','requisitos','idiomas','modelo_reserva','equipamento_nome','quantidade_equipamentos','pessoas_por_equipamento']));
    registoResponder(200,['success'=>true,'message'=>'Experiência encontrada','data'=>$data]);
}catch(InvalidArgumentException $e){registoResponder(422,['success'=>false,'message'=>$e->getMessage()]);}
catch(Throwable $e){error_log('[buscar-experiencia] '.$e->getMessage());registoResponder(500,['success'=>false,'message'=>'Não foi possível carregar a experiência. Confirme a migração 009.']);}
