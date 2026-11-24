<?php
declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
require_once __DIR__ . '/carroStock.php';
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') { http_response_code(405); exit; }
    $db = carroStockConexao();
    $id = (int)($_GET['id'] ?? 0); $slug = trim((string)($_GET['slug'] ?? ''));
    $inicio = !empty($_GET['data_inicio']) ? (string)$_GET['data_inicio'] : null;
    $fim = !empty($_GET['data_fim']) ? (string)$_GET['data_fim'] : null;
    carroPeriodoStock($inicio, $fim);
    $colunas = $db->query('SHOW COLUMNS FROM usuarios')->fetchAll(PDO::FETCH_COLUMN);
    $telefone = 'NULL';
    foreach (['telefone','phone','whatsapp','celular'] as $coluna) {
        if (in_array($coluna, $colunas, true)) { $telefone = "u.`$coluna`"; break; }
    }
    $sql = "SELECT c.id,c.slug,c.titulo,c.descricao,c.descricao_curta,c.imagem_url,c.localizacao,c.ilha,c.preco_dia,c.tipo,
        c.estrelas,c.total_reviews,c.ano,c.passageiros,c.combustivel,c.quilometragem,c.transmissao,c.cor,
        c.status,c.status_carro,c.latitude,c.longitude,c.usuario_id,
        u.id AS dono_id,u.nome AS dono_nome,u.email AS dono_email,u.foto AS dono_foto,u.tipo_conta AS dono_tipo_conta,
        $telefone AS dono_telefone,
        (SELECT AVG(rating) FROM carro_reviews WHERE carro_id=c.id AND aprovado=1) AS rating_medio,
        (SELECT COUNT(*) FROM carro_reviews WHERE carro_id=c.id AND aprovado=1) AS total_avaliacoes
        FROM carros c LEFT JOIN usuarios u ON c.usuario_id=u.id
        WHERE c.status='disponivel' AND c.status_carro='aprovado'";
    $params = [];
    if ($id > 0) { $sql .= ' AND c.id=?'; $params[] = $id; }
    elseif ($slug !== '') { $sql .= ' AND c.slug=?'; $params[] = $slug; }
    $s = $db->prepare($sql); $s->execute($params); $lista = $s->fetchAll(PDO::FETCH_ASSOC);
    if (($id > 0 || $slug !== '') && !$lista) {
        http_response_code(404);
        echo json_encode(['success'=>false,'error'=>'Veículo não encontrado'], JSON_UNESCAPED_UNICODE); exit;
    }
    $resultado = array_map(static fn($carro) => processarCarroStock($carro, $db, $inicio, $fim), $lista);
    echo json_encode(['success'=>true,'data'=>($id > 0 || $slug !== '') ? $resultado[0] : $resultado], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    error_log('[get_carro_detalhes] ' . $e->getMessage());
    http_response_code($e instanceof InvalidArgumentException ? 400 : 503);
    echo json_encode(['success'=>false,'error'=>'Não foi possível carregar o veículo.'], JSON_UNESCAPED_UNICODE);
}

function processarCarroStock(array $carro, PDO $db, ?string $inicio, ?string $fim): array {
    $coord = coordenadasCarroStock((string)($carro['ilha'] ?? $carro['localizacao'] ?? ''));
    $carro['latitude'] = !empty($carro['latitude']) ? (float)$carro['latitude'] : $coord[0];
    $carro['longitude'] = !empty($carro['longitude']) ? (float)$carro['longitude'] : $coord[1];
    $carro['usuario_id'] = !empty($carro['usuario_id']) ? (int)$carro['usuario_id'] : null;
    $carro['proprietario'] = ['id'=>!empty($carro['dono_id']) ? (int)$carro['dono_id'] : null,
        'nome'=>$carro['dono_nome'] ?? 'Proprietário','email'=>$carro['dono_email'],
        'foto'=>$carro['dono_foto'],'phone'=>$carro['dono_telefone'],
        'tipo_conta'=>$carro['dono_tipo_conta'] ?? 'proprietario','superhost'=>false,'tempo_resposta'=>'Responde em 1 hora'];
    foreach (['id','nome','email','foto','tipo_conta','telefone'] as $campo) unset($carro['dono_' . $campo]);
    $s = $db->prepare("SELECT caminho_url FROM carro_imagens WHERE carro_id=? AND caminho_url IS NOT NULL AND TRIM(caminho_url)<>'' ORDER BY principal DESC,ordem,id");
    $s->execute([$carro['id']]);
    $imagens = [];
    foreach ($s->fetchAll(PDO::FETCH_COLUMN) as $url) {
        $url = imagemCarroStock($url);
        if ($url && !in_array($url,$imagens,true)) $imagens[] = $url;
    }
    if (!$imagens && !empty($carro['imagem_url'])) {
        $url = imagemCarroStock($carro['imagem_url']); if ($url) $imagens[] = $url;
    }
    if (!$imagens) $imagens[] = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400';
    $carro['imagens'] = $imagens;
    // Zero unidades ou uma falha de consulta nunca produz um carro fictício.
    $stock = carroStockLer($db, (int)$carro['id'], $inicio, $fim);
    $carro['quantidade_disponivel'] = $stock['quantidade_disponivel'];
    $carro['caracteristicas'] = ['transmissao'=>$carro['transmissao'] ?? 'Manual','combustivel'=>$carro['combustivel'] ?? 'Gasolina',
        'passageiros'=>(int)($carro['passageiros'] ?? 5),'ano'=>(int)($carro['ano'] ?? date('Y')),
        'quilometragem'=>number_format((float)($carro['quilometragem'] ?? 0),0,',','.') . ' km','cor'=>$carro['cor'] ?? 'Não informada'];
    $carro['inclusoes'] = [
        ['titulo'=>'Cancelamento','valor'=>'Gratuito','icone'=>'CheckCircle','cor_classe'=>'text-green-600'],
        ['titulo'=>'Seguro básico','valor'=>'Incluído','icone'=>'ShieldCheck','cor_classe'=>'text-green-600'],
        ['titulo'=>'Quilometragem','valor'=>'Ilimitada','icone'=>'Infinity','cor_classe'=>'text-green-600'],
        ['titulo'=>'Levantamento','valor'=>$carro['localizacao'] ?? 'Aeroporto','icone'=>'Key','cor_classe'=>'text-slate-500']];
    $carro['estrelas'] = $carro['rating_medio'] ? round((float)$carro['rating_medio'],1) : round((float)($carro['estrelas'] ?? 5),1);
    $carro['total_avaliacoes'] = (int)$carro['total_avaliacoes']; unset($carro['rating_medio']);
    return $carro;
}
function imagemCarroStock(string $url): ?string {
    $url = trim($url);
    if ($url === '' || stripos($url,'data:') === 0) return null;
    return preg_match('#^https?://#i',$url) ? $url : 'https://welovepalop.com/' . ltrim($url,'/');
}
function coordenadasCarroStock(string $ilha): array {
    $mapa = ['Santo Antão'=>[17.0667,-25.1667],'São Vicente'=>[16.8333,-24.9833],'Santa Luzia'=>[16.75,-24.75],
        'São Nicolau'=>[16.6167,-24.2667],'Sal'=>[16.7167,-22.9167],'Boa Vista'=>[16.1,-22.8],
        'Maio'=>[15.1333,-23.2167],'Santiago'=>[15.0667,-23.5833],'Fogo'=>[14.9167,-24.3333],
        'Brava'=>[14.8667,-24.7],'Praia'=>[14.9333,-23.5125],'Mindelo'=>[16.8833,-24.9833]];
    foreach ($mapa as $nome=>$coord) if (stripos($ilha,$nome)!==false) return $coord;
    return [15.0667,-23.5833];
}
