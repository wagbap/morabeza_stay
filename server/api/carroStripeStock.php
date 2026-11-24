<?php
declare(strict_types=1);
require_once __DIR__ . '/carroStock.php';

class StripeConfiguracaoException extends RuntimeException {
    public string $codigo;
    public function __construct(string $codigo, string $mensagem) {
        parent::__construct($mensagem);
        $this->codigo = $codigo;
    }
}

function carroStripeChave(): string {
    // Configurar uma única chave para criar e confirmar os pagamentos.
    $settings = is_file(__DIR__ . '/stripe-config.local.php') ? require __DIR__ . '/stripe-config.local.php' : [];
    $key = getenv('STRIPE_SECRET_KEY') ?: ((!empty($settings['secret_key']) ? $settings['secret_key'] : (defined('CHECKOUT_STRIPE_SECRET_KEY') ? CHECKOUT_STRIPE_SECRET_KEY : '')));
    if (!is_string($key) || trim($key) === '') throw new StripeConfiguracaoException('STRIPE_CONFIG_MISSING', 'Chave Stripe não configurada no servidor.');
    return trim($key);
}

function carroStripeCliente() {
    $key = carroStripeChave();
    if (!class_exists('Stripe\\StripeClient')) {
        foreach ([__DIR__ . '/../vendor/autoload.php', __DIR__ . '/vendor/autoload.php'] as $autoload) {
            if (is_file($autoload)) require_once $autoload;
            if (class_exists('Stripe\\StripeClient')) break;
        }
    }
    if (!class_exists('Stripe\\StripeClient')) {
        throw new StripeConfiguracaoException('STRIPE_SDK_MISSING', 'Biblioteca Stripe indisponivel no servidor.');
    }
    return new \Stripe\StripeClient($key);
}

function carroPagamentoEmCurso(string $status): bool {
    return in_array($status, ['succeeded', 'processing', 'requires_capture', 'requires_action'], true);
}

/** Release only after Stripe confirms cancellation. Network uncertainty keeps stock. */
function carroCancelarRetencao(PDO $db, $stripe, string $token, $intent): bool {
    if (carroPagamentoEmCurso($intent->status)) return false;
    if ($intent->status !== 'canceled') {
        try { $intent=$stripe->paymentIntents->cancel($intent->id); }
        catch (\Stripe\Exception\InvalidRequestException $e) {
            $intent=$stripe->paymentIntents->retrieve($intent->id);
            if ($intent->status !== 'canceled') return false;
        }
    }
    if ($intent->status !== 'canceled') return false;
    $db->prepare("UPDATE carro_stock_retencoes SET estado='libertada' WHERE token=? AND estado='ativa'")->execute([$token]);
    return true;
}

function carroLibertarRetencoesExpiradas(PDO $db, int $id, $stripe): void {
    $s = $db->prepare("SELECT token,stripe_id FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa' AND expira_em<=UTC_TIMESTAMP() FOR UPDATE");
    $s->execute([$id]);
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) {
        if (!$r['stripe_id']) continue;
        $intent = $stripe->paymentIntents->retrieve($r['stripe_id']);
        // Older mocks and providers may omit id on retrieved objects.
        if (empty($intent->id)) $intent->id=$r['stripe_id'];
        carroCancelarRetencao($db,$stripe,$r['token'],$intent);
    }
}
