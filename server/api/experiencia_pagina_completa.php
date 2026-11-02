<?php
// ============================================================
// API: experiencia_pagina_completa.php
// Devolve TUDO para a página de detalhes num só pedido
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

error_reporting(E_ALL);
ini_set('display_errors', 0);

include_once __DIR__.'/config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->exec("SET NAMES utf8mb4");

    $slug = $_GET['slug'] ?? null;
    $data = $_GET['data'] ?? date('Y-m-d');
    $usuario_logado = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : null;

    if (!$slug) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'slug é obrigatório.'], JSON_UNESCAPED_UNICODE);
        $conn = null;
        exit();
    }

    // ============================================================
    // 🔥 DETETAR coluna de telefone na tabela usuarios
    // ============================================================
    $colunaTelefone = null;
    try {
        $stmt = $conn->prepare("SHOW COLUMNS FROM usuarios");
        $stmt->execute();
        $colunas = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $candidatos = ['telefone_comercial', 'telefone', 'phone', 'whatsapp', 'celular', 'contacto', 'telemovel'];
        foreach ($candidatos as $c) {
            if (in_array($c, $colunas)) {
                $colunaTelefone = $c;
                break;
            }
        }
    } catch (Exception $e) {
        error_log("Erro a detetar coluna telefone: " . $e->getMessage());
    }

    // ============================================================
    // 1. Experiência
    // ============================================================
    $stmt = $conn->prepare("
        SELECT e.*, ec.nome AS categoria_nome, ec.icone AS categoria_icone, ec.cor AS categoria_cor,
               (SELECT COUNT(*) FROM experiencia_reviews WHERE experiencia_id = e.id AND aprovado = 1) AS total_avaliacoes,
               (SELECT COALESCE(AVG(rating), 0) FROM experiencia_reviews WHERE experiencia_id = e.id AND aprovado = 1) AS rating_calculado
        FROM experiencias e
        LEFT JOIN experiencia_categorias ec ON e.categoria = ec.slug
        WHERE e.slug = :slug
        LIMIT 1
    ");
    $stmt->execute([':slug' => $slug]);
    $exp = $stmt->fetch();

    if (!$exp) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Experiência não encontrada.'], JSON_UNESCAPED_UNICODE);
        $conn = null;
        exit();
    }

    $expId = (int)$exp['id'];
    require_once __DIR__.'/experiencia/modeloRegisto.php';
    $model=modeloRegistoLerOpcional($conn,$expId);
    if($model)$exp=array_merge($exp,array_intersect_key($model,array_flip(['modelo_reserva','equipamento_nome','quantidade_equipamentos','pessoas_por_equipamento','recurso_id'])));

    // Rating
    $ratingCalc = (float)($exp['rating_calculado'] ?? 0);
    $ratingOrig = (float)($exp['rating'] ?? 0);
    $ratingFinal = $ratingCalc > 0 ? $ratingCalc : $ratingOrig;
    $exp['rating'] = $ratingFinal;
    $exp['rating_formatado'] = number_format($ratingFinal, 1, '.', '');
    $exp['total_avaliacoes'] = (int)($exp['total_avaliacoes'] ?? 0);
    unset($exp['rating_calculado']);

    // Preços por idade
    $exp['preco_adulto'] = (float)$exp['preco'];
    $exp['preco_crianca'] = $exp['preco_crianca'] !== null ? (float)$exp['preco_crianca'] : null;
    $exp['preco_crianca_formatado'] = $exp['preco_crianca'] !== null ? number_format($exp['preco_crianca'], 0, '.', '') . ' CVE' : null;
    $exp['preco_bebe'] = $exp['preco_bebe'] !== null ? (float)$exp['preco_bebe'] : null;
    $exp['preco_bebe_formatado'] = $exp['preco_bebe'] !== null ? ($exp['preco_bebe'] == 0 ? 'Grátis' : number_format($exp['preco_bebe'], 0, '.', '') . ' CVE') : null;
    $exp['aceita_criancas'] = (bool)($exp['aceita_criancas'] ?? false);
    $exp['aceita_bebes'] = (bool)($exp['aceita_bebes'] ?? false);

    // ============================================================
    // 2. Imagens
    // ============================================================
    try {
        $stmt = $conn->prepare("SELECT caminho_url, principal, legenda FROM experiencia_imagens WHERE experiencia_id = :id ORDER BY ordem ASC");
        $stmt->execute([':id' => $expId]);
        $exp['imagens'] = $stmt->fetchAll();
    } catch (Exception $e) {
        $exp['imagens'] = [];
    }

    $exp['imagem_principal'] = $exp['imagem_principal'] ?? '';
    foreach ($exp['imagens'] as $img) {
        if (!empty($img['principal']) && $img['principal'] == 1) {
            $exp['imagem_principal'] = $img['caminho_url'];
            break;
        }
    }
    if (empty($exp['imagem_principal']) && !empty($exp['imagens'])) {
        $exp['imagem_principal'] = $exp['imagens'][0]['caminho_url'];
    }

    // ============================================================
    // 3. Inclusões
    // ============================================================
    try {
        $stmt = $conn->prepare("SELECT item, icone, incluido FROM experiencia_inclusoes WHERE experiencia_id = :id ORDER BY ordem ASC");
        $stmt->execute([':id' => $expId]);
        $exp['inclusoes'] = $stmt->fetchAll();
    } catch (Exception $e) {
        $exp['inclusoes'] = [];
    }

    if (empty($exp['inclusoes'])) {
        $exp['inclusoes'] = [
            ['item' => 'Guia Certificado', 'icone' => 'headphones', 'incluido' => (int)($exp['inclui_guia'] ?? 0)],
            ['item' => 'Transporte', 'icone' => 'car', 'incluido' => (int)($exp['inclui_transporte'] ?? 0)],
            ['item' => 'Refeição', 'icone' => 'coffee', 'incluido' => (int)($exp['inclui_refeicaot'] ?? 0)]
        ];
    }

    // ============================================================
    // 4. Requisitos
    // ============================================================
    try {
        $stmt = $conn->prepare("SELECT requisito, obrigatorio FROM experiencia_requisitos WHERE experiencia_id = :id ORDER BY ordem ASC");
        $stmt->execute([':id' => $expId]);
        $exp['requisitos'] = $stmt->fetchAll();
    } catch (Exception $e) {
        $exp['requisitos'] = [];
    }

    // ============================================================
    // 5. Anfitrião — SELECT dinâmico consoante a coluna existente
    // ============================================================
    $exp['anfitriao'] = null;
    if (!empty($exp['usuario_id'])) {
        try {
            // 🔥 Construir SELECT sem assumir colunas
            $campoTelefone = $colunaTelefone ? "`{$colunaTelefone}` AS telefone" : "NULL AS telefone";
            
            $stmt = $conn->prepare("
                SELECT id, nome, email, foto, {$campoTelefone}, tipo_conta
                FROM usuarios WHERE id = :id LIMIT 1
            ");
            $stmt->execute([':id' => $exp['usuario_id']]);
            $anf = $stmt->fetch();
            
            if ($anf) {
                $exp['anfitriao'] = [
                    'id' => (int)$anf['id'],
                    'nome' => $anf['nome'] ?? 'Anfitrião',
                    'email' => $anf['email'] ?? null,
                    'foto' => $anf['foto'] ?? null,
                    'phone' => $anf['telefone'] ?? null,
                    'tipo_conta' => $anf['tipo_conta'] ?? 'guia',
                    'guia_certificado' => true,
                    'idiomas' => 'Português/Inglês'
                ];
            }
        } catch (Exception $e) {
            error_log("Erro a carregar anfitrião: " . $e->getMessage());
            $exp['anfitriao'] = [
                'id' => (int)$exp['usuario_id'],
                'nome' => 'Anfitrião',
                'email' => null,
                'foto' => null,
                'phone' => null,
                'tipo_conta' => 'guia',
                'guia_certificado' => true,
                'idiomas' => 'Português/Inglês'
            ];
        }
    }

    // ============================================================
    // 6. Sessões do dia
    // ============================================================
    require_once __DIR__.'/agendaPublica.php';
    $sessoes = agendaSessoesPublicas($conn, $expId, $data);

    // ============================================================
    // 7. Bloqueios
    // ============================================================
    try {
        $stmt = $conn->prepare("
            SELECT data_inicio, data_fim, motivo, tipo
            FROM experiencia_bloqueios
            WHERE experiencia_id = :id AND data_fim >= CURDATE()
            ORDER BY data_inicio ASC
        ");
        $stmt->execute([':id' => $expId]);
        $bloqueios = $stmt->fetchAll();
    } catch (Exception $e) {
        $bloqueios = [];
    }

    // ============================================================
    // 8. Avaliações
    // ============================================================
    try {
        $stmt = $conn->prepare("
            SELECT nome_usuario, rating, comentario, foto, created_at
            FROM experiencia_reviews
            WHERE experiencia_id = :id AND aprovado = 1
            ORDER BY created_at DESC LIMIT 3
        ");
        $stmt->execute([':id' => $expId]);
        $avaliacoes = $stmt->fetchAll();
    } catch (Exception $e) {
        $avaliacoes = [];
    }

    // ============================================================
    // 9. Configurações
    // ============================================================
    $config = [
        'antecedencia_minima_horas' => (int)($exp['antecedencia_minima_horas'] ?? 24),
        'antecedencia_maxima_dias' => (int)($exp['antecedencia_maxima_dias'] ?? 180),
        'preco_epoca_alta' => isset($exp['preco_epoca_alta']) && $exp['preco_epoca_alta'] !== null ? (float)$exp['preco_epoca_alta'] : null,
        'epoca_alta_inicio' => $exp['epoca_alta_inicio'] ?? null,
        'epoca_alta_fim' => $exp['epoca_alta_fim'] ?? null
    ];

    // ============================================================
    // RESPOSTA
    // ============================================================
    $agendaStmt = $conn->prepare('SELECT minima_horas,maxima_dias FROM experiencia_agendas WHERE experiencia_id=?');
    $agendaStmt->execute([$expId]);
    if ($regrasAgenda = $agendaStmt->fetch()) {
        $config['antecedencia_minima_horas']=(int)$regrasAgenda['minima_horas'];
        $config['antecedencia_maxima_dias']=(int)$regrasAgenda['maxima_dias'];
    }
    echo json_encode([
        'success' => true,
        'experiencia' => $exp,
        'sessoes' => $sessoes,
        'bloqueios' => $bloqueios,
        'configuracoes' => $config,
        'avaliacoes_recentes' => $avaliacoes,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

    $conn = null;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro BD: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>