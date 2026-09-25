// Pagamento.jsx - v3 multi-quarto + holds + FormularioPagamentoStripe UI
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
} from '@stripe/react-stripe-js';
import { useToast } from '../Toast';
import FormularioPagamentoStripe from './FormularioPagamentoStripe';

const ResumoReservaExperiencia = React.lazy(() => import('../features/experiencias/components/ResumoReservaExperiencia'));
const ResumoReservaAlojamento = React.lazy(() => import('../features/alojamento/components/ResumoReservaAlojamento'));
const ResumoReservaCarro = React.lazy(() => import('../features/carros/components/ResumoReservaCarro'));

const API_BASE = 'https://welovepalop.com';
const TAXA_CONVERSAO_CVE_EUR = 110.265;
const HOLD_MINUTOS = 15;

const CACHE_KEYS = {
  alojamento: 'reservaAlojamentoPendente',
  carro: 'reservaCarroPendente',
  experiencia: 'reservaPendente',
};

const getTotalPagar = (tipo, reserva) => {
  if (!reserva) return 0;
  return Number(reserva.precoTotal || reserva.totalGeral || 0);
};

let stripePromise = null;
const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

const PagamentoContent = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const isProcessingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const holdsIdsRef = useRef([]); // ✅ array de holds
  const holdExpiraRef = useRef(null);

  const { reservaData, tipo: tipoState } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState(reservaData || {});
  const [tipo, setTipo] = useState(tipoState || 'experiencia');
  const [holdSegundos, setHoldSegundos] = useState(null);

  // ---------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    window.scrollTo(0, 0);

    if (reservaData && Object.keys(reservaData).length > 0) {
      if (tipoState === 'carro') setTipo('carro');
      else if (tipoState === 'alojamento') setTipo('alojamento');
      else setTipo('experiencia');
      return;
    }

    for (const [key, storageKey] of Object.entries(CACHE_KEYS)) {
      const cache = sessionStorage.getItem(storageKey);
      if (cache) {
        try {
          const dados = JSON.parse(cache);
          setReserva(dados.reservaData || {});
          setTipo(key);
          break;
        } catch (e) {
          console.error('Erro parse cache:', e);
        }
      }
    }
  }, [reservaData, tipoState]);

  // ---------------------------------------------------------
  // Criar holds multi-quarto
  // ---------------------------------------------------------
  useEffect(() => {
    if (tipo !== 'alojamento') return;
    const quartos = reserva?.quartos || [];
    if (!quartos.length || !reserva.checkIn || !reserva.checkOut) return;
    if (holdsIdsRef.current.length) return;

    let cancelado = false;
    const criarHolds = async () => {
      try {
        const ids = [];
        const expiras = [];

        for (const q of quartos) {
          const res = await fetch(`${API_BASE}/api/criar_hold.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quarto_id: q.tipoQuartoId,
              checkin: reserva.checkIn,
              checkout: reserva.checkOut,
              quantidade: q.quantidade,
              minutos: HOLD_MINUTOS,
            }),
          });
          const data = await res.json();
          if (!data.success || !data.hold_id) {
            if (data.disponivel === false) {
              throw new Error(t('sem_stock_disponivel', 'Sem disponibilidade'));
            }
            continue;
          }
          ids.push(data.hold_id);
          expiras.push(new Date(data.expira_em).getTime());
        }

        if (cancelado) return;

        if (ids.length) {
          holdsIdsRef.current = ids;
          const menorExpira = Math.min(...expiras);
          holdExpiraRef.current = menorExpira;
          const restante = Math.max(0, Math.floor((menorExpira - Date.now()) / 1000));
          setHoldSegundos(restante);
        }
      } catch (err) {
        if (cancelado) return;
        console.error('Erro ao criar holds:', err);
        showToast(err.message || t('erro_hold', 'Erro ao reservar stock'), 'error');
      }
    };
    criarHolds();

    return () => { cancelado = true; };
  }, [tipo, reserva?.quartos, reserva?.checkIn, reserva?.checkOut, t, showToast]);

  // ---------------------------------------------------------
  // Contador regressivo
  // ---------------------------------------------------------
  useEffect(() => {
    if (!holdExpiraRef.current) return;
    const int = setInterval(() => {
      const restante = Math.max(0, Math.floor((holdExpiraRef.current - Date.now()) / 1000));
      setHoldSegundos(restante);
      if (restante === 0) {
        clearInterval(int);
        showToast(t('hold_expirado', 'A retenção de stock expirou. Volte a escolher.'), 'error');
      }
    }, 1000);
    return () => clearInterval(int);
  }, [holdSegundos !== null, t, showToast]);

  // ---------------------------------------------------------
  // Libertar holds
  // ---------------------------------------------------------
  const libertarHolds = useCallback(async () => {
    if (!holdsIdsRef.current.length) return;
    for (const id of holdsIdsRef.current) {
      try {
        const body = JSON.stringify({ hold_id: id });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${API_BASE}/api/libertar_hold.php`,
            new Blob([body], { type: 'application/json' })
          );
        } else {
          await fetch(`${API_BASE}/api/libertar_hold.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          });
        }
      } catch {}
    }
    holdsIdsRef.current = [];
  }, []);

  useEffect(() => {
    const onUnload = () => {
      if (holdsIdsRef.current.length && !isProcessingRef.current) {
        for (const id of holdsIdsRef.current) {
          try {
            navigator.sendBeacon(
              `${API_BASE}/api/libertar_hold.php`,
              new Blob([JSON.stringify({ hold_id: id })], { type: 'application/json' })
            );
          } catch {}
        }
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  // ---------------------------------------------------------
  // Emails
  // ---------------------------------------------------------
  const enviarEmailsConfirmacao = useCallback(async (dadosAPI) => {
    try {
      const keyStorage = CACHE_KEYS[tipo];
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
        preco_total: getTotalPagar(tipo, rD),
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
        participante_principal: {
          nome_completo: participantePrincipal.nome_completo || '',
          email: participantePrincipal.email || '',
          phone: participantePrincipal.phone || '',
        },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({
          nome_completo: p?.nome_completo || '',
          email: p?.email || '',
          phone: p?.phone || '',
        })),
      };

      fetch(`${API_BASE}/api/send_email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      }).catch(() => {});
    } catch (err) {
      console.error('❌ Erro ao enviar e-mails:', err);
    }
  }, [tipo, t]);

  // ---------------------------------------------------------
  // Salvar reserva
  // ---------------------------------------------------------
  const salvarReservaNoBackend = useCallback(async (dadosTransacao) => {
    const keyStorage = CACHE_KEYS[tipo];
    const cache = sessionStorage.getItem(keyStorage);
    if (!cache) throw new Error(t('erro_sessao_expirada'));

    const dados = JSON.parse(cache);
    const { reservaData: rD, participantePrincipal, participantesAdicionais, usuario } = dados;

    if (!participantePrincipal) {
      throw new Error(t('erro_participante_nao_encontrado'));
    }

    const fin = rD?.financeiro || {};
    let payload;

    if (tipo === 'alojamento') {
      payload = {
        category: 'Alojamento',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null,
        },
        reserva: {
          alojamento_id: rD?.id,
          quartos: (rD?.quartos || []).map(q => ({
            tipo_quarto_id: q.tipoQuartoId,
            quantidade: q.quantidade,
            preco_noite: q.precoNoite,
            capacidade: q.capacidade,
          })),
          data_checkin: rD?.checkIn,
          data_checkout: rD?.checkOut,
          quantidade_hospedes: rD?.totalHospedes,
          preco_total: getTotalPagar('alojamento', rD),
          noites: rD?.noites,
          hold_ids: holdsIdsRef.current,
          financeiro: {
            subtotalNoites: fin.subtotalNoites || 0,
            taxaLimpeza: fin.taxaLimpeza || 0,
            comissaoMorabeza: fin.comissaoMorabeza || 0,
            valorLiquidoAnfitriao: fin.valorLiquidoAnfitriao || 0,
            valorTotalCliente: fin.valorTotalCliente || 0,
          },
        },
        participante_principal: { ...participantePrincipal },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({ ...p })),
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
        stripe_id: dadosTransacao?.id || null,
      };
    } else if (tipo === 'carro') {
      payload = {
        category: 'Carro',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null,
        },
        reserva: {
          id: rD?.id,
          checkIn: rD?.checkIn,
          checkOut: rD?.checkOut,
          dias: rD?.dias,
          preco_total: getTotalPagar('carro', rD),
          carro_id: rD?.id,
        },
        participante_principal: {
          ...participantePrincipal,
          hora_levantamento: participantePrincipal.hora_levantamento || '10:00',
          carta_conducao_nome: participantePrincipal.carta_conducao_nome || '',
          observacoes: participantePrincipal.observacoes || '',
        },
        participantes_adicionais: [],
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
        stripe_id: dadosTransacao?.id || null,
      };
    } else {
      payload = {
        category: 'Experiencia',
        usuario: {
          email: participantePrincipal.email || '',
          nome_completo: participantePrincipal.nome_completo || '',
          phone: participantePrincipal.phone || '',
          google_id: usuario?.google_id || null,
        },
        reserva: {
          experiencia_id: rD?.id,
          data_participacao: rD?.dataISO,
          horario: `${rD?.periodo || ''} ${rD?.horario || ''}`.trim(),
          quantidade_pessoas: rD?.participantes,
          preco_total: getTotalPagar('experiencia', rD),
        },
        participante_principal: { ...participantePrincipal },
        participantes_adicionais: (participantesAdicionais || []).map(p => ({ ...p })),
        metodo_pagamento: 'cartao',
        status_pagamento: 'pago',
        stripe_id: dadosTransacao?.id || null,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE}/api/checkout_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const result = await response.json();
      if (result.success && result.data) {
        enviarEmailsConfirmacao(result.data);
        holdsIdsRef.current = [];
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

  // ---------------------------------------------------------
  // Finalizar pagamento (chamado pelo FormularioPagamentoStripe)
  // ---------------------------------------------------------
  const handleFinalizarPagamento = useCallback(async ({ zip } = {}) => {
    if (isProcessingRef.current || loading) return;
    isProcessingRef.current = true;
    setLoading(true);
    setError('');

    try {
      if (!stripe || !elements) {
        setError(t('erro_stripe_nao_carregado'));
        return;
      }

      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        setError(t('erro_cartao_invalido', 'Dados do cartão inválidos.'));
        return;
      }

      if (tipo === 'alojamento' && holdSegundos === 0) {
        setError(t('hold_expirado', 'A retenção expirou. Volte atrás.'));
        return;
      }

      const totalPagar = getTotalPagar(tipo, reserva);
      const valorEmEUR = totalPagar / TAXA_CONVERSAO_CVE_EUR;

      if (valorEmEUR < 0.5) {
        setError(t('erro_valor_minimo_cartao', { valor: valorEmEUR.toFixed(2) }));
        return;
      }

      const valorEmCentavos = Math.round(valorEmEUR * 100);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      let resIntent, dataIntent;
      try {
        resIntent = await fetch(`${API_BASE}/api/create-payment-intent.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: valorEmCentavos, currency: 'eur' }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        dataIntent = await resIntent.json();
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite excedido. Tente novamente.');
        }
        throw err;
      }

      if (!resIntent.ok) {
        throw new Error(dataIntent.error || t('erro_servidor_pagamentos'));
      }

      const result = await stripe.confirmCardPayment(dataIntent.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: zip ? { address: { postal_code: zip } } : undefined,
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const saveResult = await salvarReservaNoBackend(result.paymentIntent);

      if (saveResult.success) {
        sessionStorage.removeItem(CACHE_KEYS[tipo]);
        isProcessingRef.current = false;
        holdsIdsRef.current = [];
        navigate('/confirmacao', {
          state: {
            reservaId: saveResult.data?.reserva_id,
            codigoReserva: saveResult.data?.codigo_reserva,
            reservaData: reserva,
            metodoPagamento: 'cartao',
            tipo,
            status: 'pago',
          },
        });
        return;
      } else {
        setError(saveResult.error || t('erro_registar_reserva'));
        showToast(
          t('pagamento_cobrado_reserva_falhou',
            'Pagamento efetuado mas houve um erro ao registar. Contacte o suporte.'),
          'error'
        );
      }
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setError(err.message || t('erro_geral_pagamento'));
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [stripe, elements, reserva, tipo, t, navigate, salvarReservaNoBackend, showToast, holdSegundos, loading]);

  const getTituloStepper = () => {
    if (tipo === 'alojamento') return t('dados_hospedes');
    if (tipo === 'carro') return t('dados_condutor');
    return t('dados_participantes');
  };

  const steps = [
    { n: 1, label: getTituloStepper(), check: true },
    { n: 2, label: t('step_pagamento'), active: true },
    { n: 3, label: t('step_confirmacao') },
  ];

  const mm = holdSegundos !== null ? String(Math.floor(holdSegundos / 60)).padStart(2, '0') : null;
  const ss = holdSegundos !== null ? String(holdSegundos % 60).padStart(2, '0') : null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
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

        {tipo === 'alojamento' && holdSegundos !== null && holdSegundos > 0 && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800 text-sm font-bold">
            <Lock size={16} className="text-amber-600" />
            {t('stock_reservado', 'Stock reservado para si durante')}{' '}
            <span className="font-mono text-base">{mm}:{ss}</span>
          </div>
        )}

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
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4">
                {t('dados_cartao')}
              </h3>

              {/* ✅ UI do FormularioPagamentoStripe */}
              <FormularioPagamentoStripe
                valorTotal={getTotalPagar(tipo, reserva)}
                moeda="CVE"
                onPagar={handleFinalizarPagamento}
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-start gap-4">
              <button
                onClick={() => { libertarHolds(); navigate(-1); }}
                disabled={loading}
                className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition text-slate-700 shadow-sm disabled:opacity-50"
              >
                <ArrowLeft size={18}/> {t('voltar')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <React.Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
              {tipo === 'alojamento' ? (
                <ResumoReservaAlojamento
                  reserva={reserva}
                  totalHospedes={reserva?.totalHospedes}
                  precoTotal={getTotalPagar('alojamento', reserva)}
                  showPaymentInfo={true}
                  paymentStatus="pending"
                />
              ) : tipo === 'carro' ? (
                <ResumoReservaCarro
                  reserva={reserva}
                  precoTotal={getTotalPagar('carro', reserva)}
                  showPaymentInfo={true}
                  paymentStatus="pending"
                />
              ) : (
                <ResumoReservaExperiencia
                  reserva={reserva}
                  totalPessoas={reserva?.participantes}
                  precoTotal={getTotalPagar('experiencia', reserva)}
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

const Pagamento = () => (
  <Elements stripe={getStripePromise()}>
    <PagamentoContent />
  </Elements>
);

export default Pagamento;