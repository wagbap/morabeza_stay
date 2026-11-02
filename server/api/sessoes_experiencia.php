<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');header('Cache-Control: no-store');
ini_set('display_errors','0');
if(($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/agendaExperienciasLogica.php';
try{
    require __DIR__.'/config.php';if(!isset($conn)&&isset($pdo)&&$pdo instanceof PDO)$conn=$pdo;
    if(!isset($conn)||!($conn instanceof PDO))$conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);require_once __DIR__.'/reserva-validacao.php';$uid=utilizadorReservaQR($conn,'host');
    $method=$_SERVER['REQUEST_METHOD'];if($method==='POST'&&($_GET['action'] ?? '')==='update')$method='PUT';
    $raw=file_get_contents('php://input');$input=$raw!=='' ? json_decode($raw,true,512,JSON_THROW_ON_ERROR) : [];
    if(!is_array($input))throw new InvalidArgumentException('JSON inválido.');$input=array_merge($_GET,$_POST,$input);
    $sid=(int)($input['id'] ?? 0);$expId=(int)($input['experiencia_id'] ?? 0);$old=null;
    if($method==='PUT'||$method==='DELETE'){
        $s=$conn->prepare('SELECT * FROM experiencia_sessoes WHERE id=?');$s->execute([$sid]);$old=$s->fetch(PDO::FETCH_ASSOC);
        if(!$old)throw new InvalidArgumentException('Sessão não encontrada.');$expId=(int)$old['experiencia_id'];
    }
    $conn->beginTransaction();$s=$conn->prepare('SELECT id FROM experiencias WHERE id=? AND usuario_id=? FOR UPDATE');$s->execute([$expId,$uid]);
    if(!$s->fetchColumn())throw new InvalidArgumentException('Experiência não encontrada nesta conta.');
    if($method==='GET'){
        $sql="SELECT s.*, COALESCE((SELECT SUM(rt.quantidade) FROM reservas_temporarias rt WHERE rt.sessao_id=s.id AND rt.status='pendente' AND rt.expira_em>?),0) AS pendentes_ativos FROM experiencia_sessoes s WHERE s.experiencia_id=?";$params=[date('Y-m-d H:i:s'),$expId];
        if(!empty($input['data'])){$sql.=' AND s.data=?';$params[]=agendaData($input['data']);}
        if(!empty($input['periodo'])){$sql.=' AND s.periodo=?';$params[]=$input['periodo'];}
        $s=$conn->prepare($sql.' ORDER BY s.data,s.hora_inicio');$s->execute($params);$rows=$s->fetchAll(PDO::FETCH_ASSOC);
        foreach($rows as &$row){$row['hora_inicio']=substr($row['hora_inicio'],0,5);$row['hora_fim']=substr($row['hora_fim'],0,5);$row['reservas_pendentes']=(int)$row['pendentes_ativos'];$row['vagas_disponiveis']=agendaLivre((int)$row['capacidade_maxima'],(int)$row['vagas_ocupadas'],$row['reservas_pendentes'],0);$row['preco_especial']=$row['preco_especial']===null?null:(float)$row['preco_especial'];}unset($row);
        $conn->commit();echo json_encode(['success'=>true,'experiencia_id'=>$expId,'total'=>count($rows),'sessoes'=>$rows],JSON_UNESCAPED_UNICODE);exit;
    }
    if($old){$s=$conn->prepare('SELECT * FROM experiencia_sessoes WHERE id=? FOR UPDATE');$s->execute([$sid]);$old=$s->fetch(PDO::FETCH_ASSOC);}
    $s=$conn->prepare("SELECT COALESCE(SUM(quantidade),0) FROM reservas_temporarias WHERE sessao_id=? AND status='pendente' AND expira_em>?");$s->execute([$sid,date('Y-m-d H:i:s')]);$pending=(int)$s->fetchColumn();
    if($method==='DELETE'){
        if((int)$old['vagas_ocupadas']>0||$pending>0)throw new InvalidArgumentException('Não é possível eliminar uma sessão com reservas ou pagamentos pendentes.');
        $s=$conn->prepare('DELETE FROM experiencia_sessoes WHERE id=?');$s->execute([$sid]);
    }elseif($method==='POST'||$method==='PUT'){
        if($method==='PUT'&&isset($input['ativo'])&&!isset($input['data'])&&!isset($input['hora_inicio'])){
            $s=$conn->prepare('UPDATE experiencia_sessoes SET ativo=? WHERE id=?');$s->execute([!empty($input['ativo'])?1:0,$sid]);
        }else{
            $date=agendaData($input['data'] ?? $old['data'] ?? '');$begin=substr((string)($input['hora_inicio'] ?? $old['hora_inicio'] ?? ''),0,5);$end=substr((string)($input['hora_fim'] ?? $old['hora_fim'] ?? ''),0,5);
            if(agendaMinutos($end)<=agendaMinutos($begin))throw new InvalidArgumentException('A hora de fim deve ser posterior à hora de início.');
            $capacity=filter_var($input['capacidade_maxima'] ?? $old['capacidade_maxima'] ?? 15,FILTER_VALIDATE_INT);
            if(!$capacity||$capacity<1||$capacity>10000||$capacity<(int)($old['vagas_ocupadas'] ?? 0)+$pending)throw new InvalidArgumentException('A capacidade deve cobrir reservas e retenções existentes.');
            if($old&&((int)$old['vagas_ocupadas']>0||$pending>0)&&($date!==$old['data']||$begin!==substr($old['hora_inicio'],0,5)||$end!==substr($old['hora_fim'],0,5)))throw new InvalidArgumentException('Não altere o horário de uma sessão com reservas. Crie outra saída.');
            $price=array_key_exists('preco_especial',$input)?$input['preco_especial']:($old['preco_especial'] ?? null);if($price==='')$price=null;
            if($price!==null&&(!is_numeric($price)||(float)$price<0||!is_finite((float)$price)))throw new InvalidArgumentException('Preço inválido.');
            $period=$input['periodo'] ?? $old['periodo'] ?? 'Manhã';if(!in_array($period,['Manhã','Meio dia','Tarde'],true))throw new InvalidArgumentException('Período inválido.');
            $s=$conn->prepare('SELECT id FROM experiencia_sessoes WHERE experiencia_id=? AND data=? AND hora_inicio=? AND id<>?');$s->execute([$expId,$date,$begin,$sid]);if($s->fetchColumn())throw new InvalidArgumentException('Já existe uma sessão nessa data e hora.');
            $active=!empty($input['ativo'] ?? $old['ativo'] ?? 1)?1:0;
            if($old){$s=$conn->prepare('UPDATE experiencia_sessoes SET data=?,hora_inicio=?,hora_fim=?,periodo=?,capacidade_maxima=?,preco_especial=?,ativo=? WHERE id=?');$s->execute([$date,$begin,$end,$period,$capacity,$price,$active,$sid]);}
            else{$s=$conn->prepare('INSERT INTO experiencia_sessoes(experiencia_id,data,hora_inicio,hora_fim,periodo,capacidade_maxima,preco_especial,ativo) VALUES(?,?,?,?,?,?,?,?)');$s->execute([$expId,$date,$begin,$end,$period,$capacity,$price,$active]);$sid=(int)$conn->lastInsertId();}
        }
    }else throw new InvalidArgumentException('Método inválido.');
    $conn->commit();echo json_encode(['success'=>true,'id'=>$sid,'message'=>'Sessão atualizada.'],JSON_UNESCAPED_UNICODE);
}catch(InvalidArgumentException|JsonException $e){if(isset($conn)&&$conn->inTransaction())$conn->rollBack();http_response_code(422);echo json_encode(['success'=>false,'error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
catch(Throwable $e){if(isset($conn)&&$conn instanceof PDO&&$conn->inTransaction())$conn->rollBack();error_log('[sessoes] '.$e->getMessage());http_response_code(500);echo json_encode(['success'=>false,'error'=>'Não foi possível guardar a sessão.'],JSON_UNESCAPED_UNICODE);}
