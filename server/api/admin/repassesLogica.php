<?php
declare(strict_types=1);

function repasseCentavos($value): int {
    return (int) round((float)$value * 100);
}

function normalizarComprovativoRepasse($value): string {
    if (!is_string($value) || trim($value) === '') throw new InvalidArgumentException('Anexe o comprovativo PDF da transferência.');
    $value = preg_replace('~^(https?):/{3,}~i', '$1://', trim($value));
    if (preg_match('~^/?(?:api/)?uploads/~i', $value)) $value = 'https://welovepalop.com/' . ltrim($value, '/');
    $url = parse_url($value);
    $host = strtolower($url['host'] ?? '');
    $path = $url['path'] ?? '';
    if (!$url || !in_array(strtolower($url['scheme'] ?? ''), ['http','https'], true)
        || !in_array($host, ['welovepalop.com','www.welovepalop.com'], true)
        || !preg_match('~^/(?:api/)?uploads/.+~', $path)
        || preg_match('~(?:^|/)\.\.(?:/|$)|[\\\\\x00]~', rawurldecode($path))
        || isset($url['user']) || isset($url['pass']) || isset($url['port'])) {
        throw new InvalidArgumentException('O endereço do comprovativo é inválido. Utilize o ficheiro devolvido pelo upload da plataforma.');
    }
    return 'https://' . $host . $path . (isset($url['query']) ? '?' . $url['query'] : '');
}

function repassePrazo(string $inicio): string {
    $date = new DateTimeImmutable($inicio);
    for ($i = 0; $i < 3;) {
        $date = $date->modify('+1 day');
        if ((int)$date->format('N') < 6) $i++;
    }
    return $date->format('Y-m-d');
}

function repasseEstado(array $r, DateTimeImmutable $agora): array {
    $status = strtolower(trim((string)$r['status']));
    $pago = in_array(strtolower(trim((string)$r['pagamento_status'])), ['pago','paid','succeeded','completed','aprovado','confirmado'], true);
    $fim = new DateTimeImmutable($r['fim'] . ' 23:59:59');
    $validado = !empty($r['validado_em']) && new DateTimeImmutable($r['validado_em']) <= $agora;
    $terminado = $agora > $fim;
    $estado = 'aguardar';
    $motivo = 'em_curso';
    if (!empty($r['repasse_id'])) { $estado = 'pago'; $motivo = 'pago'; }
    elseif (in_array($status, ['cancelada','cancelado','bloqueado'], true) || !$pago || !in_array($status, ['confirmada','confirmado','concluida','concluída','finalizada','completed','approved','aprovada','pago'], true)) {
        $estado = 'retido'; $motivo = !$pago ? 'pagamento' : 'cancelada';
    } elseif (($r['revisao_resultado'] ?? null)==='retido') { $estado='retido'; $motivo='revisao'; }
    elseif (!$validado) { $estado = 'verificar'; $motivo = 'validacao'; }
    elseif (!$terminado) { $estado = 'aguardar'; }
    elseif ((int)($r['legado_centavos'] ?? 0) > 0) { $estado = 'retido'; $motivo = 'legado'; }
    else { $estado = 'disponivel'; $motivo = empty($r['tem_iban']) ? 'iban' : 'pronto'; }
    $elegivel = new DateTimeImmutable($r['fim']);
    foreach (['validado_em'] as $key) {
        if (!empty($r[$key]) && new DateTimeImmutable($r[$key]) > $elegivel) $elegivel = new DateTimeImmutable($r[$key]);
    }
    $prazo = $estado === 'disponivel' ? repassePrazo($elegivel->format('Y-m-d')) : null;
    return ['estado'=>$estado, 'motivo'=>$motivo, 'cliente_pago'=>$pago, 'concluido'=>$terminado,
        'prazo'=>$prazo, 'atrasado'=>$prazo !== null && $prazo < $agora->format('Y-m-d'),
        'vence_hoje'=>$prazo === $agora->format('Y-m-d'),
        'pode_registar'=>$estado === 'disponivel' && !empty($r['tem_iban']),
        'pode_confirmar'=>false, 'precisa_validar_qr'=>$estado === 'verificar'];
}
