import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock, Users, MapPin, ShieldCheck, CreditCard, CheckCircle, Lock,
  Calendar, Ship, Compass, User, Package
} from 'lucide-react';

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

  // 🔥 Detetar modelo de reserva
  const isGrupoPrivado = reserva?.modelo === 'grupo_privado' || reserva?.modelo_reserva === 'grupo_privado';
  const isPorEquipamento = reserva?.modelo === 'por_equipamento' || reserva?.modelo_reserva === 'por_equipamento';
  const isPorPessoa = !isGrupoPrivado && !isPorEquipamento;

  // 🔥 Configuração visual por modelo
  const configModelo = isGrupoPrivado
    ? {
        label: t('modelo_grupo_privado', 'Experiência Privada'),
        emoji: '🚤',
        icon: Compass,
        cor: 'bg-purple-50 border-purple-200 text-purple-800',
        corIcone: 'text-purple-600'
      }
    : isPorEquipamento
      ? {
          label: t('modelo_por_equipamento', 'Aluguer por Equipamento'),
          emoji: '🏍️',
          icon: Package,
          cor: 'bg-blue-50 border-blue-200 text-blue-800',
          corIcone: 'text-blue-600'
        }
      : {
          label: t('modelo_por_pessoa', 'Preço por Pessoa'),
          emoji: '🥾',
          icon: User,
          cor: 'bg-green-50 border-green-200 text-green-800',
          corIcone: 'text-green-600'
        };

  const IconeModelo = configModelo.icon;

  // 🔥 Referência única da reserva
  const referenciaUnica = reserva?.id && reserva?.dataISO && reserva?.horario
    ? `#${reserva.id}-${reserva.dataISO.replace(/-/g, '')}-${reserva.horario.replace(':', '')}`
    : null;

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm sticky top-6">
      <h2 className="text-lg font-bold text-blue-900 mb-3">{t('resumo_reserva')}</h2>

      {/* 🔥 BADGE DO MODELO */}
      <div className={`mb-4 px-3 py-1.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 ${configModelo.cor}`}>
        <IconeModelo size={12} className={configModelo.corIcone} />
        {configModelo.emoji} {configModelo.label}
      </div>

      {/* IMAGEM + TÍTULO */}
      <div className="flex gap-4 mb-6">
        <img
          src={reserva?.imagem || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
          className="w-20 h-20 rounded-xl object-cover"
          alt={reserva?.titulo || t('experiencia')}
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200'}
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900">{reserva?.titulo || t('experiencia')}</h4>
          <div className="mt-2 space-y-1 text-[10px] font-semibold text-slate-400">
            <p className="flex items-center gap-1.5">
              <Clock size={11} /> {reserva?.duracao || '15 min'}
            </p>
            <p className="flex items-center gap-1.5">
              <Users size={11} /> 1 - {reserva?.maxPessoas || 10} {t('pessoas')}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin size={11} /> {reserva?.localizacao || t('cabo_verde')}
            </p>
          </div>
        </div>
      </div>

      {/* CÓDIGO DA RESERVA */}
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

      {/* STATUS DE PAGAMENTO */}
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

        {/* DATA */}
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

        {/* PERÍODO */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock size={12} className="text-blue-500" />
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

        {/* DURAÇÃO */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock size={12} className="text-blue-500" />
              {t('duracao')}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">{reserva?.duracao || '15 min'}</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 🔥 DETALHES ESPECÍFICOS POR MODELO */}
        {/* ============================================================ */}

        {/* 🏍️ POR EQUIPAMENTO */}
        {isPorEquipamento && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Ship size={12} className="text-blue-500" />
                  {t('equipamento', 'Equipamento')}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {reserva?.quantidadeJetSkis || 1} {t('unidades', 'unid.')}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users size={12} className="text-blue-500" />
                  {t('capacidade_por_unidade', 'Capacidade / unidade')}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {reserva?.capacidadePorUnidade || 2} {t('pessoas', 'pessoas')}
                </p>
              </div>
            </div>
          </>
        )}

        {/* 🚤 GRUPO PRIVADO */}
        {isGrupoPrivado && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users size={12} className="text-purple-500" />
                  {t('n_pessoas_grupo', 'Nº de pessoas')}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {totalPessoas || 1} {totalPessoas === 1 ? t('pessoa') : t('pessoas')}
                </p>
              </div>
            </div>

            {reserva?.min_pessoas_grupo && reserva?.max_pessoas_grupo && (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users size={12} className="text-purple-500" />
                    {t('capacidade_grupo', 'Capacidade do grupo')}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {reserva.min_pessoas_grupo}-{reserva.max_pessoas_grupo} {t('pessoas', 'pessoas')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* 🥾 POR PESSOA */}
        {isPorPessoa && (
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
          </div>
        )}

        {/* ============================================================ */}
        {/* 🔥 PREÇOS ADAPTADOS AO MODELO */}
        {/* ============================================================ */}
        <div className="pt-3 space-y-1 border-t border-slate-100">

          {/* GRUPO PRIVADO */}
          {isGrupoPrivado && (
            <>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">
                  {t('preco_grupo', 'Preço do grupo')}
                </span>
                <span className="font-bold text-blue-900">
                  {formatNumber(reserva?.precoPorPessoa)} CVE
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">
                  {t('ate_n_pessoas', 'Até')} {reserva?.max_pessoas_grupo || totalPessoas} {t('pessoas', 'pessoas')}
                </span>
                <span className="font-bold text-slate-400 text-[10px]">
                  {t('sessao_exclusiva', 'sessão exclusiva')}
                </span>
              </div>
            </>
          )}

          {/* POR EQUIPAMENTO */}
          {isPorEquipamento && (
            <>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">
                  {reserva?.quantidadeJetSkis || 1} x {formatNumber(reserva?.precoPorPessoa)} CVE
                </span>
                <span className="font-bold text-blue-900">
                  {formatNumber((reserva?.quantidadeJetSkis || 1) * (reserva?.precoPorPessoa || 0))} CVE
                </span>
              </div>
            </>
          )}

          {/* POR PESSOA */}
          {isPorPessoa && (
            <>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">
                  {formatNumber(reserva?.precoPorPessoa)} CVE x {totalPessoas || 1}
                </span>
                <span className="font-bold text-blue-900">
                  {formatNumber((reserva?.precoPorPessoa || 0) * (totalPessoas || 1))} CVE
                </span>
              </div>
            </>
          )}
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-blue-900">{t('total')}</span>
          <div className="text-right">
            <span className="text-xl font-bold text-blue-600">{formatNumber(precoTotal)} CVE</span>
            {paymentStatus === 'paid' && (
              <p className="text-[9px] text-green-600 font-bold">✓ {t('pago')}</p>
            )}
          </div>
        </div>

        {/* 🔥 REFERÊNCIA ÚNICA */}
        {referenciaUnica && (
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {t('referencia_unica', 'Referência única')}
            </p>
            <p className="text-[10px] font-mono text-slate-600 mt-0.5">
              {referenciaUnica}
            </p>
          </div>
        )}

        {/* SEGURANÇA */}
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