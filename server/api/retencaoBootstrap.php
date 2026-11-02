<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store');
ini_set('display_errors','0');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'error'=>'Método inválido.']); exit; }
require_once __DIR__.'/retencaoExperiencia.php';
function executarRetencao(callable $action): void {
    try {
        require __DIR__.'/config.php';
        if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn=$pdo;
        if (!isset($conn) || !($conn instanceof PDO)) $conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
        $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
        $input=json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);
        if (!is_array($input)) throw new InvalidArgumentException('JSON inválido.');
        echo json_encode($action($conn,$input),JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    } catch (InvalidArgumentException | JsonException $e) {
        http_response_code(400); echo json_encode(['success'=>false,'error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        error_log('[retencao] '.$e->getMessage());
        http_response_code(500); echo json_encode(['success'=>false,'error'=>'Não foi possível processar a retenção.'],JSON_UNESCAPED_UNICODE);
    }
}
