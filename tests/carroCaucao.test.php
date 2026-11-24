<?php
require_once __DIR__ . '/../server/api/carroCaucao.php';
function verificarCaucao(bool $ok, string $caso): void {
    if (!$ok) throw new RuntimeException($caso);
    echo "OK $caso\n";
}
$c = carroCaucaoNormalizar(['exige_caucao'=>1,'caucao_valor'=>'500.00','caucao_formas'=>'dinheiro,transferencia'],2);
verificarCaucao($c['caucao_valor'] === 500.0 && $c['caucao_total'] === 1000.0, '500 CVE por carro: duas viaturas têm 1000 CVE de caução');
verificarCaucao(!$c['cobrada_online'] && !$c['incluida_comissao'], 'caução explicitamente fora da cobrança e comissão');
$aluguer = carroAluguerSemCaucao('5000.00','2026-11-10','2026-11-12',2);
verificarCaucao($aluguer === 20000.0, 'valor online apenas pelo aluguer de dois carros durante dois dias');
verificarCaucao(round($aluguer * 0.10,2) === 2000.0, 'comissão apenas sobre 20000 CVE, sem os 1000 CVE da caução');
$sem = carroCaucaoNormalizar(['exige_caucao'=>'0','caucao_valor'=>'20000','caucao_formas'=>'dinheiro'],1);
verificarCaucao($sem['caucao_valor'] === 0.0 && $sem['caucao_formas'] === [], 'sem caução ignora valores antigos');
foreach ([[], ['exige_caucao'=>1], ['exige_caucao'=>1,'caucao_valor'=>-1], ['exige_caucao'=>1,'caucao_valor'=>INF]] as $invalido) {
    try { carroCaucaoNormalizar($invalido,1); throw new RuntimeException('Caução inválida aceite'); }
    catch (InvalidArgumentException $e) { echo "OK rejeita dados de caução inválidos\n"; }
}

class CaucaoDbTeste extends PDO {
    public function __construct() { parent::__construct('sqlite::memory:'); $this->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION); }
    public function prepare(string $query,array $options=[]): PDOStatement|false {
        $query = preg_replace('/\s+FOR UPDATE\s*$/i','',$query);
        $query = str_replace('ON DUPLICATE KEY UPDATE snapshot_json=VALUES(snapshot_json)', 'ON CONFLICT(reserva_id) DO UPDATE SET snapshot_json=excluded.snapshot_json', $query);
        return parent::prepare($query,$options);
    }
}
$db = new CaucaoDbTeste();
$db->exec("CREATE TABLE carros(id INTEGER,preco_dia TEXT,exige_caucao INTEGER,caucao_valor TEXT,caucao_formas TEXT,caucao_condicoes TEXT);
  CREATE TABLE reservas_carro_condicoes(reserva_id INTEGER PRIMARY KEY,snapshot_json TEXT,aceite_cliente INTEGER DEFAULT 0);
  INSERT INTO carros VALUES(24,'5000.00',1,'500.00','dinheiro','Devolvida sem danos');");
$db->beginTransaction();
$guardado = carroCondicoesPagamento($db,24,2,'2026-11-10','2026-11-12');
verificarCaucao($guardado['caucao']['caucao_valor'] === 500.0, 'consulta PDO lê os 500 CVE realmente guardados');
verificarCaucao($guardado['total_aluguer'] === 20000.0, 'consulta PDO mantém a caução fora do total');
$db->exec("UPDATE carros SET caucao_valor='700.00'");
carroGuardarCaucaoReserva($db,77,$guardado['caucao']);
$snapshot = json_decode($db->query('SELECT snapshot_json FROM reservas_carro_condicoes WHERE reserva_id=77')->fetchColumn(),true);
verificarCaucao($snapshot['caucao']['caucao_valor'] === 500 && $snapshot['caucao']['caucao_total'] === 1000, 'reserva preserva as condições apresentadas antes do pagamento');
$db->exec("UPDATE reservas_carro_condicoes SET snapshot_json='{" . '"levantamento":"praia"' . "}',aceite_cliente=1 WHERE reserva_id=77");
carroGuardarCaucaoReserva($db,77,$guardado['caucao']);
$row = $db->query('SELECT * FROM reservas_carro_condicoes WHERE reserva_id=77')->fetch(PDO::FETCH_ASSOC);
verificarCaucao(json_decode($row['snapshot_json'],true)['levantamento'] === 'praia' && (int)$row['aceite_cliente'] === 1, 'snapshot de caução preserva outros campos e o aceite existente');
$db->rollBack();
