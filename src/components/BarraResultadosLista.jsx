import { createElement } from 'react';
import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BarraResultadosLista({ total, ordenar, onOrdenar, viewMode, onViewMode }) {
  const { t } = useTranslation();
  return <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <h1 className="text-left text-xl font-black uppercase italic leading-tight tracking-tighter text-[#1a2b6d] md:text-3xl">{t('explorar')}: <span className="text-3xl text-blue-600 md:text-4xl">{total}</span> {t('opcoes')}</h1>
    <div className="flex w-full max-w-full flex-nowrap items-center gap-2 self-stretch rounded-full border border-gray-100 bg-white p-1.5 shadow-sm md:w-auto md:self-auto">
      <div className="relative min-w-0 flex-1 rounded-full bg-blue-600 text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600">
        <span aria-hidden="true" className="pointer-events-none flex min-h-11 items-center overflow-hidden whitespace-nowrap py-2.5 pl-3 pr-7 text-[9px] font-black uppercase tracking-wide sm:text-[10px] md:pl-5"><span className="truncate">{t('ordenar_por')}: {t(`ordenar_${ordenar}`)}</span></span>
        <select aria-label={t('ordenar_por')} value={ordenar} onChange={e => onOrdenar(e.target.value)} className="absolute inset-0 h-full min-h-11 w-full max-w-full cursor-pointer appearance-none rounded-full text-base opacity-0">
          {['recomendados','preco_asc','preco_desc','avaliacao'].map(value => <option key={value} value={value} className="bg-white text-gray-900">{t('ordenar_por')}: {t(`ordenar_${value}`)}</option>)}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
      </div>
      <div className="mx-1 h-6 w-px shrink-0 bg-gray-100" />
      {[['grid',LayoutGrid,'exp_ver_grelha'],['list',List,'exp_ver_lista']].map(([mode,Icon,label]) => <button key={mode} type="button" aria-label={t(label)} aria-pressed={viewMode === mode} onClick={() => onViewMode(mode)} className={`min-h-11 min-w-11 shrink-0 rounded-full p-3 transition-colors ${viewMode === mode ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>{createElement(Icon, {size:18})}</button>)}
    </div>
  </div>;
}
