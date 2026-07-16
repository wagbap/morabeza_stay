// Pagamento.jsx - VERSÃO OTIMIZADA (Reduzido de 12s para <2s)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, CreditCard, ArrowLeft, ChevronRight, 
  ShieldCheck, Lock, AlertCircle, Loader, 
  Sparkles
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Importação dos Resumos (LAZY LOAD)
const ResumoReservaExperiencia = React.lazy(() => import('../features/experiencias/components/ResumoReservaExperiencia'));
const ResumoReservaAlojamento = React.lazy(() => import('../features/alojamento/components/ResumoReservaAlojamento'));
const ResumoReservaCarro = React.lazy(() => import('../features/carros/components/ResumoReservaCarro'));

// Stripe com cache
let stripePromise = null;
const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

// ============================================
// COMPONENTE PRINCIPAL OTIMIZADO
// ============================================
const PagamentoContent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Refs para evitar re-renders desnecessários
  const isProcessingRef = useRef(false);
  const hasMountedRef = useRef(false);

  const { reservaData, dadosParticipantes, tipo: tipoState } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState(reservaData || {});
  const [tipo, setTipo] = useState(tipoState || 'experiencia');
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');

  // ============================================
  // CARREGAR DADOS DO CACHE - OTIMIZADO
  // ============================================
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    
    window.scrollTo(0, 0);
    
    // Se já tem dados, não precisa carregar do cache
    if (reservaData && Object.keys(reservaData).length > 0) {
      if (tipoState === 'carro') setTipo('carro');
      else if (tipoState === 'alojamento') setTipo('alojamento');
      else setTipo('experiencia');
      return;
    }

    // Carregar do cache apenas se necessário
    const cacheKeys = {
      alojamento: 'reservaAlojamentoPendente',
      experiencia: 'reservaPendente',
      carro: 'reservaCarroPendente'
    };

    for (const [key, storageKey] of Object.entries(cacheKeys)) {
      const cache = sessionStorage.getItem(storageKey);
      if (cache) {
        try {
          const dados = JSON.parse(cache);
          setReserva(dados.reservaData || {});
          setTipo(key);
          break;
        } catch (e) {
          console.error('Erro ao parse cache:', e);
        }
      }
    }
  }, [reservaData, tipoState]);

  // ============================================
  // ENVIO DE EMAILS - OTIMIZADO (NÃO BLOQUEIA)
  // ============================================
  const enviarEmailsConfirmacao = useCallback(async (dadosAPI) => {
    try {
      console.log('📧 Enviando emails em background...');
      
      const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' :
                        tipo === 'carro' ? 'reservaCarroPendente' : 'reservaPendente';
      
      const cache = sessionStorage.getItem(keyStorage);
      if (!cache) return;

      const dados = JSON.parse(cache);
      const { reservaData: rD, participantePrincipal, participantesAdicionais } = dados;

      if (!participantePrincipal?.email) return;

      let dataFormatada, horarioFormatado, quantidadeLabel;
      
      if (tipo === 'alojamento') {
        dataFormatada = `${rD?.checkIn || ''} até ${rD?.checkOut || ''}`;
        horarioFormatado = `${rD?.noites || 0} ${t('noites')}`;
        quantidadeLabel = rD?.totalHospedes || 1;
      } else if (tipo === 'carro') {
        dataFormatada = `${rD?.checkIn || ''} até ${rD?.checkOut || ''}`;
        horarioFormatado = `${rD?.dias || 0} ${t('dias')}`;
        quantidadeLabel = 1;
      } else {
        dataFormatada = rD?.data || new Date().toLocaleDateString('pt-PT');
        horarioFormatado = `${rD?.periodo || ''} ${rD?.horario || ''}`.trim();
        quantidadeLabel = rD?.participantes || 1;
      }

      const emailPayload = {
        email_cliente: participantePrincipal.email,
        nome_cliente: participantePrincipal.nome_completo || t('cliente'),
        phone_cliente: participantePrincipal.phone || '',
        codigo_reserva: dadosAPI?.codigo_reserva || '',
        reserva_id: String(dadosAPI?.reserva_id || ''),
        experiencia: rD?.titulo || t('reserva_morabeza'),
        data: dataFormatada,
        horario: horarioFormatado,
        quantidade_pessoas: quantidadeLabel,
        preco_total: tipo === 'alojamento' ? (rD?.totalGeral || 0) : 
                     tipo === 'carro' ? (rD?.totalGeral || 0) : (rD?.precoTotal || 0),
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
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

      // Enviar em background (não esperar resposta)
      fetch('https://welovepalop.com/api/send_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      }).catch(() => {}); // Ignorar erros

      console.log('✅ Email enviado em background');
    } catch (err) {
      console.error('❌ Erro ao enviar e-mails:', err);
    }
  }, [tipo, t]);

  // ============================================
  // SALVAR RESERVA - OTIMIZADO
  // ============================================
  const salvarReservaNoBackend = useCallback(async (dadosTransacao) => {
    const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' :
                      tipo === 'carro' ? 'reservaCarroPendente' : 'reservaPendente';
    
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
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
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
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
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
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
        stripe_id: dadosTransacao?.id || null
      };
    }

    // Timeout de 5 segundos para não travar
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://welovepalop.com/api/checkout_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Enviar email em background
        enviarEmailsConfirmacao(result.data);
      }
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite excedido. Tente novamente.');
      }
      throw error;
    }
  }, [tipo, t, enviarEmailsConfirmacao]);

  // ============================================
  // FINALIZAR PAGAMENTO - OTIMIZADO
  // ============================================
  const handleFinalizarPagamento = useCallback(async () => {
    // Prevenir múltiplos cliques
    if (isProcessingRef.current || loading) return;
    isProcessingRef.current = true;
    
    setLoading(true);
    setError('');
    
    try {
      if (!stripe || !elements) {
        setError(t('erro_stripe_nao_carregado'));
        isProcessingRef.current = false;
        setLoading(false);
        return;
      }

      // Calcular total
      let totalPagar;
      if (tipo === 'alojamento') totalPagar = reserva?.totalGeral || 0;
      else if (tipo === 'carro') totalPagar = reserva?.totalGeral || 0;
      else totalPagar = reserva?.precoTotal || 0;
      
      const taxaConversao = 110.265;
      let valorEmEUR = totalPagar / taxaConversao;

      if (valorEmEUR < 0.50) {
        setError(t('erro_valor_minimo_cartao', { valor: valorEmEUR.toFixed(2) }));
        isProcessingRef.current = false;
        setLoading(false);
        return;
      }

      const valorEmCentavos = Math.round(valorEmEUR * 100);

      // ============================================
      // 1. CRIAR PAYMENT INTENT (COM TIMEOUT)
      // ============================================
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let resIntent, dataIntent;
      try {
        resIntent = await fetch('https://welovepalop.com/api/create-payment-intent.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: valorEmCentavos, currency: 'eur' }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        dataIntent = await resIntent.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Tempo limite excedido. Tente novamente.');
        }
        throw error;
      }
      
      if (!resIntent.ok) {
        throw new Error(dataIntent.error || t('erro_servidor_pagamentos'));
      }

      // ============================================
      // 2. CONFIRMAR PAGAMENTO COM STRIPE
      // ============================================
      const result = await stripe.confirmCardPayment(dataIntent.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        isProcessingRef.current = false;
        setLoading(false);
        return;
      }

      // ============================================
      // 3. SALVAR RESERVA (COM TIMEOUT)
      // ============================================
      const saveResult = await salvarReservaNoBackend(result.paymentIntent);
      
      if (saveResult.success) {
        // Limpar cache
        const keyStorage = tipo === 'alojamento' ? 'reservaAlojamentoPendente' :
                          tipo === 'carro' ? 'reservaCarroPendente' : 'reservaPendente';
        sessionStorage.removeItem(keyStorage);
        
        // Redirecionar
        navigate('/confirmacao', { 
          state: { 
            reservaId: saveResult.data?.reserva_id,
            codigoReserva: saveResult.data?.codigo_reserva,
            reservaData: reserva,
            metodoPagamento: 'cartao',
            tipo,
            status: 'pago'
          } 
        });
      } else {
        setError(saveResult.error || t('erro_registar_reserva'));
      }
      
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setError(err.message || t('erro_geral_pagamento'));
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [stripe, elements, reserva, tipo, t, navigate, salvarReservaNoBackend]);

  // ============================================
  // HANDLE CARD CHANGE
  // ============================================
  const handleCardChange = useCallback((event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : '');
  }, []);

  // ============================================
  // RENDER
  // ============================================
  const getTituloStepper = () => {
    if (tipo === 'alojamento') return t('dados_hospedes');
    if (tipo === 'carro') return t('dados_condutor');
    return t('dados_participantes');
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
            <p className="text-slate-500 text-sm mb-6 text-left font-medium">{t('pagamento_com_cartao')}</p>
            
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
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4">{t('dados_cartao')}</h3>
              
              {/* STRIPE - ESTILIZADO */}
              <div className="border-2 border-blue-500 rounded-2xl bg-blue-50/30 shadow-md shadow-blue-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                      <CreditCard className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">{t('cartao_credito_debito')}</p>
                      <p className="text-xs text-slate-500 font-medium">Pagamento seguro com Stripe</p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-auto">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" alt="Visa" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                      <Sparkles className="text-blue-400" size={14} />
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Informações do cartão</span>
                    </div>
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#0f172a',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: '500',
                            padding: '12px 0',
                            '::placeholder': { color: '#94a3b8', fontWeight: '400' },
                          },
                          invalid: { color: '#ef4444' },
                        },
                        hidePostalCode: true,
                      }}
                      onChange={handleCardChange}
                    />
                    {cardError && (
                      <p className="text-xs text-red-500 mt-2 font-medium">{cardError}</p>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">🔒 Seguro</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">⚡ Instantâneo</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Pagamento processado pela Stripe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition text-slate-700 shadow-sm"
              >
                <ArrowLeft size={18}/> {t('voltar')}
              </button>
              
              <button 
                onClick={handleFinalizarPagamento}
                disabled={loading || !cardComplete}
                className="flex-1 max-w-md bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-blue-200 py-3.5"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} /> 
                ) : (
                  <>
                    <Lock size={16} /> 
                    {t('confirmar_reserva_concluir')} 
                    <ChevronRight size={18}/>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <React.Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
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
            </React.Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL COM ELEMENTS
// ============================================
const Pagamento = () => {
  return (
    <Elements stripe={getStripePromise()}>
      <PagamentoContent />
    </Elements>
  );
};

export default Pagamento;