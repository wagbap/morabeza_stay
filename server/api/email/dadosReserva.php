<?php
declare(strict_types=1);
require_once __DIR__ . '/confirmacao.php';

function carregarDadosEmailReserva(PDO $conn, string $tipo, string $codigo, array $extra = []): array {
    $map = [
        'alojamento' => ['reservas_alojamento', 'alojamentos', 'alojamento_id', 'proprietario_id', 'data_checkin', 'data_checkout'],
        'carro' => ['reservas_carro', 'carros', 'carro_id', 'usuario_id', 'data_levantamento', 'data_devolucao'],
        'experiencia' => ['reservas_experiencia', 'experiencias', 'experiencia_id', 'usuario_id', 'data_participacao', 'data_participacao'],
    ];
    if (!isset($map[$tipo])) throw new InvalidArgumentException('Invalid booking category');
    [$table, $listing, $fk, $owner, $start, $end] = $map[$tipo];
    $stmt = $conn->prepare('SELECT * FROM `' . $table . '` WHERE codigo_reserva = :codigo LIMIT 1');
    $stmt->execute(['codigo' => $codigo]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r || (int) ($r['is_bloqueio'] ?? 0) === 1) throw new RuntimeException('Booking not found');
    $stmt = $conn->prepare('SELECT * FROM `' . $listing . '` WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $r[$fk]]);
    $l = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare('SELECT id, nome, email, phone FROM usuarios WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $r['usuario_id']]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$u) throw new RuntimeException('Booking customer missing');
    $stmt->execute(['id' => $l[$owner] ?? 0]);
    $host = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    $people = (int) ($r['quantidade_hospedes'] ?? $r['quantidade_pessoas'] ?? 1);
    $length = (int) ($r['noites'] ?? $r['dias'] ?? 0);
    $details = $tipo === 'experiencia' ? $people . ' participante(s)' : $length . ($tipo === 'carro' ? ' dia(s) de aluguer' : ' noite(s) · ' . $people . ' hóspede(s)');
    if ($tipo === 'carro') {
        $specs = array_filter([$l['marca'] ?? '', $l['modelo'] ?? '', $l['transmissao'] ?? '', $l['combustivel'] ?? '']);
        if ($specs) $details .= ' · ' . implode(' · ', $specs);
    } elseif ($tipo === 'experiencia') {
        if (!empty($l['duracao'])) $details .= ' · ' . $l['duracao'];
        if ((int) ($r['quantidade_jet_skis'] ?? 0) > 0) $details .= ' · ' . (int) $r['quantidade_jet_skis'] . ' jet ski(s)';
    }
    $photo = $l['imagem_url'] ?? $l['imagem_principal'] ?? $l['foto'] ?? $extra['imagem'] ?? '';
    $items = [];
    foreach (($extra['quartos'] ?? []) as $q) {
        if (!is_array($q)) continue;
        $items[] = ['nome' => (string) ($q['nome'] ?? 'Quarto'), 'imagem' => (string) ($q['imagem'] ?? ''),
            'descricao' => (int) ($q['quantidade'] ?? 1) . ' quarto(s)' . (!empty($q['capacidade']) ? ' · ' . (int) $q['capacidade'] . ' hóspede(s)' : '')];
    }
    $rows = [];
    if ($tipo === 'alojamento' && isset($r['subtotal_noites']) && abs((float) $r['subtotal_noites'] + (float) ($r['taxa_limpeza'] ?? 0) - (float) $r['preco_total']) < 0.02) {
        $rows[] = ['descricao' => $length . ' noite(s)', 'valor' => $r['subtotal_noites']];
        if ((float) ($r['taxa_limpeza'] ?? 0) > 0) $rows[] = ['descricao' => 'Taxa de limpeza', 'valor' => $r['taxa_limpeza']];
    } else $rows[] = ['descricao' => $details, 'valor' => $r['preco_total']];
    return [
        'tipo' => $tipo, 'reserva_id' => $r['id'], 'usuario_id' => $r['usuario_id'], 'codigo_reserva' => $r['codigo_reserva'],
        'status' => $r['status'], 'status_pagamento' => $r['pagamento_status'], 'preco_total' => $r['preco_total'],
        'titulo' => $l['titulo'] ?? $l['nome'] ?? $extra['experiencia'] ?? ucfirst($tipo),
        'imagem' => $photo, 'localizacao' => $l['localizacao'] ?? $l['cidade'] ?? $l['ilha'] ?? '',
        'morada' => $l['morada_completa'] ?? $l['endereco'] ?? $l['localizacao'] ?? '',
        'latitude' => $l['latitude'] ?? $l['coordenadas_lat'] ?? null,
        'longitude' => $l['longitude'] ?? $l['coordenadas_lng'] ?? null,
        'duracao' => $l['duracao'] ?? '',
        'quartos_quantidade' => array_sum(array_map(static function ($q) { return (int) ($q['quantidade'] ?? 1); }, $extra['quartos'] ?? [])),
        'pessoas_resumo' => $people . ($tipo === 'experiencia' ? ' participante(s)' : ' pessoa(s)'),
        'inicio' => $r[$start], 'fim' => $r[$end], 'hora_inicio' => $r['hora_levantamento'] ?? $l['hora_checkin'] ?? '',
        'hora_fim' => $r['hora_devolucao'] ?? $l['hora_checkout'] ?? '', 'horario' => $r['horario'] ?? '',
        'detalhes' => $details, 'itens' => $tipo === 'alojamento' ? $items : [], 'linhas_pagamento' => $rows,
        'nome_cliente' => $u['nome'], 'email_cliente' => $u['email'], 'phone_cliente' => $u['phone'],
        'anfitriao_nome' => $host['nome'] ?? '', 'anfitriao_phone' => $host['phone'] ?? '', 'anfitriao_email' => $host['email'] ?? '',
        'participante_principal' => $extra['participante_principal'] ?? [], 'participantes_adicionais' => $extra['participantes_adicionais'] ?? [],
        'metodo_pagamento' => $r['metodo_pagamento'] ?? $extra['metodo_pagamento'] ?? '',
        'referencia_pagamento' => $r['payment_intent_id'] ?? $r['stripe_id'] ?? '',
        'instrucoes' => $l['instrucoes_checkin'] ?? $l['ponto_encontro'] ?? '',
        // No generic listing policy is presented as an immutable booking policy.
        'cancelamento' => $r['condicoes_cancelamento'] ?? 'Aplicam-se as condições aceites no momento da reserva. Consulte os detalhes da sua reserva.',
    ];
}

function urlComprovativoReserva(array $d, string $secret, ?int $expires = null): string {
    if ($secret === '') throw new RuntimeException('Receipt signing key missing');
    $expires = $expires ?? time() + 7 * 86400;
    $payload = $d['tipo'] . '|' . $d['codigo_reserva'] . '|' . $expires;
    return 'https://welovepalop.com/api/comprovativo-reserva.php?' . http_build_query([
        'tipo' => $d['tipo'], 'codigo' => $d['codigo_reserva'], 'expira' => $expires,
        'assinatura' => hash_hmac('sha256', $payload, $secret),
    ], '', '&', PHP_QUERY_RFC3986);
}
