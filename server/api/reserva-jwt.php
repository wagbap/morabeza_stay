<?php
declare(strict_types=1);

/** Verify the existing login's HS256 JWT; decoding alone never authenticates. */
function verificarJwtReservaQR(string $token, string $secret, ?int $now = null): ?array {
    if ($secret === '' || strlen($token) > 16384) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    $decode = static function (string $part) {
        if ($part === '' || !preg_match('/^[A-Za-z0-9_-]+$/D', $part)) return false;
        return base64_decode(strtr($part, '-_', '+/'), true);
    };
    $headerRaw = $decode($parts[0]);
    $payloadRaw = $decode($parts[1]);
    $signature = $decode($parts[2]);
    if ($headerRaw === false || $payloadRaw === false || $signature === false) return null;
    $header = json_decode($headerRaw, true);
    $payload = json_decode($payloadRaw, true);
    if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256' || isset($header['crit']) || !is_array($payload)) return null;
    if (!hash_equals(hash_hmac('sha256', $parts[0] . '.' . $parts[1], $secret, true), $signature)) return null;
    $now = $now ?? time();
    if (!is_int($payload['exp'] ?? null) || $payload['exp'] <= $now) return null;
    foreach (['nbf', 'iat'] as $claim) {
        if (isset($payload[$claim]) && (!is_int($payload[$claim]) || $payload[$claim] > $now)) return null;
    }
    $identity = $payload['data'] ?? null;
    if (!is_array($identity) || !filter_var($identity['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) ||
        !is_string($identity['email'] ?? null) || !filter_var($identity['email'], FILTER_VALIDATE_EMAIL)) return null;
    return $identity;
}
