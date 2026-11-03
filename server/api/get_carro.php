<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'GET') {
    http_response_code(405);
    header('Allow: GET, OPTIONS');
    echo json_encode(['success' => false, 'error' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

function parametroCarro(string $chave): string
{
    return isset($_GET[$chave]) && is_string($_GET[$chave])
        ? trim($_GET[$chave])
        : '';
}

try {
    require_once __DIR__ . '/config.php';
    if (!isset($conn) || !($conn instanceof PDO)) {
        $senha = $password_db ?? $password ?? null;
        if (!isset($host, $db_name, $username) || $senha === null) {
            throw new RuntimeException('Configuração da ligação indisponível.');
        }
        $conn = new PDO(
            "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
            $username,
            $senha
        );
    }
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec('SET NAMES utf8mb4');

    $id = (int) parametroCarro('id');
    $localizacao = parametroCarro('localizacao');
    $inicio = parametroCarro('data_levantamento');
    $fim = parametroCarro('data_devolucao');
    $orcamento = parametroCarro('orcamento');

    // Aplicar a aprovação tanto à listagem como à consulta pública por ID.
    $query = "SELECT * FROM carros
              WHERE status_carro = 'aprovado'
                AND status = 'disponivel'";
    $params = [];

    if ($id > 0) {
        $query .= ' AND id = :id';
        $params[':id'] = $id;
    } else {
        // Sem orçamento explícito, não esconder carros pelo preço.
        if ($orcamento !== '') {
            if (!is_numeric($orcamento) || (float) $orcamento < 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Orçamento inválido.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $query .= ' AND preco_dia <= :orcamento';
            $params[':orcamento'] = $orcamento;
        }
        if ($localizacao !== '') {
            $query .= ' AND localizacao LIKE :localizacao';
            $params[':localizacao'] = '%' . $localizacao . '%';
        }
        if ($inicio !== '' || $fim !== '') {
            $dataInicio = DateTimeImmutable::createFromFormat('!Y-m-d', $inicio);
            $dataFim = DateTimeImmutable::createFromFormat('!Y-m-d', $fim);
            if (!$dataInicio || !$dataFim
                || $dataInicio->format('Y-m-d') !== $inicio
                || $dataFim->format('Y-m-d') !== $fim
                || $inicio > $fim) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Datas de pesquisa inválidas.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $query .= ' AND data_levantamento <= :inicio AND data_devolucao >= :fim';
            $params[':inicio'] = $inicio;
            $params[':fim'] = $fim;
        }
    }
    $query .= ' ORDER BY id DESC';
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $carros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($carros as &$carro) {
        $extra = $carro['imagens_extra'] ?? '';
        $json = is_string($extra) ? json_decode($extra, true) : null;
        $carro['imagens_extra'] = is_array($json)
            ? $json
            : ($extra !== '' && $extra !== null ? explode(',', $extra) : []);
    }
    unset($carro);

    if ($id > 0 && !$carros) {
        http_response_code(404);
        $resposta = ['success' => false, 'count' => 0, 'total' => 0, 'data' => [], 'error' => 'Veículo não encontrado.'];
    } else {
        $resposta = [
            'success' => true,
            'count' => count($carros),
            'total' => count($carros),
            'data' => $id > 0 ? $carros[0] : $carros
        ];
    }
    echo json_encode($resposta, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    error_log('[get_carro.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Não foi possível carregar os veículos.'], JSON_UNESCAPED_UNICODE);
}
