<?php
// Carrega apenas as funcoes puras, sem ligar ao banco ou executar o endpoint.
$source = file_get_contents(__DIR__ . '/../server/api/checkout_api.php');
$start = strpos($source, 'function validarCobrancaCheckout');
$end = strpos($source, 'function pagamentoCheckoutStripe', $start);
eval(substr($source, $start, $end - $start));
$paid = ['status'=>'succeeded', 'client_secret'=>'fixture-secret', 'currency'=>'eur',
    'amount'=>1000, 'amount_received'=>1000,
    'latest_charge'=>['paid'=>true, 'refunded'=>false, 'amount_refunded'=>0]];
validarCobrancaCheckout($paid, 'fixture-secret', 1000);
$cases = [
    [array_replace($paid, ['status'=>'processing']), 'fixture-secret', 1000],
    [array_replace($paid, ['status'=>'requires_action']), 'fixture-secret', 1000],
    [$paid, 'wrong-secret', 1000],
    [$paid, 'fixture-secret', 999],
    [array_replace($paid, ['currency'=>'usd']), 'fixture-secret', 1000],
    [array_replace($paid, ['amount_received'=>0]), 'fixture-secret', 1000],
    [array_replace($paid, ['latest_charge'=>['paid'=>true,'refunded'=>true]]), 'fixture-secret', 1000],
    [array_replace($paid, ['latest_charge'=>['paid'=>true,'amount_refunded'=>1]]), 'fixture-secret', 1000],
];
foreach ($cases as $i => $case) {
    $rejected = false;
    try { validarCobrancaCheckout(...$case); } catch (Exception $e) { $rejected = true; }
    if (!$rejected) throw new RuntimeException('Invalid payment accepted: ' . $i);
}
echo "Stripe succeeded accepted; processing, action, proof, amount, currency and refunds rejected.\n";
