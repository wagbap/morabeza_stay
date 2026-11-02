<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');header('Content-Type: application/json; charset=UTF-8');header('Access-Control-Allow-Methods: GET, POST, OPTIONS');header('Cache-Control: no-store');header('Access-Control-Allow-Headers: Content-Type, Authorization');
if(($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){http_response_code(204);exit;}
ini_set('display_errors','0');
try{
    require __DIR__.'/config.php';
    if(!isset($conn) && isset($pdo) && $pdo instanceof PDO)$conn=$pdo;
    if(!isset($conn) || !($conn instanceof PDO))$conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    require_once __DIR__.'/agendaPublica.php';
    $input=array_merge($_GET,json_decode(file_get_contents('php://input'),true) ?: []);
    $id=filter_var($input['experiencia_id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    if(!$id)throw new InvalidArgumentException('Experiência inválida.');
    $date=agendaData($input['data'] ?? date('Y-m-d'));
    echo json_encode(['success'=>true,'sessoes'=>agendaSessoesPublicas($conn,$id,$date,$input['periodo'] ?? null,$input['token'] ?? null)],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}catch(InvalidArgumentException $e){http_response_code(422);echo json_encode(['success'=>false,'error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
catch(Throwable $e){error_log('[agenda-publica] '.$e->getMessage());http_response_code(500);echo json_encode(['success'=>false,'error'=>'Disponibilidade indisponível. Confirme a API e a migração da agenda.'],JSON_UNESCAPED_UNICODE);}
