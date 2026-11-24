<?php
declare(strict_types=1);
require_once __DIR__ . '/carroStripeStock.php';
require_once __DIR__ . '/carroCaucao.php';
require_once __DIR__ . '/carroDocumentos.php';

class CarroPagamentoException extends DomainException {
    public string $codigo;
    public function __construct(string $codigo, string $mensagem) {
        parent::__construct($mensagem); $this->codigo=$codigo;
    }
}

/** One transaction and one car lock for entry, refresh, payment and release. */
function carroPagamentoPreparar(PDO $db, $stripe, array $data): array {
    $r=$data['reserva']??[];$token=$data['pedido_stock']??'';
    $id=filter_var($r['carro_id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $qtd=filter_var($r['quantidade']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $inicio=(string)($r['checkIn']??'');$fim=(string)($r['checkOut']??'');
    $action=$data['acao']??'iniciar';
    if(!$id || !$qtd || !is_string($token) || !preg_match('/^[a-f0-9]{64}$/D',$token)
        || !in_array($action,['iniciar','estado','validar','falha'],true)) throw new InvalidArgumentException('Pedido de reserva inválido.');
    carroPeriodoStock($inicio,$fim);
    $db->beginTransaction();
    try {
        $db->prepare('SELECT id FROM carros WHERE id=? FOR UPDATE')->execute([$id]);
        carroLibertarRetencoesExpiradas($db,$id,$stripe);
        $s=$db->prepare('SELECT * FROM carro_stock_retencoes WHERE token=? FOR UPDATE');$s->execute([$token]);
        $hold=$s->fetch(PDO::FETCH_ASSOC);
        $now=(string)$db->query('SELECT UTC_TIMESTAMP()')->fetchColumn();
        if($hold && ((int)$hold['carro_id']!==$id || (int)$hold['quantidade']!==$qtd || $hold['data_levantamento']!==$inicio || $hold['data_devolucao']!==$fim)) {
            throw new CarroPagamentoException('CARRO_PEDIDO_INVALIDO','Os dados da reserva foram alterados.');
        }
        if(!$hold && $action!=='iniciar') throw new CarroPagamentoException('CARRO_RETENCAO_EXPIRADA','O prazo da reserva terminou.');
        if($hold && $hold['estado']!=='ativa') {
            // Commit expiration cleanup even when this request is rejected.
            $db->commit();
            throw new CarroPagamentoException('CARRO_RETENCAO_EXPIRADA','O prazo da reserva terminou.');
        }
        $conditions=$hold && !empty($hold['caucao_json'])?json_decode($hold['caucao_json'],true,512,JSON_THROW_ON_ERROR):carroCondicoesPagamento($db,$id,$qtd,$inicio,$fim);
        try {
            $horarios=carroHorariosValidar($conditions['horarios']??carroHorariosLer($db,$id),(string)($r['hora_levantamento']??''),(string)($r['hora_devolucao']??''));
            if($hold && (($hold['hora_levantamento']??'')!==$horarios['hora_levantamento'].':00' || ($hold['hora_devolucao']??'')!==$horarios['hora_devolucao'].':00'))throw new InvalidArgumentException('Horas alteradas.');
            $conditions['horarios']=$horarios;
        } catch(InvalidArgumentException $e) {throw new CarroPagamentoException('CARRO_HORARIOS_INVALIDOS',$e->getMessage());}
        try {
            $docs=carroDocumentosValidar($db,$data['documentos_condutor']??[],$id,$inicio,$fim,(string)($data['documentos_condutor']['email']??''),$token);
            if(isset($conditions['documentos_lote']) && $conditions['documentos_lote']!==$docs['id'])throw new DomainException('Documentos alterados.');
            $conditions['documentos_lote']=$docs['id'];
        } catch(DomainException $e) {throw new CarroPagamentoException('CARRO_DOCUMENTOS_INVALIDOS','Envie os três documentos antes de pagar.');}
        $amount=(int)round($conditions['total_aluguer']/110.265*100);
        if(!$hold) {
            $caucao=$conditions['caucao'];
            if(!array_key_exists('exige_caucao',$r) || !array_key_exists('caucao_valor',$r)
                || (int)$r['exige_caucao']!==$caucao['exige_caucao'] || abs((float)$r['caucao_valor']-$caucao['caucao_valor'])>.001) {
                $db->commit();
                return ['error'=>'A caução foi atualizada.','code'=>'CAUCAO_ALTERADA','caucao'=>$caucao,'http_status'=>409];
            }
            if((int)$data['amount']!==$amount) throw new CarroPagamentoException('ALUGUER_ALTERADO','O preço de aluguer foi atualizado.');
            if(carroStockLer($db,$id,$inicio,$fim,true,null,false,$horarios['hora_levantamento'],$horarios['hora_devolucao'])['quantidade_disponivel']<$qtd) throw new CarroPagamentoException('CARRO_SEM_STOCK','Não há carros disponíveis para este período.');
            $expires=gmdate('Y-m-d H:i:s',strtotime($now.' UTC')+300);
            $db->prepare('INSERT INTO carro_stock_retencoes(token,carro_id,data_levantamento,data_devolucao,quantidade,expira_em) VALUES(?,?,?,?,?,?)')->execute([$token,$id,$inicio,$fim,$qtd,$expires]);
            $db->prepare('UPDATE carro_stock_retencoes SET hora_levantamento=?,hora_devolucao=? WHERE token=?')->execute([$horarios['hora_levantamento'].':00',$horarios['hora_devolucao'].':00',$token]);
            $intent=$stripe->paymentIntents->create(['amount'=>$amount,'currency'=>'eur','payment_method_types'=>['card'],
                'description'=>'Reserva Morabeza Stay','metadata'=>['tipo'=>'carro','carro_id'=>(string)$id,'token_stock'=>$token]],['idempotency_key'=>'carro_stock_'.$token]);
            $db->prepare('UPDATE carro_stock_retencoes SET stripe_id=?,caucao_json=? WHERE token=?')->execute([$intent->id,json_encode($conditions,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$token]);
            $hold=['expira_em'=>$expires];
        } else {
            $intent=$stripe->paymentIntents->retrieve($hold['stripe_id']);
            if((int)$intent->amount!==$amount || $intent->currency!=='eur') throw new CarroPagamentoException('ALUGUER_ALTERADO','O valor do pedido mudou.');
            $db->prepare('UPDATE carro_stock_retencoes SET caucao_json=? WHERE token=?')->execute([json_encode($conditions,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$token]);
        }
        $failed=$action==='falha' && $intent->status==='requires_payment_method' && !empty($intent->last_payment_error);
        $expired=$hold['expira_em']<=$now;
        if($failed || $intent->status==='canceled' || ($expired && !carroPagamentoEmCurso($intent->status))) {
            if(carroCancelarRetencao($db,$stripe,$token,$intent)) {
                $db->commit();
                throw new CarroPagamentoException($failed?'CARRO_PAGAMENTO_FALHOU':'CARRO_RETENCAO_EXPIRADA',$failed?'O pagamento falhou. A unidade foi libertada.':'O prazo da reserva terminou.');
            }
            // A concurrent Stripe confirmation may have won the cancellation race.
            $intent=$stripe->paymentIntents->retrieve($intent->id);
        }
        $db->commit();
        return ['clientSecret'=>$intent->client_secret,'alreadyPaid'=>$intent->status==='succeeded','paymentStatus'=>$intent->status,
            'expiresAt'=>str_replace(' ','T',$hold['expira_em']).'Z','serverNow'=>str_replace(' ','T',$now).'Z'];
    } catch(Throwable $e) {
        if($db->inTransaction()) $db->rollBack();
        throw $e;
    }
}
