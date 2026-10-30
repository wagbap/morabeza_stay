<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error']); exit; }
try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input)) throw new InvalidArgumentException('Invalid input');
    $action = $input['action'] ?? '';
    if (!in_array($action, ['listar', 'marcar_lida', 'marcar_todas_lidas'], true)) throw new InvalidArgumentException('Invalid action');
    require __DIR__ . '/../config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if ((!isset($conn) || !($conn instanceof PDO)) && isset($host, $db_name, $username, $password)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    }
    if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    require_once __DIR__ . '/../reserva-validacao.php';
    $userId = utilizadorReservaQR($conn, 'host');
    if ($action === 'listar') {
        $limit = max(1, min(100, (int)($input['limite'] ?? 20)));
        $stmt = $conn->prepare("SELECT n.*,
            COALESCE(NULLIF(n.anuncio_imagem,''), CASE n.tipo_anuncio
                WHEN 'alojamento' THEN COALESCE((SELECT NULLIF(g.caminho_url,'') FROM alojamento_imagens g WHERE g.alojamento_id=n.anuncio_id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),(SELECT a.imagem_url FROM alojamentos a WHERE a.id=n.anuncio_id))
                WHEN 'carro' THEN COALESCE((SELECT NULLIF(g.caminho_url,'') FROM carro_imagens g WHERE g.carro_id=n.anuncio_id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),(SELECT a.imagem_url FROM carros a WHERE a.id=n.anuncio_id))
                WHEN 'experiencia' THEN COALESCE((SELECT NULLIF(g.caminho_url,'') FROM experiencia_imagens g WHERE g.experiencia_id=n.anuncio_id ORDER BY g.principal DESC,g.ordem,g.id LIMIT 1),(SELECT a.imagem_principal FROM experiencias a WHERE a.id=n.anuncio_id))
            END,'') AS anuncio_imagem
            FROM notificacoes_anfitriao n WHERE n.usuario_id=:uid ORDER BY n.criado_em DESC,n.id DESC LIMIT " . $limit);
        $stmt->execute(['uid'=>$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) {
            $photo = trim((string)($row['anuncio_imagem'] ?? ''));
            if (strpos($photo, 'uploads/') === 0) $photo = '/' . $photo;
            if (strpos($photo, '/uploads/') === 0) $photo = 'https://welovepalop.com' . $photo;
            $row['anuncio_imagem'] = preg_match('~^https?://~i', $photo) ? $photo : '';
            unset($row['evento_chave'], $row['usuario_id']);
        }
        unset($row);
        $count = $conn->prepare('SELECT COUNT(*) FROM notificacoes_anfitriao WHERE usuario_id=:uid AND lida=0');
        $count->execute(['uid'=>$userId]);
        echo json_encode(['status'=>'success', 'usuario_id'=>$userId, 'data'=>$rows, 'nao_lidas'=>(int)$count->fetchColumn()], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    } else {
        $sql = 'UPDATE notificacoes_anfitriao SET lida=1 WHERE usuario_id=:uid AND lida=0';
        $params = ['uid'=>$userId];
        if ($action === 'marcar_lida') {
            $id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
            if (!$id) throw new InvalidArgumentException('Invalid notification');
            $sql .= ' AND id=:id';
            $params['id'] = $id;
        }
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status'=>'success', 'atualizadas'=>$stmt->rowCount()]);
    }
} catch (InvalidArgumentException | JsonException $e) {
    http_response_code(422); echo json_encode(['status'=>'error', 'message'=>'Pedido invalido.']);
} catch (Throwable $e) {
    error_log('[usuarios/notificacoes] ' . $e->getMessage());
    http_response_code(500); echo json_encode(['status'=>'error', 'message'=>'Notificacoes indisponiveis.']);
}
