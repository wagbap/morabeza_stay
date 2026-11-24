<?php
require_once __DIR__ . '/../server/api/carroStripeStock.php';

// SQLite exercises the real PDO reads/writes. FOR UPDATE is removed only in
// this adapter; MySQL row-lock concurrency must also be checked on staging.
class StockDbTeste extends PDO {
    public function __construct() {
        parent::__construct('sqlite::memory:');
        $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->sqliteCreateFunction('UTC_TIMESTAMP', static fn() => '2026-11-04 12:00:00');
    }
    public function prepare(string $query, array $options = []): PDOStatement|false {
        return parent::prepare(preg_replace('/\s+FOR UPDATE\s*$/i', '', $query), $options);
    }
}
function confirmarStockDb(bool $ok, string $caso): void {
    if (!$ok) throw new RuntimeException($caso);
    echo "OK $caso\n";
}
$db = new StockDbTeste();
$db->exec("CREATE TABLE carros(id INTEGER,status TEXT,status_carro TEXT);
    CREATE TABLE carro_unidade_bloqueios(unidade_id INTEGER,data TEXT,motivo TEXT,criado_por INTEGER,PRIMARY KEY(unidade_id,data));
CREATE TABLE veiculos_unidades(id INTEGER,carro_id INTEGER,estado TEXT);
    CREATE TABLE reservas_carro(id INTEGER,carro_id INTEGER,unidade_id INTEGER,status TEXT,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER);
    CREATE TABLE carro_stock_retencoes(token TEXT,carro_id INTEGER,data_levantamento TEXT,data_devolucao TEXT,quantidade INTEGER,stripe_id TEXT,estado TEXT,expira_em TEXT);
    INSERT INTO carros VALUES(24,'disponivel','aprovado');
    INSERT INTO veiculos_unidades VALUES(1,24,'manutencao');");
$inicio = '2026-11-10'; $fim = '2026-11-12';
confirmarStockDb(carroStockLer($db,24,$inicio,$fim)['quantidade_disponivel'] === 0, 'consulta real: unidade do ID 24 em manutenção dá zero');
$db->exec("UPDATE veiculos_unidades SET estado='disponivel'");
confirmarStockDb(carroStockLer($db,24,$inicio,$fim)['quantidade_disponivel'] === 1, 'consulta real: voltar a disponível repõe stock');
$db->beginTransaction();
confirmarStockDb(carroStockLer($db,24,$inicio,$fim,true)['quantidade_disponivel'] === 1, 'primeiro pedido pode reter o último carro');
$db->exec("INSERT INTO carro_stock_retencoes VALUES('pedido1',24,'2026-11-10','2026-11-12',1,'pi_pendente','ativa','2026-11-04 11:00:00')");
$db->commit();
$db->beginTransaction();
confirmarStockDb(carroStockLer($db,24,$inicio,$fim,true)['quantidade_disponivel'] === 0, 'pedido seguinte vê o stock retido e não pode reservar');
confirmarStockDb(carroStockLer($db,24,$inicio,$fim,true,'pedido1')['quantidade_disponivel'] === 1, 'só a gravação do próprio pagamento exclui a sua retenção');
$db->commit();

$pagos = new class {
    public object $paymentIntents;
    public function __construct() {
        $this->paymentIntents = new class {
            public array $cancelados = [];
            public string $status = 'succeeded';
            public function retrieve($id): object { return (object)['status'=>$this->status]; }
            public function cancel($id): object { $this->cancelados[]=$id; return (object)['status'=>'canceled']; }
        };
    }
};
$db->beginTransaction();
carroLibertarRetencoesExpiradas($db,24,$pagos);
confirmarStockDb($db->query("SELECT estado FROM carro_stock_retencoes")->fetchColumn() === 'ativa', 'retenção expirada com pagamento concluído continua a proteger o carro');
confirmarStockDb($pagos->paymentIntents->cancelados === [], 'um pagamento concluído nunca é cancelado pela limpeza');
$db->commit();
$db->beginTransaction();
$db->exec("INSERT INTO reservas_carro VALUES(1,24,NULL,'confirmada','2026-11-10','2026-11-12',1)");
$db->exec("UPDATE carro_stock_retencoes SET estado='consumida'");
confirmarStockDb(carroStockLer($db,24,$inicio,$fim,true)['quantidade_disponivel'] === 0, 'converter retenção em reserva não conta o carro duas vezes');
$db->commit();
$db->exec("UPDATE reservas_carro SET status='cancelada'; UPDATE carro_stock_retencoes SET estado='ativa'");
$pagos->paymentIntents->status = 'requires_payment_method';
$db->beginTransaction();
carroLibertarRetencoesExpiradas($db,24,$pagos);
$db->commit();
confirmarStockDb($db->query("SELECT estado FROM carro_stock_retencoes")->fetchColumn() === 'libertada', 'só liberta a retenção após cancelar o intent sem pagamento');
confirmarStockDb(carroStockLer($db,24,$inicio,$fim)['quantidade_disponivel'] === 1, 'cancelamento sem pagamento devolve o último carro');
$db->exec("UPDATE carros SET status_carro='pendente'");
confirmarStockDb(carroStockLer($db,24,$inicio,$fim)['quantidade_disponivel'] === 0, 'anúncios pendentes também não têm stock público');
