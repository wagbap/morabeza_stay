import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, CreditCard, ArrowLeft, ChevronRight, 
  ShieldCheck, Lock, AlertCircle, Loader, Users 
} from 'lucide-react';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import ResumoReserva from './ResumoReserva';

// INICIALIZAÇÃO DO STRIPE
const stripePromise = loadStripe('pk_test_51Q2vbsBGBgdae3VE253hWrzJikRaIK6tYOlWOeCKkFt6GArcJUZrNoaBc21vXz1F0sxPc3ErEqskwvQFf2EIDov200ZtBcleBd');

const PagamentoContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const { reservaData, dadosParticipantes } = location.state || {};

  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState(reservaData || {});

  useEffect(() => {
    window.scrollTo(0, 0);
    const reservaPendente = sessionStorage.getItem('reservaPendente');
    if (reservaPendente && !reservaData) {
      const dados = JSON.parse(reservaPendente);
      setReserva(dados.reservaData);
    }
  }, [reservaData]);

  // FUNÇÃO PARA ENVIAR EMAILS
  const enviarEmailsConfirmacao = async (dadosReserva) => {
    try {
        console.log('📧 Iniciando envio de emails...');
        
        const reservaPendente = sessionStorage.getItem('reservaPendente');
        if (!reservaPendente) {
            console.log('❌ Nenhuma reserva pendente encontrada');
            return;
        }
        
        const dados = JSON.parse(reservaPendente);
        const { reservaData, participantePrincipal, participantesAdicionais } = dados;
        
        // Formatar a data corretamente
        const dataFormatada = reservaData.data || reservaData.entrada || new Date().toLocaleDateString('pt-PT');
        const horarioFormatado = `${reservaData.periodo || ''} ${reservaData.horario || ''}`.trim();
        
        const emailPayload = {
            email_cliente: participantePrincipal.email,
            nome_cliente: participantePrincipal.nome_completo,
            phone_cliente: participantePrincipal.phone,
            codigo_reserva: dadosReserva.codigo_reserva,
            reserva_id: dadosReserva.reserva_id,
            experiencia: reservaData.titulo,
            data: dataFormatada,
            horario: horarioFormatado || 'Confirmar horário',
            quantidade_pessoas: reservaData.participantes || 1,
            preco_total: reservaData.precoTotal,
            metodo_pagamento: metodoPagamento,
            status_pagamento: metodoPagamento === 'cartao' ? 'pago' : 'pendente',
            participante_principal: participantePrincipal,
            participantes_adicionais: participantesAdicionais || []
        };
        
        console.log('📤 Payload do email:', emailPayload);
        
        const response = await fetch('https://welovepalop.com/api/send_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
        });
        
        const result = await response.json();
        console.log('✅ Resultado envio de emails:', result);
        
        if (result.cliente_notificado) {
            console.log('📧 Email enviado para o cliente:', participantePrincipal.email);
        }
        if (result.admin_notificado) {
            console.log('📧 Email enviado para o admin');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao enviar emails:', error);
        // Não bloqueia o fluxo principal se o email falhar
    }
  };

  const salvarReservaNoBackend = async (dadosTransacao) => {
    const reservaPendente = sessionStorage.getItem('reservaPendente');
    if (!reservaPendente) throw new Error("Dados da reserva expiraram.");
    
    const dados = JSON.parse(reservaPendente);
    const { reservaData: dR, participantePrincipal: pP, participantesAdicionais: pA, usuario } = dados;

    const payload = {
      usuario: { 
        email: pP.email, 
        nome_completo: pP.nome_completo, 
        phone: pP.phone, 
        google_id: usuario?.google_id || null 
      },
      reserva: { 
        experiencia_id: dR.id || 1, 
        data_participacao: dR.dataISO, 
        horario: `${dR.periodo} (${dR.horario})`, 
        quantidade_pessoas: dR.participantes, 
        preco_total: dR.precoTotal 
      },
      participante_principal: { ...pP },
      participantes_adicionais: pA.map(p => ({ ...p })),
      metodo_pagamento: metodoPagamento,
      status_pagamento: metodoPagamento === 'cartao' ? 'pago' : 'pendente',
      stripe_id: dadosTransacao?.id || null
    };

    console.log('💾 Salvando reserva no backend:', payload);
    
    const response = await fetch('https://welovepalop.com/api/checkout_api.php', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    const result = await response.json();
    console.log('💾 Resultado da reserva:', result);
    
    // APÓS SALVAR A RESERVA, ENVIAR OS EMAILS
    if (result.success && result.data) {
        console.log('📧 Reserva salva, enviando emails...');
        await enviarEmailsConfirmacao(result.data);
    } else {
        console.log('⚠️ Reserva não foi salva, ignorando envio de emails');
    }
    
    return result;
  };

  const handleFinalizarPagamento = async () => {
    setLoading(true);
    setError('');

    try {
      if (metodoPagamento === 'cartao') {
        if (!stripe || !elements) {
          setError("O sistema de pagamento não carregou corretamente.");
          setLoading(false);
          return;
        }

        // 1. Conversão de CVE para EUR
        const valorEmCVE = reserva.precoTotal;
        const taxaConversao = 110.265;
        let valorEmEUR = valorEmCVE / taxaConversao;
        
        if (valorEmEUR < 0.50) {
          setError(`O valor mínimo para cartão é €0,50. Seu total (${valorEmEUR.toFixed(2)}€) é insuficiente.`);
          setLoading(false);
          return;
        }

        const valorEmCentavos = Math.round(valorEmEUR * 100);
        
        console.log(`💶 Convertendo: ${valorEmCVE} CVE → €${valorEmEUR.toFixed(2)} → ${valorEmCentavos} centavos`);
        
        const resIntent = await fetch('https://welovepalop.com/api/create-payment-intent.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: valorEmCentavos,
            currency: 'eur'
          })
        });
        
        const dataIntent = await resIntent.json();
        if (!resIntent.ok) throw new Error(dataIntent.error || "Erro no servidor");

        // 2. Confirmar com o Stripe
        const result = await stripe.confirmCardPayment(dataIntent.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (result.error) {
          setError(result.error.message);
          setLoading(false);
          return;
        }
        
        console.log('✅ Pagamento confirmado no Stripe');
        
        // 3. Salvar reserva (os emails serão enviados dentro da função)
        const saveResult = await salvarReservaNoBackend(result.paymentIntent);
        if (saveResult.success) {
          finalizeSucesso(saveResult.data);
        } else {
          setError(saveResult.error || "Erro ao salvar reserva");
        }

      } else {
        // Outros métodos (Transferência, ZAP)
        console.log('💳 Processando pagamento via:', metodoPagamento);
        const saveResult = await salvarReservaNoBackend();
        if (saveResult.success) {
          finalizeSucesso(saveResult.data);
        } else {
          setError(saveResult.error || "Erro ao salvar reserva");
        }
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message || "Erro ao processar o pedido.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeSucesso = (data) => {
    console.log('🎉 Reserva finalizada com sucesso!');
    console.log('📧 Emails devem ter sido enviados para cliente e admin');
    
    sessionStorage.removeItem('reservaPendente');
    navigate('/confirmacao', { 
      state: { 
        reservaId: data.reserva_id,
        codigoReserva: data.codigo_reserva,
        reservaData: reserva,
        metodoPagamento,
        status: metodoPagamento === 'cartao' ? 'pago' : 'pendente'
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* STEPPER */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {[
            { n: 1, label: 'Dados', check: true },
            { n: 2, label: 'Pagamento', active: true },
            { n: 3, label: 'Confirmação' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  s.active ? 'bg-blue-600 text-white shadow-lg' : 
                  s.check ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-400'
                }`}>
                  {s.check ? <Check size={14} strokeWidth={3} /> : s.n}
                </div>
                <span className={`text-[10px] ${s.active || s.check ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Pagamento</h1>
            
            <div className="bg-[#F8FFF9] border border-green-100 rounded-lg p-4 flex gap-3 mb-8">
              <ShieldCheck className="text-green-500" size={20} />
              <div>
                <p className="text-sm font-bold text-green-900">Pagamento 100% seguro</p>
                <p className="text-xs text-green-700">Encriptação SSL de nível bancário.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-900 uppercase">1. Método de pagamento</h3>
              
              {/* CARTÃO */}
              <div className={`border rounded-xl transition ${metodoPagamento === 'cartao' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100'}`}>
                <label className="flex items-center p-4 cursor-pointer">
                  <input type="radio" checked={metodoPagamento === 'cartao'} onChange={() => setMetodoPagamento('cartao')} className="w-4 h-4 text-blue-600" />
                  <CreditCard className="ml-4 text-blue-900" size={20} />
                  <span className="ml-3 text-sm font-bold text-blue-900 flex-1">Cartão de Crédito</span>
                  <div className="flex gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                  </div>
                </label>
                
                {metodoPagamento === 'cartao' && (
                  <div className="px-12 pb-6 animate-in fade-in duration-500">
                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#1e293b',
                            fontFamily: 'sans-serif',
                            '::placeholder': { color: '#94a3b8' },
                          },
                          invalid: { color: '#ef4444' },
                        },
                      }} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Seguro via Stripe</p>
                  </div>
                )}
              </div>

              {/* OUTROS MÉTODOS */}
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${metodoPagamento === 'transferencia' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100'}`}>
                <input type="radio" checked={metodoPagamento === 'transferencia'} onChange={() => setMetodoPagamento('transferencia')} className="w-4 h-4" />
                <Users className="ml-4 text-slate-600" size={20} />
                <div className="ml-3">
                  <p className="text-sm font-bold text-blue-900">Transferência Bancária</p>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${metodoPagamento === 'zap' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100'}`}>
                <input type="radio" checked={metodoPagamento === 'zap'} onChange={() => setMetodoPagamento('zap')} className="w-4 h-4" />
                <span className="ml-4 text-[#E91E63] font-black italic text-lg">zap</span>
                <span className="ml-3 text-sm font-bold text-blue-900 ml-2">Pagamento via ZAP</span>
              </label>
            </div>

            <div className="mt-12 flex justify-between gap-4">
              <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition">
                <ArrowLeft size={18}/> Voltar
              </button>
              <button 
                onClick={handleFinalizarPagamento}
                disabled={loading}
                className="flex-1 max-w-md bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <><Lock size={16} /> Finalizar Reserva <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <ResumoReserva 
              reserva={reserva}
              totalPessoas={reserva?.participantes}
              precoTotal={reserva?.precoTotal}
              showPaymentInfo={true}
              paymentStatus="pending"
            />
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