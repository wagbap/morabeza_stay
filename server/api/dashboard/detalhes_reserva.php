<?php
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$origens = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://morabezastay.cv', 'https://www.morabezastay.cv'];
if (in_array($origem, $origens, true)) header('Access-Control-Allow-Origin: ' . $origem);
header('Vary: Origin');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function responder($success, $message, $data = null) {
    echo json_encode(["success" => $success, "message" => $message, "data" => $data]);
    exit();
}

try {
    require_once __DIR__ . '/../config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if ((!isset($conn) || !($conn instanceof PDO)) && isset($host, $db_name, $username, $password)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    }

    if (!isset($conn)) {
        throw new Exception("Erro na conexão com banco de dados");
    }

    $reserva_id = isset($_GET['reserva_id']) ? intval($_GET['reserva_id']) : 0;
    // Identidade autenticada, nunca o usuario_id enviado pela URL.
    require_once __DIR__ . '/../reserva-validacao.php';
    $usuario_id = utilizadorReservaQR($conn, 'host');
    $tipo = isset($_GET['tipo']) && is_string($_GET['tipo']) ? $_GET['tipo'] : '';

    if (!$reserva_id || !$usuario_id || !$tipo) {
        responder(false, "Parâmetros incompletos");
    }

    // Determinar tabela baseado no tipo
    $tabela = '';
    switch ($tipo) {
        case 'alojamento':
            $tabela = 'reservas_alojamento';
            break;
        case 'carro':
            $tabela = 'reservas_carro';
            break;
        case 'experiencia':
            $tabela = 'reservas_experiencia';
            break;
        default:
            responder(false, "Tipo de reserva inválido");
    }

    // Buscar detalhes da reserva
    $query = "";
    $params = [$reserva_id, $usuario_id, $usuario_id];

    if ($tipo === 'alojamento') {
        $query = "
            SELECT
                r.*,
                a.titulo as item_nome,
                a.descricao as item_descricao,
                a.imagem_url as item_imagem,
                a.localizacao,
                a.cidade,
                u.nome as proprietario_nome,
                u.email as proprietario_email,
                u.phone as proprietario_telefone,
                'alojamento' as tipo,
                CONCAT(DATE_FORMAT(r.data_checkin, '%d/%m/%Y'), ' - ', DATE_FORMAT(r.data_checkout, '%d/%m/%Y')) as periodo,
                DATEDIFF(r.data_checkout, r.data_checkin) as duracao,
                r.noites,
                r.quantidade_hospedes,
                r.data_checkin,
                r.data_checkout
            FROM $tabela r
            LEFT JOIN alojamentos a ON r.alojamento_id = a.id
            LEFT JOIN usuarios u ON a.proprietario_id = u.id
            WHERE r.id = ? AND (r.usuario_id = ? OR a.proprietario_id = ?) AND COALESCE(r.is_bloqueio, 0) = 0
        ";
    } elseif ($tipo === 'carro') {
        $query = "
            SELECT
                r.*,
                c.titulo as item_nome,
                c.descricao as item_descricao,
                c.imagem_url as item_imagem,
                c.modelo,
                c.marca,
                c.ano,
                u.nome as proprietario_nome,
                u.email as proprietario_email,
                u.phone as proprietario_telefone,
                'carro' as tipo,
                CONCAT(DATE_FORMAT(r.data_levantamento, '%d/%m/%Y'), ' - ', DATE_FORMAT(r.data_devolucao, '%d/%m/%Y')) as periodo,
                DATEDIFF(r.data_devolucao, r.data_levantamento) as duracao,
                r.dias,
                r.data_levantamento,
                r.data_devolucao
            FROM $tabela r
            LEFT JOIN carros c ON r.carro_id = c.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE r.id = ? AND (r.usuario_id = ? OR c.usuario_id = ?)
        ";
    } else { // experiencia
        $query = "
            SELECT
                r.*,
                e.titulo as item_nome,
                e.imagem_principal as item_imagem,
                e.localizacao,
                e.duracao as duracao_experiencia,
                u.nome as proprietario_nome,
                u.email as proprietario_email,
                u.phone as proprietario_telefone,
                'experiencia' as tipo,
                DATE_FORMAT(r.data_participacao, '%d/%m/%Y') as periodo,
                r.quantidade_pessoas,
                r.data_participacao,
                r.horario
            FROM $tabela r
            LEFT JOIN experiencias e ON r.experiencia_id = e.id
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            WHERE r.id = ? AND (r.usuario_id = ? OR e.usuario_id = ?)
        ";
    }

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reserva) {
        responder(false, "Reserva não encontrada");
    }

    // Apenas eventos com datas guardadas; sem processamento simulado.
    $criado = $reserva['created_at'] ?? $reserva['data_reserva'] ?? null;
    $historico = [];
    if ($criado) $historico[] = [
        'data' => date('d/m/Y H:i', strtotime($criado)),
        'status' => 'Criada', 'descricao' => 'Reserva criada', 'cor' => '#3b82f6'
    ];
    $estados = ['confirmada'=>'Confirmada', 'confirmado'=>'Confirmada', 'pendente'=>'Pendente', 'cancelada'=>'Cancelada', 'concluida'=>'Concluída', 'concluída'=>'Concluída'];
    $estado = $estados[strtolower($reserva['status'])] ?? $reserva['status'];

    // Gerar QR Code
    $qr_code_url = "https://quickchart.io/qr?text=" . urlencode($reserva['codigo_reserva'] ?? $reserva['id']) . "&size=300&margin=2";

    // Formatar dados para resposta
    $detalhes = [
        'id' => $reserva['id'],
        'codigo_reserva' => $reserva['codigo_reserva'] ?? 'RES-' . str_pad($reserva['id'], 6, '0', STR_PAD_LEFT),
        'tipo' => $reserva['tipo'],
        'status' => $estado,
        'papel' => (int)$reserva['usuario_id'] === $usuario_id ? 'cliente' : 'anfitriao',
        'item_nome' => $reserva['item_nome'],
        'item_descricao' => $reserva['item_descricao'] ?? '',
        'item_imagem' => $reserva['item_imagem'] ?? '',
        'periodo' => $reserva['periodo'],
        'valor' => (float)$reserva['preco_total'],
        'valor_pago' => in_array(strtolower(trim($reserva['pagamento_status'] ?? '')), ['pago','paid','confirmado','aprovado','completed','succeeded'], true) ? (float)$reserva['preco_total'] : 0,
        'preco_total' => $reserva['preco_total'],
        'moeda' => 'CVE',
        'data_criacao' => $criado ? date('d/m/Y H:i', strtotime($criado)) : '',
        'qr_code' => $qr_code_url,
        'proprietario' => [
            'nome' => $reserva['proprietario_nome'] ?? 'Anfitrião',
            'email' => $reserva['proprietario_email'] ?? '',
            'telefone' => $reserva['proprietario_telefone'] ?? ''
        ],
        'historico' => $historico
    ];

    // Adicionar campos específicos por tipo
    if ($tipo === 'alojamento') {
        $detalhes['especifico'] = [
            'checkin' => date('d/m/Y', strtotime($reserva['data_checkin'])),
            'checkout' => date('d/m/Y', strtotime($reserva['data_checkout'])),
            'noites' => $reserva['noites'],
            'hospedes' => $reserva['quantidade_hospedes'],
            'endereco' => $reserva['endereco'] ?? '',
            'cidade' => $reserva['cidade'] ?? ''
        ];
    } elseif ($tipo === 'carro') {
        $detalhes['especifico'] = [
            'levantamento' => date('d/m/Y', strtotime($reserva['data_levantamento'])),
            'devolucao' => date('d/m/Y', strtotime($reserva['data_devolucao'])),
            'dias' => $reserva['dias'],
            'modelo' => $reserva['modelo'] ?? '',
            'marca' => $reserva['marca'] ?? '',
            'ano' => $reserva['ano'] ?? ''
        ];
    } else {
        $detalhes['especifico'] = [
            'data_participacao' => date('d/m/Y', strtotime($reserva['data_participacao'])),
            'horario' => $reserva['horario'] ?? '',
            'pessoas' => $reserva['quantidade_pessoas'],
            'localizacao' => $reserva['localizacao'] ?? '',
            'duracao' => $reserva['duracao_experiencia'] ?? ''
        ];
    }

    responder(true, "Detalhes da reserva carregados", $detalhes);

} catch (PDOException $e) {
    error_log("[detalhes_reserva] " . $e->getMessage());
    http_response_code(500);
    responder(false, "Erro ao carregar detalhes da reserva.");
} catch (Exception $e) {
    error_log("[detalhes_reserva] " . $e->getMessage());
    http_response_code(500);
    responder(false, "Erro ao carregar detalhes da reserva.");
}
?>
