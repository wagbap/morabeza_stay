import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Users, MapPin, ShieldCheck, CreditCard, CheckCircle, Lock, Calendar, Clock as ClockIcon } from 'lucide-react';

const ResumoReservaExperiencia = ({ 
  reserva = {}, 
  totalPessoas = 0, 
  precoTotal = 0, 
  setDataModalOpen, 
  setHorarioModalOpen,
  showPaymentInfo = false,
  paymentStatus = null,
  isConfirmed = false,
  codigoReserva = null
}) => {
  const { t } = useTranslation();
  
  const podeAlterar = !showPaymentInfo || paymentStatus !== 'paid';
  
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('pt-PT');
  };
  
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6">
      <h2 className="text-lg font-bold text-blue-900 mb-5">{t('resumo_reserva')}</h2>
      
      <div className="flex gap-4 mb-6">
        <img 
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'} 
          className="w-20 h-20 rounded-xl object-cover" 
          alt={reserva?.titulo || t('experiencia')}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900">{reserva?.titulo || t('cidade_velha_cultura_tour')}</h4>
          <div className="mt-2 space-y-1 text-[10px] font-semibold text-slate-400">
            <p className="flex items-center gap-1.5"><Clock size={11}/> {reserva?.duracao || '4 horas'}</p>
            <p className="flex items-center gap-1.5"><Users size={11}/> 1 - {reserva?.maxPessoas || 10} {t('pessoas')}</p>
            <p className="flex items-center gap-1.5"><MapPin size={11}/> {reserva?.localizacao || t('cidade_velha')}</p>
          </div>
        </div>
      </div>

      {/* Código da reserva */}
      {isConfirmed && codigoReserva && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-800">{t('codigo_reserva')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-900">{codigoReserva}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(codigoReserva)}
              className="text-[9px] text-blue-600 underline"
            >
              {t('copiar')}
            </button>
          </div>
        </div>
      )}

      {/* Status de pagamento */}
      {showPaymentInfo && paymentStatus && (
        <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 border ${
          paymentStatus === 'paid' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="shrink-0">
            {paymentStatus === 'paid' ? (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={18} />
              </div>
            ) : (
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <CreditCard className="text-white" size={16} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${
              paymentStatus === 'paid' ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {paymentStatus === 'paid' ? t('pagamento_confirmado') : t('aguardando_pagamento')}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {paymentStatus === 'paid' 
                ? t('reserva_confirmada_codigo_experiencia')
                : t('reserva_confirmada_apos_pagamento')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 border-t border-slate-100 pt-5">
        {/* Data selecionada */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              {t('data_selecionada')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{reserva?.data || t('nao_selecionada')}</p>
          </div>
          {setDataModalOpen && podeAlterar && (
            <button 
              onClick={() => setDataModalOpen(true)} 
              className="text-blue-600 font-bold text-[10px] underline hover:opacity-70 transition"
            >
              {t('alterar')}
            </button>
          )}
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado')}
            </span>
          )}
        </div>

        {/* Período */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ClockIcon size={12} className="text-blue-500" />
              {t('periodo')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {reserva?.periodo && reserva?.horario 
                ? `${reserva.periodo} (${reserva.horario})` 
                : t('nao_selecionado')}
            </p>
          </div>
          {setHorarioModalOpen && podeAlterar && (
            <button 
              onClick={() => setHorarioModalOpen(true)} 
              className="text-blue-600 font-bold text-[10px] underline hover:opacity-70 transition"
            >
              {t('alterar')}
            </button>
          )}
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado')}
            </span>
          )}
        </div>

        {/* Participantes */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={12} className="text-blue-500" />
              {t('participantes')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {totalPessoas || 1} {totalPessoas === 1 ? t('pessoa') : t('pessoas')}
            </p>
          </div>
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado')}
            </span>
          )}
        </div>
        
        {/* Preços */}
        <div className="pt-3 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('preco_por_pessoa')}</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.precoPorPessoa)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('total_participantes', { total: totalPessoas || 1 })}</span>
            <span className="font-bold text-blue-900">{formatNumber(precoTotal)} CVE</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total')}</span>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
            {paymentStatus === 'paid' && (
              <p className="text-[9px] text-green-600 font-bold">✓ {t('pago')}</p>
            )}
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 mt-3">
          <ShieldCheck className="text-blue-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-blue-900">{t('reserva_100_segura')}</p>
            <p className="text-[8px] text-blue-700 leading-tight mt-0.5">
              {paymentStatus === 'paid' 
                ? t('reserva_garantida_codigo_experiencia')
                : t('dados_protegidos_reserva')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReservaExperiencia;