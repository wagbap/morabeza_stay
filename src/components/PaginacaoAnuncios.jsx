import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PaginacaoAnuncios({ total, pagina, porPagina = 9, onChange }) {
  const { t } = useTranslation();
  if (!total) return null;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const atual = Math.min(Math.max(1, pagina), paginas);
  return <nav aria-label={t('admin_paginacao')} className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-4 sm:px-5">
    <p role="status" className="text-xs text-slate-500">{t('admin_pagina_resumo', { inicio: (atual - 1) * porPagina + 1, fim: Math.min(atual * porPagina, total), total })}</p>
    <div className="flex items-center gap-3">
      <button type="button" disabled={atual <= 1} onClick={() => onChange(atual - 1)} className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs text-blue-600 transition hover:bg-blue-50 disabled:cursor-default disabled:opacity-40">{t('admin_pagina_anterior')}</button>
      <span className="text-xs text-slate-600">{t('admin_pagina_numero', { pagina: atual, total: paginas })}</span>
      <button type="button" disabled={atual >= paginas} onClick={() => onChange(atual + 1)} className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs text-blue-600 transition hover:bg-blue-50 disabled:cursor-default disabled:opacity-40">{t('admin_pagina_seguinte')}</button>
    </div>
  </nav>;
}
