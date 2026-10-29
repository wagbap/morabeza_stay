<?php
require_once __DIR__ . '/../server/api/reserva-jwt.php';
$key = 'test-only-signing-key';
$now = 1800000000;
$encode = static function ($value) { return rtrim(strtr(base64_encode($value), '+/', '-_'), '='); };
$sign = static function (array $payload, string $alg = 'HS256') use ($encode, $key): string {
    $body = $encode(json_encode(['alg' => $alg, 'typ' => 'JWT'])) . '.' . $encode(json_encode($payload));
    return $body . '.' . $encode(hash_hmac('sha256', $body, $key, true));
};
$payload = ['exp' => $now + 60, 'iat' => $now - 60, 'data' => ['id' => 12, 'email' => 'owner@example.com']];
$valid = $sign($payload);
$cases = [
    'valid owner' => verificarJwtReservaQR($valid, $key, $now) !== null,
    'wrong key' => verificarJwtReservaQR($valid, 'wrong', $now) === null,
    'expired' => verificarJwtReservaQR($valid, $key, $now + 61) === null,
    'none algorithm' => verificarJwtReservaQR($sign($payload, 'none'), $key, $now) === null,
    'future token' => verificarJwtReservaQR($valid, $key, $now - 120) === null,
    'missing expiry' => verificarJwtReservaQR($sign(['data' => $payload['data']]), $key, $now) === null,
    'invalid user ID' => verificarJwtReservaQR($sign(array_replace($payload, ['data' => ['id' => 0, 'email' => 'owner@example.com']])), $key, $now) === null,
    'unsigned token' => verificarJwtReservaQR('e30.e30.', $key, $now) === null,
];
foreach ($cases as $name => $passed) {
    if (!$passed) { fwrite(STDERR, "FAIL: $name\n"); exit(1); }
}
echo count($cases) . " JWT authentication checks passed.\n";
