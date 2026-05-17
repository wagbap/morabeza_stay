import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, CreditCard, ArrowLeft, ChevronRight, 
  ShieldCheck, Lock, AlertCircle, Loader, Users, Wallet
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Importação dos Resumos
import ResumoReservaExperiencia from '../features/experiencias/components/ResumoReservaExperiencia';
import ResumoReservaAlojamento from '../features/alojamento/components/ResumoReservaAlojamento';
import PayPalButton from './PayPalButton';

const stripePromise = loadStripe('pk_test_51Q2vbsBGBgdae3VE253hWrzJikRaIK6tYOlWOeCKkFt6GArcJUZrNoaBc21vXz1F0sxPc3ErEqskwvQFf2EIDov200ZtBcleBd');

const PagamentoContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const { reservaData, dadosParticipantes, tipo: tipoState } = location.state || {};

  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState(reservaData || {});
  const [tipo, setTipo] = useState(tipoState || 'experiencia');
  const [payPalLoading, setPayPalLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Se não veio por state, tenta recuperar do sessionStorage baseado no tipo
    if (!reservaData) {
      const cacheAlojamento = sessionStorage.getItem('reservaAlojamentoPendente');
      const cacheExperiencia = sessionStorage.getItem('reservaPendente');

      if (cacheAlojamento) {
        const dados = JSON.parse(cacheAlojamento);
        setReserva(dados.reservaData);
        setTipo('alojamento');
      } else if (cacheExperiencia) {
        const dados = JSON.parse(cacheExperiencia);
        setReserva(dados.reservaData);
        setTipo('experiencia');
      } else {
        navigate('/');
      }
    }
  }, [reservaData, navigate]);

  const enviarEmailsConfirmacao = async (dadosAPI) => {
    try {
      console.log('📧 Iniciando envio de emails...');
      const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' : 'reservaPendente';
      const cache = sessionStorage.getItem(keyStorage);
      if (!cache) return;

      const dados = JSON.parse(cache);
      const { reservaData: rD, participantePrincipal, participantesAdicionais } = dados;

      const dataFormatada = tipo === 'alojamento' 
        ? `${rD.checkIn} até ${rD.checkOut}`
        : (rD.data || rD.entrada || new Date().toLocaleDateString('pt-PT'));

      const horarioFormatado = tipo === 'alojamento'
        ? `${rD.noites} noites`
        : `${rD.periodo || ''} ${rD.horario || ''}`.trim();

      // 🔥 CORREÇÃO DA CHAVE: Alterado de 'font_cliente' para 'nome_cliente' para bater certo com a validação do PHP
      const emailPayload = {
        email_cliente: participantePrincipal.email,
        nome_cliente: participantePrincipal.nome_completo,
        phone_cliente: participantePrincipal.phone || '',
        codigo_reserva: dadosAPI.codigo_reserva,
        reserva_id: String(dadosAPI.reserva_id),
        experiencia: rD.titulo,
        data: dataFormatada,
        horario: horarioFormatado,
        quantidade_pessoas: tipo === 'alojamento' ? (rD.totalHospedes || 1) : (rD.participantes || 1),
        preco_total: tipo === 'alojamento' ? rD.totalGeral : rD.precoTotal,
        metodo_pagamento: metodoPagamento,
        status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
        participante_principal: {
          nome_completo: participantePrincipal.nome_completo,
          email: participantePrincipal.email,
          phone: participantePrincipal.phone || ''
        },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({
          nome_completo: p.nome_completo || '',
          email: p.email || '',
          phone: p.phone || ''
        }))
      };

      await fetch('https://welovepalop.com/api/send_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.error('❌ Erro ao enviar e-mails:', err);
    }
  };

  const salvarReservaNoBackend = async (dadosTransacao) => {
    const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' : 'reservaPendente';
    const cache = sessionStorage.getItem(keyStorage);
    if (!cache) throw new Error("Os dados da sua sessão de reserva expiraram.");

    const dados = JSON.parse(cache);
    const { reservaData: rD, participantePrincipal: pP, participantesAdicionais: pA, usuario } = dados;

    const payload = {
      category: tipo === 'alojamento' ? 'Alojamento' : 'Experiencia',
      usuario: {
        email: pP.email,
        nome_completo: pP.nome_completo,
        phone: pP.phone,
        google_id: usuario?.google_id || null
      },
      reserva: tipo === 'alojamento' ? {
        alojamento_id: rD.id,
        data_checkin: rD.checkIn,
        data_checkout: rD.checkOut,
        quantidade_hospedes: rD.totalHospedes,
        preco_total: rD.totalGeral,
        noites: rD.noites
      } : {
        experiencia_id: rD.id,
        data_participacao: rD.dataISO,
        horario: `${rD.periodo || ''} ${rD.horario || ''}`.trim(),
        quantidade_pessoas: rD.participantes,
        preco_total: rD.precoTotal
      },
      participante_principal: { ...pP },
      participantes_adicionais: pA.map(p => ({ ...p })),
      metodo_pagamento: metodoPagamento,
      status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
      transaction_id: dadosTransacao?.id || dadosTransacao?.paypal_capture_id || null,
      paypal_order_id: dadosTransacao?.paypal_order_id || null,
      paypal_capture_id: dadosTransacao?.paypal_capture_id || null,
      stripe_id: dadosTransacao?.id || null
    };

    const response = await fetch('https://welovepalop.com/api/checkout_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success && result.data) {
      await enviarEmailsConfirmacao(result.data);
    }
    return result;
  };

  const handlePayPalSuccess = async (paypalData) => {
    setPayPalLoading(true);
    setError('');
    try {
      const transactionData = {
        id: paypalData.id,
        paypal_order_id: paypalData.id,
        paypal_capture_id: paypalData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalData.id
      };

      const saveResult = await salvarReservaNoBackend(transactionData);
      if (saveResult.success) {
        finalizeSucesso(saveResult.data);
      } else {
        setError(saveResult.error || "Erro ao registrar a reserva.");
      }
    } catch (err) {
      setError(err.message || "Erro no processamento do PayPal.");
    } finally {
      setPayPalLoading(false);
    }
  };

  const handlePayPalError = (err) => {
    setError(err.message || "Ocorreu um erro com o seu pagamento via PayPal.");
  };

  const handleFinalizarPagamento = async () => {
    setLoading(true);
    setError('');
    try {
      if (metodoPagamento === 'cartao') {
        if (!stripe || !elements) {
          setError("O módulo de pagamento do Stripe não foi carregado.");
          setLoading(false);
          return;
        }

        const totalPagar = tipo === 'alojamento' ? reserva.totalGeral : reserva.precoTotal;
        const taxaConversao = 110.265;
        let valorEmEUR = totalPagar / taxaConversao;

        if (valorEmEUR < 0.50) {
          setError(`Montante mínimo para cartões é €0,50. O seu total (${valorEmEUR.toFixed(2)}€) é insuficiente.`);
          setLoading(false);
          return;
        }

        const valorEmCentavos = Math.round(valorEmEUR * 100);

        const resIntent = await fetch('https://welovepalop.com/api/create-payment-intent.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: valorEmCentavos, currency: 'eur' })
        });

        const dataIntent = await resIntent.json();
        if (!resIntent.ok) throw new Error(dataIntent.error || "Erro no servidor de pagamentos.");

        const result = await stripe.confirmCardPayment(dataIntent.clientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

        if (result.error) {
          setError(result.error.message);
          setLoading(false);
          return;
        }

        const saveResult = await salvarReservaNoBackend(result.paymentIntent);
        if (saveResult.success) {
          finalizeSucesso(saveResult.data);
        } else {
          setError(saveResult.error || "Ocorreu um erro ao registar a sua reserva.");
        }
      } else if (metodoPagamento === 'transferencia' || metodoPagamento === 'zap') {
        const saveResult = await salvarReservaNoBackend();
        if (saveResult.success) {
          finalizeSucesso(saveResult.data);
        } else {
          setError(saveResult.error || "Ocorreu um erro ao registar a sua reserva.");
        }
      }
    } catch (err) {
      setError(err.message || "Erro geral ao processar o seu pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeSucesso = (data) => {
    const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' : 'reservaPendente';
    sessionStorage.removeItem(keyStorage);
    
    navigate('/confirmacao', { 
      state: { 
        reservaId: data.reserva_id,
        codigoReserva: data.codigo_reserva,
        reservaData: reserva,
        metodoPagamento,
        tipo,
        status: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente'
      } 
    });
  };

  const getPayPalReservationData = () => {
    const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' : 'reservaPendente';
    const cache = sessionStorage.getItem(keyStorage);
    if (cache) {
      const dados = JSON.parse(cache);
      return {
        titulo: reserva.titulo,
        reserva_id: reserva.id,
        email_cliente: dados.participantePrincipal?.email,
        nome_cliente: dados.participantePrincipal?.nome_completo,
        phone_cliente: dados.participantePrincipal?.phone
      };
    }
    return { titulo: reserva.titulo, nome_cliente: 'Cliente', email_cliente: '' };
  };

  const isPayPalAmountValid = () => {
    const totalPagar = tipo === 'alojamento' ? (reserva.totalGeral || 0) : (reserva.precoTotal || 0);
    return (totalPagar / 110.265) >= 0.50;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* STEPPER */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {[
            { n: 1, label: tipo === 'alojamento' ? 'Dados dos hóspedes' : 'Dados dos participantes', check: true },
            { n: 2, label: 'Pagamento', active: true },
            { n: 3, label: 'Confirmação' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center min-w-[120px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  s.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                  s.check ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-400'
                }`}>
                  {s.check ? <Check size={14} strokeWidth={3} /> : s.n}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${s.active || s.check ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">Pagamento</h1>
            <p className="text-slate-500 text-sm mb-6 text-left font-medium">Escolha o método de pagamento preferencial para concluir a sua reserva.</p>
            
            <div className="bg-[#F8FFF9] border border-green-100 rounded-2xl p-4 flex gap-3 mb-8 text-left">
              <ShieldCheck className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-green-900">Ambiente de pagamento seguro</p>
                <p className="text-xs text-green-700 font-medium">Os seus dados encontram-se protegidos através de encriptação SSL de nível bancário.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm text-left font-medium">
                <AlertCircle className="shrink-0 text-red-500" size={20} /> {error}
              </div>
            )}

            <div className="space-y-4 text-left">
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4">Selecione o método de pagamento</h3>
              
              {/* STRIPE */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'cartao' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'cartao'} onChange={() => setMetodoPagamento('cartao')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <CreditCard className="ml-4 text-blue-900" size={20} />
                  <span className="ml-3 text-sm font-bold text-blue-900 flex-1">Cartão de Crédito / Débito (Stripe)</span>
                  <div className="flex gap-1 shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                  </div>
                </label>
                
                {metodoPagamento === 'cartao' && (
                  <div className="px-12 pb-6 duration-300 animate-in fade-in">
                    <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '14px',
                            color: '#0f172a',
                            fontFamily: 'sans-serif',
                            '::placeholder': { color: '#94a3b8' },
                          },
                          invalid: { color: '#ef4444' },
                        },
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* PAYPAL */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'paypal' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'paypal'} onChange={() => setMetodoPagamento('paypal')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <Wallet className="ml-4 text-[#0070ba]" size={20} />
                  <span className="ml-3 text-sm font-bold text-blue-900 flex-1">PayPal</span>
                  <img src="https://www.paypal.com/webapps/mpp/assets/images/logo/logo_paypal_pill.png" alt="PayPal" className="h-5 shrink-0" />
                </label>
                
                {metodoPagamento === 'paypal' && (
                  <div className="px-12 pb-6 duration-300 animate-in fade-in">
                    {!isPayPalAmountValid() ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <AlertCircle className="text-amber-600 mx-auto mb-2" size={24} />
                        <p className="text-sm font-bold text-amber-800">Montante mínimo não elegível</p>
                        <p className="text-xs text-amber-700 mt-1 font-medium">
                          O PayPal requer um valor mínimo de transação de €0.50 EUR.<br />
                          Por favor selecione outra modalidade de pagamento para concluir o processo.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                        {payPalLoading ? (
                          <div className="flex items-center justify-center py-4 text-slate-500 text-sm font-medium">
                            <Loader className="animate-spin text-blue-600 mr-2" size={20} /> Processando transação...
                          </div>
                        ) : (
                          <PayPalButton
                            amount={tipo === 'alojamento' ? reserva.totalGeral : reserva.precoTotal}
                            currency="CVE"
                            reservationData={getPayPalReservationData()}
                            onSuccess={handlePayPalSuccess}
                            onError={handlePayPalError}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TRANSFERÊNCIA BANCÁRIA */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'transferencia' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'transferencia'} onChange={() => setMetodoPagamento('transferencia')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <Users className="ml-4 text-slate-600" size={20} />
                  <div className="ml-3">
                    <p className="text-sm font-bold text-blue-900">Transferência Bancária / Depósito</p>
                    <p className="text-xs text-slate-500 font-medium">Os dados das contas bancárias locais ser-lhe-ão fornecidos por e-mail após a confirmação.</p>
                  </div>
                </label>
              </div>

              {/* ZAP */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'zap' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'zap'} onChange={() => setMetodoPagamento('zap')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-4 text-[#E91E63] font-black italic text-lg font-sans">zap</span>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-blue-900">Pagamento Digital ZAP</p>
                    <p className="text-xs text-slate-500 font-medium">Liquidação imediata através da rede digital ZAP. Contacte o suporte para validação.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4">
              <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition text-slate-700 shadow-sm">
                <ArrowLeft size={18}/> Voltar
              </button>
              
              {metodoPagamento !== 'paypal' && (
                <button 
                  onClick={handleFinalizarPagamento}
                  disabled={loading}
                  className="flex-1 max-w-md bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <><Lock size={16} /> Confirmar Reserva e Concluir <ChevronRight size={18}/></>}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            {tipo === 'alojamento' ? (
              <ResumoReservaAlojamento 
                reserva={reserva}
                totalHospedes={reserva?.totalHospedes}
                precoTotal={reserva?.totalGeral}
                showPaymentInfo={true}
                paymentStatus="pending"
              />
            ) : (
              <ResumoReservaExperiencia 
                reserva={reserva}
                totalPessoas={reserva?.participantes}
                precoTotal={reserva?.precoTotal}
                showPaymentInfo={true}
                paymentStatus="pending"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagamento = () => {
  return (
    <Elements stripe={stripePromise}>
      <PagamentoContent />
    </Elements>
  );
};

export default Pagamento;