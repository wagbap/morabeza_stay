<?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function falhaComprovativo(): void { http_response_code(403); header('Content-Type: text/plain; charset=UTF-8'); echo 'Ligacao invalida ou expirada. Consulte a sua reserva.'; exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') { http_response_code(405); header('Allow: GET'); exit; }
try {
    $tipo = $_GET['tipo'] ?? '';
    $codigo = $_GET['codigo'] ?? '';
    $exp = filter_var($_GET['expira'] ?? '', FILTER_VALIDATE_INT);
    $sig = $_GET['assinatura'] ?? '';
    if (!is_string($tipo) || !in_array($tipo, ['alojamento', 'carro', 'experiencia'], true) || !is_string($codigo) || strlen($codigo) > 50 || !is_string($sig)) falhaComprovativo();
    $settings = require __DIR__ . '/auth-secrets.local.php';
    $key = $settings['jwt_secret'] ?? '';
    $signed = $codigo !== '' && $exp && $exp >= time() && is_string($key) && $key !== '' && hash_equals(hash_hmac('sha256', $tipo . '|' . $codigo . '|' . $exp, $key), $sig);
    require __DIR__ . '/config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if (!$signed) {
        require_once __DIR__ . '/reserva-validacao.php';
        $userId = utilizadorReservaQR($conn, 'host');
        $tables = [
            'alojamento' => ['reservas_alojamento', 'alojamentos', 'alojamento_id', 'proprietario_id'],
            'carro' => ['reservas_carro', 'carros', 'carro_id', 'usuario_id'],
            'experiencia' => ['reservas_experiencia', 'experiencias', 'experiencia_id', 'usuario_id'],
        ];
        [$table, $listing, $fk, $owner] = $tables[$tipo];
        $id = filter_var($_GET['reserva_id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
        if ($codigo === '' && !$id) falhaComprovativo();
        $where = $codigo !== '' ? 'r.codigo_reserva=:ref' : 'r.id=:ref';
        $stmt = $conn->prepare('SELECT r.codigo_reserva FROM ' . $table . ' r LEFT JOIN ' . $listing . ' l ON l.id=r.' . $fk . ' WHERE ' . $where . ' AND (r.usuario_id=:cliente OR l.' . $owner . '=:anfitriao) LIMIT 1');
        $stmt->execute([':ref'=>$codigo !== '' ? $codigo : $id, ':cliente'=>$userId, ':anfitriao'=>$userId]);
        $codigo = $stmt->fetchColumn();
        if (!is_string($codigo) || $codigo === '') falhaComprovativo();
    }
    require_once __DIR__ . '/send_email.php';
    $d = carregarDadosEmailReserva($conn, $tipo, $codigo);
    $d['mapa_jpeg'] = mapaComprovativoReserva($d, $settings);
    $pdf = gerarPdfComprovativoReserva($d);
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="reserva-' . preg_replace('/[^a-zA-Z0-9_-]/', '', $codigo) . '.pdf"');
    header('Content-Length: ' . strlen($pdf));
    echo $pdf;
} catch (Throwable $e) { error_log('[comprovativo-reserva] ' . $e->getMessage()); falhaComprovativo(); }
