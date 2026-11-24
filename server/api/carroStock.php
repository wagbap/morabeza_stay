<?php
declare(strict_types=1);
require_once __DIR__.'/carroHorarios.php';

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
function calcularStockCarro(array $unidades, array $reservas, array $retencoes, ?string $inicio, ?string $fim, array $bloqueios = [], bool $diagnostico = false, ?string $horaInicio = null, ?string $horaFim = null): int {
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
    $preciso=$horaInicio!==null || $horaFim!==null;
    if($preciso) {
        if($horaInicio===null || $horaFim===null)throw new InvalidArgumentException('Escolha as duas horas.');
        $inicio=carroInstante($inicio,$horaInicio);$fim=carroInstante($fim,$horaFim);
        foreach($ativas as &$r) {$r['data_levantamento']=carroInstante($r['data_levantamento'],$r['hora_levantamento']??null);$r['data_devolucao']=carroInstante($r['data_devolucao'],$r['hora_devolucao']??null,true);}unset($r);
        foreach($retencoes as &$r) {$r['data_levantamento']=carroInstante($r['data_levantamento'],$r['hora_levantamento']??null);$r['data_devolucao']=carroInstante($r['data_devolucao'],$r['hora_devolucao']??null,true);}unset($r);
    }
    $livres = $elegiveis;
    foreach ($bloqueios as $b) {
        $a=$preciso?$b['data'].' 00:00:00':$b['data'];
        $z=$preciso?(new DateTimeImmutable($b['data']))->modify('+1 day')->format('Y-m-d').' 00:00:00':null;
        if ($preciso ? ($a<$fim && $z>$inicio) : ($a >= $inicio && $a < $fim)) unset($livres[(int)$b['unidade_id']]);
    }
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
    return $diagnostico ? count($livres) - $pico : max(0, count($livres) - $pico);
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

function carroStockLer(PDO $db, int $id, ?string $inicio = null, ?string $fim = null, bool $bloquear = false, ?string $excluirToken = null, bool $diagnostico = false, ?string $horaInicio = null, ?string $horaFim = null): array {
    carroPeriodoStock($inicio, $fim);
    $dados=carroStockSnapshot($db,$id,$bloquear,$excluirToken,$diagnostico);
    return ['quantidade_disponivel'=>calcularStockCarro($dados['unidades'],$dados['reservas'],$dados['retencoes'],$inicio,$fim,$dados['bloqueios'],$diagnostico,$horaInicio,$horaFim)];
}

/** Request-local snapshot; never reuse it after a stock mutation. */
function carroStockSnapshot(PDO $db,int $id,bool $bloquear=false,?string $excluirToken=null,bool $ignorarEstadoAnuncio=false): array {
    if ($id < 1 || ($bloquear && !$db->inTransaction())) throw new InvalidArgumentException('Pedido de stock inválido.');
    $lock = $bloquear ? ' FOR UPDATE' : '';
    // Todos os caminhos de criação bloqueiam o mesmo anúncio antes de ler stock.
    $s = $db->prepare('SELECT id,status,status_carro FROM carros WHERE id=?' . $lock);
    $s->execute([$id]); $carro = $s->fetch(PDO::FETCH_ASSOC);
    if (!$carro) throw new InvalidArgumentException('Veículo não encontrado.');
    if (!$ignorarEstadoAnuncio && ($carro['status_carro'] !== 'aprovado' || $carro['status'] !== 'disponivel')) return ['unidades'=>[],'reservas'=>[],'retencoes'=>[],'bloqueios'=>[]];
    $s = $db->prepare('SELECT id,estado FROM veiculos_unidades WHERE carro_id=?' . $lock);
    $s->execute([$id]); $unidades = $s->fetchAll(PDO::FETCH_ASSOC);
    $s = $db->prepare("SELECT * FROM reservas_carro WHERE carro_id=? AND status IN ('pendente','confirmada')" . $lock);
    $s->execute([$id]); $reservas = $s->fetchAll(PDO::FETCH_ASSOC);
    // Uma retenção só é libertada após confirmar/cancelar o intent no Stripe.
    // Não ignorar uma retenção apenas porque o relógio expirou: o pagamento
    // pode ter concluído enquanto o cliente ainda grava a reserva.
    $s = $db->prepare("SELECT * FROM carro_stock_retencoes WHERE carro_id=? AND estado='ativa'" . $lock);
    $s->execute([$id]);
    $retencoes = array_values(array_filter($s->fetchAll(PDO::FETCH_ASSOC), static fn($r) => $r['token'] !== $excluirToken));
    $s = $db->prepare('SELECT b.unidade_id,b.data FROM carro_unidade_bloqueios b INNER JOIN veiculos_unidades u ON u.id=b.unidade_id WHERE u.carro_id=?' . $lock);
    $s->execute([$id]);$bloqueios=$s->fetchAll(PDO::FETCH_ASSOC);
    return ['unidades'=>$unidades,'reservas'=>$reservas,'retencoes'=>$retencoes,'bloqueios'=>$bloqueios];
}
