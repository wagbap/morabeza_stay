// Pagamento.jsx - Versão COMPLETA com suporte para Experiências, Alojamentos e Carros
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import ResumoReservaCarro from '../features/carros/components/ResumoReservaCarro';
import PayPalButton from './PayPalButton';

// No topo do ficheiro, depois dos imports
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PagamentoContent = () => {
  const { t } = useTranslation();
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
    
    if (!reservaData || Object.keys(reservaData).length === 0) {
      const cacheAlojamento = sessionStorage.getItem('reservaAlojamentoPendente');
      const cacheExperiencia = sessionStorage.getItem('reservaPendente');
      const cacheCarro = sessionStorage.getItem('reservaCarroPendente');

      if (cacheAlojamento) {
        try {
          const dados = JSON.parse(cacheAlojamento);
          setReserva(dados.reservaData || {});
          setTipo('alojamento');
        } catch (e) { console.error('Erro ao parse cacheAlojamento:', e); }
      } else if (cacheExperiencia) {
        try {
          const dados = JSON.parse(cacheExperiencia);
          setReserva(dados.reservaData || {});
          setTipo('experiencia');
        } catch (e) { console.error('Erro ao parse cacheExperiencia:', e); }
      } else if (cacheCarro) {
        try {
          const dados = JSON.parse(cacheCarro);
          setReserva(dados.reservaData || {});
          setTipo('carro');
        } catch (e) { console.error('Erro ao parse cacheCarro:', e); }
      }
    } else if (tipoState === 'carro') {
      setTipo('carro');
    } else if (tipoState === 'alojamento') {
      setTipo('alojamento');
    } else if (tipoState === 'experiencia') {
      setTipo('experiencia');
    }
  }, [reservaData, tipoState]);

  const enviarEmailsConfirmacao = async (dadosAPI) => {
    try {
      console.log('📧 Iniciando envio de emails...');
      
      let keyStorage;
      if (tipo === 'alojamento') keyStorage = 'reservaAlojamentoPendente';
      else if (tipo === 'carro') keyStorage = 'reservaCarroPendente';
      else keyStorage = 'reservaPendente';
      
      const cache = sessionStorage.getItem(keyStorage);
      if (!cache) {
        console.log('⚠️ Nenhum cache encontrado para:', keyStorage);
        return;
      }

      const dados = JSON.parse(cache);
      const { reservaData: rD, participantePrincipal, participantesAdicionais } = dados;

      if (!participantePrincipal) {
        console.error('❌ participantePrincipal não encontrado no cache');
        return;
      }

      let dataFormatada, horarioFormatado, quantidadeLabel;
      
      if (tipo === 'alojamento') {
        dataFormatada = `${rD?.checkIn || ''} até ${rD?.checkOut || ''}`;
        horarioFormatado = `${rD?.noites || 0} ${t('noites')}`;
        quantidadeLabel = rD?.totalHospedes || 1;
      } else if (tipo === 'carro') {
        dataFormatada = `${rD?.checkIn || ''} até ${rD?.checkOut || ''}`;
        horarioFormatado = `${rD?.dias || 0} ${t('dias')} • ${t('levantamento')}: ${participantePrincipal?.hora_levantamento || '10:00'}`;
        quantidadeLabel = 1;
      } else {
        dataFormatada = rD?.data || rD?.entrada || new Date().toLocaleDateString('pt-PT');
        horarioFormatado = `${rD?.periodo || ''} ${rD?.horario || ''}`.trim();
        quantidadeLabel = rD?.participantes || 1;
      }

      const emailPayload = {
        email_cliente: participantePrincipal.email || '',
        nome_cliente: participantePrincipal.nome_completo || t('cliente'),
        phone_cliente: participantePrincipal.phone || '',
        codigo_reserva: dadosAPI?.codigo_reserva || '',
        reserva_id: String(dadosAPI?.reserva_id || ''),
        experiencia: rD?.titulo || t('reserva_morabeza'),
        data: dataFormatada,
        horario: horarioFormatado,
        quantidade_pessoas: quantidadeLabel,
        preco_total: tipo === 'alojamento' ? (rD?.totalGeral || 0) : (tipo === 'carro' ? (rD?.totalGeral || 0) : (rD?.precoTotal || 0)),
        metodo_pagamento: metodoPagamento,
        status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
        participante_principal: {
          nome_completo: participantePrincipal.nome_completo || '',
          email: participantePrincipal.email || '',
          phone: participantePrincipal.phone || ''
        },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({
          nome_completo: p?.nome_completo || '',
          email: p?.email || '',
          phone: p?.phone || ''
        }))
      };

      await fetch('https://welovepalop.com/api/send_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      console.log('✅ Emails enviados com sucesso');
    } catch (err) {
      console.error('❌ Erro ao enviar e-mails:', err);
    }
  };

  const salvarReservaNoBackend = async (dadosTransacao) => {
    let keyStorage;
    if (tipo === 'alojamento') keyStorage = 'reservaAlojamentoPendente';
    else if (tipo === 'carro') keyStorage = 'reservaCarroPendente';
    else keyStorage = 'reservaPendente';
    
    const cache = sessionStorage.getItem(keyStorage);
    if (!cache) throw new Error(t('erro_sessao_expirada'));

    const dados = JSON.parse(cache);
    const { reservaData: rD, participantePrincipal, participantesAdicionais, usuario } = dados;

    if (!participantePrincipal) {
      throw new Error(t('erro_participante_nao_encontrado'));
    }

    let payload;
    
    if (tipo === 'alojamento') {
      payload = {
        category: 'Alojamento',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null
        },
        reserva: {
          alojamento_id: rD?.id,
          data_checkin: rD?.checkIn,
          data_checkout: rD?.checkOut,
          quantidade_hospedes: rD?.totalHospedes,
          preco_total: rD?.totalGeral,
          noites: rD?.noites
        },
        participante_principal: { ...participantePrincipal },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({ ...p })),
        metodo_pagamento: metodoPagamento,
        status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
        transaction_id: dadosTransacao?.id || dadosTransacao?.paypal_capture_id || null,
        paypal_order_id: dadosTransacao?.paypal_order_id || null,
        paypal_capture_id: dadosTransacao?.paypal_capture_id || null,
        stripe_id: dadosTransacao?.id || null
      };
    } else if (tipo === 'carro') {
      payload = {
        category: 'Carro',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null
        },
        reserva: {
          id: rD?.id,
          checkIn: rD?.checkIn,
          checkOut: rD?.checkOut,
          dias: rD?.dias,
          preco_total: rD?.totalGeral,
          carro_id: rD?.id
        },
        participante_principal: {
          ...participantePrincipal,
          hora_levantamento: participantePrincipal.hora_levantamento || '10:00',
          carta_conducao_nome: participantePrincipal.carta_conducao_nome || '',
          observacoes: participantePrincipal.observacoes || ''
        },
        participantes_adicionais: [],
        metodo_pagamento: metodoPagamento,
        status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
        transaction_id: dadosTransacao?.id || dadosTransacao?.paypal_capture_id || null,
        paypal_order_id: dadosTransacao?.paypal_order_id || null,
        paypal_capture_id: dadosTransacao?.paypal_capture_id || null,
        stripe_id: dadosTransacao?.id || null
      };
    } else {
      payload = {
        category: 'Experiencia',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null
        },
        reserva: {
          experiencia_id: rD?.id,
          data_participacao: rD?.dataISO,
          horario: `${rD?.periodo || ''} ${rD?.horario || ''}`.trim(),
          quantidade_pessoas: rD?.participantes,
          preco_total: rD?.precoTotal
        },
        participante_principal: { ...participantePrincipal },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({ ...p })),
        metodo_pagamento: metodoPagamento,
        status_pagamento: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente',
        transaction_id: dadosTransacao?.id || dadosTransacao?.paypal_capture_id || null,
        paypal_order_id: dadosTransacao?.paypal_order_id || null,
        paypal_capture_id: dadosTransacao?.paypal_capture_id || null,
        stripe_id: dadosTransacao?.id || null
      };
    }

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
        setError(saveResult.error || t('erro_registar_reserva'));
      }
    } catch (err) {
      setError(err.message || t('erro_processamento_paypal'));
    } finally {
      setPayPalLoading(false);
    }
  };

  const handlePayPalError = (err) => {
    setError(err.message || t('erro_paypal'));
  };

  const handleFinalizarPagamento = async () => {
    setLoading(true);
    setError('');
    try {
      if (metodoPagamento === 'cartao') {
        if (!stripe || !elements) {
          setError(t('erro_stripe_nao_carregado'));
          setLoading(false);
          return;
        }

        let totalPagar;
        if (tipo === 'alojamento') totalPagar = reserva?.totalGeral || 0;
        else if (tipo === 'carro') totalPagar = reserva?.totalGeral || 0;
        else totalPagar = reserva?.precoTotal || 0;
        
        const taxaConversao = 110.265;
        let valorEmEUR = totalPagar / taxaConversao;

        if (valorEmEUR < 0.50) {
          setError(t('erro_valor_minimo_cartao', { valor: valorEmEUR.toFixed(2) }));
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
        if (!resIntent.ok) throw new Error(dataIntent.error || t('erro_servidor_pagamentos'));

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
          setError(saveResult.error || t('erro_registar_reserva'));
        }
      } else if (metodoPagamento === 'transferencia' || metodoPagamento === 'zap') {
        const saveResult = await salvarReservaNoBackend();
        if (saveResult.success) {
          finalizeSucesso(saveResult.data);
        } else {
          setError(saveResult.error || t('erro_registar_reserva'));
        }
      }
    } catch (err) {
      setError(err.message || t('erro_geral_pagamento'));
    } finally {
      setLoading(false);
    }
  };

  const finalizeSucesso = (data) => {
    let keyStorage;
    if (tipo === 'alojamento') keyStorage = 'reservaAlojamentoPendente';
    else if (tipo === 'carro') keyStorage = 'reservaCarroPendente';
    else keyStorage = 'reservaPendente';
    
    sessionStorage.removeItem(keyStorage);
    
    navigate('/confirmacao', { 
      state: { 
        reservaId: data?.reserva_id,
        codigoReserva: data?.codigo_reserva,
        reservaData: reserva,
        metodoPagamento,
        tipo,
        status: metodoPagamento === 'cartao' || metodoPagamento === 'paypal' ? 'pago' : 'pendente'
      } 
    });
  };

  const getPayPalReservationData = () => {
    let keyStorage;
    if (tipo === 'alojamento') keyStorage = 'reservaAlojamentoPendente';
    else if (tipo === 'carro') keyStorage = 'reservaCarroPendente';
    else keyStorage = 'reservaPendente';
    
    const cache = sessionStorage.getItem(keyStorage);
    if (cache) {
      try {
        const dados = JSON.parse(cache);
        return {
          titulo: reserva?.titulo || t('reserva'),
          reserva_id: reserva?.id,
          email_cliente: dados.participantePrincipal?.email || '',
          nome_cliente: dados.participantePrincipal?.nome_completo || t('cliente'),
          phone_cliente: dados.participantePrincipal?.phone || ''
        };
      } catch (e) {
        return { titulo: reserva?.titulo || t('reserva'), nome_cliente: t('cliente'), email_cliente: '' };
      }
    }
    return { titulo: reserva?.titulo || t('reserva'), nome_cliente: t('cliente'), email_cliente: '' };
  };

  const isPayPalAmountValid = () => {
    let totalPagar;
    if (tipo === 'alojamento') totalPagar = reserva?.totalGeral || 0;
    else if (tipo === 'carro') totalPagar = reserva?.totalGeral || 0;
    else totalPagar = reserva?.precoTotal || 0;
    return (totalPagar / 110.265) >= 0.50;
  };

  const getTituloStepper = () => {
    if (tipo === 'alojamento') return t('dados_hospedes');
    if (tipo === 'carro') return t('dados_condutor');
    return t('dados_participantes');
  };

  const getMetodoPagamentoLabel = (metodo) => {
    const labels = {
      cartao: t('cartao_credito_debito'),
      paypal: 'PayPal',
      transferencia: t('transferencia_bancaria'),
      zap: 'ZAP'
    };
    return labels[metodo] || metodo;
  };

  const steps = [
    { n: 1, label: getTituloStepper(), check: true },
    { n: 2, label: t('step_pagamento'), active: true },
    { n: 3, label: t('step_confirmacao') }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* STEPPER */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {steps.map((s, i, arr) => (
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
            <h1 className="text-2xl font-bold text-blue-900 mb-2 text-left">{t('pagamento')}</h1>
            <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('escolha_metodo_pagamento')}</p>
            
            <div className="bg-[#F8FFF9] border border-green-100 rounded-2xl p-4 flex gap-3 mb-8 text-left">
              <ShieldCheck className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-green-900">{t('ambiente_pagamento_seguro')}</p>
                <p className="text-xs text-green-700 font-medium">{t('dados_protegidos_ssl')}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm text-left font-medium">
                <AlertCircle className="shrink-0 text-red-500" size={20} /> {error}
              </div>
            )}

            <div className="space-y-4 text-left">
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4">{t('selecione_metodo_pagamento')}</h3>
              
              {/* STRIPE */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'cartao' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'cartao'} onChange={() => setMetodoPagamento('cartao')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <CreditCard className="ml-4 text-blue-900" size={20} />
                  <span className="ml-3 text-sm font-bold text-blue-900 flex-1">{t('cartao_credito_debito_stripe')}</span>
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
                        <p className="text-sm font-bold text-amber-800">{t('montante_minimo_nao_elegivel')}</p>
                        <p className="text-xs text-amber-700 mt-1 font-medium">
                          {t('paypal_valor_minimo')}<br />
                          {t('selecione_outro_metodo')}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                        {payPalLoading ? (
                          <div className="flex items-center justify-center py-4 text-slate-500 text-sm font-medium">
                            <Loader className="animate-spin text-blue-600 mr-2" size={20} /> {t('processando_transacao')}
                          </div>
                        ) : (
                          <PayPalButton
                            amount={tipo === 'alojamento' || tipo === 'carro' ? (reserva?.totalGeral || 0) : (reserva?.precoTotal || 0)}
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
                    <p className="text-sm font-bold text-blue-900">{t('transferencia_bancaria_deposito')}</p>
                    <p className="text-xs text-slate-500 font-medium">{t('info_transferencia')}</p>
                  </div>
                </label>
              </div>

              {/* ZAP */}
              <div className={`border rounded-2xl transition ${metodoPagamento === 'zap' ? 'border-blue-600 bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" name="metodoPagamento" checked={metodoPagamento === 'zap'} onChange={() => setMetodoPagamento('zap')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-4 text-[#E91E63] font-black italic text-lg font-sans">zap</span>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-blue-900">{t('pagamento_zap')}</p>
                    <p className="text-xs text-slate-500 font-medium">{t('info_zap')}</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4">
              <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition text-slate-700 shadow-sm">
                <ArrowLeft size={18}/> {t('voltar')}
              </button>
              
              {metodoPagamento !== 'paypal' && (
                <button 
                  onClick={handleFinalizarPagamento}
                  disabled={loading}
                  className="flex-1 max-w-md bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <><Lock size={16} /> {t('confirmar_reserva_concluir')} <ChevronRight size={18}/></>}
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
            ) : tipo === 'carro' ? (
              <ResumoReservaCarro 
                reserva={reserva}
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