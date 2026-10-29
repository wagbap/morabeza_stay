<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function respostaEmailReserva(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respostaEmailReserva(405, ['status' => 'error', 'message' => 'Use POST.']);
try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input)) throw new InvalidArgumentException('Invalid JSON object');
    $tipo = $input['tipo'] ?? '';
    $codigo = $input['codigo_reserva'] ?? '';
    if (!in_array($tipo, ['alojamento', 'carro', 'experiencia'], true) || !is_string($codigo) || $codigo === '' || strlen($codigo) > 50) {
        respostaEmailReserva(422, ['status' => 'error', 'message' => 'Tipo e codigo da reserva obrigatorios.']);
    }
    require __DIR__ . '/config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn = $pdo;
    if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    require_once __DIR__ . '/reserva-validacao.php';
    $userId = utilizadorReservaQR($conn, 'host'); // Identity only; no host role is required.
    require_once __DIR__ . '/email/dadosReserva.php';
    require_once __DIR__ . '/email/comprovativo.php';
    $d = carregarDadosEmailReserva($conn, $tipo, $codigo, $input);
    if ((int) $d['usuario_id'] !== $userId) respostaEmailReserva(404, ['status' => 'error', 'message' => 'Reserva nao encontrada.']);
    $settings = require __DIR__ . '/auth-secrets.local.php';
    $d['receipt_url'] = urlComprovativoReserva($d, (string) ($settings['jwt_secret'] ?? ''));
    $d['support_email'] = $settings['support_email'] ?? 'morabezastay@gmail.com';
    $body = renderizarConfirmacaoReserva($d);
    require_once __DIR__ . '/mail/Exception.php';
    require_once __DIR__ . '/mail/PHPMailer.php';
    require_once __DIR__ . '/mail/SMTP.php';
    $makeMailer = static function () use ($settings, $body) {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $settings['smtp_user'];
        $mail->Password = trim($settings['smtp_password']);
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->Timeout = 15;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($settings['smtp_user'], 'Morabeza Stay');
        $mail->isHTML(true);
        foreach (emailReservaAssets() as $name => $base64) {
            // Imagens CID sem referencia no HTML aparecem como anexos no Gmail.
            if (strpos($body, 'cid:morabeza-' . $name . '"') === false) continue;
            $mail->addStringEmbeddedImage(base64_decode($base64), 'morabeza-' . $name, $name . '.png', 'base64', 'image/png');
        }
        return $mail;
    };
    $subject = (in_array(strtolower($d['status']), ['confirmada', 'confirmado', 'approved'], true) ? 'Reserva confirmada' : 'Reserva recebida') . ' · ' . $codigo;
    $d['mapa_jpeg'] = mapaComprovativoReserva($d, $settings);
    $pdf = gerarPdfComprovativoReserva($d);
    $clientSent = false;
    $adminSent = false;
    try {
        $mail = $makeMailer();
        $mail->addAddress($d['email_cliente'], $d['nome_cliente']);
        $mail->addReplyTo($d['support_email'], 'Reservas Morabeza Stay');
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $subject . "\n" . $d['titulo'] . "\nTotal: " . emailReservaDinheiro($d['preco_total']) . "\nEstado: " . $d['status'] . "\nPagamento: " . $d['status_pagamento'] . "\n" . $d['receipt_url'];
        $mail->addStringAttachment($pdf, 'reserva-' . preg_replace('/[^a-zA-Z0-9_-]/', '', $codigo) . '.pdf', 'base64', 'application/pdf');
        $clientSent = $mail->send();
    } catch (Throwable $e) { error_log('[email-reserva][cliente] ' . $e->getMessage()); }
    if (!empty($settings['admin_email'])) {
        try {
            $admin = $makeMailer();
            $admin->addAddress($settings['admin_email']);
            $admin->addReplyTo($d['email_cliente'], $d['nome_cliente']);
            $admin->Subject = 'Nova reserva - ' . ucfirst($tipo) . ' · ' . $codigo;
            $admin->Body = $body;
            $admin->AltBody = 'Nova reserva ' . $codigo . ' · ' . $d['nome_cliente'] . ' · ' . emailReservaDinheiro($d['preco_total']);
            $adminSent = $admin->send();
        } catch (Throwable $e) { error_log('[email-reserva][admin] ' . $e->getMessage()); }
    }
    respostaEmailReserva($clientSent ? 200 : 502, ['status' => $clientSent ? 'success' : 'error', 'message' => $clientSent ? 'Email de reserva enviado.' : 'Nao foi possivel enviar o email.',
        'cliente_notificado' => $clientSent, 'admin_notificado' => $adminSent, 'codigo_reserva' => $codigo, 'tipo_reserva' => $tipo]);
} catch (JsonException $e) {
    respostaEmailReserva(400, ['status' => 'error', 'message' => 'JSON invalido.']);
} catch (Throwable $e) {
    error_log('[email-reserva] ' . $e->getMessage());
    respostaEmailReserva(500, ['status' => 'error', 'message' => 'Envio de email indisponivel.']);
}
