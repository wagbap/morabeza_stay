import React from 'react';
import { useTranslation } from 'react-i18next';
import { idiomas, idiomaAtual } from '../utils/idiomas';
import { ChevronDown, Check } from 'lucide-react';

export default function SeletorIdioma() {
  const { t, i18n } = useTranslation();
  const atual = idiomaAtual(i18n.resolvedLanguage || i18n.language);
  return <details className="group relative text-left">
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-gray-200 px-3 text-gray-700 transition hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
      <img src={`/images/flags/${atual.flag}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover" />
      <span>{t('idioma_seletor')}: {atual.label}</span><ChevronDown size={14} />
    </summary>
    <div className="absolute bottom-full right-0 z-50 mb-2 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
      {idiomas.map(item => <button key={item.code} type="button" aria-pressed={item.code === atual.code}
        onClick={event => { void i18n.changeLanguage(item.code); event.currentTarget.closest('details').open = false; }}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-gray-700 hover:bg-blue-50">
        <img src={`/images/flags/${item.flag}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover" /><span className="flex-1 text-left">{item.label}</span>
        {item.code === atual.code && <span className="text-blue-600"><Check size={15} /></span>}
      </button>)}
    </div>
  </details>;
}
