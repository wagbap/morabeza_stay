// src/features/carros/components/ResumoReservaCarro.jsx
import React from 'react';
import { MapPin, Calendar, ShieldCheck, Lock, CreditCard, Check, Info, Clock } from 'lucide-react';

const ResumoReservaCarro = ({ reserva, precoTotal, showPaymentInfo = false, paymentStatus = null }) => {
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString('pt-PT');
  };
  
  const formatarData = (data) => {
    if (!data) return 'Não selecionada';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Dados do carro
  const titulo = reserva?.titulo || 'Veículo não informado';
  const localizacao = reserva?.localizacao || 'Cabo Verde';
  const imagem = reserva?.imagem || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200';
  const checkIn = reserva?.checkIn;
  const checkOut = reserva?.checkOut;
  const dias = reserva?.dias || 0;
  const precoDia = reserva?.precoDia || 0;
  const subtotal = reserva?.subtotal || 0;
  const taxaServico = reserva?.taxaServico || 0;
  const horaLevantamento = reserva?.horaLevantamento || reserva?.hora_levantamento || '10:00';

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">Resumo da reserva</h2>
      
      <div className="flex gap-4 mb-6">
        <img 
          src={imagem}
          className="w-20 h-20 rounded-xl object-cover shrink-0" 
          alt={titulo}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">{titulo}</h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <MapPin size={10} className="text-orange-500" /> {localizacao}
          </p>
        </div>
      </div>

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
                <Check className="text-white" size={18} />
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
              {paymentStatus === 'paid' ? '✓ Pagamento confirmado!' : '⏳ Aguardando pagamento'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {paymentStatus === 'paid' 
                ? 'Sua reserva está confirmada.' 
                : 'A reserva será confirmada após o pagamento.'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Levantamento</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(checkIn)} - {horaLevantamento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Devolução</span>
          <span className="text-xs font-bold text-blue-900">{formatarData(checkOut)} - {horaLevantamento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-600 font-medium">Dias</span>
          <span className="text-xs font-bold text-blue-900">{dias} {dias === 1 ? 'dia' : 'dias'}</span>
        </div>
        
        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Preço por dia</span>
            <span className="text-slate-800">{formatNumber(precoDia)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500">Subtotal ({dias} dias)</span>
            <span className="text-slate-800">{formatNumber(subtotal)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-500 flex items-center gap-1">Taxa de serviço (10%) <Info size={11} className="text-slate-400" /></span>
            <span className="text-slate-800">{formatNumber(taxaServico)} CVE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">Total</span>
          <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
        </div>

        <div className="bg-green-50 p-3 rounded-xl flex gap-2 mt-3 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">Cancelamento gratuito</p>
            <p className="text-[8px] text-green-700 font-medium">Até 48 horas antes do levantamento</p>
          </div>
        </div>

        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 border border-blue-50">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <p className="text-[8px] text-blue-700 font-medium">Seus dados estão protegidos e seguros através de encriptação segura de ponta a ponta.</p>
        </div>
      </div>
    </div>
  );
};

export default ResumoReservaCarro;