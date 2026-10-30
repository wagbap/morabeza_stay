<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') { http_response_code(405); exit; }
try {
    $tipo = $_GET['tipo'] ?? '';
    $id = filter_var($_GET['reserva_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $categorias = [
        'alojamento' => ['reservas_alojamento', 'alojamentos', 'alojamento_id', 'proprietario_id'],
        'carro' => ['reservas_carro', 'carros', 'carro_id', 'usuario_id'],
        'experiencia' => ['reservas_experiencia', 'experiencias', 'experiencia_id', 'usuario_id'],
    ];
    if (!$id || !is_string($tipo) || !isset($categorias[$tipo])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Reserva invalida.']);
        exit;
    }
    require __DIR__ . '/../config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if ((!isset($conn) || !($conn instanceof PDO)) && isset($host, $db_name, $username, $password)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    }
    if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    require_once __DIR__ . '/../reserva-validacao.php';
    $userId = utilizadorReservaQR($conn, 'host');
    [$table, $listing, $fk, $owner] = $categorias[$tipo];
    // O cliente pertence a reserva; o anfitriao pertence ao anuncio reservado.
    // Nunca confiar no usuario_id enviado pela URL para autorizar o acesso.
    $sql = 'SELECT r.* FROM `' . $table . '` r INNER JOIN `' . $listing . '` l ON l.id = r.`' . $fk . '` '
        . 'WHERE r.id = :id AND (r.usuario_id = :cliente OR l.`' . $owner . '` = :anfitriao)';
    if ($tipo === 'alojamento') $sql .= ' AND COALESCE(r.is_bloqueio, 0) = 0';
    $stmt = $conn->prepare($sql . ' LIMIT 1');
    $stmt->execute(['id' => $id, 'cliente' => $userId, 'anfitriao' => $userId]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r || ($r['status'] ?? '') === 'bloqueado') {
        http_response_code(404);
        echo json_encode(['success' => false, 'code' => 'BOOKING_NOT_FOUND', 'message' => 'Reserva não encontrada.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    // Biblioteca partilhada: incluir nao executa o envio de emails.
    require_once __DIR__ . '/../send_email.php';
    $d = carregarDadosEmailReserva($conn, $tipo, $r['codigo_reserva']);
    $date = static function ($value, string $format = 'd/m/Y'): string {
        return $value ? (new DateTimeImmutable((string) $value))->format($format) : '';
    };
    $status = ['confirmada' => 'Confirmada', 'confirmado' => 'Confirmada', 'approved' => 'Confirmada', 'pendente' => 'Pendente', 'pending' => 'Pendente', 'cancelada' => 'Cancelada', 'cancelado' => 'Cancelada', 'concluida' => 'Concluída', 'concluída' => 'Concluída'];
    $paid = in_array(strtolower((string) $r['pagamento_status']), ['pago', 'paid', 'confirmado', 'aprovado', 'completed', 'succeeded'], true);
    $qr = QRCode::getMinimumQRCode($r['codigo_reserva'], QR_ERROR_CORRECT_LEVEL_M);
    $count = $qr->getModuleCount();
    $size = $count + 8;
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $size . ' ' . $size . '"><path fill="white" d="M0 0h' . $size . 'v' . $size . 'H0z"/><g fill="black">';
    for ($y = 0; $y < $count; $y++) for ($x = 0; $x < $count; $x++) {
        if ($qr->isDark($y, $x)) $svg .= '<rect x="' . ($x + 4) . '" y="' . ($y + 4) . '" width="1" height="1"/>';
    }
    $svg .= '</g></svg>';
    $specific = $tipo === 'alojamento'
        ? ['checkin' => $date($d['inicio']), 'checkout' => $date($d['fim']), 'noites' => $r['noites'], 'hospedes' => $r['quantidade_hospedes']]
        : ($tipo === 'carro'
            ? ['levantamento' => $date($d['inicio']), 'devolucao' => $date($d['fim']), 'dias' => $r['dias'] ?? null]
            : ['data_participacao' => $date($d['inicio']), 'horario' => $r['horario'] ?? '', 'pessoas' => $r['quantidade_pessoas'] ?? 1]);
    $photo = $d['imagem'];
    if (strpos($photo, 'uploads/') === 0) $photo = '/' . $photo;
    if (strpos($photo, '/uploads/') === 0) $photo = 'https://welovepalop.com' . $photo;
    echo json_encode(['success' => true, 'data' => [
        'id' => (int) $r['id'], 'tipo' => $tipo, 'codigo_reserva' => $r['codigo_reserva'],
        'papel' => (int) $r['usuario_id'] === $userId ? 'cliente' : 'anfitriao',
        'status' => $status[strtolower($r['status'])] ?? $r['status'],
        'valor' => (float) $r['preco_total'], 'valor_pago' => $paid ? (float) $r['preco_total'] : 0,
        'item_nome' => $d['titulo'], 'item_imagem' => $photo, 'item_descricao' => $d['localizacao'],
        'periodo' => $date($d['inicio']) . ($tipo !== 'experiencia' ? ' - ' . $date($d['fim']) : ''),
        'data_criacao' => $date($r['data_reserva'] ?? $r['created_at'] ?? null, 'd/m/Y H:i'),
        'metodo_pagamento' => $d['metodo_pagamento'], 'especifico' => $specific,
        'qr_code' => 'data:image/svg+xml;base64,' . base64_encode($svg),
        'proprietario' => ['nome' => $d['anfitriao_nome'], 'email' => $d['anfitriao_email'], 'telefone' => $d['anfitriao_phone']],
    ]], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    error_log('[dashboard/detalhes_reserva] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao carregar detalhes da reserva.']);
}
