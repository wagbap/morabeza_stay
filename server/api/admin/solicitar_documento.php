<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store');
function respostaDocumento(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respostaDocumento(405, ['status'=>'error', 'message'=>'Método inválido.']);

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input)) throw new InvalidArgumentException('Pedido inválido.');
    $action = $input['action'] ?? '';
    $adminActions = ['criar_pedido', 'listar_por_anuncio', 'aprovar_documento', 'rejeitar_documento'];
    $hostActions = ['listar_pedidos_prestador', 'listar_correcoes_prestador', 'enviar_documento'];
    if (!in_array($action, array_merge($adminActions, $hostActions), true)) throw new InvalidArgumentException('Ação inválida.');
    require __DIR__ . '/../config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if ((!isset($conn) || !($conn instanceof PDO)) && isset($host, $db_name, $username, $password)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    }
    if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    require_once __DIR__ . '/../reserva-validacao.php';
    $isAdmin = in_array($action, $adminActions, true);
    $userId = utilizadorReservaQR($conn, $isAdmin ? 'admin' : 'host');
    // Fixed identifiers from the supplied schema; car availability is separate.
    $map = [
        'alojamento'=>['alojamentos', 'proprietario_id', 'status'],
        'carro'=>['carros', 'usuario_id', 'status_carro'],
        'experiencia'=>['experiencias', 'usuario_id', 'status'],
    ];
    $positiveId = static function ($value): int {
        $id = filter_var($value, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
        if (!$id) throw new InvalidArgumentException('Referência inválida.');
        return (int)$id;
    };
    $text = static function (array $values, string $key): string {
        if (!is_string($values[$key] ?? null)) throw new InvalidArgumentException('Dados incompletos.');
        return trim($values[$key]);
    };

    if ($action === 'listar_pedidos_prestador' || $action === 'listar_por_anuncio') {
        $sql = 'SELECT pd.*, COALESCE(a.titulo,c.titulo,e.titulo) AS anuncio_titulo, u.nome AS admin_nome
            FROM pedidos_documentos pd
            LEFT JOIN alojamentos a ON pd.anuncio_tipo=\'alojamento\' AND a.id=pd.anuncio_id
            LEFT JOIN carros c ON pd.anuncio_tipo=\'carro\' AND c.id=pd.anuncio_id
            LEFT JOIN experiencias e ON pd.anuncio_tipo=\'experiencia\' AND e.id=pd.anuncio_id
            LEFT JOIN usuarios u ON u.id=pd.admin_id WHERE ';
        $params = ['uid'=>$userId];
        if ($isAdmin) {
            $type = $input['anuncio_tipo'] ?? '';
            if (!isset($map[$type])) throw new InvalidArgumentException('Tipo de anúncio inválido.');
            $sql .= 'pd.anuncio_id=:id AND pd.anuncio_tipo=:tipo';
            $params = ['id'=>$positiveId($input['anuncio_id'] ?? null), 'tipo'=>$type];
        } else $sql .= 'pd.prestador_id=:uid';
        $stmt = $conn->prepare($sql . ' ORDER BY pd.criado_em DESC, pd.id DESC');
        $stmt->execute($params);
        respostaDocumento(200, ['status'=>'success', 'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
    if ($action === 'listar_correcoes_prestador') {
        $rows = [];
        // A correction belongs to its exact listing, never the user's latest generic message.
        foreach ($map as $type=>$config) {
            [$table, $owner, $state] = $config;
            $stmt = $conn->prepare("SELECT id, titulo, motivo_rejeicao AS motivo FROM $table WHERE $owner=:uid AND $state='rejeitado' AND motivo_rejeicao IS NOT NULL AND motivo_rejeicao<>'' ORDER BY id DESC");
            $stmt->execute(['uid'=>$userId]);
            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $row['tipo'] = $type;
                $row['estado'] = 'correcao_necessaria'; // UI label; not persisted into the enum.
                $rows[] = $row;
            }
        }
        respostaDocumento(200, ['status'=>'success', 'data'=>$rows]);
    }

    $conn->beginTransaction();
    if ($action === 'criar_pedido') {
        $type = $input['anuncio_tipo'] ?? '';
        if (!isset($map[$type])) throw new InvalidArgumentException('Tipo de anúncio inválido.');
        $listingId = $positiveId($input['anuncio_id'] ?? null);
        [$table, $owner, $state] = $map[$type];
        $stmt = $conn->prepare("SELECT $owner FROM $table WHERE id=:id FOR UPDATE");
        $stmt->execute(['id'=>$listingId]);
        $ownerId = $stmt->fetchColumn();
        if (!$ownerId) throw new InvalidArgumentException('Anúncio não encontrado.');
        $documentType = $text($input, 'tipo_documento');
        $validTypes = ['alvara','licenca_turismo','caderneta_predial','certidao','bi_passaporte','carta_conducao','livrete','seguro','licenca_guia','outro'];
        if (!in_array($documentType, $validTypes, true)) throw new InvalidArgumentException('Tipo de documento inválido.');
        $reason = $text($input, 'motivo');
        if (mb_strlen($reason) < 10 || mb_strlen($reason) > 10000) throw new InvalidArgumentException('O motivo deve ter entre 10 e 10000 caracteres.');
        $deadline = $text($input, 'prazo');
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $deadline);
        if (!$date || $date->format('Y-m-d') !== $deadline || $deadline < date('Y-m-d')) throw new InvalidArgumentException('Prazo inválido.');
        $stmt = $conn->prepare("INSERT INTO pedidos_documentos (anuncio_id,anuncio_tipo,admin_id,prestador_id,tipo_documento,motivo,prazo,estado,criado_em) VALUES (:aid,:tipo,:admin,:owner,:doc,:motivo,:prazo,'pendente',CURRENT_TIMESTAMP)");
        $stmt->execute(['aid'=>$listingId,'tipo'=>$type,'admin'=>$userId,'owner'=>$ownerId,'doc'=>$documentType,'motivo'=>$reason,'prazo'=>$deadline]);
        $pedidoId = (int)$conn->lastInsertId();
        $title = 'Documento solicitado';

    } else {
        $pedidoId = $positiveId($input['pedido_id'] ?? null);
        $stmt = $conn->prepare('SELECT * FROM pedidos_documentos WHERE id=:id' . ($isAdmin ? '' : ' AND prestador_id=:uid') . ' FOR UPDATE');
        $params = ['id'=>$pedidoId];
        if (!$isAdmin) $params['uid'] = $userId;
        $stmt->execute($params);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$pedido || !isset($map[$pedido['anuncio_tipo']])) throw new InvalidArgumentException('Pedido não encontrado.');
        $type = $pedido['anuncio_tipo'];
        [$table, $owner, $state] = $map[$type];
        $listingId = (int)$pedido['anuncio_id'];
        if ($action === 'enviar_documento') {
            $url = $text($input, 'documento_url');
            if (strpos($url, '/uploads/') === 0) $url = 'https://welovepalop.com' . $url;
            $parts = parse_url($url);
            if (strlen($url)>255 || !is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || ($parts['host'] ?? '') !== 'welovepalop.com' || strpos($parts['path'] ?? '', '/uploads/') !== 0 || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) throw new InvalidArgumentException('URL de documento inválida.');
            if ($pedido['estado'] === 'enviado' && $pedido['documento_url'] === $url) {
                $conn->commit();
                respostaDocumento(200, ['status'=>'success','message'=>'Documento enviado.']);
            }
            if (!in_array($pedido['estado'], ['pendente','rejeitado'], true)) throw new InvalidArgumentException('Este pedido não aceita um novo envio.');
            $stmt = $conn->prepare("UPDATE pedidos_documentos SET estado='enviado',documento_url=:url,enviado_em=CURRENT_TIMESTAMP,aprovado_em=NULL,motivo_rejeicao=NULL WHERE id=:id");
            $stmt->execute(['url'=>$url,'id'=>$pedidoId]);
            $title = 'Documento recebido';

        } else {
            $target = $action === 'aprovar_documento' ? 'aprovado' : 'rejeitado';
            $reason = $target === 'rejeitado' ? $text($input, 'motivo') : null;
            if ($reason !== null && (mb_strlen($reason)<5 || mb_strlen($reason)>10000)) throw new InvalidArgumentException('Escreve o motivo da rejeição (5 a 10000 caracteres).');
            if ($pedido['estado'] === $target && ($target === 'aprovado' || $pedido['motivo_rejeicao'] === $reason)) {
                $conn->commit();
                respostaDocumento(200, ['status'=>'success','message'=>'Documento já atualizado.']);
            }
            if ($pedido['estado'] !== 'enviado') throw new InvalidArgumentException('O documento tem de estar enviado para ser analisado.');
            $stmt = $conn->prepare("UPDATE pedidos_documentos SET estado=:estado,aprovado_em=" . ($target === 'aprovado' ? 'CURRENT_TIMESTAMP' : 'NULL') . ',motivo_rejeicao=:motivo WHERE id=:id');
            $stmt->execute(['estado'=>$target,'motivo'=>$reason,'id'=>$pedidoId]);
            $title = $target === 'aprovado' ? 'Documento aprovado' : 'Documento rejeitado';

        }
    }
    // Document approval returns the listing to moderation; it never publishes it.
    if ($action !== 'rejeitar_documento') {
        $stmt = $conn->prepare("UPDATE $table SET $state='pendente' WHERE id=:id");
        $stmt->execute(['id'=>$listingId]);
    }
    $conn->commit();
    respostaDocumento(200, ['status'=>'success','message'=>$title . '.', 'pedido_id'=>$pedidoId]);
} catch (InvalidArgumentException | JsonException $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    respostaDocumento(422, ['status'=>'error','message'=>$e instanceof JsonException ? 'JSON inválido.' : $e->getMessage()]);
} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    error_log('[admin/solicitar_documento] ' . $e->getMessage());
    respostaDocumento(500, ['status'=>'error','message'=>'Não foi possível processar o pedido de documento.']);
}
