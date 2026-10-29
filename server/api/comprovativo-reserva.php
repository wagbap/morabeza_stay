 <?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');
function falhaComprovativo(): void { http_response_code(403); header('Content-Type: text/plain; charset=UTF-8'); echo 'Ligacao invalida ou expirada. Consulte a sua reserva.'; exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') { http_response_code(405); header('Allow: GET'); exit; }
try {
    $tipo = $_GET['tipo'] ?? '';
    $codigo = $_GET['codigo'] ?? '';
    $exp = filter_var($_GET['expira'] ?? '', FILTER_VALIDATE_INT);
    $sig = $_GET['assinatura'] ?? '';
    if (!is_string($tipo) || !in_array($tipo, ['alojamento', 'carro', 'experiencia'], true) || !is_string($codigo) || strlen($codigo) > 50 || !is_string($sig) || !$exp || $exp < time()) falhaComprovativo();
    $settings = require __DIR__ . '/auth-secrets.local.php';
    $key = $settings['jwt_secret'] ?? '';
    if (!is_string($key) || $key === '' || !hash_equals(hash_hmac('sha256', $tipo . '|' . $codigo . '|' . $exp, $key), $sig)) falhaComprovativo();
    require __DIR__ . '/config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    require_once __DIR__ . '/send_email.php';
    $d = carregarDadosEmailReserva($conn, $tipo, $codigo);
    $d['mapa_jpeg'] = mapaComprovativoReserva($d, $settings);
    $pdf = gerarPdfComprovativoReserva($d);
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="reserva-' . preg_replace('/[^a-zA-Z0-9_-]/', '', $codigo) . '.pdf"');
    header('Content-Length: ' . strlen($pdf));
    echo $pdf;
} catch (Throwable $e) { error_log('[comprovativo-reserva] ' . $e->getMessage()); falhaComprovativo(); }
