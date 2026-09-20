// src/features/alojamento/components/ResumoReservaAlojamento.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Users, MapPin, Star, ShieldCheck, CreditCard,
  CheckCircle, Lock, Clock as ClockIcon,
} from 'lucide-react';

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

const formatNumber = (value) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0';
  return Number(value).toLocaleString('pt-PT');
};

const formatarData = (data, t) => {
  if (!data) return t('nao_selecionada', 'Não selecionada');
  const d = new Date(data);
  if (isNaN(d.getTime())) return t('nao_selecionada', 'Não selecionada');
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const ResumoReservaAlojamento = ({
  reserva = {},
  totalHospedes = 0,
  precoTotal = 0,
  showPaymentInfo = false,
  paymentStatus = null,
  isConfirmed = false,
  codigoReserva = null,
  setDataModalOpen = null,
}) => {
  const { t } = useTranslation();
  const podeAlterar = !showPaymentInfo || paymentStatus !== 'paid';

  const noites = Number(reserva?.noites || 1);
  const quartos = Array.isArray(reserva?.quartos) ? reserva.quartos : [];
  const taxaLimpeza = Number(reserva?.taxaLimpeza || 0);

  // ---------------------------------------------------------
  // Cálculo do subtotal — 3 caminhos possíveis:
  //  1. Multi-quarto (novo): soma(precoNoite × quantidade × noites)
  //  2. Formato antigo com precoNoite no topo
  //  3. Fallback: precoTotal − taxaLimpeza
  // ---------------------------------------------------------
  let subtotalNoites = 0;

  if (quartos.length > 0) {
    subtotalNoites = quartos.reduce((acc, q) => {
      const preco = Number(q.precoNoite || q.preco_noite || 0);
      const qtd = Number(q.quantidade || 1);
      return acc + preco * qtd * noites;
    }, 0);
  } else if (Number(reserva?.precoNoite) > 0) {
    subtotalNoites = Number(reserva.precoNoite) * noites;
  } else if (Number(precoTotal) > taxaLimpeza) {
    subtotalNoites = Number(precoTotal) - taxaLimpeza;
  }

  const totalCalculado = subtotalNoites + taxaLimpeza;
  const totalFinal = Number(precoTotal) > 0 ? Number(precoTotal) : totalCalculado;

  // Preço médio por noite (para mostrar quando há 1 quarto)
  const precoMedioNoite = quartos.length === 1
    ? Number(quartos[0]?.precoNoite || quartos[0]?.preco_noite || 0)
    : 0;

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6 text-left">
      <h2 className="text-lg font-bold text-blue-900 mb-5">
        {t('resumo_reserva') || 'Resumo da reserva'}
      </h2>

      {/* Alojamento */}
      <div className="flex gap-4 mb-6">
        <img
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
          alt={reserva?.titulo || t('alojamento') || 'Alojamento'}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 leading-tight">
            {reserva?.titulo || 'Morabeza Stay'}
          </h4>
          <div className="mt-2 space-y-1 text-[10px] font-semibold text-slate-400">
            <p className="flex items-center gap-1.5">
              <MapPin size={11} /> {reserva?.localizacao || t('cabo_verde') || 'Cabo Verde'}
            </p>
            <p className="flex items-center gap-1.5">
              <Users size={11} /> {t('capacidade') || 'Capacidade'}:{' '}
              {reserva?.capacidade || reserva?.maxPessoas || 2} {t('pessoas') || 'pessoas'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              <Star size={11} fill="currentColor" />
              <span className="text-[10px] font-bold text-slate-500">4.8 {t('avaliacoes') || 'avaliações'}</span>
            </div>
          </div>
          {setDataModalOpen && podeAlterar && (
            <button
              type="button"
              onClick={() => setDataModalOpen(true)}
              className="text-[10px] text-blue-600 underline mt-2 font-bold block"
            >
              {t('alterar_datas', 'Alterar datas')}
            </button>
          )}
        </div>
      </div>

      {/* Código da reserva */}
      {isConfirmed && codigoReserva && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-800">
              {t('codigo_reserva') || 'Código de reserva'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-900">{codigoReserva}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codigoReserva)}
              className="text-[9px] text-blue-600 underline"
            >
              {t('copiar') || 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Status de pagamento */}
      {showPaymentInfo && paymentStatus && (
        <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 border ${
          paymentStatus === 'paid' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
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
            <p className={`text-sm font-bold ${paymentStatus === 'paid' ? 'text-green-800' : 'text-yellow-800'}`}>
              {paymentStatus === 'paid'
                ? (t('pagamento_confirmado') || 'Pagamento confirmado')
                : (t('aguardando_pagamento') || 'A aguardar pagamento')}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {paymentStatus === 'paid'
                ? (t('reserva_confirmada_checkin') || 'Reserva confirmada. Vemo-nos no check-in!')
                : (t('reserva_confirmada_apos_pagamento') || 'A reserva será confirmada após o pagamento.')}
            </p>
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              {t('checkin') || 'Check-in'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {formatarData(reserva?.checkIn, t)}
            </p>
          </div>
          {podeAlterar ? (
            <span className="text-blue-600 text-[9px] font-bold bg-blue-50 px-2 py-0.5 rounded-full">
              {t('pendente') || 'Pendente'}
            </span>
          ) : (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado') || 'Confirmado'}
            </span>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              {t('checkout') || 'Check-out'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {formatarData(reserva?.checkOut, t)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ClockIcon size={12} className="text-blue-500" />
              {t('estadia') || 'Estadia'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {plural(noites, t('noite') || 'noite', t('noites') || 'noites')}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={12} className="text-blue-500" />
              {t('hospedes') || 'Hóspedes'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {plural(totalHospedes || 1, t('hospede') || 'hóspede', t('hospedes') || 'hóspedes')}
            </p>
          </div>
          {!podeAlterar && (
            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {t('confirmado') || 'Confirmado'}
            </span>
          )}
        </div>
      </div>

      {/* Quartos escolhidos — só aparece se houver tipos */}
      {quartos.length > 0 && (
        <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
          <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">
            {quartos.length === 1 && quartos[0].modoInteiro
              ? t('alojamento', 'Alojamento')
              : t('quartos', 'Quartos')}
          </p>
          {quartos.map((q, idx) => {
            const preco = Number(q.precoNoite || q.preco_noite || 0);
            const qtd = Number(q.quantidade || 1);
            const linhaTotal = preco * qtd * noites;
            return (
              <div
                key={q.tipoQuartoId || `q-${idx}`}
                className="flex justify-between text-[11px] font-medium gap-2"
              >
                <span className="text-slate-600 truncate">
                  {q.modoInteiro ? q.nome : `${qtd}× ${q.nome}`}
                </span>
                <span className="text-slate-800 font-bold whitespace-nowrap">
                  {formatNumber(linhaTotal)} CVE
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Preços detalhados */}
      <div className="pt-3 mt-3 space-y-1 border-t border-slate-100">
        {/* Preço/noite só faz sentido mostrar quando há 1 único tipo */}
        {precoMedioNoite > 0 && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('preco_por_noite') || 'Preço por noite'}</span>
            <span className="font-bold text-blue-900">{formatNumber(precoMedioNoite)} CVE</span>
          </div>
        )}

        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">
            {t('subtotal', 'Subtotal')} ({plural(noites, t('noite') || 'noite', t('noites') || 'noites')})
          </span>
          <span className="font-bold text-blue-900">{formatNumber(subtotalNoites)} CVE</span>
        </div>

        {taxaLimpeza > 0 && (
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">{t('taxa_limpeza') || 'Taxa de limpeza'}</span>
            <span className="font-bold text-blue-900">{formatNumber(taxaLimpeza)} CVE</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
        <span className="text-base font-bold text-blue-900">{t('total') || 'Total'}</span>
        <div className="text-right">
          <span className="text-xl font-bold text-blue-600">{formatNumber(totalFinal)} CVE</span>
          {paymentStatus === 'paid' && (
            <p className="text-[9px] text-green-600 font-bold">✓ {t('pago') || 'Pago'}</p>
          )}
        </div>
      </div>



         {/* Blocos de rodapé — Cancelamento + Segurança (UMA única vez) */}
      <div className="space-y-3 mt-4">
        {/* Cancelamento */}
        <div className="bg-green-50 p-3 rounded-xl flex gap-2 border border-green-100">
          <ShieldCheck className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[9px] font-bold text-green-800">
              {t('cancelamento_gratis') || 'Cancelamento gratuito disponível'}
            </p>
            <p className="text-[8px] text-green-700 leading-tight mt-0.5">
              {t('cancelamento_prazo_checkout') || 'Até 48 horas antes do check-in'}
            </p>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-[#F0F7FF] p-3 rounded-xl flex gap-2 border border-blue-100">
          <Lock className="text-blue-600 shrink-0" size={16} />
          <div>
            <p className="text-[9px] font-bold text-blue-900">
              {t('reserva_100_segura') || 'Reserva 100% segura'}
            </p>
            <p className="text-[8px] text-blue-700 leading-tight mt-0.5">
              {paymentStatus === 'paid'
                ? (t('reserva_garantida_codigo') || 'Reserva garantida com código')
                : (t('dados_protegidos_reserva') || 'Dados protegidos durante a reserva')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoReservaAlojamento;