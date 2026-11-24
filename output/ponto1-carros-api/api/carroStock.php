<?php
declare(strict_types=1);

function carroDataStock(string $value): string {
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value) throw new InvalidArgumentException('Data inválida.');
    return $value;
}

function carroPeriodoStock(?string $inicio, ?string $fim): void {
    if ($inicio === null && $fim === null) return;
    if (!$inicio || !$fim || carroDataStock($inicio) >= carroDataStock($fim)) {
        throw new InvalidArgumentException('A devolução deve ser posterior ao levantamento.');
    }
}

// Unidades já atribuídas devem estar livres durante TODO o pedido.
// Para reservas ainda sem matrícula atribuída, descontar o pico simultâneo,
// não a soma de reservas consecutivas que se cruzam com o pedido.
// Intervalos [levantamento, devolução): devolver num dia permite alugar nesse dia.
function calcularStockCarro(array $unidades, array $reservas, array $retencoes, ?string $inicio, ?string $fim): int {
    carroPeriodoStock($inicio, $fim);
    $ativas = array_values(array_filter($reservas, static fn($r) => in_array($r['status'], ['pendente', 'confirmada'], true)));
    $atribuidas = [];
    foreach ($ativas as $r) if (!empty($r['unidade_id'])) $atribuidas[(int)$r['unidade_id']] = true;
    $elegiveis = [];
    foreach ($unidades as $u) {
        $estado = $u['estado'];
        if ($estado === 'disponivel' || ($inicio !== null && in_array($estado, ['reservada', 'entregue'], true) && isset($atribuidas[(int)$u['id']]))) {
            $elegiveis[(int)$u['id']] = true;
        }
    }
    if ($inicio === null) return count($elegiveis);
    $livres = $elegiveis;
    foreach ($ativas as $r) {
        if (!empty($r['unidade_id']) && $r['data_levantamento'] < $fim && $r['data_devolucao'] > $inicio) {
            unset($livres[(int)$r['unidade_id']]);
        }
    }
    $eventos = [];
    foreach ($ativas as $r) {
        $qtd = max(1, (int)($r['quantidade'] ?? 1));
        // A matrícula atribuída já saiu da lista de unidades livres.
        // Se avariou, manter a necessidade de uma viatura de substituição.
        if (!empty($r['unidade_id']) && isset($elegiveis[(int)$r['unidade_id']])) $qtd--;
        adicionarOcupacaoCarro($eventos, $r['data_levantamento'], $r['data_devolucao'], $qtd, $inicio, $fim);
    }
    foreach ($retencoes as $r) {
        adicionarOcupacaoCarro($eventos, $r['data_levantamento'], $r['data_devolucao'], (int)$r['quantidade'], $inicio, $fim);
    }
    ksort($eventos);
    $ocupado = 0; $pico = 0;
    foreach ($eventos as $delta) { $ocupado += $delta; $pico = max($pico, $ocupado); }
    return max(0, count($livres) - $pico);
}

function adicionarOcupacaoCarro(array &$eventos, string $a, string $b, int $qtd, string $inicio, string $fim): void {
    if ($qtd <= 0 || $a >= $fim || $b <= $inicio) return;
    $a = max($a, $inicio); $b = min($b, $fim);
    if ($a >= $b) return;
    $eventos[$a] = ($eventos[$a] ?? 0) + $qtd;
    $eventos[$b] = ($eventos[$b] ?? 0) - $qtd;
}

function carroStockConexao(): PDO {
    require __DIR__ . '/config.php';
    if (isset($conn) && $conn instanceof PDO) $db = $conn;
    elseif (isset($pdo) && $pdo instanceof PDO) $db = $pdo;
    else $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password_db ?? $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}

function carroStockLer(PDO $db, int $id, ?string $inicio = null, ?string $fim = null, bool $bloquear = false, ?string $excluirToken = null): array {
    carroPeriodoStock($inicio, $fim);
    if ($id < 1 || ($bloquear && !$db->inTransaction())) throw new InvalidArgumentException('Pedido de stock inválido.');
    $lock = $bloquear ? ' FOR UPDATE' : '';
    // Todos os caminhos de criação bloqueiam o mesmo anúncio antes de ler stock.
    $s = $db->prepare('SELECT id,status,status_carro FROM carros WHERE id=?' . $lock);
    $s->execute([$id]); $carro = $s->fetch(PDO::FETCH_ASSOC);
    if (!$carro) throw new InvalidArgumentException('Veículo não encontrado.');
    if ($carro['status_carro'] !== 'aprovado' || $carro['status'] !== 'disponivel') return ['quantidade_disponivel'=>0];
    $s = $db->prepare('SELECT id,estado FROM veiculos_unidades WHERE carro_id=?' . $lock);
    $s->execute([$id]); $unidades = $s->fetchAll(PDO::FETCH_ASSOC);
    $s = $db->prepare("SELECT id,unidade_id,status,data_levantamento,data_devolucao,quantidade FROM reservas_carro WHERE carro_id=? AND status IN ('pendente','confirmada')" . $lock);
    $s->execute([$id]); $reservas = $s->fetchAll(PDO::FETCH_ASSOC);
    // Uma retenção só é libertada após confirmar/cancelar o intent no Stripe.
    // Não ignorar uma retenção apenas porque o relógio expirou: o pagamento
    // pode ter concluído enquanto o cliente ainda grava a reserva.
    $s = $db->prepare("SELECT token,data_levantamento,data_devolucao,quantidade FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa'" . $lock);
    $s->execute([$id]);
    $retencoes = array_values(array_filter($s->fetchAll(PDO::FETCH_ASSOC), static fn($r) => $r['token'] !== $excluirToken));
    return ['quantidade_disponivel'=>calcularStockCarro($unidades, $reservas, $retencoes, $inicio, $fim)];
}
