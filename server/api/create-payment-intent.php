<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
require_once __DIR__ . '/carroStripeStock.php';
require_once __DIR__ . '/carroPagamento.php';
$db = null;
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); exit; }
    $data = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>50]]);
    $currency = strtolower((string)($data['currency'] ?? ''));
    if (!$amount || $currency !== 'eur') throw new InvalidArgumentException('Valor ou moeda inválidos.');
    $stripe = carroStripeCliente();
    $options = ['amount'=>$amount, 'currency'=>$currency, 'automatic_payment_methods'=>['enabled'=>true], 'description'=>'Reserva Morabeza Stay'];
    $carro = $data['tipo'] ?? null;
    if ($carro === 'carro') {
        $mode=$data['stripe_mode']??null;
        $key=carroStripeChave();
        if(in_array($mode,['test','live'],true) && strpos($key,'sk_'.$mode.'_')!==0 && strpos($key,'rk_'.$mode.'_')!==0) {
            throw new StripeConfiguracaoException('STRIPE_MODE_MISMATCH','Os ambientes Stripe do site e do servidor n?o coincidem.');
        }
        $db=carroStockConexao();
        $response=carroPagamentoPreparar($db,$stripe,$data);
        http_response_code($response['http_status']??200);
        unset($response['http_status']);
        echo json_encode($response,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        exit;
    } else {
        // Preservar o contrato existente dos pagamentos das outras verticais.
        $intent = $stripe->paymentIntents->create($options);
    }
    echo json_encode(['clientSecret'=>$intent->client_secret, 'alreadyPaid'=>$intent->status === 'succeeded'], JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    if ($db instanceof PDO && $db->inTransaction()) $db->rollBack();
    error_log('[create-payment-intent] ' . $e->getMessage());
    http_response_code($e instanceof DomainException ? 409 : ($e instanceof InvalidArgumentException ? 400 : 500));
    echo json_encode(['error'=>$e instanceof DomainException ? $e->getMessage() : 'Não foi possível iniciar o pagamento.',
        'code'=>($e instanceof StripeConfiguracaoException || $e instanceof CarroPagamentoException) ? $e->codigo : ($e instanceof \Stripe\Exception\AuthenticationException ? 'STRIPE_AUTH_FAILED' : ($e instanceof \Stripe\Exception\ApiErrorException ? 'STRIPE_API_ERROR' : ($e->getCode() === 2 ? 'CAUCAO_ALTERADA' : ($e->getCode() === 3 ? 'ALUGUER_ALTERADO' : 'PAYMENT_SERVER_ERROR')))),
        'caucao'=>$e->getCode() === 2 ? ($caucaoAtual ?? null) : null], JSON_UNESCAPED_UNICODE);
}
