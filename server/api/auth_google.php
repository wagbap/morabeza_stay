<?php
// api/auth.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// ==========================================================
require_once __DIR__ . '/config.php';
if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
if (!isset($conn) || !($conn instanceof PDO)) {
    http_response_code(503);
    echo json_encode(['status' => 'error', 'message' => 'Configuracao indisponivel.']);
    exit;
}
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
require_once __DIR__ . '/reserva-validacao.php';
$authSecrets = require __DIR__ . '/auth-secrets.local.php';

// ==========================================================
// FUNÇÃO NATIVA PARA GERAR JWT SEM COMPOSER
// ==========================================================
function gerarJWTNativo($user_id, $email, $nome = '', $foto = '') {
    $secret_key = $GLOBALS['authSecrets']['jwt_secret'];

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = [
        'iat' => time(),
        'exp' => time() + (86400 * 7),
        'data' => [
            'id'      => $user_id,
            'email'   => $email,
            'name'    => $nome,
            'foto'    => $foto,
            'picture' => $foto,
        ],
    ];

    $base64UrlHeader  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// ==========================================================
// FUNÇÕES AUXILIARES
// ==========================================================

function getUserRoles($conn, $user_id) {
    $stmt = $conn->prepare("
        SELECT r.name, ur.status 
        FROM roles r 
        INNER JOIN user_roles ur ON r.id = ur.role_id 
        WHERE ur.user_id = :user_id
    ");
    $stmt->execute([':user_id' => $user_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Envia email via SMTP (com otimizações)
 */
function sendEmailSMTP($to, $subject, $htmlMessage) {
    require_once __DIR__ . '/mail/Exception.php';
    require_once __DIR__ . '/mail/PHPMailer.php';
    require_once __DIR__ . '/mail/SMTP.php';

    $EMAIL_USER = $GLOBALS['authSecrets']['smtp_user'];
    $EMAIL_PASSWORD = $GLOBALS['authSecrets']['smtp_password'];

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $EMAIL_USER;
        $mail->Password   = trim($EMAIL_PASSWORD);
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        // ✅ OTIMIZAÇÕES
        $mail->Timeout       = 10;
        $mail->SMTPKeepAlive = true;
        $mail->SMTPDebug     = 0;

        $mail->setFrom($EMAIL_USER, 'Morabeza Stay');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlMessage;

        return $mail->send();
    } catch (Exception $e) {
        error_log("Erro ao enviar email: " . $e->getMessage());
        return false;
    }
}

/**
 * ✅ Responde JÁ ao cliente e envia email em background.
 * Suporta LiteSpeed (litespeed_finish_request) — o teu servidor.
 */
function sendEmailInBackground($to, $subject, $htmlMessage) {
    if (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    } elseif (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        if (ob_get_level() > 0) @ob_end_flush();
        @flush();
    }

    ignore_user_abort(true);
    @set_time_limit(30);

    sendEmailSMTP($to, $subject, $htmlMessage);
}

function generateOtpEmail($otp, $nome = '') {
    $saudacao = $nome ? "Olá, $nome!" : "Olá!";

    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 550px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
            .header { background: #003580; padding: 25px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 26px; }
            .header span { color: #FFD700; }
            .content { padding: 30px; }
            .code-box { text-align: center; margin: 30px 0; }
            .code-box span { background: #f0f7ff; border: 2px dashed #003580; padding: 12px 30px; font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #003580; display: inline-block; border-radius: 6px; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #777; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'><h1>Morabeza<span>Stay</span></h1></div>
            <div class='content'>
                <h2>$saudacao</h2>
                <p>Utilize o código abaixo para verificar o seu email:</p>
                <div class='code-box'><span>$otp</span></div>
                <p>Este código é <strong>válido por 10 minutos</strong>.</p>
                <p style='color: #666; font-size: 12px;'>Se não solicitou esta verificação, ignore este email.</p>
            </div>
            <div class='footer'><p>&copy; 2024-2026 Morabeza Stay</p></div>
        </div>
    </body>
    </html>";
}

function generateResetEmail($otp, $nome) {
    return "
   <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 550px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
            .header { background: #003580; padding: 25px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 26px; }
            .header span { color: #FFD700; }
            .content { padding: 30px; }
            .code-box { text-align: center; margin: 30px 0; }
            .code-box span { background: #f0f7ff; border: 2px dashed #003580; padding: 12px 30px; font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #003580; display: inline-block; border-radius: 6px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 6px; font-size: 13px; color: #856404; margin-top: 20px; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #777; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'><h1>Morabeza<span>Stay</span></h1></div>
            <div class='content'>
                <h2>Olá, $nome!</h2>
                <p>Recebemos um pedido para redefinir a sua palavra-passe. Utilize o código abaixo:</p>
                <div class='code-box'><span>$otp</span></div>
                <p>Este código é <strong>válido por 10 minutos</strong>.</p>
                <div class='warning'>
                    ⚠️ Se não solicitou esta alteração, ignore este email.
                </div>
            </div>
            <div class='footer'><p>&copy; 2024-2026 Morabeza Stay</p></div>
        </div>
    </body>
    </html>";
}

// ==========================================================
// LEITURA DOS DADOS DA REQUISIÇÃO
// ==========================================================
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON);

if (!$data) $data = (object)$_POST;
if (empty((array)$data) && !empty($_GET)) $data = (object)$_GET;

$action = isset($data->action) ? trim($data->action) : '';

// ==========================================================
// ACTION 1: VERIFICAR EMAIL
// ==========================================================
if ($action === 'check_email') {
    $email = isset($data->email) ? trim($data->email) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Email inválido"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nome, senha, email_verificado FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $has_password = !empty($user['senha']);
        $is_verified = ($user['email_verificado'] == 1);

        echo json_encode([
            "status"           => 'exists',
            "has_password"     => $has_password,
            "user_id"          => $user['id'],
            "email_verificado" => $is_verified,
            "nome"             => $user['nome'],
        ]);
    } else {
        echo json_encode(["status" => 'new_user']);
    }
    exit();
}

// ==========================================================
// ACTION 2: LOGIN COM SENHA
// ==========================================================
if ($action === 'login_with_password') {
    $email = isset($data->email) ? trim($data->email) : '';
    $senha = isset($data->senha) ? trim($data->senha) : '';

    if (empty($email) || empty($senha)) {
        echo json_encode(["status" => "error", "message" => "Email e senha são obrigatórios"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nome, email, phone, foto, senha, email_verificado FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Email não encontrado"]);
        exit();
    }

    if (empty($user['senha'])) {
        echo json_encode(["status" => "error", "message" => "Esta conta foi criada com Google. Use o botão do Google."]);
        exit();
    }

    if (!password_verify($senha, $user['senha'])) {
        echo json_encode(["status" => "error", "message" => "Senha incorreta"]);
        exit();
    }

    $token = gerarJWTNativo($user['id'], $user['email'], $user['nome'], $user['foto']);
    $roles = getUserRoles($conn, $user['id']);

    echo json_encode([
        "status" => "success",
        "token"  => $token,
        "validation_token" => emitirTokenValidacaoReservaQR($conn, (int) $user['id']),
        "user"   => [
            "id"               => $user['id'],
            "nome"             => $user['nome'],
            "email"            => $user['email'],
            "phone"            => $user['phone'],
            "foto"             => $user['foto'],
            "picture"          => $user['foto'],
            "email_verificado" => ($user['email_verificado'] == 1),
            "roles"            => $roles,
        ],
    ]);
    exit();
}

// ==========================================================
// ACTION 3: ENVIAR OTP PARA REGISTO (OTIMIZADO)
// ==========================================================
if ($action === 'send_otp') {
    $email = isset($data->email) ? trim($data->email) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Email inválido"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, senha, email_verificado, nome FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing && !empty($existing['senha'])) {
        echo json_encode(["status" => "error", "message" => "Email já registado. Faça login."]);
        exit();
    }

    $otp = rand(100000, 999999);
    $expira = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    if ($existing) {
        $stmt = $conn->prepare("UPDATE usuarios SET 
            codigo_otp = :otp, 
            otp_expira = :expira, 
            email_verificado = 0,
            email_verificado_em = NULL
            WHERE id = :id");
        $stmt->execute([
            ':otp'    => $otp,
            ':expira' => $expira,
            ':id'     => $existing['id'],
        ]);
        $user_id = $existing['id'];
        $nome = $existing['nome'];
    } else {
        $stmt = $conn->prepare("INSERT INTO usuarios (
            email, nome, senha, foto, phone, criado_em, codigo_otp, otp_expira,
            email_verificado, email_verificado_em, google_id, reset_otp, reset_otp_expira
        ) VALUES (
            :email, '', '', '', '', NOW(), :otp, :expira, 0, NULL, NULL, NULL, NULL
        )");
        $stmt->execute([
            ':email'  => $email,
            ':otp'    => $otp,
            ':expira' => $expira,
        ]);

        $user_id = $conn->lastInsertId();
        $nome = '';

        $stmt = $conn->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (:user_id, 1)");
        $stmt->execute([':user_id' => $user_id]);
    }

    // ✅ Responde JÁ ao cliente (antes de enviar email)
    echo json_encode([
        "status"  => "otp_sent",
        "message" => "Código de verificação enviado para o email",
        "user_id" => $user_id,
    ]);

    // ✅ Email em background (LiteSpeed)
    $subject = "🔐 Código de verificação Morabeza Stay";
    $htmlMessage = generateOtpEmail($otp, $nome);
    sendEmailInBackground($email, $subject, $htmlMessage);

    exit();
}

// ==========================================================
// ACTION 4: VERIFICAR OTP PARA REGISTO
// ==========================================================
if ($action === 'verify_otp') {
    $email = isset($data->email) ? trim($data->email) : '';
    $otp = isset($data->otp) ? trim($data->otp) : '';

    if (empty($email) || empty($otp)) {
        echo json_encode(["status" => "error", "message" => "Email e código são obrigatórios"]);
        exit();
    }

    if (strlen($otp) !== 6 || !ctype_digit($otp)) {
        echo json_encode(["status" => "error", "message" => "Código deve ter 6 dígitos"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, codigo_otp, otp_expira, email_verificado FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
        exit();
    }

    if (empty($user['codigo_otp'])) {
        echo json_encode(["status" => "error", "message" => "Nenhum código de verificação encontrado"]);
        exit();
    }

    if ($user['codigo_otp'] != $otp) {
        echo json_encode(["status" => "error", "message" => "Código inválido"]);
        exit();
    }

    if (date('Y-m-d H:i:s') > $user['otp_expira']) {
        echo json_encode(["status" => "error", "message" => "Código expirado"]);
        exit();
    }

    $stmt = $conn->prepare("UPDATE usuarios SET 
        codigo_otp = NULL, 
        otp_expira = NULL, 
        email_verificado = 1,
        email_verificado_em = NOW() 
        WHERE id = :id");
    $stmt->execute([':id' => $user['id']]);

    echo json_encode([
        "status"  => "success",
        "user_id" => $user['id'],
        "email"   => $email,
        "message" => "Email verificado com sucesso!",
    ]);
    exit();
}

// ==========================================================
// ACTION 5: COMPLETAR REGISTO
// ==========================================================
if ($action === 'complete_register') {
    $user_id        = isset($data->user_id) ? (int)$data->user_id : 0;
    $nome           = isset($data->nome) ? trim($data->nome) : '';
    $senha          = isset($data->senha) ? trim($data->senha) : '';
    $phone          = isset($data->telefone) ? trim($data->telefone) : '';
    $selected_roles = isset($data->roles) ? $data->roles : ['hospede'];

    if ($user_id <= 0) {
        echo json_encode(["status" => "error", "message" => "ID do usuário inválido"]);
        exit();
    }

    if (empty($nome) || empty($senha)) {
        echo json_encode(["status" => "error", "message" => "Nome e senha são obrigatórios"]);
        exit();
    }

    if (strlen($senha) < 6) {
        echo json_encode(["status" => "error", "message" => "A senha deve ter pelo menos 6 caracteres"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, email_verificado, senha FROM usuarios WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
        exit();
    }

    if ($user['email_verificado'] != 1) {
        echo json_encode([
            "status" => "error",
            "message" => "Email não verificado. Complete a verificação do email primeiro.",
        ]);
        exit();
    }

    if (!empty($user['senha'])) {
        echo json_encode(["status" => "error", "message" => "Usuário já registado"]);
        exit();
    }

    $email      = $user['email'];
    $senhaHash  = password_hash($senha, PASSWORD_DEFAULT);
    $avatarUrl  = 'https://www.gravatar.com/avatar/' . md5(strtolower($email)) . '?d=mp';

    $stmt = $conn->prepare("UPDATE usuarios SET 
        nome = :nome, 
        senha = :senha, 
        phone = :phone, 
        foto = :foto,
        updated_at = NOW()
        WHERE id = :id");
    $stmt->execute([
        ':nome'  => $nome,
        ':senha' => $senhaHash,
        ':phone' => $phone,
        ':foto'  => $avatarUrl,
        ':id'    => $user_id,
    ]);

    $conn->prepare("DELETE FROM user_roles WHERE user_id = :user_id")->execute([':user_id' => $user_id]);

    if (!in_array('hospede', $selected_roles)) {
        $selected_roles[] = 'hospede';
    }

    foreach ($selected_roles as $roleName) {
        $stmt = $conn->prepare("SELECT id FROM roles WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $roleName]);
        $role_id = $stmt->fetchColumn();
        if ($role_id) {
            $stmt = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)");
            $stmt->execute([':user_id' => $user_id, ':role_id' => $role_id]);
        }
    }

    $token = gerarJWTNativo($user_id, $email, $nome, $avatarUrl);
    $roles = getUserRoles($conn, $user_id);

    echo json_encode([
        "status"  => "success",
        "token"   => $token,
        "user"    => [
            "id"               => $user_id,
            "nome"             => $nome,
            "email"            => $email,
            "phone"            => $phone,
            "foto"             => $avatarUrl,
            "picture"          => $avatarUrl,
            "email_verificado" => true,
            "roles"            => $roles,
        ],
        "message" => "Registro completo com sucesso!",
    ]);
    exit();
}

// ==========================================================
// ACTION 6: ENVIAR OTP PARA RESET PASSWORD (OTIMIZADO)
// ==========================================================
if ($action === 'send_reset_otp') {
    $email = isset($data->email) ? trim($data->email) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Email inválido"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nome FROM usuarios WHERE email = :email AND senha != '' LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Email não encontrado"]);
        exit();
    }

    $otp    = rand(100000, 999999);
    $expira = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $stmt = $conn->prepare("UPDATE usuarios SET reset_otp = :otp, reset_otp_expira = :expira WHERE id = :id");
    $stmt->execute([':otp' => $otp, ':expira' => $expira, ':id' => $user['id']]);

    // ✅ Responde JÁ ao cliente
    echo json_encode([
        "status"  => "reset_otp_sent",
        "message" => "Código de redefinição enviado para o email",
    ]);

    // ✅ Email em background
    $subject = "🔐 Código para redefinir sua senha - Morabeza Stay";
    $htmlMessage = generateResetEmail($otp, $user['nome']);
    sendEmailInBackground($email, $subject, $htmlMessage);

    exit();
}

// ==========================================================
// ACTION 7: VERIFICAR OTP PARA RESET PASSWORD
// ==========================================================
if ($action === 'verify_reset_otp') {
    $email = isset($data->email) ? trim($data->email) : '';
    $otp   = isset($data->otp) ? trim($data->otp) : '';

    if (empty($email) || empty($otp)) {
        echo json_encode(["status" => "error", "message" => "Email e código são obrigatórios"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, reset_otp, reset_otp_expira FROM usuarios WHERE email = :email AND senha != '' LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
        exit();
    }

    if ($user['reset_otp'] != $otp) {
        echo json_encode(["status" => "error", "message" => "Código inválido"]);
        exit();
    }

    if (date('Y-m-d H:i:s') > $user['reset_otp_expira']) {
        echo json_encode(["status" => "error", "message" => "Código expirado"]);
        exit();
    }

    echo json_encode([
        "status"  => "success",
        "user_id" => $user['id'],
        "email"   => $email,
    ]);
    exit();
}

// ==========================================================
// ACTION 8: RESET PASSWORD
// ==========================================================
if ($action === 'reset_password') {
    $user_id    = isset($data->user_id) ? (int)$data->user_id : 0;
    $nova_senha = isset($data->nova_senha) ? trim($data->nova_senha) : '';

    if ($user_id <= 0) {
        echo json_encode(["status" => "error", "message" => "ID do usuário inválido"]);
        exit();
    }

    if (strlen($nova_senha) < 6) {
        echo json_encode(["status" => "error", "message" => "A senha deve ter pelo menos 6 caracteres"]);
        exit();
    }

    try {
        $senhaHash = password_hash($nova_senha, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("UPDATE usuarios SET 
            senha = :senha, 
            reset_otp = NULL, 
            reset_otp_expira = NULL 
            WHERE id = :id");
        $result = $stmt->execute([':senha' => $senhaHash, ':id' => $user_id]);

        if ($result) {
            echo json_encode(["status" => "success", "message" => "Senha atualizada com sucesso"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Erro ao atualizar senha"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erro de base de dados: " . $e->getMessage()]);
    }
    exit();
}

// ==========================================================
// ACTION 9: LOGIN GOOGLE
// ==========================================================
if ($action === 'google_login') {
    $accessToken = isset($data->access_token) && is_string($data->access_token) ? $data->access_token : '';
    if ($accessToken === '' || strlen($accessToken) > 8192 || preg_match('/[\x00-\x20\x7F]/', $accessToken)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Autenticacao Google invalida.']);
        exit;
    }
    $curl = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
        CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2]);
    $profileJson = curl_exec($curl);
    $profileStatus = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    $profile = is_string($profileJson) ? json_decode($profileJson, true) : null;
    if ($profileStatus !== 200 || !is_array($profile) || empty($profile['sub']) ||
        !filter_var($profile['email'] ?? '', FILTER_VALIDATE_EMAIL) || ($profile['email_verified'] ?? false) !== true) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Autenticacao Google invalida.']);
        exit;
    }
    $google_id = (string) $profile['sub'];
    $email = (string) $profile['email'];
    $nome = (string) ($profile['name'] ?? '');
    $foto = (string) ($profile['picture'] ?? '');

    $stmt = $conn->prepare("SELECT id, nome, email, foto, phone, senha, email_verificado FROM usuarios WHERE google_id = :google_id OR email = :email LIMIT 1");
    $stmt->execute([':google_id' => $google_id, ':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $user_id   = $user['id'];
        $fotoFinal = $user['foto'] ?: $foto;

        if ($user['email_verificado'] != 1) {
            $conn->prepare("UPDATE usuarios SET 
                google_id = :google_id, 
                email_verificado = 1, 
                email_verificado_em = NOW(),
                foto = :foto
                WHERE id = :id")
                ->execute([
                    ':google_id' => $google_id,
                    ':foto'      => $fotoFinal,
                    ':id'        => $user_id,
                ]);
        } else {
            $conn->prepare("UPDATE usuarios SET google_id = :google_id, foto = :foto WHERE id = :id")
                ->execute([':google_id' => $google_id, ':foto' => $fotoFinal, ':id' => $user_id]);
        }

        $token = gerarJWTNativo($user_id, $user['email'], $user['nome'], $fotoFinal);
        $roles = getUserRoles($conn, $user_id);

        echo json_encode([
            "status" => "success",
            "token"  => $token,
            "validation_token" => emitirTokenValidacaoReservaQR($conn, (int) $user_id),
            "user"   => [
                "id"               => $user_id,
                "nome"             => $user['nome'],
                "email"            => $user['email'],
                "phone"            => $user['phone'],
                "foto"             => $fotoFinal,
                "picture"          => $fotoFinal,
                "email_verificado" => true,
                "roles"            => $roles,
            ],
        ]);
    } else {
        $stmt = $conn->prepare("INSERT INTO usuarios (
            google_id, email, nome, senha, foto, phone, email_verificado, email_verificado_em, criado_em
        ) VALUES (
            :google_id, :email, :nome, '', :foto, '', 1, NOW(), NOW()
        )");
        $stmt->execute([
            ':google_id' => $google_id,
            ':email'     => $email,
            ':nome'      => $nome,
            ':foto'      => $foto,
        ]);
        $user_id = $conn->lastInsertId();

        $stmt = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, 1)");
        $stmt->execute([':user_id' => $user_id]);

        $token = gerarJWTNativo($user_id, $email, $nome, $foto);

        echo json_encode([
            "status" => "success",
            "token"  => $token,
            "validation_token" => emitirTokenValidacaoReservaQR($conn, (int) $user_id),
            "user"   => [
                "id"               => $user_id,
                "nome"             => $nome,
                "email"            => $email,
                "phone"            => '',
                "foto"             => $foto,
                "picture"          => $foto,
                "email_verificado" => true,
                "roles"            => [["name" => "hospede", "status" => "active"]],
            ],
        ]);
    }
    exit();
}

// ==========================================================
// ACTION 10: RESEND OTP (OTIMIZADO)
// ==========================================================
if ($action === 'resend_otp') {
    $email = isset($data->email) ? trim($data->email) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Email inválido"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nome, email_verificado, senha FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
        exit();
    }

    if ($user['email_verificado'] == 1) {
        echo json_encode(["status" => "error", "message" => "Email já verificado"]);
        exit();
    }

    if (!empty($user['senha'])) {
        echo json_encode(["status" => "error", "message" => "Usuário já registado. Faça login."]);
        exit();
    }

    $otp    = rand(100000, 999999);
    $expira = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $stmt = $conn->prepare("UPDATE usuarios SET 
        codigo_otp = :otp, 
        otp_expira = :expira
        WHERE id = :id");
    $stmt->execute([
        ':otp'    => $otp,
        ':expira' => $expira,
        ':id'     => $user['id'],
    ]);

    // ✅ Responde JÁ ao cliente
    echo json_encode([
        "status"  => "success",
        "message" => "Código reenviado com sucesso",
    ]);

    // ✅ Email em background
    $subject = "🔐 Código de verificação Morabeza Stay";
    $htmlMessage = generateOtpEmail($otp, $user['nome']);
    sendEmailInBackground($email, $subject, $htmlMessage);

    exit();
}

// ==========================================================
// FALLBACK: Ação não reconhecida
// ==========================================================
echo json_encode(["status" => "error", "message" => "Ação não reconhecida: $action"]);
?>