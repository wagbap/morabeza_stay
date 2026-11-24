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
require_once __DIR__ . '/carroCaucao.php';
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
        $r = $data['reserva'] ?? [];
        $id = filter_var($r['carro_id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
        $qtd = filter_var($r['quantidade'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
        $inicio = (string)($r['checkIn'] ?? ''); $fim = (string)($r['checkOut'] ?? '');
        $token = $data['pedido_stock'] ?? '';
        if (!$id || !$qtd || !is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) throw new InvalidArgumentException('Pedido de reserva inválido.');
        carroPeriodoStock($inicio, $fim);
        $db = carroStockConexao(); $db->beginTransaction();
        $db->prepare('SELECT id FROM carros WHERE id=? FOR UPDATE')->execute([$id]);
        carroLibertarRetencoesExpiradas($db, $id, $stripe);
        $s = $db->prepare('SELECT * FROM carro_stock_retencoes WHERE token=? FOR UPDATE');
        $s->execute([$token]); $existente = $s->fetch(PDO::FETCH_ASSOC);
        $condicoes = $existente && !empty($existente['caucao_json'])
            ? json_decode($existente['caucao_json'], true, 512, JSON_THROW_ON_ERROR)
            : carroCondicoesPagamento($db, $id, $qtd, $inicio, $fim);
        $caucaoAtual = $condicoes['caucao'];
        // Não iniciar a cobrança se o cliente ainda viu outra caução.
        if (!array_key_exists('exige_caucao', $r) || !array_key_exists('caucao_valor', $r)
            || (int)$r['exige_caucao'] !== $caucaoAtual['exige_caucao']
            || abs((float)$r['caucao_valor'] - $caucaoAtual['caucao_valor']) > 0.001) {
            throw new DomainException('A caução foi atualizada. Confirme as condições antes de continuar.', 2);
        }
        // A caução não entra nem no PaymentIntent nem na base da comissão.
        if ($amount !== (int)round($condicoes['total_aluguer'] / 110.265 * 100)) {
            throw new DomainException('O preço de aluguer foi atualizado. Reveja a reserva.', 3);
        }
        if ($existente) {
            if ((int)$existente['carro_id'] !== $id || (int)$existente['quantidade'] !== $qtd || $existente['data_levantamento'] !== $inicio || $existente['data_devolucao'] !== $fim || $existente['estado'] !== 'ativa') {
                throw new DomainException('O pedido de stock expirou. Tente novamente.');
            }
            $intent = $stripe->paymentIntents->retrieve($existente['stripe_id']);
            if ((int)$intent->amount !== $amount || $intent->currency !== $currency) throw new DomainException('O valor do pedido mudou. Atualize a reserva.');
        } else {
            $stock = carroStockLer($db, $id, $inicio, $fim, true);
            if ($stock['quantidade_disponivel'] < $qtd) throw new DomainException('Não há carros suficientes disponíveis para este período.');
            $db->prepare("INSERT INTO carro_stock_retencoes(token,carro_id,data_levantamento,data_devolucao,quantidade,expira_em) VALUES(?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 15 MINUTE))")
                ->execute([$token,$id,$inicio,$fim,$qtd]);
            $options['metadata'] = ['tipo'=>'carro', 'carro_id'=>(string)$id, 'token_stock'=>$token];
            $intent = $stripe->paymentIntents->create($options, ['idempotency_key'=>'carro_stock_' . $token]);
            $db->prepare('UPDATE carro_stock_retencoes SET stripe_id=?,caucao_json=? WHERE token=?')
                ->execute([$intent->id,json_encode($condicoes, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),$token]);
        }
        if ($existente && empty($existente['caucao_json'])) {
            $db->prepare('UPDATE carro_stock_retencoes SET caucao_json=? WHERE token=?')
                ->execute([json_encode($condicoes, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),$token]);
        }
        $db->commit();
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
        'code'=>$e->getCode() === 2 ? 'CAUCAO_ALTERADA' : ($e->getCode() === 3 ? 'ALUGUER_ALTERADO' : null),
        'caucao'=>$e->getCode() === 2 ? ($caucaoAtual ?? null) : null], JSON_UNESCAPED_UNICODE);
}
