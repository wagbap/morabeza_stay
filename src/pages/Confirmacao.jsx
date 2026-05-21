// Confirmacao.jsx - Com suporte para Carros
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, Calendar, Clock, MapPin, Users, 
  Mail, Camera, ArrowRight, Printer, List, 
  ShieldCheck, Phone, HelpCircle, Copy, CheckCircle
} from 'lucide-react';

// Importação dos Resumos Reutilizáveis
import ResumoReservaExperiencia from '../features/experiencias/components/ResumoReservaExperiencia';
import ResumoReservaAlojamento from '../features/alojamento/components/ResumoReservaAlojamento';
import ResumoReservaCarro from '../features/carros/components/ResumoReservaCarro';

const Confirmacao = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { reservaId, codigoReserva, reservaData, metodoPagamento, tipo: tipoState, status } = location.state || {};
  
  const [userEmail, setUserEmail] = useState('');
  const [tipo, setTipo] = useState(tipoState || 'experiencia');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.error('Erro ao recuperar email do usuário:', e);
      }
    }
    
    if (!reservaData) {
      const cacheAlojamento = sessionStorage.getItem('reservaAlojamentoPendente');
      const cacheExperiencia = sessionStorage.getItem('reservaPendente');
      const cacheCarro = sessionStorage.getItem('reservaCarroPendente');

      if (cacheAlojamento) {
        setTipo('alojamento');
      } else if (cacheExperiencia) {
        setTipo('experiencia');
      } else if (cacheCarro) {
        setTipo('carro');
      }
    }
  }, [reservaData]);

  const totalPessoas = tipo === 'alojamento' 
    ? (reservaData?.totalHospedes || 1) 
    : (tipo === 'carro' ? 1 : (reservaData?.participantes || 1));
    
  const precoTotal = tipo === 'alojamento' 
    ? (reservaData?.totalGeral || 0) 
    : (tipo === 'carro' ? (reservaData?.totalGeral || 0) : (reservaData?.precoTotal || 0));
    
  const emailUsuario = reservaData?.email || userEmail || 'cliente@email.com';

  const handleCopyCode = () => {
    if (codigoReserva) {
      navigator.clipboard.writeText(codigoReserva);
      alert(t('codigo_copiado'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMetodoPagamentoLabel = () => {
    switch(metodoPagamento) {
      case 'cartao': return t('cartao_credito_debito');
      case 'paypal': return t('paypal');
      case 'zap': return t('zap');
      case 'transferencia': return t('transferencia_bancaria');
      default: return t('cartao');
    }
  };

  const getStep1Label = () => {
    if (tipo === 'alojamento') return t('dados_hospedes');
    if (tipo === 'carro') return t('dados_condutor');
    return t('dados_participantes');
  };

  const getInfoMessages = () => {
    if (tipo === 'alojamento') {
      return [
        t('info_alojamento_1'),
        t('info_alojamento_2'),
        t('info_alojamento_3'),
        t('info_alojamento_4')
      ];
    } else if (tipo === 'carro') {
      return [
        t('info_carro_1'),
        t('info_carro_2'),
        t('info_carro_3'),
        t('info_carro_4')
      ];
    } else {
      return [
        t('info_experiencia_1'),
        t('info_experiencia_2'),
        t('info_experiencia_3'),
        t('info_experiencia_4')
      ];
    }
  };

  const getPrepareMessage = () => {
    if (tipo === 'alojamento') return t('prepare_checkin');
    if (tipo === 'carro') return t('prepare_levantamento');
    return t('prepare_tour');
  };

  const getDetailMessage = () => {
    if (tipo === 'alojamento') return t('detalhe_alojamento');
    if (tipo === 'carro') return t('detalhe_carro');
    return t('detalhe_experiencia');
  };

  const getEnjoyMessage = () => {
    if (tipo === 'carro') return t('aproveite_veiculo');
    return t('aproveite_experiencia');
  };

  const getExploreMessage = () => {
    if (tipo === 'carro') return t('explore_cabo_verde_carro');
    return t('descubra_historia_cultura');
  };

  const steps = [
    { n: 1, label: getStep1Label(), check: true },
    { n: 2, label: t('step_pagamento'), check: true },
    { n: 3, label: t('step_confirmacao'), active: true },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* STEPPER - Passo 3 de 3 (Final) */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {steps.map((s, i, arr) => (
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
                <h1 className="text-3xl font-bold text-blue-900">{t('reserva_confirmada')}</h1>
                <p className="text-slate-500">{t('reserva_sucesso')}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> {t('pagamento_confirmado_via')} {getMetodoPagamentoLabel()}
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
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">{t('codigo_reserva')}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight font-mono">
                      {codigoReserva || 'RES-XXXXXX'}
                    </h2>
                    <button 
                      onClick={handleCopyCode}
                      className="text-[11px] bg-white border border-green-200 px-3 py-1.5 rounded-lg text-green-600 font-bold flex items-center gap-1 hover:bg-green-50 transition"
                    >
                      <Copy size={12} /> {t('copiar')}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    {t('enviamos_detalhes_para')} <span className="font-bold text-blue-800">{emailUsuario}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('guardar_codigo_futuras')}
                  </p>
                  <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
                    <Mail size={10} /> {t('email_confirmacao_enviado')}
                  </p>
                </div>
              </div>
            </div>

            {/* O QUE ACONTECE A SEGUIR */}
            <div className="border border-slate-100 rounded-xl p-6 mb-8 bg-white shadow-sm">
              <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2 mb-6">
                <Check size={18} className="text-blue-600" /> {t('oque_acontece_seguir')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">{t('email_confirmacao')}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {t('enviamos_detalhes_reserva_para')} <span className="font-medium text-blue-600">{emailUsuario}</span>
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">{getPrepareMessage()}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {getDetailMessage()}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera size={20} />
                  </div>
                  <p className="text-xs font-bold text-blue-900 mb-1">{getEnjoyMessage()}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {getExploreMessage()}
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMAÇÕES IMPORTANTES */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 mb-8">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">i</div>
                {t('informacoes_importantes')}
              </h3>
              <ul className="space-y-1.5">
                {getInfoMessages().map((text, i) => (
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
                <List size={16}/> {t('ver_minhas_reservas')}
              </button>
              <button 
                onClick={handlePrint}
                className="h-[44px] px-5 border border-slate-200 rounded-lg text-sm font-bold text-blue-900 flex items-center gap-2 hover:bg-slate-50 transition"
              >
                <Printer size={16}/> {t('imprimir')}
              </button>
              <button 
                onClick={() => navigate('/')}
                className="h-[44px] px-6 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 ml-auto hover:bg-blue-700 transition shadow-md"
              >
                {t('voltar_inicio')} <ArrowRight size={16}/>
              </button>
            </div>

            {/* BANNER SEGURANÇA RODAPÉ */}
            <div className="mt-6 bg-orange-50/40 border border-orange-100 p-3 rounded-xl flex items-center gap-3">
              <ShieldCheck className="text-orange-400 shrink-0" size={18} />
              <span className="text-[9px] font-bold text-orange-800 uppercase tracking-tight">{t('reserva_100_segura')}</span>
              <span className="text-[9px] text-orange-600">{t('dados_protegidos_short')}</span>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO DA RESERVA */}
          <div className="lg:col-span-4">
            {tipo === 'alojamento' ? (
              <ResumoReservaAlojamento 
                reserva={reservaData || {}}
                totalHospedes={totalPessoas}
                precoTotal={precoTotal}
                showPaymentInfo={true}
                paymentStatus="paid"
                isConfirmed={true}
                codigoReserva={codigoReserva}
              />
            ) : tipo === 'carro' ? (
              <ResumoReservaCarro 
                reserva={reservaData || {}}
                precoTotal={precoTotal}
                showPaymentInfo={true}
                paymentStatus="paid"
                isConfirmed={true}
                codigoReserva={codigoReserva}
              />
            ) : (
              <ResumoReservaExperiencia 
                reserva={reservaData || {}}
                totalPessoas={totalPessoas}
                precoTotal={precoTotal}
                showPaymentInfo={true}
                paymentStatus="paid"
                isConfirmed={true}
                codigoReserva={codigoReserva}
              />
            )}
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