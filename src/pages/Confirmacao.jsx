import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, Calendar, Clock, MapPin, Users, 
  Mail, Camera, ArrowRight, Printer, List, 
  ShieldCheck, Phone, HelpCircle, Copy, CheckCircle
} from 'lucide-react';
import ResumoReserva from './ResumoReserva';

const Confirmacao = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaId, codigoReserva, reservaData, metodoPagamento, status } = location.state || {};
  
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Recuperar email do usuário logado
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.error('Erro ao recuperar email do usuário:', e);
      }
    }
    
    // Se não tiver dados, tentar recuperar do sessionStorage
    if (!reservaData) {
      const reservaPendente = sessionStorage.getItem('reservaConfirmada');
      if (reservaPendente) {
        const dados = JSON.parse(reservaPendente);
        sessionStorage.removeItem('reservaConfirmada');
      }
    }
  }, [reservaData]);

  const totalPessoas = reservaData?.participantes || 1;
  const precoTotal = reservaData?.precoTotal || 0;
  const emailUsuario = reservaData?.email || userEmail || 'cliente@email.com';

  // Função para copiar código
  const handleCopyCode = () => {
    if (codigoReserva) {
      navigator.clipboard.writeText(codigoReserva);
      alert('✅ Código da reserva copiado!');
    }
  };

  // Função para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Formatar método de pagamento para exibição
  const getMetodoPagamentoLabel = () => {
    switch(metodoPagamento) {
      case 'cartao': return 'Cartão de Crédito/Débito';
      case 'mpesa': return 'M-Pesa';
      case 'zap': return 'ZAP';
      case 'transferencia': return 'Transferência Bancária';
      default: return 'Cartão';
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* STEPPER - Passo 7 de 7 (Final) */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {[
            { n: 1, label: 'Dados dos Participantes', check: true },
            { n: 2, label: 'Pagamento', check: true },
            { n: 3, label: 'Confirmação', active: true },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  s.active || s.check ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border border-slate-200 text-slate-400'
                }`}>
                  {s.check || (s.active && s.n === 3) ? <Check size={14} strokeWidth={3} /> : s.n}
                </div>
                <span className={`text-[10px] whitespace-nowrap ${s.active || s.check ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6 min-w-[20px]"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: SUCESSO E DETALHES */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-100 shrink-0 animate-pulse">
                <Check size={32} strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Reserva confirmada!</h1>
                <p className="text-slate-500">A sua reserva foi realizada com sucesso.</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Pagamento confirmado via {getMetodoPagamentoLabel()}
                </p>
              </div>
            </div>

            {/* CARD CÓDIGO DA RESERVA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                <div className="p-3 bg-white rounded-xl border border-green-200 text-green-600 shadow-sm">
                  <List size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Código da reserva</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight font-mono">
                      {codigoReserva || 'CV240524-8723'}
                    </h2>
                    <button 
                      onClick={handleCopyCode}
                      className="text-[11px] bg-white border border-green-200 px-3 py-1.5 rounded-lg text-green-600 font-bold flex items-center gap-1 hover:bg-green-50 transition"
                    >
                      <Copy size={12} /> Copiar
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    Enviámos os detalhes da sua reserva para <span className="font-bold text-blue-800">{emailUsuario}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Guarde este código para futuras consultas e para apresentar no dia do passeio.
                  </p>
                  <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
                    <Mail size={10} /> Um email de confirmação foi enviado para o seu endereço.
                  </p>
                </div>
              </div>
            </div>

            {/* O QUE ACONTECE A SEGUIR */}
            <div className="border border-slate-100 rounded-xl p-6 mb-8 bg-white shadow-sm">
              <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2 mb-6">
                <Check size={18} className="text-blue-600" /> O que acontece a seguir?
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">Email de confirmação</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Enviámos todos os detalhes da sua reserva para <span className="font-medium text-blue-600">{emailUsuario}</span>
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">Prepare-se para o tour</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Chegue 15 minutos antes do horário escolhido no ponto de encontro.</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">Aproveite a experiência!</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Descubra a história e a cultura local.</p>
                </div>
              </div>
            </div>

            {/* INFORMAÇÕES IMPORTANTES */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 mb-8">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">i</div>
                Informações importantes
              </h3>
              <ul className="space-y-1.5">
                {[
                  'Chegue 15 minutos antes do horário selecionado.',
                  'Apresente um documento de identificação no dia do tour.',
                  'Cancelamento gratuito até 24h antes da experiência.',
                  'Leve protetor solar, chapéu e água.',
                  'Em caso de dúvidas, entre em contacto connosco.'
                ].map((text, i) => (
                  <li key={i} className="text-[11px] text-blue-800 flex items-start gap-2">
                    <Check size={11} className="text-blue-500 shrink-0 mt-0.5" /> 
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AÇÕES FINAIS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => navigate('/minhas-reservas')}
                className="h-[44px] px-5 border border-slate-200 rounded-lg text-sm font-bold text-blue-900 flex items-center gap-2 hover:bg-slate-50 transition"
              >
                <List size={16}/> Ver minhas reservas
              </button>
              <button 
                onClick={handlePrint}
                className="h-[44px] px-5 border border-slate-200 rounded-lg text-sm font-bold text-blue-900 flex items-center gap-2 hover:bg-slate-50 transition"
              >
                <Printer size={16}/> Imprimir
              </button>
              <button 
                onClick={() => navigate('/')}
                className="h-[44px] px-6 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 ml-auto hover:bg-blue-700 transition shadow-md"
              >
                Voltar para experiências <ArrowRight size={16}/>
              </button>
            </div>

            {/* BANNER SEGURANÇA RODAPÉ */}
            <div className="mt-6 bg-orange-50/40 border border-orange-100 p-3 rounded-xl flex items-center gap-3">
              <ShieldCheck className="text-orange-400 shrink-0" size={18} />
              <span className="text-[9px] font-bold text-orange-800 uppercase tracking-tight">Reserva 100% segura</span>
              <span className="text-[9px] text-orange-600">Os seus dados estão protegidos.</span>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO (REUTILIZANDO O COMPONENTE) */}
          <div className="lg:col-span-4">
            <ResumoReserva 
              reserva={reservaData || {}}
              totalPessoas={totalPessoas}
              precoTotal={precoTotal}
              showPaymentInfo={true}
              paymentStatus="paid"
              isConfirmed={true}
              codigoReserva={codigoReserva}
            />
          </div>
        </div>
      </div>

      {/* CSS para impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Confirmacao;