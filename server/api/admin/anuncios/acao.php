<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST, OPTIONS');
    echo json_encode(['status' => 'error', 'message' => 'Metodo nao permitido.']);
    exit();
}

try {
    require_once __DIR__ . '/../../config.php';
    if (!isset($conn) || !($conn instanceof PDO)) {
        $senha = $password_db ?? $password ?? null;
        if (!isset($host, $db_name, $username) || $senha === null) {
            throw new RuntimeException('Database configuration unavailable.');
        }
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $senha);
    }
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Throwable $e) {
    error_log('[anuncios/acao.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erro de conexao.']);
    exit();
}

// ============================================================
// HELPER — notificação única (evita duplicados em 30s)
// ============================================================
function criarNotificacaoUnica($conn, $usuario_id, $titulo, $mensagem, $tipo = 'geral') {
    try {
        $chk = $conn->prepare("
            SELECT id FROM notificacoes
            WHERE usuario_id = :uid
              AND titulo = :titulo
              AND mensagem = :msg
              AND criado_em >= DATE_SUB(NOW(), INTERVAL 30 SECOND)
            LIMIT 1
        ");
        $chk->execute([':uid' => $usuario_id, ':titulo' => $titulo, ':msg' => $mensagem]);

        if ($chk->fetchColumn()) return false;

        $ins = $conn->prepare("
            INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, criado_em)
            VALUES (:uid, :titulo, :msg, :tipo, NOW())
        ");
        $ins->execute([
            ':uid'    => $usuario_id,
            ':titulo' => $titulo,
            ':msg'    => $mensagem,
            ':tipo'   => $tipo,
        ]);
        return true;
    } catch (PDOException $e) { return false; }
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "JSON inválido.", "debug" => substr($raw, 0, 300)]);
    exit();
}

$anuncio_id = (int)($input->anuncio_id ?? 0);
$tipo       = trim($input->tipo ?? '');
$admin_id   = (int)($input->admin_id ?? 0);
$acao       = trim($input->acao ?? '');
$motivo     = trim($input->motivo ?? '');

if (!$anuncio_id || !$admin_id || !$acao) {
    echo json_encode([
        "status" => "error",
        "message" => "Dados incompletos.",
        "debug" => [
            "anuncio_id" => $anuncio_id,
            "admin_id"   => $admin_id,
            "acao"       => $acao
        ]
    ]);
    exit();
}

$tabelas = [
    'alojamento'  => 'alojamentos',
    'carro'       => 'carros',
    'experiencia' => 'experiencias',
];

if (!isset($tabelas[$tipo])) {
    echo json_encode([
        "status" => "error",
        "message" => "Tipo inválido.",
        "recebido" => $tipo,
        "esperado" => array_keys($tabelas)
    ]);
    exit();
}

$tabela = $tabelas[$tipo];

// Mapear ação → novo estado
$mapaEstados = [
    'aprovar'        => 'aprovado',
    'publicar'       => 'publicado',
    'rejeitar'       => 'rejeitado',
    'pausar'         => 'pausado',
    'suspender'      => 'suspenso',
    'pedir_correcao' => 'correcao_necessaria',
];

if (!isset($mapaEstados[$acao])) {
    echo json_encode([
        "status" => "error",
        "message" => "Ação desconhecida.",
        "recebido" => $acao,
        "esperado" => array_keys($mapaEstados)
    ]);
    exit();
}

$novo_estado = $mapaEstados[$acao];

try {
    // Verificar se tabela e coluna de estado existem
    $colunas = $conn->query("DESCRIBE `$tabela`")->fetchAll(PDO::FETCH_COLUMN);
    // Moderation and availability are independent fields.
    $colEstado = $tipo === 'carro'
        ? 'status_carro'
        : (in_array('status', $colunas, true) ? 'status' : 'estado');
    if (!in_array($colEstado, $colunas, true)) {
        throw new RuntimeException('Moderation column unavailable.');
    }
    $conn->beginTransaction();
    $consulta = $conn->prepare("SELECT * FROM `$tabela` WHERE id = :id LIMIT 1 FOR UPDATE");
    $consulta->execute([':id' => $anuncio_id]);
    $anuncio = $consulta->fetch(PDO::FETCH_ASSOC);
    if (!$anuncio) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Anuncio nao encontrado.']);
        exit();
    }

    $alteracoes = [$colEstado => $novo_estado];
    if ($tipo === 'carro') {
        switch ($acao) {
            case 'aprovar':
                $alteracoes = ['status_carro' => 'aprovado'];
                // Repair legacy empty values; preserve maintenance/unavailability.
                if (!isset($anuncio['status']) || trim($anuncio['status']) === '') {
                    $alteracoes['status'] = 'disponivel';
                }
                break;
            case 'publicar':
                if ($anuncio['status_carro'] !== 'aprovado') {
                    $conn->rollBack();
                    http_response_code(409);
                    echo json_encode(['status' => 'error', 'message' => 'Aprova o carro antes de o publicar.']);
                    exit();
                }
                $alteracoes = ['status' => 'disponivel'];
                break;
            case 'pausar':
                $alteracoes = ['status' => 'indisponivel'];
                break;
            case 'suspender':
                $alteracoes = ['status_carro' => 'pendente', 'status' => 'indisponivel'];
                break;
            case 'pedir_correcao':
                $alteracoes = ['status_carro' => 'pendente'];
                break;
            case 'rejeitar':
                $alteracoes = ['status_carro' => 'rejeitado'];
                break;
        }
    }
    if (in_array('motivo_rejeicao', $colunas, true)) {
        if (in_array($acao, ['rejeitar', 'pedir_correcao'], true)) {
            $alteracoes['motivo_rejeicao'] = $motivo;
        } elseif ($acao === 'aprovar') {
            $alteracoes['motivo_rejeicao'] = null;
        }
    }
    $mudou = false;
    foreach ($alteracoes as $coluna => $valor) {
        if (($anuncio[$coluna] ?? null) !== $valor) $mudou = true;
    }
    if (!$mudou) {
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Estado ja confirmado.',
            'novo_estado' => $anuncio[$colEstado], 'sem_alteracao' => true]);
        exit();
    }
    $sets = [];
    $params = [':id' => $anuncio_id];
    foreach ($alteracoes as $coluna => $valor) {
        $sets[] = "`$coluna` = :$coluna";
        $params[":$coluna"] = $valor;
    }
    $upd = $conn->prepare("UPDATE `$tabela` SET " . implode(', ', $sets) . " WHERE id = :id");
    $upd->execute($params);
    // Read back persisted values before reporting success.
    $consulta->execute([':id' => $anuncio_id]);
    $guardado = $consulta->fetch(PDO::FETCH_ASSOC);
    foreach ($alteracoes as $coluna => $valor) {
        if (!$guardado || $guardado[$coluna] !== $valor) {
            throw new RuntimeException("Failed to persist $coluna.");
        }
    }
    $novo_estado = $guardado[$colEstado];

    // Registar ação (se tabela existir)
    try {
        $chk = $conn->query("SHOW TABLES LIKE 'historico_acoes'");
        if ($chk->fetchColumn()) {
            $log = $conn->prepare("
                INSERT INTO historico_acoes
                    (admin_id, anuncio_id, anuncio_tipo, acao, motivo, criado_em)
                VALUES
                    (:admin, :aid, :atipo, :acao, :motivo, NOW())
            ");
            $log->execute([
                ':admin' => $admin_id,
                ':aid'   => $anuncio_id,
                ':atipo' => $tipo,
                ':acao'  => $acao,
                ':motivo'=> $motivo ?: null
            ]);
        }
    } catch (PDOException $e) {
        // histórico é opcional
    }

    // Notificar o prestador (sem duplicação)
    try {
        $chk = $conn->query("SHOW TABLES LIKE 'notificacoes'");
        if ($chk->fetchColumn()) {
            // Descobrir o dono do anúncio
            $info = $conn->prepare("SELECT * FROM `$tabela` WHERE id = :id LIMIT 1");
            $info->execute([':id' => $anuncio_id]);
            $row = $info->fetch(PDO::FETCH_ASSOC);

            $colUser = null;
            foreach (['user_id','usuario_id','proprietario_id','anfitriao_id','prestador_id'] as $c) {
                if (isset($row[$c])) { $colUser = $c; break; }
            }

            if ($colUser && $row[$colUser]) {
                $mensagens = [
                    'aprovar'        => 'O teu anúncio foi aprovado.',
                    'rejeitar'       => "O teu anúncio foi rejeitado. Motivo: $motivo",
                    'pausar'         => 'O teu anúncio foi pausado pela administração.',
                    'suspender'      => 'O teu anúncio foi suspenso pela administração.',
                    'pedir_correcao' => "O teu anúncio precisa de correções. Motivo: $motivo",
                ];

                if (isset($mensagens[$acao])) {
                    criarNotificacaoUnica(
                        $conn,
                        $row[$colUser],
                        'Anúncio ' . $novo_estado,
                        $mensagens[$acao],
                        'anuncio'
                    );
                }
            }
        }
    } catch (PDOException $e) {
        // opcional
    }

    $conn->commit();

    echo json_encode([
        "status"  => "success",
        "message" => "Ação executada: " . $novo_estado,
        "novo_estado" => $novo_estado
    ]);
    exit();

} catch (Throwable $e) {
    error_log('[anuncios/acao.php] ' . $e->getMessage());
    http_response_code(500);
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode([
        "status"  => "error",
        "message" => "Erro ao executar ação.",
    ]);
    exit();
}