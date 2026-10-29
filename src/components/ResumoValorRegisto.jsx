import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ResumoValorRegisto({ valor, unidade = 'noite', referencia = false }) {
  const { t } = useTranslation();
  const preco = Number(valor);
  if (valor === '' || valor == null || !Number.isFinite(preco) || preco < 0) return null;
  const totalCentimos = Math.round(preco * 100);
  const comissaoCentimos = Math.round(totalCentimos * 0.1);
  const formatar = centimos => `${(centimos / 100).toLocaleString('pt-PT', { maximumFractionDigits: 2 })} CVE`;
  return <section className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 sm:p-4" aria-label={t('registo_resumo_titulo')}>
    <h3 className="mb-3 font-bold">{t('registo_resumo_titulo')}</h3>
    <dl className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><dt>{t(referencia ? 'registo_resumo_referencia' : 'registo_resumo_cliente')}</dt><dd className="ml-auto whitespace-nowrap tabular-nums">{formatar(totalCentimos)}</dd></div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><dt>{t('registo_resumo_comissao')}</dt><dd className="ml-auto whitespace-nowrap tabular-nums">{formatar(comissaoCentimos)}</dd></div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-blue-100 pt-2 font-bold"><dt>{t('registo_resumo_recebe')}</dt><dd className="ml-auto text-right tabular-nums">{formatar(totalCentimos - comissaoCentimos)} {t(`registo_resumo_por_${unidade}`)}</dd></div>
    </dl>
    {referencia && <p className="mt-2 text-xs leading-relaxed text-blue-800">{t('registo_resumo_nota_referencia')}</p>}
  </section>;
}
