<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
require_once __DIR__ . '/carroStripeStock.php';
$db = null;
try {
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET','POST'], true)) { http_response_code(405); exit; }
    $input = $_SERVER['REQUEST_METHOD'] === 'POST' ? json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR) : $_GET;
    $id = filter_var($input['carro_id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    $qtd = filter_var($input['quantidade'] ?? 1, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    if (!$id || !$qtd) throw new InvalidArgumentException('Veículo ou quantidade inválidos.');
    $inicio = !empty($input['checkin']) ? (string)$input['checkin'] : null;
    $fim = !empty($input['checkout']) ? (string)$input['checkout'] : null;
    carroPeriodoStock($inicio, $fim);
    $db = carroStockConexao();
    $db->beginTransaction();
    // Libertar reservas de stock expiradas sem voltar a vender um intent pago.
    $db->prepare('SELECT id FROM carros WHERE id=? FOR UPDATE')->execute([$id]);
    $s = $db->prepare("SELECT 1 FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa' AND expira_em<=UTC_TIMESTAMP() LIMIT 1");
    $s->execute([$id]);
    if ($s->fetchColumn()) carroLibertarRetencoesExpiradas($db, $id, carroStripeCliente());
    $haHoras=isset($input['hora_levantamento']) || isset($input['hora_devolucao']);
    $horarios=$haHoras?carroHorariosValidar(carroHorariosLer($db,$id),(string)($input['hora_levantamento']??''),(string)($input['hora_devolucao']??'')):null;
    $stock = carroStockLer($db, $id, $inicio, $fim,false,null,false,$horarios['hora_levantamento']??null,$horarios['hora_devolucao']??null);
    $db->commit();
    $restantes = $stock['quantidade_disponivel'];
    echo json_encode(['success'=>true, 'disponivel'=>$restantes >= $qtd,
        'vagas_restantes'=>$restantes, 'quantidade_disponivel'=>$restantes,
        'periodo_verificado'=>$inicio !== null], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    if ($db instanceof PDO && $db->inTransaction()) $db->rollBack();
    error_log('[disponibilidade-carro] ' . $e->getMessage());
    http_response_code($e instanceof InvalidArgumentException ? 400 : 503);
    echo json_encode(['success'=>false, 'error'=>'Não foi possível confirmar a disponibilidade.'], JSON_UNESCAPED_UNICODE);
}
