<?php
declare(strict_types=1);
require_once __DIR__ . '/emailAssets.php';

function emailReservaImg(string $name, int $size = 24, bool $preview = false, ?int $height = null): string {
    if ($name === 'logo' || $name === 'sun') {
        $width = $name === 'logo' ? 260 : 120;
        return '<img class="brand-mark" src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1781877448/logo_morabeza_r1s2ne.png" width="' . $width . '" alt="Morabeza Stay" style="display:inline-block;vertical-align:middle;border:0;width:' . $width . 'px;max-width:100%;height:auto;box-sizing:border-box;background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);border-radius:10px;padding:10px 14px;">';
    }
    $assets = emailReservaAssets();
    if (!isset($assets[$name])) return '';
    $src = $preview ? 'data:image/png;base64,' . $assets[$name] : 'https://morabezastay.cv/images/email/' . rawurlencode($name) . '.png';
    return '<img class="email-icon" src="' . $src . '" width="' . $size . '" height="' . ($height ?? $size) . '" alt="" style="display:inline-block;vertical-align:middle;border:0;width:' . $size . 'px;height:' . ($height ?? $size) . 'px;background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);border-radius:5px;padding:2px;">';
}

function emailReservaEsc($value): string {
    return htmlspecialchars(is_scalar($value) ? (string) $value : '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function emailReservaUrl($value): string {
    if (!is_string($value) || trim($value) === '') return '';
    $value = trim($value);
    if (strpos($value, '//') === 0) $value = 'https:' . $value;
    if (strpos($value, '/') === 0) $value = 'https://welovepalop.com' . $value;
    elseif (preg_match('~^(uploads|api)/~', $value)) $value = 'https://welovepalop.com/' . $value;
    elseif (preg_match('~^[a-zA-Z0-9_./ -]+\.(jpg|jpeg|png|webp|gif)$~i', $value)) $value = 'https://welovepalop.com/api/uploads/' . str_replace(' ', '%20', $value);
    return filter_var($value, FILTER_VALIDATE_URL) && in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['https', 'http'], true) ? $value : '';
}
/** Email e PDF usam o estado persistido pelo checkout. */
function emailReservaEstaPaga(array $d): bool {
    $status = strtolower(trim((string) ($d['status_pagamento'] ?? $d['pagamento_status'] ?? '')));
    return in_array($status, ['pago', 'paid', 'succeeded'], true);
}

function emailReservaDinheiro($value): string {
    $value = (float) $value;
    return number_format($value, abs($value - round($value)) > 0.00001 ? 2 : 0, ',', '.') . ' CVE';
}
function emailReservaData($value): string {
    $value = (string) $value;
    if (preg_match('/^([0-9]{4})-([0-9]{2})-([0-9]{2})/', $value, $m)) return $m[3] . '/' . $m[2] . '/' . $m[1];
    return $value;
}

/** Pure renderer: no sending, network access or database side effects. */
function renderizarConfirmacaoReserva(array $d): string {
    $e = 'emailReservaEsc';
    $tipo = $d['tipo'];
    $preview = !empty($d['preview_assets']);
    $icon = static function (string $name, int $size = 24) use ($preview): string { return emailReservaImg($name, $size, $preview); };
    $paid = emailReservaEstaPaga($d);
    $confirmed = $paid || in_array(strtolower($d['status'] ?? ''), ['confirmada', 'confirmado', 'approved'], true);
    $headline = $confirmed ? 'Reserva confirmada' : 'Reserva recebida';
    $code = (string) $d['codigo_reserva'];
    $name = trim((string) $d['nome_cliente']);
    $startLabel = ['alojamento' => 'Entrada', 'carro' => 'Levantamento', 'experiencia' => 'Data da atividade'][$tipo];
    $endLabel = ['alojamento' => 'Saída', 'carro' => 'Devolução', 'experiencia' => 'Horário'][$tipo];
    $principalLabel = ['alojamento' => 'Hóspede principal', 'carro' => 'Condutor principal', 'experiencia' => 'Participante principal'][$tipo];
    $qrInstruction = ['alojamento' => 'Apresente este QR Code no check-in', 'carro' => 'Apresente este QR Code no levantamento', 'experiencia' => 'Apresente este QR Code na atividade'][$tipo];
    $preparation = ['alojamento' => 'Apresente um documento de identificação e este comprovativo.', 'carro' => 'Apresente a carta de condução, um documento de identificação e este comprovativo.', 'experiencia' => 'Apresente este comprovativo no ponto de encontro e consulte os requisitos da atividade.'][$tipo];
    $bookingUrl = 'https://morabezastay.cv/gest/reserva/' . rawurlencode((string) $d['reserva_id']) . '/' . $tipo;
    $photo = emailReservaUrl($d['imagem'] ?? '');
    $photoHtml = $photo ? '<img class="photo" src="' . $e($photo) . '" width="300" height="220" alt="' . $e($d['titulo']) . '" style="width:100%;height:220px;object-fit:cover;border-radius:9px">' : '';
    $reserved = '';
    foreach (($d['itens'] ?? []) as $item) {
        $image = emailReservaUrl($item['imagem'] ?? '') ?: $photo;
        $reserved .= '<table role="presentation" width="100%" style="margin-top:10px"><tr>';
        if ($image) $reserved .= '<td class="stack" width="43%" style="padding-right:20px"><img class="photo" src="' . $e($image) . '" width="280" height="110" alt="' . $e($item['nome']) . '" style="width:100%;height:110px;object-fit:cover;border-radius:9px"></td>';
        $reserved .= '<td class="stack" style="vertical-align:middle"><h3 class="dm-heading" style="font:bold 21px/1.3 Georgia,serif;color:#07176a;margin:0">' . $e($item['nome']) . '</h3><p class="dm-text" style="font:16px/1.5 Arial,sans-serif;color:#294d83;margin:8px 0 0">' . $e($item['descricao'] ?? '') . '</p></td></tr></table>';
    }
    if ($reserved === '') $reserved = '<h3 class="dm-heading" style="font:bold 21px/1.3 Georgia,serif;color:#07176a;margin:10px 0 0">' . $e($d['titulo']) . '</h3><p class="dm-text" style="font:16px/1.5 Arial,sans-serif;color:#294d83;margin:8px 0 0">' . $e($d['detalhes'] ?? '') . '</p>';
    $rows = '';
    foreach (($d['linhas_pagamento'] ?? []) as $row) {
        $rows .= '<tr><td class="dm-text" style="padding:8px 10px 16px 0;font:17px/1.4 Arial,sans-serif;color:#294d83">' . $e($row['descricao']) . '</td><td class="dm-text" align="right" style="padding:8px 0 16px;font:17px/1.4 Arial,sans-serif;color:#294d83;white-space:nowrap">' . $e(emailReservaDinheiro($row['valor'])) . '</td></tr>';
    }
    $address = (string) ($d['morada'] ?? $d['localizacao'] ?? '');
    $map = $address !== '' ? 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($address) : '';
    $main = $d['participante_principal'] ?? [];
    $principal = implode('<br>', array_map($e, array_filter([$main['nome_completo'] ?? $name, $main['email'] ?? $d['email_cliente'], $main['phone'] ?? $d['phone_cliente'] ?? ''])));
    $people = [];
    foreach (($d['participantes_adicionais'] ?? []) as $person) {
        if (!empty($person['nome_completo'])) $people[] = $e($person['nome_completo']);
    }
    $host = implode('<br>', array_map($e, array_filter([$d['anfitriao_nome'] ?? '', $d['anfitriao_phone'] ?? '', $d['anfitriao_email'] ?? ''])));
    $reference = array_filter([$d['metodo_pagamento'] ?? '', $d['referencia_pagamento'] ?? '']);
    $tokens = [
        'subject' => $headline . ' · ' . $code, 'preheader' => $headline . ' · ' . $d['titulo'] . ' · ' . $code,
        'hero_image' => $d['hero_image'] ?? 'https://morabezastay.cv/media/home-beach-29984774-poster.jpg',
        'headline' => $headline, 'subtitle' => $paid ? 'Pagamento recebido. A sua viagem começa aqui.' : 'Consulte os detalhes da sua reserva.',
        'first_name' => explode(' ', $name)[0], 'greeting' => $confirmed && $paid ? 'A sua reserva está confirmada e o pagamento foi recebido.' : ($paid ? 'O pagamento foi recebido. Consulte abaixo o estado da sua reserva.' : 'Recebemos a sua reserva. O pagamento ainda está pendente.'),
        'code' => $code, 'badge_state' => $paid ? 'paid' : 'pending', 'badge_color' => $paid ? '#087f46' : '#995500', 'badge_bg' => $paid ? '#d7f2df' : '#fff1cf', 'payment_badge' => $paid ? 'Pago' : 'Pagamento pendente',
        'listing_title' => $d['titulo'] . (!empty($d['localizacao']) ? ' · ' . $d['localizacao'] : ''),
        'address' => $address, 'start_label' => $startLabel, 'end_label' => $endLabel,
        'start' => emailReservaData($d['inicio'] ?? '') . (!empty($d['hora_inicio']) ? ' · ' . $d['hora_inicio'] : ''),
        'end' => $tipo === 'experiencia' ? ($d['horario'] ?? '') : emailReservaData($d['fim'] ?? '') . (!empty($d['hora_fim']) ? ' · ' . $d['hora_fim'] : ''),
        'duration_people' => $d['detalhes'] ?? '',
        'total_label' => $paid ? 'Total pago' : 'Total da reserva', 'total' => emailReservaDinheiro($d['preco_total']),
        'payment_reference' => $reference ? 'Pagamento: ' . implode(' · ', $reference) : 'Consulte os detalhes do pagamento na sua reserva.',
        'qr_url' => 'https://quickchart.io/qr?text=' . rawurlencode($code) . '&size=220&margin=2',
        'qr_instruction' => $qrInstruction, 'booking_url' => $bookingUrl, 'receipt_url' => $d['receipt_url'],
        'cancellation' => $d['cancelamento'] ?? 'Aplicam-se as condições aceites no momento da reserva. Consulte-as antes de cancelar.',
        'preparation' => $preparation, 'support_contact' => $d['support_email'] ?? 'Contacte-nos através do site.',
        'principal_label' => $principalLabel,
    ];
    $replacements = [];
    foreach ($tokens as $key => $value) $replacements['{{' . $key . '}}'] = $e($value);
    $raw = [
        'demo_banner' => !empty($d['exemplo']) ? '<tr><td class="dm-text dm-soft" align="center" style="background:#eaf2f8;border-radius:7px;padding:9px;color:#294d83;font:13px Arial,sans-serif">MODELO VISUAL &#183; DADOS DE EXEMPLO</td></tr>' : '',
        'listing_photo' => $photoHtml, 'reserved_items' => $reserved, 'payment_rows' => $rows,
        'map_link' => $map ? '<table role="presentation" style="margin-top:10px"><tr><td width="30">' . $icon('map', 21) . '</td><td style="font:15px Arial,sans-serif;vertical-align:middle"><a class="dm-link" style="color:#0758ae;text-decoration:underline" href="' . $e($map) . '">Ver localização no mapa &nbsp; &#8594;</a></td></tr></table>' : '',
        'arrival_notes' => !empty($d['instrucoes']) ? '<p class="dm-text" style="font:16px/1.5 Arial,sans-serif;color:#294d83;margin:12px 0 0">' . nl2br($e($d['instrucoes'])) . '</p>' : '<p class="dm-text" style="font:16px/1.5 Arial,sans-serif;color:#294d83;margin:12px 0 0">Instruções de acesso disponíveis em Ver a minha reserva.</p>',
        'host_contact' => $host !== '' ? '<b>' . $e(['alojamento' => 'Alojamento', 'carro' => 'Rent-a-car', 'experiencia' => 'Organizador'][$tipo]) . ':</b><br>' . $host : 'Consulte os contactos do anfitrião na sua reserva.',
        'principal' => $principal, 'additional_people' => $people ? '<p class="dm-text" style="font:15px/1.5 Arial,sans-serif;color:#294d83;margin-top:10px"><b>Também nesta reserva:</b><br>' . implode('<br>', $people) . '</p>' : '',
        'logo' => emailReservaImg('logo', 440, $preview, 82),
        'sun' => $icon('sun', 48),
        'reserved_icon' => $icon(['alojamento'=>'bed','carro'=>'car','experiencia'=>'experience'][$tipo], 26),
        'payment_icon' => $icon('payment', 26),
        'calendar_icon' => $icon('calendar', 24),
        'preparation_icon' => $icon('preparation', 25),
        'support_icon' => $icon('support', 26),
        'guest_icon' => $icon('guest', 28),
        'people_icon' => $icon('people', 22),
        'pin_icon' => $icon('pin', 20),
        'download_icon' => $icon('download', 22),
        'globe_icon' => $icon('globe', 23),
        'paid_icon' => $paid ? $icon('check', 23) : '',
    ];
    foreach ($raw as $key => $value) $replacements['{{' . $key . '}}'] = $value;
    return strtr(file_get_contents(__DIR__ . '/confirmacao.html'), $replacements);
}
