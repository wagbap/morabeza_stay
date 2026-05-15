import React from 'react';
import { Clock, Users, MapPin, ShieldCheck, CreditCard, CheckCircle, Lock, Calendar, Clock as ClockIcon } from 'lucide-react';

const ResumoReserva = ({ 
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
  
  // Determinar se pode alterar (apenas antes do pagamento)
  const podeAlterar = !showPaymentInfo || paymentStatus !== 'paid';
  
  // Função segura para formatar números
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString();
  };
  
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6">
      <h2 className="text-lg font-bold text-blue-900 mb-5">Resumo da reserva</h2>
      
      <div className="flex gap-4 mb-6">
        <img 
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'} 
          className="w-20 h-20 rounded-xl object-cover" 
          alt={reserva?.titulo || 'Experiência'}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900">{reserva?.titulo || 'Cidade Velha Cultura & Tour'}</h4>
          <div className="mt-2 space-y-1 text-[10px] font-semibold text-slate-400">
            <p className="flex items-center gap-1.5"><Clock size={11}/> {reserva?.duracao || '4 horas'}</p>
            <p className="flex items-center gap-1.5"><Users size={11}/> 1 - {reserva?.maxPessoas || 10} pessoas</p>
            <p className="flex items-center gap-1.5"><MapPin size={11}/> {reserva?.localizacao || 'Cidade Velha'}</p>
          </div>
        </div>
      </div>

      {/* Código da reserva (após confirmação) */}
      {isConfirmed && codigoReserva && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-800">Código da reserva</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-900">{codigoReserva}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(codigoReserva)}
              className="text-[9px] text-blue-600 underline"
            >
              Copiar
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
              {paymentStatus === 'paid' ? '✓ Pagamento confirmado!' : '⏳ Aguardando pagamento'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {paymentStatus === 'paid' 
                ? 'Sua reserva está confirmada. Apresente o código acima no momento do passeio.' 
                : 'A reserva será confirmada automaticamente após a confirmação do pagamento.'}
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
              Data selecionada
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{reserva?.data || 'Não selecionada'}</p>
          </div>
          {setDataModalOpen && podeAlterar && (
            <button 
              onClick={() => setDataModalOpen(true)} 
              className="text-blue-600 font-bold text-[10px] underline hover:opacity-70 transition"
            >
              Alterar
            </button>
          )}
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              Confirmado
            </span>
          )}
        </div>

        {/* Período */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ClockIcon size={12} className="text-blue-500" />
              Período
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {reserva?.periodo && reserva?.horario 
                ? `${reserva.periodo} (${reserva.horario})` 
                : 'Não selecionado'}
            </p>
          </div>
          {setHorarioModalOpen && podeAlterar && (
            <button 
              onClick={() => setHorarioModalOpen(true)} 
              className="text-blue-600 font-bold text-[10px] underline hover:opacity-70 transition"
            >
              Alterar
            </button>
          )}
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              Confirmado
            </span>
          )}
        </div>

        {/* Participantes */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={12} className="text-blue-500" />
              Participantes
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {totalPessoas || 1} {totalPessoas === 1 ? 'pessoa' : 'pessoas'}
            </p>
          </div>
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              Confirmado
            </span>
          )}
        </div>
        
        {/* Preços */}
        <div className="pt-3 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Preço por pessoa</span>
            <span className="font-bold text-blue-900">{formatNumber(reserva?.precoPorPessoa)} CVE</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Total ({totalPessoas || 1} pessoas)</span>
            <span className="font-bold text-blue-900">{formatNumber(precoTotal)} CVE</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">Total</span>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
            {paymentStatus === 'paid' && (
              <p className="text-[9px] text-green-600 font-bold">✓ Pago</p>
            )}
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 mt-3">
          <ShieldCheck className="text-blue-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-blue-900">Reserva 100% segura</p>
            <p className="text-[8px] text-blue-700 leading-tight mt-0.5">
              {paymentStatus === 'paid' 
                ? 'Sua reserva está garantida. Apresente o código no local do passeio.'
                : 'Seus dados estão protegidos e a reserva será confirmada após o pagamento.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReserva;