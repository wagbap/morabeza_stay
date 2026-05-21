import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, MapPin, Star, ShieldCheck, CreditCard, CheckCircle, Lock, Clock as ClockIcon } from 'lucide-react';

const ResumoReservaAlojamento = ({ 
  reserva = {}, 
  totalHospedes = 0, 
  precoTotal = 0,
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
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} 
          className="w-20 h-20 rounded-xl object-cover" 
          alt={reserva?.titulo || t('alojamento')}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900">{reserva?.titulo || 'Morabeza Stay'}</h4>
          <div className="mt-2 space-y-1 text-[10px] font-semibold text-slate-400">
            <p className="flex items-center gap-1.5"><MapPin size={11}/> {reserva?.localizacao || t('cabo_verde')}</p>
            <p className="flex items-center gap-1.5"><Users size={11}/> {t('capacidade')}: {reserva?.maxPessoas || 10} {t('pessoas')}</p>
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              <Star size={11} fill="currentColor"/>
              <span className="text-[10px] font-bold text-slate-500">4.8 {t('avaliacoes')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Código da reserva (após confirmação) */}
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
                ? t('reserva_confirmada_checkin') 
                : t('reserva_confirmada_apos_pagamento')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 border-t border-slate-100 pt-5">
        {/* Check-in */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              {t('checkin')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{reserva?.checkIn || t('nao_selecionada')}</p>
          </div>
          {podeAlterar && (
            <span className="text-blue-600 text-[9px] font-bold bg-blue-50 px-2 py-0.5 rounded-full">
              {t('pendente')}
            </span>
          )}
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado')}
            </span>
          )}
        </div>

        {/* Check-out */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              {t('checkout')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{reserva?.checkOut || t('nao_selecionada')}</p>
          </div>
        </div>

        {/* Estadia */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ClockIcon size={12} className="text-blue-500" />
              {t('estadia')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {reserva?.noites || 0} {reserva?.noites === 1 ? t('noite') : t('noites')}
            </p>
          </div>
        </div>

        {/* Hóspedes */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={12} className="text-blue-500" />
              {t('hospedes')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {totalHospedes || 1} {totalHospedes === 1 ? t('hospede') : t('hospedes')}
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
            <span className="text-slate-500">{t('preco_por_noite')}</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.precoNoite)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('subtotal_noites', { noites: reserva?.noites || 0 })}</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.subtotal)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('taxa_limpeza')}</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.taxaLimpeza)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('taxa_servico_curto')}</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.taxaServico)} CVE</span>
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

        {/* Política de cancelamento */}
        <div className="bg-green-50 p-3 rounded-xl flex gap-2 mt-3 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">{t('cancelamento_gratis')}</p>
            <p className="text-[8px] text-green-700 leading-tight mt-0.5">
              {t('cancelamento_prazo_checkout')}
            </p>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <div>
            <p className="text-[9px] font-bold text-blue-900">{t('reserva_100_segura')}</p>
            <p className="text-[8px] text-blue-700 leading-tight mt-0.5">
              {paymentStatus === 'paid' 
                ? t('reserva_garantida_codigo')
                : t('dados_protegidos_reserva')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReservaAlojamento;