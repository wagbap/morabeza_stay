<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function respostaRepasse(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respostaRepasse(405, ['status'=>'error']);
require_once __DIR__ . '/repassesLogica.php';

function categoriasRepasse(): array {
    return [
        'alojamento'=>['reservas_alojamento','alojamentos','alojamento_id','proprietario_id','data_checkout','data_checkin'],
        'carro'=>['reservas_carro','carros','carro_id','usuario_id','data_devolucao','data_levantamento'],
        'experiencia'=>['reservas_experiencia','experiencias','experiencia_id','usuario_id','data_participacao','data_participacao'],
    ];
}

function carregarReservasRepasse(PDO $conn): array {
    $rows = [];
    $revisoes = [];
    foreach ($conn->query('SELECT * FROM repasse_revisoes ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC) as $revisao) {
        $revisoes[$revisao['tipo'].':'.$revisao['reserva_id']][] = $revisao;
    }
    foreach (categoriasRepasse() as $tipo => [$table,$listing,$fk,$owner,$end,$start]) {
        $sql = "SELECT r.id AS reserva_id, r.codigo_reserva, r.status, r.pagamento_status,
            r.preco_total, r.$end AS fim, r.$start AS inicio,
            l.id AS anuncio_id, l.titulo AS anuncio_titulo, l.$owner AS prestador_id,
            u.nome AS prestador_nome, u.email AS prestador_email,
            cliente.nome AS cliente_nome, validador.nome AS validado_por_nome,
            dr.iban AS iban_numero, dr.titular AS iban_titular, dr.banco AS iban_banco, dr.pais AS iban_pais,
            v.validado_em, cf.confirmado_em, cf.motivo AS confirmacao_motivo,
            pago.repasse_id,
            COALESCE(legado.total,0) AS legado_total
            FROM $table r INNER JOIN $listing l ON l.id=r.$fk
            INNER JOIN usuarios u ON u.id=l.$owner
            LEFT JOIN usuarios cliente ON cliente.id=r.usuario_id
            LEFT JOIN dados_recebimento dr ON dr.id=(
                SELECT d.id FROM dados_recebimento d WHERE d.usuario_id=u.id AND d.confirmado=1 ORDER BY d.id DESC LIMIT 1
            )
            LEFT JOIN reserva_validacoes v ON v.categoria=:tipo_v AND v.reserva_id=r.id
            LEFT JOIN usuarios validador ON validador.id=v.validado_por
            LEFT JOIN repasse_confirmacoes cf ON cf.tipo=:tipo_c AND cf.reserva_id=r.id
            LEFT JOIN (
                SELECT ri.reserva_id, ri.repasse_id FROM repasse_itens ri
                INNER JOIN repasses rp ON rp.id=ri.repasse_id AND rp.estado='pago'
                WHERE ri.tipo=:tipo_p
            ) pago ON pago.reserva_id=r.id
            LEFT JOIN (
                SELECT rp.prestador_id, SUM(rp.valor) AS total FROM repasses rp
                WHERE rp.estado='pago' AND NOT EXISTS (SELECT 1 FROM repasse_itens ri WHERE ri.repasse_id=rp.id)
                GROUP BY rp.prestador_id
            ) legado ON legado.prestador_id=u.id
            WHERE r.usuario_id>0 AND LOWER(r.status)<>'bloqueado'";
        if ($tipo === 'alojamento') $sql .= ' AND COALESCE(r.is_bloqueio,0)=0';
        $stmt = $conn->prepare($sql);
        $stmt->execute(['tipo_v'=>$tipo,'tipo_c'=>$tipo,'tipo_p'=>$tipo]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
            $r['tipo']=$tipo;
            $r['bruto_centavos']=repasseCentavos($r['preco_total']);
            $r['comissao_centavos']=(int)round($r['bruto_centavos']*0.10);
            $r['liquido_centavos']=$r['bruto_centavos']-$r['comissao_centavos'];
            $r['legado_centavos']=repasseCentavos($r['legado_total']);
            $r['tem_iban']=!empty($r['iban_numero']);
            $r['revisoes']=$revisoes[$tipo.':'.$r['reserva_id']] ?? [];
            $r['revisao_resultado']=$r['revisoes'][0]['resultado'] ?? null;
            $r=array_merge($r,repasseEstado($r,new DateTimeImmutable('now')));
            $rows[]=$r;
        }
    }
    return $rows;
}

try {
    $input=json_decode(file_get_contents('php://input'),true,512,JSON_THROW_ON_ERROR);
    if (!is_array($input)) throw new InvalidArgumentException('Pedido inválido.');
    require __DIR__ . '/../config.php';
    if (!isset($conn) && isset($pdo) && $pdo instanceof PDO) $conn=$pdo;
    if ((!isset($conn) || !($conn instanceof PDO)) && isset($host,$db_name,$username,$password)) {
        $conn=new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4",$username,$password);
    }
    if (!isset($conn) || !($conn instanceof PDO)) throw new RuntimeException('PDO missing');
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    require_once __DIR__ . '/../reserva-validacao.php';
    $admin=utilizadorReservaQR($conn,'admin');
    $action=$input['action'] ?? '';
    if ($action==='painel') {
        $rows=carregarReservasRepasse($conn);
        $hist=$conn->query("SELECT rp.*, u.nome AS prestador_nome,
            tr.tipo, tr.reserva_id, tr.data_transferencia, tr.referencia
            FROM repasses rp LEFT JOIN usuarios u ON u.id=rp.prestador_id
            LEFT JOIN repasse_transferencias tr ON tr.repasse_id=rp.id
            ORDER BY rp.registado_em DESC, rp.id DESC")->fetchAll(PDO::FETCH_ASSOC);
        respostaRepasse(200,['status'=>'success','reservas'=>$rows,'historico'=>$hist]);
    }
    $tipo=$input['tipo'] ?? '';
    $id=filter_var($input['reserva_id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $map=categoriasRepasse();
    if (!is_string($tipo) || !isset($map[$tipo]) || !$id) throw new InvalidArgumentException('Reserva inválida.');
    [$table,$listing,$fk,$owner]=$map[$tipo];
    if ($action === 'guardar_verificacao') {
        $resultado=$input['resultado'] ?? '';
        $motivo=trim((string)($input['motivo'] ?? ''));
        $mensagem=trim((string)($input['mensagem'] ?? ''));
        $revisao=$input['proxima_revisao'] ?? null;
        if (!in_array($resultado,['concluido','retido'],true) || strlen($motivo)<10 || strlen($motivo)>5000 || strlen($mensagem)<10 || strlen($mensagem)>5000) throw new InvalidArgumentException('Preencha o resultado, a fundamentação e a mensagem ao prestador (mínimo 10 caracteres).');
        if ($resultado==='retido') {
            $data=is_string($revisao) ? DateTimeImmutable::createFromFormat('!Y-m-d',$revisao) : false;
            if (!$data || $data->format('Y-m-d')!==$revisao || $revisao<date('Y-m-d')) throw new InvalidArgumentException('Indique uma próxima revisão válida, a partir de hoje.');
        } else $revisao=null;
        $evidencia=empty($input['evidencia_url']) ? null : normalizarComprovativoRepasse($input['evidencia_url']);
        $conn->beginTransaction();
        $lock=$conn->prepare("SELECT id FROM $table WHERE id=? FOR UPDATE"); $lock->execute([$id]);
        $row=null;
        foreach (carregarReservasRepasse($conn) as $candidate) if ($candidate['tipo']===$tipo && (int)$candidate['reserva_id']===$id) { $row=$candidate; break; }
        if (!$row || !empty($row['repasse_id'])) throw new InvalidArgumentException('Reserva inexistente ou já repassada.');
        if ($resultado==='concluido' && (empty($row['validado_em']) || !$row['concluido'] || !$row['cliente_pago'])) throw new InvalidArgumentException('A confirmação exige QR validado, serviço terminado e pagamento do cliente.');
        $stmt=$conn->prepare('INSERT INTO repasse_revisoes(tipo,reserva_id,resultado,motivo,mensagem,evidencia_url,proxima_revisao,administrador_id) VALUES(?,?,?,?,?,?,?,?)');
        $stmt->execute([$tipo,$id,$resultado,$motivo,$mensagem,$evidencia,$revisao,$admin]);
        $stmt=$conn->prepare("INSERT INTO notificacoes(usuario_id,titulo,mensagem,tipo,criado_em) VALUES(?,?,?,'financeiro',NOW())");
        $stmt->execute([$row['prestador_id'],'Verificação do repasse — '.$row['codigo_reserva'],$mensagem]);
        $conn->commit();
        respostaRepasse(200,['status'=>'success']);
    }
    if ($action === 'confirmar_conclusao') throw new InvalidArgumentException('A validação do QR Code é obrigatória. A confirmação manual não autoriza repasses.');
    if ($action !== 'registar_repasse') throw new InvalidArgumentException('Ação inválida.');
    if (($input['transferencia_confirmada'] ?? false) !== true) throw new InvalidArgumentException('Confirme que a transferência bancária já foi concluída antes de guardar o registo.');
    $conn->beginTransaction();
    // Serializa operacoes do mesmo prestador e da mesma reserva.
    $lock=$conn->prepare("SELECT l.$owner FROM $table r INNER JOIN $listing l ON l.id=r.$fk WHERE r.id=?");
    $lock->execute([$id]); $prestador=$lock->fetchColumn();
    if (!$prestador) throw new InvalidArgumentException('Reserva não encontrada.');
    $lock=$conn->prepare('SELECT id FROM usuarios WHERE id=? FOR UPDATE'); $lock->execute([$prestador]);
    $lock=$conn->prepare("SELECT id FROM $table WHERE id=? FOR UPDATE"); $lock->execute([$id]);
    $row=null;
    foreach (carregarReservasRepasse($conn) as $candidate) {
        if ($candidate['tipo']===$tipo && (int)$candidate['reserva_id']===$id) { $row=$candidate; break; }
    }
    if (!$row) throw new InvalidArgumentException('Reserva não encontrada.');
    if (empty($row['validado_em'])) throw new InvalidArgumentException('Valide primeiro o QR Code desta reserva antes de registar o repasse.');
    if (!$row['pode_registar']) throw new InvalidArgumentException('Reserva não disponível, já paga, sem IBAN ou com pagamentos antigos por reconciliar.');
    $referencia=trim((string)($input['referencia'] ?? ''));
    $comprov=normalizarComprovativoRepasse($input['comprovativo_url'] ?? '');
    $date=$input['data_transferencia'] ?? '';
    $key=$input['pedido_chave'] ?? '';
    $dateObject=is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d',$date) : false;
    if (!$dateObject || $dateObject->format('Y-m-d')!==$date || $date>date('Y-m-d')) throw new InvalidArgumentException('Indique uma data válida para a transferência, sem ser uma data futura.');
    if (strlen($referencia)<3 || strlen($referencia)>150) throw new InvalidArgumentException('A referência da transferência deve ter entre 3 e 150 caracteres.');
    if (!is_string($key) || !preg_match('/^[a-zA-Z0-9-]{16,64}$/D',$key)) throw new InvalidArgumentException('Reabra o formulário para gerar um identificador de registo válido.');
    if (repasseCentavos($input['valor'] ?? 0)!==$row['liquido_centavos']) throw new InvalidArgumentException('O valor deve corresponder ao líquido desta reserva.');
    // Um cancelamento de teste permite novo registo sem perder o historico.
    $stmt=$conn->prepare("DELETE ri FROM repasse_itens ri INNER JOIN repasses rp ON rp.id=ri.repasse_id WHERE ri.tipo=? AND ri.reserva_id=? AND rp.estado='cancelado'");
    $stmt->execute([$tipo,$id]);
    $stmt=$conn->prepare("INSERT INTO repasses(prestador_id,reserva_id,valor,metodo,iban_destino,comprovativo_url,observacoes,registado_por,registado_em,estado) VALUES(?,?,?,'transferencia',?,?,?,?,NOW(),'pago')");
    $stmt->execute([$prestador,$id,$row['liquido_centavos']/100,$row['iban_numero'],$comprov,trim((string)($input['observacoes'] ?? '')),$admin]);
    $repasse=(int)$conn->lastInsertId();
    $stmt=$conn->prepare('INSERT INTO repasse_itens(tipo,reserva_id,repasse_id,valor) VALUES(?,?,?,?)');
    $stmt->execute([$tipo,$id,$repasse,$row['liquido_centavos']/100]);
    $stmt=$conn->prepare('INSERT INTO repasse_transferencias(repasse_id,tipo,reserva_id,data_transferencia,referencia,pedido_chave) VALUES(?,?,?,?,?,?)');
    $stmt->execute([$repasse,$tipo,$id,$date,$referencia,$key]);
    $conn->commit();
    respostaRepasse(200,['status'=>'success','repasse_id'=>$repasse]);
} catch (InvalidArgumentException | JsonException $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    respostaRepasse(422,['status'=>'error','message'=>$e->getMessage()]);
} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    error_log('[repasses] '.$e->getMessage());
    respostaRepasse(500,['status'=>'error','message'=>'Não foi possível processar os repasses. Verifique a instalação da migração e tente novamente.']);
}
