import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { normalizarCaucaoCarro, totalCaucaoCarro } from '../utils/caucaoCarro';

export default function CaucaoCarro({ dados, quantidade = 1 }) {
  const { t, i18n } = useTranslation();
  const caucao = normalizarCaucaoCarro(dados);
  const formatar = value => Number(value).toLocaleString(i18n.resolvedLanguage || 'pt-PT', { maximumFractionDigits: 2 });
  return (
    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-left">
      <span className="mt-0.5 shrink-0 text-orange-500"><Shield size={18} /></span>
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <h5 className="mb-1 text-sm font-bold text-slate-900">{!caucao ? t('carro_caucao_por_confirmar') : caucao.exige_caucao ? `${t('carro_caucao_por_carro')}: ${formatar(caucao.caucao_valor)} CVE` : t('carro_caucao_sem')}</h5>
        {caucao?.exige_caucao === 1 && <>
          {quantidade > 1 && <p className="mb-1 text-xs font-semibold text-slate-700">{t('carro_caucao_total', { quantidade, valor: formatar(totalCaucaoCarro(caucao, quantidade)) })}</p>}
          <p className="text-[11px] font-medium leading-relaxed text-slate-600">{t('carro_caucao_fora_pagamento')}</p>
          {caucao.caucao_formas.length > 0 && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{t('carro_caucao_metodos')}: {caucao.caucao_formas.map(forma => ({
            dinheiro: t('carro_caucao_metodo_dinheiro'),
            transferencia: t('carro_caucao_metodo_transferencia'),
            multibanco: t('carro_caucao_metodo_multibanco'),
            cheque: t('carro_caucao_metodo_cheque'),
          })[forma] || forma).join(' · ')}</p>}
          {caucao.caucao_condicoes && <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-600">{caucao.caucao_condicoes}</p>}
        </>}
      </div>
    </div>
  );
}
