<?php
declare(strict_types=1);

/** Shared HTTP handling and booking validation for admin and host endpoints. */
function responderReservaQR(int $status, array $body): void {
    $messages = [
        'VALIDATED' => 'Reserva validada com sucesso.',
        'BOOKING_NOT_FOUND' => 'Reserva nao encontrada.',
        'ALREADY_VALIDATED' => 'Este QR Code ja foi validado.',
        'BOOKING_BLOCKED' => 'Este registo e um bloqueio, nao uma reserva de cliente.',
        'BOOKING_NOT_CONFIRMED' => 'A reserva ainda nao esta confirmada ou ja nao esta ativa.',
        'PAYMENT_REQUIRED' => 'O pagamento desta reserva ainda nao esta confirmado.',
        'OUTSIDE_BOOKING_DATES' => 'A data atual esta fora do periodo da reserva.',
        'AMBIGUOUS_CODE' => 'Codigo duplicado entre categorias. Contacte o suporte.',
        'AUTH_REQUIRED' => 'Inicie sessao novamente.',
        'HOST_AUTH_UNAVAILABLE' => 'O login do anfitriao ainda nao emite o token aceite pela validacao. Integre validation_token na resposta de login.',
    ];
    if (!isset($body['mensagem'])) $body['mensagem'] = $messages[$body['code'] ?? ''] ?? 'Validacao indisponivel.';
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function pedidoReservaQR(): array {
    ini_set('display_errors', '0');
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Cache-Control: no-store');
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($method === 'OPTIONS') { http_response_code(204); exit; }
    if ($method !== 'POST') {
        header('Allow: POST, OPTIONS');
        responderReservaQR(405, ['success' => false, 'code' => 'METHOD_NOT_ALLOWED']);
    }
    try { $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { responderReservaQR(400, ['success' => false, 'code' => 'INVALID_INPUT']); }
    $codigo = is_array($input) && is_string($input['codigo'] ?? null) ? trim($input['codigo']) : '';
    if ($codigo === '' || strlen($codigo) > 50 || preg_match('/[\x00-\x1F\x7F]/', $codigo)) {
        responderReservaQR(422, ['success' => false, 'code' => 'INVALID_INPUT']);
    }
    $contexto = $input['contexto'] ?? 'admin';
    if (!in_array($contexto, ['admin', 'host'], true)) responderReservaQR(422, ['success' => false, 'code' => 'INVALID_INPUT']);
    return ['codigo' => $codigo, 'contexto' => $contexto];
}

/**
 * Returns an authenticated database user ID, NEVER an ID from the request.
 * Both scopes reuse the existing authenticated bearer token store.
 */
function emitirTokenValidacaoReservaQR(PDO $conn, int $userId): string {
    if ($userId < 1) throw new InvalidArgumentException('Invalid authenticated user');
    $token = bin2hex(random_bytes(32));
    $stmt = $conn->prepare('INSERT INTO admin_access_tokens (user_id, token_hash, expires_at) VALUES (:id, :hash, UTC_TIMESTAMP() + INTERVAL 8 HOUR)');
    $stmt->execute(['id' => $userId, 'hash' => hash('sha256', $token)]);
    return $token;
}

function utilizadorReservaQR(PDO $conn, string $contexto): int {
    if ($contexto === 'admin') {
        $auth = __DIR__ . '/auth_admin.php';
        if (!is_file($auth)) responderReservaQR(503, ['success' => false, 'code' => 'CONFIG_MISSING']);
        require_once $auth;
        if (!function_exists('validarAdminAutenticado') || !function_exists('obterTokenAdmin') || !validarAdminAutenticado($conn)) {
            responderReservaQR(403, ['success' => false, 'code' => 'AUTH_REQUIRED']);
        }
        $stmt = $conn->prepare('SELECT user_id FROM admin_access_tokens WHERE token_hash = :hash AND expires_at > UTC_TIMESTAMP() LIMIT 1');
        $stmt->execute(['hash' => hash('sha256', (string) obterTokenAdmin())]);
        $id = $stmt->fetchColumn();
    } elseif ($contexto === 'host') {
        // Hosts accept the existing signed login JWT or the shared opaque token.
        // Admin role authentication above remains unchanged.
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) { $header = $value; break; }
            }
        }
        if (!is_string($header) || !preg_match('/^Bearer\s+(\S+)$/i', trim($header), $bearer)) {
            responderReservaQR(403, ['success' => false, 'code' => 'AUTH_REQUIRED']);
        }
        $token = $bearer[1];
        if (substr_count($token, '.') === 2) {
            $settingsFile = __DIR__ . '/auth-secrets.local.php';
            if (!is_file($settingsFile)) responderReservaQR(503, ['success' => false, 'code' => 'HOST_AUTH_UNAVAILABLE']);
            $settings = require $settingsFile;
            require_once __DIR__ . '/reserva-jwt.php';
            $identity = verificarJwtReservaQR($token, (string) ($settings['jwt_secret'] ?? ''));
            if ($identity === null) responderReservaQR(403, ['success' => false, 'code' => 'AUTH_REQUIRED']);
            $stmt = $conn->prepare('SELECT id FROM usuarios WHERE id = :id AND email = :email LIMIT 1');
            $stmt->execute(['id' => $identity['id'], 'email' => $identity['email']]);
        } elseif (preg_match('/^[a-f0-9]{64}$/iD', $token)) {
            $stmt = $conn->prepare('SELECT t.user_id FROM admin_access_tokens t INNER JOIN usuarios u ON u.id = t.user_id WHERE t.token_hash = :hash AND t.expires_at > UTC_TIMESTAMP() LIMIT 1');
            $stmt->execute(['hash' => hash('sha256', $token)]);
        } else {
            responderReservaQR(403, ['success' => false, 'code' => 'AUTH_REQUIRED']);
        }
        $id = $stmt->fetchColumn();
    } else {
        throw new InvalidArgumentException('Unknown validation context');
    }
    $valid = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($valid === false) responderReservaQR(403, ['success' => false, 'code' => 'AUTH_REQUIRED']);
    return (int) $valid;
}

function validarReservaPartilhada(PDO $conn, string $codigo, int $utilizadorId, string $contexto): void {
    if (!in_array($contexto, ['host', 'admin'], true)) throw new InvalidArgumentException('Unknown validation context');
    // Column names match the registration services. All identifiers are fixed.
    $categorias = [
        'alojamento' => ['table' => 'reservas_alojamento', 'listing' => 'alojamentos', 'fk' => 'alojamento_id', 'owner' => 'proprietario_id', 'start' => 'data_checkin', 'end' => 'data_checkout'],
        'carro' => ['table' => 'reservas_carro', 'listing' => 'carros', 'fk' => 'carro_id', 'owner' => 'usuario_id', 'start' => 'data_levantamento', 'end' => 'data_devolucao'],
        'experiencia' => ['table' => 'reservas_experiencia', 'listing' => 'experiencias', 'fk' => 'experiencia_id', 'owner' => 'usuario_id', 'start' => 'data_participacao', 'end' => 'data_participacao'],
    ];
    $matches = [];
    foreach ($categorias as $categoria => $c) {
        $sql = 'SELECT r.id FROM `' . $c['table'] . '` r';
        if ($contexto === 'host') $sql .= ' INNER JOIN `' . $c['listing'] . '` l ON l.id = r.`' . $c['fk'] . '`';
        $sql .= ' WHERE r.codigo_reserva = :codigo';
        $params = ['codigo' => $codigo];
        if ($contexto === 'host') {
            $sql .= ' AND l.`' . $c['owner'] . '` = :owner';
            $params['owner'] = $utilizadorId;
        }
        $stmt = $conn->prepare($sql . ' LIMIT 1');
        $stmt->execute($params);
        $id = $stmt->fetchColumn();
        if ($id !== false) $matches[] = ['categoria' => $categoria, 'id' => (int) $id, 'campos' => $c];
    }
    // Another host's code has the same response as a nonexistent code.
    if (count($matches) !== 1) {
        responderReservaQR(count($matches) ? 409 : 404, ['success' => false, 'code' => count($matches) ? 'AMBIGUOUS_CODE' : 'BOOKING_NOT_FOUND']);
    }
    $match = $matches[0];
    $c = $match['campos'];
    $conn->beginTransaction();
    // Recheck AND lock ownership with the booking to close the lookup/write race.
    $sql = 'SELECT r.* FROM `' . $c['table'] . '` r';
    if ($contexto === 'host') $sql .= ' INNER JOIN `' . $c['listing'] . '` l ON l.id = r.`' . $c['fk'] . '`';
    $sql .= ' WHERE r.id = :id AND r.codigo_reserva = :codigo';
    $params = ['id' => $match['id'], 'codigo' => $codigo];
    if ($contexto === 'host') {
        $sql .= ' AND l.`' . $c['owner'] . '` = :owner';
        $params['owner'] = $utilizadorId;
    }
    $stmt = $conn->prepare($sql . ' FOR UPDATE');
    $stmt->execute($params);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$reserva) {
        $conn->rollBack();
        responderReservaQR(404, ['success' => false, 'code' => 'BOOKING_NOT_FOUND']);
    }
    $stmt = $conn->prepare('SELECT validado_em FROM reserva_validacoes WHERE categoria = :categoria AND reserva_id = :id');
    $stmt->execute(['categoria' => $match['categoria'], 'id' => $match['id']]);
    $anterior = $stmt->fetchColumn();
    $falha = null;
    if ($anterior !== false) $falha = 'ALREADY_VALIDATED';
    elseif ((int) ($reserva['is_bloqueio'] ?? 0) === 1) $falha = 'BOOKING_BLOCKED';
    elseif (!in_array(strtolower(trim((string) $reserva['status'])), ['confirmada', 'confirmado', 'approved'], true)) $falha = 'BOOKING_NOT_CONFIRMED';
    elseif (strtolower(trim((string) $reserva['pagamento_status'])) !== 'pago') $falha = 'PAYMENT_REQUIRED';
    $hoje = (new DateTimeImmutable('now', new DateTimeZone('Atlantic/Cape_Verde')))->format('Y-m-d');
    $inicio = (string) $reserva[$c['start']];
    $fim = (string) $reserva[$c['end']];
    if (!$falha && ($hoje < $inicio || $hoje > $fim)) $falha = 'OUTSIDE_BOOKING_DATES';
    $publico = ['codigo' => $reserva['codigo_reserva'], 'tipo' => $match['categoria'], 'data' => $inicio,
        'data_fim' => $fim, 'status' => $reserva['status'], 'pagamento_status' => $reserva['pagamento_status']];
    if ($falha) {
        $conn->rollBack();
        responderReservaQR(409, ['success' => false, 'found' => true, 'code' => $falha, 'reserva' => $publico]);
    }
    $stmt = $conn->prepare('INSERT INTO reserva_validacoes (categoria, reserva_id, codigo_reserva, validado_por, validado_em) VALUES (:categoria, :id, :codigo, :actor, UTC_TIMESTAMP())');
    $stmt->execute(['categoria' => $match['categoria'], 'id' => $match['id'], 'codigo' => $reserva['codigo_reserva'], 'actor' => $utilizadorId]);
    $conn->commit();
    responderReservaQR(200, ['success' => true, 'code' => 'VALIDATED', 'reserva' => $publico]);
}

function executarReservaQR(): void {
    $pedido = pedidoReservaQR();
    $codigo = $pedido['codigo'];
    $contexto = $pedido['contexto'];
    try {
        $config = __DIR__ . '/config.php';
        if (!is_file($config)) responderReservaQR(503, ['success' => false, 'code' => 'CONFIG_MISSING']);
        require $config;
        if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
        if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $id = utilizadorReservaQR($conn, $contexto);
        validarReservaPartilhada($conn, $codigo, $id, $contexto);
    } catch (Throwable $e) {
        if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
        error_log('[validar-reserva][' . $contexto . '] ' . $e->getMessage());
        $state = $e instanceof PDOException ? (string) $e->getCode() : '';
        responderReservaQR(500, ['success' => false, 'code' => in_array($state, ['42S02', '42S22'], true) ? 'SCHEMA_MISSING' : 'SERVER_ERROR']);
    }
}

// Run HTTP handling only when requested directly. Includes from login/admin
// expose shared functions without consuming their request or running twice.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    executarReservaQR();
}
