<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Origin: *');header('Access-Control-Allow-Methods: GET, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Cache-Control: no-store');
if(($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){http_response_code(204);exit;}
require_once __DIR__.'/agendaPublica.php';
try{
    require __DIR__.'/config.php';
    if(!isset($conn) && isset($pdo) && $pdo instanceof PDO)$conn=$pdo;
    if(!isset($conn) || !$conn instanceof PDO)$conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $id=filter_var($_GET['experiencia_id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $month=$_GET['mes'] ?? (new DateTimeImmutable('now',new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m');
    if(!$id || !is_string($month) || !preg_match('/^\d{4}-\d{2}$/D',$month))throw new InvalidArgumentException('Experiência ou mês inválido.');
    $first=agendaData($month.'-01');$end=(new DateTimeImmutable($first))->modify('last day of this month');$days=[];
    for($day=new DateTimeImmutable($first);$day<=$end;$day=$day->modify('+1 day')){
        $date=$day->format('Y-m-d');
        foreach(agendaSessoesPublicas($conn,$id,$date) as $slot)if((int)$slot['vagas_disponiveis']>0){$days[]=$date;break;}
    }
    echo json_encode(['success'=>true,'dias_disponiveis'=>$days],JSON_UNESCAPED_UNICODE);
}catch(InvalidArgumentException $e){http_response_code(422);echo json_encode(['success'=>false,'error'=>$e->getMessage()]);}
catch(Throwable $e){error_log('[dias-sessoes] '.$e->getMessage());http_response_code(500);echo json_encode(['success'=>false,'error'=>'Não foi possível carregar as datas disponíveis.']);}
