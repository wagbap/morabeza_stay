<?php
declare(strict_types=1);
require_once __DIR__ . '/../server/api/send_email.php';
function checkEmail($condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$fixtures = json_decode(file_get_contents(__DIR__ . '/../server/previews/reservas-exemplo.json'), true);
foreach (['pago', 'PAGO', ' paid ', 'succeeded'] as $status) {
    checkEmail(emailReservaEstaPaga(['status_pagamento' => $status]), 'Paid payment status not recognized');
}
foreach (['pendente', 'aguardando', 'processing', 'requires_action', 'refunded', ''] as $status) {
    checkEmail(!emailReservaEstaPaga(['status_pagamento' => $status]), 'Unpaid status must not be shown as paid');
}
checkEmail(emailReservaEstaPaga(['pagamento_status' => 'pago']), 'Database payment field not recognized');
foreach ($fixtures as $d) {
    $body = renderizarConfirmacaoReserva($d);
    checkEmail(strpos($body, '{{') === false, 'Unresolved template tokens');
    checkEmail(strpos($body, 'name="color-scheme" content="light dark"') !== false, 'Declare both email color schemes');
    checkEmail(strpos($body, '@media (prefers-color-scheme:dark)') !== false, 'Missing dark email palette');
    checkEmail(strpos($body, 'class="dm-badge-paid"') !== false, 'Paid badge needs the correct dark palette');
    checkEmail(strpos($body, 'class="brand-mark"') !== false, 'Logo needs a contrasting background');
    checkEmail(strpos($body, 'https://morabezastay.cv/images/email/payment.png') !== false, 'Payment icon must use a public URL');
    checkEmail(strpos($body, 'logo_morabeza_r1s2ne.png') !== false, 'Use the actual site logo');
    checkEmail(strpos($body, 'cid:') === false, 'Email must not require image attachments');
    checkEmail(preg_match('/>\s*\?\s*(?:&nbsp;|<)/', $body) === 0, 'Broken icon glyph');
    checkEmail(strpos($body, 'text=' . rawurlencode($d['codigo_reserva'])) !== false, 'QR must encode booking code');
    checkEmail(strpos($body, 'https://morabezastay.cv/gest/reserva/123/' . $d['tipo']) !== false, 'Incorrect booking link');
    checkEmail(strpos($body, emailReservaDinheiro($d['preco_total'])) !== false, 'Incorrect total');
    $d['status_pagamento'] = 'aguardando';
    $d['status'] = 'pendente';
    $d['nome_cliente'] = '<script>alert(1)</script>';
    $body = renderizarConfirmacaoReserva($d);
    checkEmail(strpos($body, 'Pagamento recebido.') === false, 'Pending booking must not claim payment');
    checkEmail(strpos($body, 'class="dm-badge-pending"') !== false, 'Pending badge needs its own dark palette');
    checkEmail(strpos($body, '<script>') === false, 'Customer name must be escaped');
    checkEmail(strpos($body, 'Reserva recebida') !== false, 'Pending booking heading');
    $pdf = gerarPdfComprovativoReserva($d);
    checkEmail(strpos($pdf, 'Mapa ilustrativo - Praia, Cabo Verde') !== false, 'Missing location needs labelled example map');
    checkEmail(strpos($pdf, '/Subtype /Image') !== false, 'Fallback map must be embedded in PDF');
    checkEmail(strpos($pdf, '%PDF-1.4') === 0 && substr($pdf, -5) === '%%EOF', 'Invalid PDF envelope');
    preg_match('/startxref\n(\d+)/', $pdf, $matches);
    checkEmail(substr($pdf, (int) $matches[1], 4) === 'xref', 'Invalid PDF offset');
    $url = urlComprovativoReserva($d, 'test-only-key', 1900000000);
    parse_str(parse_url($url, PHP_URL_QUERY), $query);
    checkEmail(hash_equals($query['assinatura'], hash_hmac('sha256', $d['tipo'] . '|' . $d['codigo_reserva'] . '|1900000000', 'test-only-key')), 'Receipt signature');
    echo $d['tipo'] . " renderer and receipt checks passed.\n";
}
checkEmail(emailReservaDinheiro(10.5) === '10,50 CVE', 'Currency must preserve cents');
checkEmail(emailReservaUrl('javascript:alert(1)') === '', 'Unsafe URL');
checkEmail(emailReservaUrl('/uploads/photo.jpg') === 'https://welovepalop.com/uploads/photo.jpg', 'Upload URL');
