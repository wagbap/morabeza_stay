<?php
declare(strict_types=1);
require_once __DIR__ . '/../server/api/admin/repassesLogica.php';
function checkRepasse(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$now = new DateTimeImmutable('2026-10-30 12:00:00');
$base = ['status'=>'confirmada','pagamento_status'=>'pago','fim'=>'2026-10-26','validado_em'=>'2026-10-25 10:00:00','confirmado_em'=>null,'tem_iban'=>true,'legado_centavos'=>0,'repasse_id'=>null];
$r=repasseEstado($base,$now);
checkRepasse($r['estado']==='disponivel' && $r['pode_registar'], 'Eligible booking must allow manual payout');
checkRepasse($r['prazo']==='2026-10-29' && $r['atrasado'], 'Three business days from the service end date');
checkRepasse(repasseEstado(array_merge($base,['fim'=>'2026-11-02']),$now)['estado']==='aguardar', 'Confirmed booking in progress must not become available');
checkRepasse(repasseEstado(array_merge($base,['validado_em'=>null]),$now)['estado']==='verificar', 'Past booking without validation needs review');
checkRepasse(repasseEstado(array_merge($base,['validado_em'=>null,'confirmado_em'=>'2026-10-29 10:00:00']),$now)['estado']==='verificar', 'Administrative confirmation must never replace QR validation');
checkRepasse(!repasseEstado(array_merge($base,['validado_em'=>null,'fim'=>'2026-11-02']),$now)['pode_registar'], 'Unvalidated future booking cannot be paid out');
checkRepasse(!repasseEstado(array_merge($base,['validado_em'=>'2026-11-02 10:00:00']),$now)['pode_registar'], 'Future validation timestamp cannot authorize payout');
foreach (['aguardando','falhou','reembolsado'] as $payment) {
    $r=repasseEstado(array_merge($base,['pagamento_status'=>$payment]),$now);
    checkRepasse($r['estado']==='retido' && !$r['pode_registar'], 'Unpaid or refunded booking must not be paid out');
}
checkRepasse(!repasseEstado(array_merge($base,['status'=>'pendente']),$now)['pode_registar'], 'Pending booking cannot be paid out');
checkRepasse(!repasseEstado(array_merge($base,['status'=>'cancelada']),$now)['pode_registar'], 'Cancelled booking cannot be paid out');
checkRepasse(repasseEstado(array_merge($base,['repasse_id'=>45]),$now)['estado']==='pago', 'Existing payout must prevent duplicates');
checkRepasse(!repasseEstado(array_merge($base,['tem_iban'=>false]),$now)['pode_registar'], 'Missing IBAN disables registration');
checkRepasse(repasseEstado(array_merge($base,['legado_centavos'=>71690000]),$now)['motivo']==='legado', 'Legacy payouts need reconciliation before further payment');
checkRepasse(repassePrazo('2026-10-30')==='2026-11-04', 'Business days must skip the weekend');
checkRepasse(repasseCentavos('648.90')===64890, 'Amounts must retain cents');
checkRepasse(repasseCentavos('1000.00')-(int)round(repasseCentavos('1000.00')*0.1)===90000, '1000 CVE yields 900 CVE net');
foreach (['/uploads/teste.pdf','uploads/teste.pdf','https:///welovepalop.com/uploads/teste.pdf','http://welovepalop.com/uploads/teste.pdf'] as $url) {
    checkRepasse(normalizarComprovativoRepasse($url)==='https://welovepalop.com/uploads/teste.pdf', 'Normalize legacy upload URL');
}
checkRepasse(normalizarComprovativoRepasse('/api/uploads/teste.pdf')==='https://welovepalop.com/api/uploads/teste.pdf', 'Accept the API upload directory');
foreach (['https://example.com/uploads/teste.pdf','https://welovepalop.com/config.php','https://welovepalop.com/uploads/%2e%2e/config.php','javascript:alert(1)','https://user@welovepalop.com/uploads/teste.pdf'] as $url) {
    try { normalizarComprovativoRepasse($url); throw new RuntimeException('Invalid upload URL accepted'); }
    catch (InvalidArgumentException $expected) { }
}
echo "PASS: payout eligibility, manual confirmation, duplicate prevention state, IBAN, legacy reconciliation, business days and cents.\n";
