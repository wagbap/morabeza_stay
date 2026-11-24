<?php
declare(strict_types=1);
require_once __DIR__ . '/carroStock.php';

function carroCaucaoNormalizar(array $carro, int $quantidade): array {
    if ($quantidade < 1 || !array_key_exists('exige_caucao', $carro) || !in_array($carro['exige_caucao'], [0,1,'0','1',false,true], true)) {
        throw new InvalidArgumentException('Não foi possível confirmar a caução.');
    }
    $exige = (int)$carro['exige_caucao'] === 1;
    $valor = $exige ? ($carro['caucao_valor'] ?? null) : 0;
    if (!is_numeric($valor) || !is_finite((float)$valor) || ($exige && (float)$valor <= 0)) {
        throw new InvalidArgumentException('Valor de caução inválido.');
    }
    $formas = $carro['caucao_formas'] ?? [];
    if (is_string($formas)) {
        $json = json_decode($formas, true);
        $formas = is_array($json) ? $json : explode(',', $formas);
    }
    $unitario = round((float)$valor, 2);
    return ['exige_caucao'=>$exige ? 1 : 0, 'caucao_valor'=>$unitario,
        'caucao_total'=>round($unitario * $quantidade, 2), 'quantidade'=>$quantidade,
        'caucao_formas'=>$exige && is_array($formas) ? array_values(array_filter(array_map('trim', array_filter($formas, 'is_string')))) : [],
        'caucao_condicoes'=>$exige ? trim((string)($carro['caucao_condicoes'] ?? '')) : '',
        'cobrada_online'=>false, 'incluida_comissao'=>false];
}

function carroAluguerSemCaucao($precoDia, string $inicio, string $fim, int $quantidade): float {
    carroPeriodoStock($inicio, $fim);
    if (!is_numeric($precoDia) || !is_finite((float)$precoDia) || (float)$precoDia <= 0 || $quantidade < 1) {
        throw new InvalidArgumentException('Preço de aluguer inválido.');
    }
    $dias = (new DateTimeImmutable($inicio))->diff(new DateTimeImmutable($fim))->days;
    return round((float)$precoDia * $dias * $quantidade, 2);
}

function carroCondicoesPagamento(PDO $db, int $id, int $quantidade, string $inicio, string $fim): array {
    if (!$db->inTransaction()) throw new RuntimeException('Transação de pagamento necessária.');
    $s = $db->prepare('SELECT preco_dia,exige_caucao,caucao_valor,caucao_formas,caucao_condicoes FROM carros WHERE id=? FOR UPDATE');
    $s->execute([$id]); $carro = $s->fetch(PDO::FETCH_ASSOC);
    if (!$carro) throw new InvalidArgumentException('Veículo não encontrado.');
    return ['versao'=>1, 'caucao'=>carroCaucaoNormalizar($carro, $quantidade),
        'total_aluguer'=>carroAluguerSemCaucao($carro['preco_dia'], $inicio, $fim, $quantidade)];
}

function carroGuardarCaucaoReserva(PDO $db, int $reservaId, array $caucao): void {
    $s = $db->prepare('SELECT snapshot_json FROM reservas_carro_condicoes WHERE reserva_id=?');
    $s->execute([$reservaId]);
    $anterior = json_decode($s->fetchColumn() ?: '{}', true) ?: [];
    $snapshot = array_replace($anterior, ['caucao'=>$caucao]);
    $db->prepare('INSERT INTO reservas_carro_condicoes(reserva_id,snapshot_json) VALUES(?,?) ON DUPLICATE KEY UPDATE snapshot_json=VALUES(snapshot_json)')
        ->execute([$reservaId,json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)]);
}
