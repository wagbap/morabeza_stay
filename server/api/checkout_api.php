<?php
// ============================================
// CHECKOUT API — v6 (otimizado)
// ============================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once __DIR__ . '/config.php';

// Coloca aqui a mesma chave secreta usada no teu create-payment-intent.php.
// Este valor fica apenas no servidor PHP.
define('CHECKOUT_STRIPE_SECRET_KEY', '');

/** Aceita apenas uma cobranca concluida, no valor esperado pelo checkout. */
function validarCobrancaCheckout(array $intent, string $clientSecret, int $centimos): void {
    if (($intent['status'] ?? '') !== 'succeeded' ||
        !is_string($intent['client_secret'] ?? null) ||
        !hash_equals($intent['client_secret'], $clientSecret)) {
        throw new Exception('Pagamento Stripe nao confirmado.');
    }
    $charge = $intent['latest_charge'] ?? null;
    if ($centimos < 50 || ($intent['currency'] ?? '') !== 'eur' ||
        (int)($intent['amount'] ?? -1) !== $centimos ||
        (int)($intent['amount_received'] ?? -1) !== $centimos ||
        !is_array($charge) || ($charge['paid'] ?? false) !== true ||
        !empty($charge['refunded']) || (int)($charge['amount_refunded'] ?? 0) > 0) {
        throw new Exception('O valor recebido no Stripe nao corresponde a esta reserva ou foi reembolsado.');
    }
}

function comprovativoCheckout(string $category, string $codigo): ?string {
    try {
        $settings = require __DIR__ . '/auth-secrets.local.php';
        require_once __DIR__ . '/send_email.php';
        return urlComprovativoReserva(['tipo'=>strtolower($category), 'codigo_reserva'=>$codigo], (string)($settings['jwt_secret'] ?? ''));
    } catch (Throwable $e) {
        error_log('Checkout: ligacao do comprovativo indisponivel.');
        return null;
    }
}

function pagamentoCheckoutStripe(array $input): bool {
    $ref = $input['stripe_id'] ?? '';
    if ($ref === '' || $ref === null) throw new Exception('Pagamento Stripe obrigatorio para confirmar a reserva.');
    $proof = $input['stripe_client_secret'] ?? '';
    if (!is_string($ref) || !preg_match('/^pi_[A-Za-z0-9]+$/D', $ref) ||
        !is_string($proof) || $proof === '' || strlen($proof) > 512) {
        throw new Exception('Referencia de pagamento Stripe invalida.');
    }
    $secret = CHECKOUT_STRIPE_SECRET_KEY;
    if (!is_string($secret) || trim($secret) === '') {
        throw new Exception('Coloque a chave secreta em CHECKOUT_STRIPE_SECRET_KEY no checkout_api.php.');
    }
    require_once __DIR__ . '/../vendor/autoload.php';
    \Stripe\Stripe::setApiKey(trim($secret));
    $intent = \Stripe\PaymentIntent::retrieve(['id' => $ref, 'expand' => ['latest_charge']]);
    $total = $input['reserva']['preco_total'] ?? null;
    if (!is_numeric($total) || !is_finite((float)$total)) throw new Exception('Total da reserva invalido.');
    validarCobrancaCheckout($intent->toArray(), $proof, (int)round((float)$total / 110.265 * 100));
    return true;
}

try {
    // ✅ PDO persistente + atributos otimizados
    $conn = new PDO(
        "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_PERSISTENT         => true,
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    $method = $_SERVER['REQUEST_METHOD'];
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';

    if ($method === 'POST' && $action === '') {
        $raw = file_get_contents('php://input');
        $maybe = json_decode($raw, true);
        if (is_array($maybe) && !empty($maybe['action'])) {
            $action = trim($maybe['action']);
        }
    }

    // ============================================
    // ✅ NOVO: GET check_exists — ULTRA leve
    // Usado pelo frontend para verificar email antes do checkout.
    // Responde em ~20-50ms (só uma query indexada).
    // ============================================
    if ($method === 'GET' && $action === 'check_exists') {
        $email = isset($_GET['email']) ? trim($_GET['email']) : '';

        if ($email === '') {
            echo json_encode(['success' => true, 'existe' => false]);
            exit();
        }

        // Só uma verificação: o user existe?
        $stmt = $conn->prepare("SELECT 1 FROM usuarios WHERE email = :e LIMIT 1");
        $stmt->execute([':e' => $email]);
        $existe = (bool)$stmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'existe'  => $existe,
        ]);
        exit();
    }

    // ============================================
    // GET: CHECK_STOCK
    // ============================================
    if ($method === 'GET' && $action === 'check_stock') {
        $alojamentoId = (int)($_GET['alojamento_id'] ?? 0);
        $checkin      = $_GET['data_checkin']  ?? null;
        $checkout     = $_GET['data_checkout'] ?? null;

        if ($alojamentoId <= 0 || !$checkin || !$checkout) {
            throw new Exception("Parâmetros em falta: alojamento_id, data_checkin, data_checkout");
        }

        $stmt = $conn->prepare("
            SELECT id, titulo, modelo_venda, status FROM alojamentos
            WHERE id = :aid LIMIT 1
        ");
        $stmt->execute([':aid' => $alojamentoId]);
        $aloj = $stmt->fetch();

        if (!$aloj) { echo json_encode(['success'=>false,'error'=>'Alojamento não encontrado']); exit(); }
        if ($aloj['status'] !== 'aprovado') {
            echo json_encode(['success'=>false,'error'=>'Alojamento indisponível']); exit();
        }

        if ($aloj['modelo_venda'] === 'inteiro') {
            $stmt = $conn->prepare("
                SELECT COUNT(*) FROM reservas_alojamento
                WHERE alojamento_id = :aid
                  AND status IN ('pendente','confirmada')
                  AND data_checkin  < :checkout
                  AND data_checkout > :checkin
            ");
            $stmt->execute([':aid'=>$alojamentoId, ':checkin'=>$checkin, ':checkout'=>$checkout]);
            $bloqueado = ((int)$stmt->fetchColumn()) > 0;

            echo json_encode([
                'success'      => true,
                'modelo_venda' => 'inteiro',
                'alojamento'   => $alojamentoId,
                'titulo'       => $aloj['titulo'],
                'checkin'      => $checkin,
                'checkout'     => $checkout,
                'disponivel'   => !$bloqueado,
                'motivo'       => $bloqueado ? 'Já existe uma reserva nestas datas' : null,
            ]); exit();
        }

        $stmt = $conn->prepare("
            SELECT id, tipo_quarto_id, quantidade_disponivel, preco_personalizado, ativo
            FROM alojamento_quartos
            WHERE alojamento_id = :aid AND ativo = 1
            ORDER BY id ASC
        ");
        $stmt->execute([':aid' => $alojamentoId]);
        $quartos = $stmt->fetchAll();

        $stmtRes = $conn->prepare("
            SELECT rq.tipo_quarto_id, SUM(rq.quantidade) AS reservado
            FROM reservas_alojamento_quartos rq
            INNER JOIN reservas_alojamento r ON r.id = rq.reserva_id
            WHERE r.alojamento_id = :aid
              AND r.status IN ('pendente','confirmada')
              AND r.data_checkin  < :checkout
              AND r.data_checkout > :checkin
            GROUP BY rq.tipo_quarto_id
        ");
        $stmtRes->execute([':aid'=>$alojamentoId, ':checkin'=>$checkin, ':checkout'=>$checkout]);
        $reservadoPorTipo = [];
        foreach ($stmtRes->fetchAll() as $row) {
            $reservadoPorTipo[(int)$row['tipo_quarto_id']] = (int)$row['reservado'];
        }

        $resultado = [];
        foreach ($quartos as $q) {
            $tid   = (int)$q['tipo_quarto_id'];
            $total = (int)$q['quantidade_disponivel'];
            $usado = $reservadoPorTipo[$tid] ?? 0;
            $disp  = max(0, $total - $usado);

            $resultado[] = [
                'quarto_id'             => (int)$q['id'],
                'tipo_quarto_id'        => $tid,
                'quantidade_total'      => $total,
                'quantidade_reservada'  => $usado,
                'quantidade_disponivel' => $disp,
                'preco_noite'           => (float)$q['preco_personalizado'],
                'esgotado'              => $disp <= 0,
            ];
        }

        echo json_encode([
            'success'      => true,
            'modelo_venda' => 'por_quarto',
            'alojamento'   => $alojamentoId,
            'titulo'       => $aloj['titulo'],
            'checkin'      => $checkin,
            'checkout'     => $checkout,
            'quartos'      => $resultado,
        ]); exit();
    }

    // ============================================
    // CONFIRM_PAYMENT
    // ============================================
    if ($method === 'POST' && $action === 'confirm_payment') {
        $rawBody = file_get_contents('php://input');

        $signature = $_SERVER['HTTP_X_PAYMENT_SIGNATURE'] ?? '';
        $token     = $_SERVER['HTTP_X_INTERNAL_TOKEN']    ?? '';

        $hmacValido  = $signature !== '' && hash_equals(
            hash_hmac('sha256', $rawBody, PAYMENT_WEBHOOK_SECRET), $signature
        );
        $tokenValido = $token !== '' && hash_equals(INTERNAL_API_TOKEN, $token);

        if (!$hmacValido && !$tokenValido) {
            http_response_code(401);
            echo json_encode(['success'=>false,'error'=>'Não autorizado']); exit();
        }

        $input = json_decode($rawBody, true);
        if (!$input) throw new Exception("Dados inválidos");

        $reservaId     = (int)($input['reserva_id'] ?? 0);
        $category      = $input['category'] ?? 'Alojamento';
        $paymentRef    = trim((string)($input['payment_intent_id'] ?? ''));
        $valorPago     = (float)($input['valor_pago'] ?? 0);
        $gatewayStatus = strtolower(trim((string)($input['gateway_status'] ?? 'paid')));

        if ($reservaId <= 0) throw new Exception("reserva_id inválido");
        if ($paymentRef === '') throw new Exception("payment_intent_id obrigatório");
        if (!in_array($gatewayStatus, ['paid','succeeded','confirmed'], true)) {
            throw new Exception("Pagamento ainda não confirmado pelo gateway (status: {$gatewayStatus})");
        }

        $conn->beginTransaction();
        try {
            $tabela = null;
            if ($category === 'Alojamento')      $tabela = 'reservas_alojamento';
            elseif ($category === 'Experiencia') $tabela = 'reservas_experiencia';
            elseif ($category === 'Carro')       $tabela = 'reservas_carro';
            else throw new Exception("Categoria inválida: {$category}");

            $stmt = $conn->prepare("
                SELECT id, preco_total, status, pagamento_status
                FROM {$tabela} WHERE id = :rid LIMIT 1 FOR UPDATE
            ");
            $stmt->execute([':rid' => $reservaId]);
            $reserva = $stmt->fetch();
            if (!$reserva) throw new Exception("Reserva não encontrada");

            $valorEsperado = (float)$reserva['preco_total'];

            if ($reserva['pagamento_status'] === 'pago') {
                $conn->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Pagamento já confirmado anteriormente',
                    'data'    => ['reserva_id'=>$reservaId,'status'=>'pago','idempotent'=>true],
                ]); exit();
            }

            if ($valorPago > 0 && abs($valorPago - $valorEsperado) > 0.01) {
                $conn->prepare("
                    UPDATE {$tabela} SET status='cancelada', pagamento_status='reembolsado'
                    WHERE id = :rid
                ")->execute([':rid' => $reservaId]);
                $conn->commit();
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error'   => "Valor pago ({$valorPago}) difere do esperado ({$valorEsperado}). Reserva cancelada para reembolso.",
                ]); exit();
            }

            $conn->prepare("
                UPDATE {$tabela} SET status='confirmada', pagamento_status='pago'
                WHERE id = :rid
            ")->execute([':rid' => $reservaId]);

            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Pagamento confirmado e reserva ativada.',
                'data'    => [
                    'reserva_id'        => $reservaId,
                    'category'          => $category,
                    'status'            => 'confirmada',
                    'pagamento_status'  => 'pago',
                    'payment_intent_id' => $paymentRef,
                ],
            ]); exit();

        } catch (Exception $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            throw $e;
        }
    }

    // ============================================
    // CANCEL_RESERVATION
    // ============================================
    if ($method === 'POST' && $action === 'cancel_reservation') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) throw new Exception("Dados inválidos");

        $reservaId = (int)($input['reserva_id'] ?? 0);
        $category  = $input['category'] ?? 'Alojamento';
        $motivo    = trim((string)($input['motivo'] ?? ''));
        if ($reservaId <= 0) throw new Exception("reserva_id inválido");

        $tabela = null;
        if ($category === 'Alojamento')      $tabela = 'reservas_alojamento';
        elseif ($category === 'Experiencia') $tabela = 'reservas_experiencia';
        elseif ($category === 'Carro')       $tabela = 'reservas_carro';
        else throw new Exception("Categoria inválida: {$category}");

        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare("
                SELECT id, status, pagamento_status FROM {$tabela}
                WHERE id = :rid LIMIT 1 FOR UPDATE
            ");
            $stmt->execute([':rid' => $reservaId]);
            $reserva = $stmt->fetch();
            if (!$reserva) throw new Exception("Reserva não encontrada");

            if ($reserva['status'] === 'cancelada') {
                $conn->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Reserva já estava cancelada',
                    'idempotent' => true,
                ]); exit();
            }

            $novoPagamentoStatus = $reserva['pagamento_status'] === 'pago'
                ? 'reembolsado' : $reserva['pagamento_status'];

            $conn->prepare("
                UPDATE {$tabela} SET status='cancelada', pagamento_status=:ps WHERE id=:rid
            ")->execute([':ps' => $novoPagamentoStatus, ':rid' => $reservaId]);

            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Reserva cancelada.',
                'data'    => [
                    'reserva_id'       => $reservaId,
                    'pagamento_status' => $novoPagamentoStatus,
                    'motivo'           => $motivo,
                ],
            ]); exit();

        } catch (Exception $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            throw $e;
        }
    }

    // ============================================
    // POST (default) — Criar Reserva
    // ============================================
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) throw new Exception("Dados inválidos");

        // Nunca confiar no texto status_pagamento enviado pelo navegador.
        // Havendo sessao, a reserva pertence a conta autenticada.
        $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($authorization !== '') {
            require_once __DIR__ . '/reserva-validacao.php';
            $contaId = utilizadorReservaQR($conn, 'host');
            $stmtConta = $conn->prepare('SELECT id, nome, email, phone, google_id FROM usuarios WHERE id=:id LIMIT 1');
            $stmtConta->execute([':id' => $contaId]);
            $contaCheckout = $stmtConta->fetch();
            if (!$contaCheckout) throw new Exception('Utilizador da sessao nao encontrado.');
            $input['usuario'] = [
                'email' => $contaCheckout['email'],
                'nome_completo' => $contaCheckout['nome'],
                'phone' => $contaCheckout['phone'],
                'google_id' => $contaCheckout['google_id'],
            ];
        }
        // O intent antigo continua a funcionar; verificamos a cobranca aqui.
        $stripePago = pagamentoCheckoutStripe($input);
        $estadoReserva = 'confirmada';
        $estadoPagamento = 'pago';
        $idempotency_key = $input['stripe_id'];
        if ($stripePago) {
            // Serializa pedidos com a mesma cobranca, incluindo categorias diferentes.
            $lockName = 'checkout_stripe_' . substr(hash('sha256', $input['stripe_id']), 0, 45);
            $lock = $conn->prepare('SELECT GET_LOCK(:nome, 5)');
            $lock->execute([':nome' => $lockName]);
            if ((int)$lock->fetchColumn() !== 1) throw new Exception('Pagamento em processamento. Aguarde e tente novamente.');
            register_shutdown_function(static function () use ($conn, $lockName) {
                try {
                    if ($conn->inTransaction()) $conn->rollBack();
                    $release = $conn->prepare('SELECT RELEASE_LOCK(:nome)');
                    $release->execute([':nome' => $lockName]);
                } catch (Throwable $e) { error_log('Checkout: falha ao libertar bloqueio.'); }
            });
            $tables = ['Alojamento'=>'reservas_alojamento', 'Experiencia'=>'reservas_experiencia', 'Carro'=>'reservas_carro'];
            foreach ($tables as $cat => $table) {
                $used = $conn->prepare('SELECT id FROM ' . $table . ' WHERE idempotency_key=:ref LIMIT 1');
                $used->execute([':ref' => $input['stripe_id']]);
                if ($used->fetchColumn() && $cat !== ($input['category'] ?? 'Experiencia')) {
                    throw new Exception('Esta cobranca ja foi utilizada noutra reserva.');
                }
            }
        }
        if ($idempotency_key) {
            $categoryIdem = $input['category'] ?? 'Experiencia';
            $tabelaIdem = null;
            if ($categoryIdem === 'Alojamento')      $tabelaIdem = 'reservas_alojamento';
            elseif ($categoryIdem === 'Experiencia') $tabelaIdem = 'reservas_experiencia';
            elseif ($categoryIdem === 'Carro')       $tabelaIdem = 'reservas_carro';

            if ($tabelaIdem) {
                try {
                    $stmtIdem = $conn->prepare("
                        SELECT id, codigo_reserva, status, pagamento_status FROM {$tabelaIdem}
                        WHERE idempotency_key = :key LIMIT 1
                    ");
                    $stmtIdem->execute([':key' => $idempotency_key]);
                    $existente = $stmtIdem->fetch();
                    if ($existente) {
                        echo json_encode([
                            'success' => true,
                            'message' => 'Reserva já registada anteriormente.',
                            'data' => [
                                'reserva_id'       => (int)$existente['id'],
                                'codigo_reserva'   => $existente['codigo_reserva'],
                                'comprovativo_url' => comprovativoCheckout($categoryIdem, $existente['codigo_reserva']),
                                'status'           => $existente['status'],
                                'pagamento_status' => $existente['pagamento_status'],
                                'category'         => $categoryIdem,
                            ],
                            'idempotente' => true,
                        ], JSON_UNESCAPED_UNICODE); exit();
                    }
                } catch (Throwable $e) {
                    error_log("Idempotency check: " . $e->getMessage());
                }
            }
        }

        $conn->beginTransaction();
        try {
            $category  = $input['category'] ?? 'Experiencia';
            $google_id = $input['usuario']['google_id'] ?? null;
            $email     = $input['usuario']['email'] ?? null;
            $nome      = $input['usuario']['nome_completo'] ?? $input['usuario']['name'] ?? null;
            $phone     = $input['usuario']['phone'] ?? null;

            if (!$google_id && !$email) throw new Exception("Google ID ou Email não fornecido");

            $usuario_id = null;
            if ($google_id) {
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE google_id = :g");
                $stmt->execute([':g' => $google_id]);
                $u = $stmt->fetch();
                if ($u) $usuario_id = $u['id'];
            }
            if (!$usuario_id && $email) {
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = :e");
                $stmt->execute([':e' => $email]);
                $u = $stmt->fetch();
                if ($u) {
                    $usuario_id = $u['id'];
                    if ($google_id) {
                        $conn->prepare("UPDATE usuarios SET google_id=:g WHERE id=:id")
                             ->execute([':g'=>$google_id, ':id'=>$usuario_id]);
                    }
                }
            }
            if (!$usuario_id) {
                $conn->prepare("
                    INSERT INTO usuarios (email, nome, phone, google_id, created_at)
                    VALUES (:email, :nome, :phone, :google_id, NOW())
                ")->execute([':email'=>$email, ':nome'=>$nome, ':phone'=>$phone, ':google_id'=>$google_id]);
                $usuario_id = $conn->lastInsertId();
            } else {
                $conn->prepare("
                    UPDATE usuarios
                    SET phone = COALESCE(:phone, phone), nome = COALESCE(:nome, nome)
                    WHERE id = :id
                ")->execute([':phone'=>$phone, ':nome'=>$nome, ':id'=>$usuario_id]);
            }

            $codigoReserva = 'RES-' . strtoupper(uniqid()) . '-' . date('Ymd');
            $reservaId = null;

            if ($category === 'Experiencia') {
                $experiencia_id     = $input['reserva']['experiencia_id'] ?? null;
                $data_participacao  = $input['reserva']['data_participacao'] ?? null;
                $horario            = $input['reserva']['horario'] ?? null;
                $quantidade_pessoas = $input['reserva']['quantidade_pessoas'] ?? 1;
                $preco_total        = $input['reserva']['preco_total'] ?? 0;

                if (!$experiencia_id) throw new Exception("ID da experiência não fornecido");

                $conn->prepare("
                    INSERT INTO reservas_experiencia
                        (usuario_id, experiencia_id, codigo_reserva, data_participacao,
                         horario, quantidade_pessoas, preco_total, status, pagamento_status, idempotency_key, data_reserva)
                    VALUES
                        (:uid, :eid, :code, :dp, :hr, :qp, :pt, :estado, :pagamento, :idem, NOW())
                ")->execute([
                    ':uid'=>$usuario_id, ':eid'=>$experiencia_id, ':code'=>$codigoReserva,
                    ':dp'=>$data_participacao, ':hr'=>$horario, ':qp'=>$quantidade_pessoas,
                    ':pt'=>$preco_total, ':idem'=>$idempotency_key,
                    ':estado'=>$estadoReserva, ':pagamento'=>$estadoPagamento,
                ]);
                $reservaId = $conn->lastInsertId();

            } elseif ($category === 'Alojamento') {
                $alojamento_id       = (int)($input['reserva']['alojamento_id'] ?? 0);
                $data_checkin        = $input['reserva']['data_checkin'] ?? null;
                $data_checkout       = $input['reserva']['data_checkout'] ?? null;
                $quantidade_hospedes = $input['reserva']['quantidade_hospedes'] ?? 1;
                $noites              = $input['reserva']['noites'] ?? 1;
                $quartos             = $input['reserva']['quartos'] ?? [];
                $fin                 = $input['reserva']['financeiro'] ?? [];

                $preco_total        = (float)($input['reserva']['preco_total'] ?? 0);
                $subtotal_noites    = (float)($fin['subtotalNoites'] ?? 0);
                $taxa_limpeza       = (float)($fin['taxaLimpeza'] ?? 0);
                $comissao_morabeza  = (float)($fin['comissaoMorabeza'] ?? 0);
                $valor_liquido_anf  = (float)($fin['valorLiquidoAnfitriao'] ?? 0);

                if (!$alojamento_id) throw new Exception("ID do alojamento não fornecido");
                if (!$data_checkin || !$data_checkout) throw new Exception("Datas em falta");

                $stmtAloj = $conn->prepare("SELECT modelo_venda, status FROM alojamentos WHERE id=:aid LIMIT 1");
                $stmtAloj->execute([':aid'=>$alojamento_id]);
                $aloj = $stmtAloj->fetch();
                if (!$aloj) throw new Exception("Alojamento não encontrado");
                if ($aloj['status'] !== 'aprovado') throw new Exception("Alojamento não está disponível");

                $tipo_venda = $aloj['modelo_venda'];

                if ($tipo_venda === 'por_quarto' && empty($quartos)) {
                    throw new Exception("Reserva 'por_quarto' exige array 'quartos'.");
                }

                $conn->prepare("
                    INSERT INTO reservas_alojamento
                        (usuario_id, alojamento_id, codigo_reserva, data_checkin, data_checkout,
                         quantidade_hospedes, noites, preco_total,
                         subtotal_noites, taxa_limpeza, comissao_morabeza,
                         valor_liquido_anfitriao, tipo_venda,
                         status, pagamento_status, idempotency_key, data_reserva)
                    VALUES
                        (:uid, :aid, :code, :cin, :cout,
                         :qh, :noites, :pt,
                         :sn, :tl, :cm, :vla, :tv,
                         :estado, :pagamento, :idem, NOW())
                ")->execute([
                    ':uid'=>$usuario_id, ':aid'=>$alojamento_id, ':code'=>$codigoReserva,
                    ':cin'=>$data_checkin, ':cout'=>$data_checkout,
                    ':qh'=>$quantidade_hospedes, ':noites'=>$noites, ':pt'=>$preco_total,
                    ':sn'=>$subtotal_noites, ':tl'=>$taxa_limpeza, ':cm'=>$comissao_morabeza,
                    ':vla'=>$valor_liquido_anf, ':tv'=>$tipo_venda, ':idem'=>$idempotency_key,
                    ':estado'=>$estadoReserva, ':pagamento'=>$estadoPagamento,
                ]);
                $reservaId = $conn->lastInsertId();

                if ($tipo_venda === 'por_quarto') {
                    $stmtQ = $conn->prepare("
                        INSERT INTO reservas_alojamento_quartos
                            (reserva_id, tipo_quarto_id, quantidade, preco_noite, capacidade)
                        VALUES (:rid, :tid, :qtd, :preco, :cap)
                    ");
                    $inseridos = 0;
                    foreach ($quartos as $q) {
                        $qid   = (int)($q['tipo_quarto_id'] ?? $q['tipoQuartoId'] ?? 0);
                        $qtd   = max(1, (int)($q['quantidade'] ?? 1));
                        $preco = (float)($q['preco_noite'] ?? $q['precoNoite'] ?? 0);
                        $cap   = (int)($q['capacidade'] ?? 0);
                        if (!$qid) continue;
                        $stmtQ->execute([
                            ':rid'=>$reservaId, ':tid'=>$qid, ':qtd'=>$qtd,
                            ':preco'=>$preco, ':cap'=>$cap,
                        ]);
                        $inseridos++;
                    }
                    if ($inseridos === 0) {
                        throw new Exception("Nenhuma linha de quarto válida foi inserida.");
                    }
                }

            } elseif ($category === 'Carro') {
                $carro_id = $input['reserva']['carro_id'] ?? $input['reserva']['id'] ?? null;
                $data_levantamento = $input['reserva']['checkIn'] ?? $input['reserva']['data_levantamento'] ?? null;
                $data_devolucao    = $input['reserva']['checkOut'] ?? $input['reserva']['data_devolucao'] ?? null;
                $dias              = $input['reserva']['dias'] ?? 1;
                $preco_total       = $input['reserva']['preco_total'] ?? 0;

                $num_documento     = $input['participante_principal']['num_documento'] ?? '';
                $hora_levantamento = $input['participante_principal']['hora_levantamento'] ?? '10:00';
                $observacoes       = $input['participante_principal']['observacoes'] ?? '';
                $carta_conducao    = $input['participante_principal']['carta_conducao_nome'] ?? '';

                $conn->prepare("
                    INSERT INTO reservas_carro
                        (usuario_id, carro_id, codigo_reserva, data_levantamento, data_devolucao, dias,
                         preco_total, status, pagamento_status, num_documento, hora_levantamento,
                         observacoes, carta_conducao, idempotency_key, data_reserva)
                    VALUES
                        (:uid, :cid, :code, :in, :out, :ds,
                         :prc, :estado, :pagamento, :doc, :hora,
                         :obs, :carta, :idem, NOW())
                ")->execute([
                    ':uid'=>$usuario_id, ':cid'=>$carro_id, ':code'=>$codigoReserva,
                    ':in'=>$data_levantamento, ':out'=>$data_devolucao, ':ds'=>$dias,
                    ':prc'=>$preco_total, ':doc'=>$num_documento, ':hora'=>$hora_levantamento,
                    ':obs'=>$observacoes, ':carta'=>$carta_conducao, ':idem'=>$idempotency_key,
                    ':estado'=>$estadoReserva, ':pagamento'=>$estadoPagamento,
                ]);
                $reservaId = $conn->lastInsertId();
            } else {
                throw new Exception("Categoria inválida: " . $category);
            }

            $stmtP = $conn->prepare("
                INSERT INTO participantes
                    (usuario_id, reserva_id, nome_completo, idade, nacionalidade, tipo, category)
                VALUES
                    (:uid, :rid, :nome, :idade, :nac, :tipo, :cat)
            ");

            if (!empty($input['participante_principal']['nome_completo'])) {
                $stmtP->execute([
                    ':uid'=>$usuario_id, ':rid'=>$reservaId,
                    ':nome'=>$input['participante_principal']['nome_completo'],
                    ':idade'=>$input['participante_principal']['idade'] ?? 'adulto',
                    ':nac'=>$input['participante_principal']['nacionalidade'] ?? 'Cabo Verde',
                    ':tipo'=>'principal', ':cat'=>$category,
                ]);
            }
            if (!empty($input['participantes_adicionais']) && $category !== 'Carro') {
                foreach ($input['participantes_adicionais'] as $p) {
                    if (empty($p['nome_completo'])) continue;
                    $stmtP->execute([
                        ':uid'=>$usuario_id, ':rid'=>$reservaId,
                        ':nome'=>$p['nome_completo'],
                        ':idade'=>$p['idade'] ?? 'adulto',
                        ':nac'=>$p['nacionalidade'] ?? 'Cabo Verde',
                        ':tipo'=>'adicional', ':cat'=>$category,
                    ]);
                }
            }

            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Reserva criada com sucesso',
                'data'    => [
                    'reserva_id'       => $reservaId,
                    'codigo_reserva'   => $codigoReserva,
                    'comprovativo_url' => comprovativoCheckout($category, $codigoReserva),
                    'usuario_id'       => $usuario_id,
                    'status'           => $estadoReserva,
                    'pagamento_status' => $estadoPagamento,
                    'category'         => $category,
                ],
            ]);

        } catch (Exception $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            throw $e;
        }

    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) throw new Exception("Dados inválidos");

        $nome_antigo   = $input['nome_antigo'] ?? null;
        $nome_novo     = $input['nome_novo'] ?? null;
        $idade         = $input['idade'] ?? 'adulto';
        $nacionalidade = $input['nacionalidade'] ?? 'Cabo Verde';
        $email         = $input['email'] ?? null;
        $category      = $input['category'] ?? null;

        if (!$nome_antigo || !$nome_novo || !$email) {
            throw new Exception("Dados incompletos para atualização");
        }

        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = :e");
        $stmt->execute([':e'=>$email]);
        $user = $stmt->fetch();
        if (!$user) throw new Exception("Usuário não encontrado");

        $usuario_id = $user['id'];

        $sql = "UPDATE participantes
                SET nome_completo=:nn, idade=:id, nacionalidade=:nac
                WHERE nome_completo=:na AND usuario_id=:uid";
        $params = [
            ':nn'=>$nome_novo, ':id'=>$idade, ':nac'=>$nacionalidade,
            ':na'=>$nome_antigo, ':uid'=>$usuario_id,
        ];
        if ($category) { $sql .= " AND category=:cat"; $params[':cat'] = $category; }

        $stmtU = $conn->prepare($sql);
        $stmtU->execute($params);

        echo json_encode([
            'success'       => true,
            'message'       => 'Participante atualizado com sucesso',
            'updated_count' => $stmtU->rowCount(),
        ]);

    } elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $dv);
        $participante_id = $dv['id'] ?? null;
        $nome_completo   = $dv['nome_completo'] ?? null;
        $email           = $dv['email'] ?? null;
        $category        = $dv['category'] ?? null;

        if (!$participante_id && !$nome_completo) {
            throw new Exception("ID ou Nome do participante não fornecido");
        }

        $usuario_id = null;
        if ($email) {
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = :e");
            $stmt->execute([':e'=>$email]);
            $u = $stmt->fetch();
            if ($u) $usuario_id = $u['id'];
        }
        if (!$usuario_id) throw new Exception("Usuário não encontrado");

        if ($participante_id) {
            $sql = "DELETE FROM participantes WHERE id=:id AND usuario_id=:uid";
            $params = [':id'=>$participante_id, ':uid'=>$usuario_id];
            if ($category) { $sql .= " AND category=:cat"; $params[':cat']=$category; }
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        } else if ($nome_completo) {
            $sql = "DELETE FROM participantes WHERE nome_completo=:nc AND usuario_id=:uid";
            $params = [':nc'=>$nome_completo, ':uid'=>$usuario_id];
            if ($category) { $sql .= " AND category=:cat"; $params[':cat']=$category; }
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        }

        echo json_encode([
            'success'       => true,
            'message'       => 'Participante removido com sucesso',
            'deleted_count' => $stmt->rowCount(),
        ]);

    } elseif ($method === 'GET') {
        $email     = $_GET['email'] ?? null;
        $google_id = $_GET['google_id'] ?? null;
        $category  = $_GET['category'] ?? null;

        if (!$email && !$google_id) {
            echo json_encode([
                'success'                  => true,
                'usuario'                  => null,
                'participantes_anteriores' => [],
                'message'                  => 'Nenhum email ou google_id fornecido',
            ]); exit();
        }

        $usuario_id = null;
        $userData   = null;

        if ($google_id) {
            $stmt = $conn->prepare("SELECT id, nome, email, phone FROM usuarios WHERE google_id=:g");
            $stmt->execute([':g'=>$google_id]);
            $userData = $stmt->fetch();
            if ($userData) $usuario_id = $userData['id'];
        }
        if (!$usuario_id && $email) {
            $stmt = $conn->prepare("SELECT id, nome, email, phone FROM usuarios WHERE email=:e");
            $stmt->execute([':e'=>$email]);
            $userData = $stmt->fetch();
            if ($userData) $usuario_id = $userData['id'];
        }

        $partAnteriores = [];
        if ($usuario_id) {
            $sql = "
                SELECT p.nome_completo, p.idade, p.nacionalidade, p.tipo, p.category,
                       COUNT(p.id) as vezes_utilizado
                FROM participantes p
                WHERE p.usuario_id = :uid AND p.tipo != 'principal'
            ";
            $params = [':uid'=>$usuario_id];
            if ($category) { $sql .= " AND p.category=:cat"; $params[':cat']=$category; }
            $sql .= " GROUP BY p.nome_completo, p.idade, p.nacionalidade, p.tipo, p.category
                      ORDER BY vezes_utilizado DESC LIMIT 50";

            $stmtP = $conn->prepare($sql);
            $stmtP->execute($params);
            $partAnteriores = $stmtP->fetchAll();
        }

        echo json_encode([
            'success'                  => true,
            'usuario'                  => $userData,
            'participantes_anteriores' => $partAnteriores,
            'total_participantes'      => count($partAnteriores),
            'categoria_filtrada'       => $category,
        ]);
    }

} catch(PDOException $e) {
    if ($e->getCode() == 23000 || strpos($e->getMessage(), 'uk_idempotency') !== false) {
        if (!empty($idempotency_key) && !empty($tabelaIdem)) {
            try {
                $stmtIdem = $conn->prepare("
                    SELECT id, codigo_reserva, status, pagamento_status FROM {$tabelaIdem}
                    WHERE idempotency_key=:key LIMIT 1
                ");
                $stmtIdem->execute([':key'=>$idempotency_key]);
                $existente = $stmtIdem->fetch();
                if ($existente) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Reserva já registada anteriormente.',
                        'data' => [
                            'reserva_id'     => (int)$existente['id'],
                            'codigo_reserva' => $existente['codigo_reserva'],
                            'comprovativo_url' => comprovativoCheckout($category ?? 'Experiencia', $existente['codigo_reserva']),
                            'status' => $existente['status'],
                            'pagamento_status' => $existente['pagamento_status'],
                            'category'       => $category ?? 'Experiencia',
                        ],
                        'idempotente' => true,
                    ], JSON_UNESCAPED_UNICODE); exit();
                }
            } catch (Throwable $e2) { error_log("Idempotency catch: " . $e2->getMessage()); }
        }
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Erro na base de dados: " . $e->getMessage(),
    ]);
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage(),
    ]);
}
?>
