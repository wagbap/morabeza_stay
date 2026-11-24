<?php
declare(strict_types=1);
require_once __DIR__ . '/carroStock.php';

function carroStripeChave(): string {
    // Configurar uma única chave para criar e confirmar os pagamentos.
    $settings = is_file(__DIR__ . '/stripe-config.local.php') ? require __DIR__ . '/stripe-config.local.php' : [];
    $key = getenv('STRIPE_SECRET_KEY') ?: ($settings['secret_key'] ?? (defined('CHECKOUT_STRIPE_SECRET_KEY') ? CHECKOUT_STRIPE_SECRET_KEY : ''));
    if (!is_string($key) || trim($key) === '') throw new RuntimeException('Chave Stripe não configurada no servidor.');
    return trim($key);
}

function carroStripeCliente() {
    require_once __DIR__ . '/../vendor/autoload.php';
    return new \Stripe\StripeClient(carroStripeChave());
}

function carroLibertarRetencoesExpiradas(PDO $db, int $id, $stripe): void {
    $s = $db->prepare("SELECT token,stripe_id FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa' AND expira_em<=UTC_TIMESTAMP() FOR UPDATE");
    $s->execute([$id]);
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) {
        if (!$r['stripe_id']) continue;
        $intent = $stripe->paymentIntents->retrieve($r['stripe_id']);
        if (in_array($intent->status, ['succeeded', 'processing', 'requires_capture'], true)) continue;
        if ($intent->status !== 'canceled') $intent = $stripe->paymentIntents->cancel($r['stripe_id']);
        if ($intent->status === 'canceled') {
            $db->prepare("UPDATE carro_stock_retencoes SET estado='libertada' WHERE token=?")->execute([$r['token']]);
        }
    }
}
