import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginacaoLista({ total, page, pages, size, first, last, onPage, onSize }) {
  const { t } = useTranslation();
  const navRef = useRef(null);
  const move = callback => {
    callback();
    requestAnimationFrame(() => navRef.current?.closest('[data-lista-paginada]')?.scrollIntoView({
      block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    }));
  };
  if (!total) return null;
  return <nav ref={navRef} aria-label={t('lista_paginacao')} className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <p role="status" className="text-xs text-slate-500">{t('lista_resultados', { first, last, total })}</p>
    {total > 10 && <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
      <label className="flex items-center gap-2 text-xs text-slate-500">{t('lista_por_pagina')}
        <select value={size} onChange={event => move(() => onSize(event.target.value))} className="min-h-11 rounded-lg border border-slate-200 bg-white px-2 text-base text-slate-700 sm:min-h-9 sm:text-xs">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} aria-label={t('lista_anterior')} onClick={() => move(() => onPage(page - 1))} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"><ChevronLeft size={17} /></button>
        <span className="min-w-14 text-center text-xs font-medium tabular-nums text-slate-600">{t('lista_pagina', { page, pages })}</span>
        <button type="button" disabled={page >= pages} aria-label={t('lista_seguinte')} onClick={() => move(() => onPage(page + 1))} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"><ChevronRight size={17} /></button>
      </div>
    </div>}
  </nav>;
}
