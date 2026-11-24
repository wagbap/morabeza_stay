import { useId, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PainelFiltrosLista({ total, pesquisa, children }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const { t } = useTranslation();
  return <div data-filter-panel className="rounded-[32px] border border-gray-100 bg-white p-5 sm:p-6 shadow-xl shadow-blue-900/5">
    <div className={`flex items-center justify-between mb-3 sm:mb-4`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">{t('filtrar_por', 'Filtrar por')}</h3>
      <div className="flex items-center gap-2">
        <span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-600">{total}</span>
        <button type="button" aria-expanded={aberto} aria-controls={id} aria-label={t(aberto ? 'alojamento_recolher_filtros' : 'alojamento_expandir_filtros')} onClick={() => setAberto(v => !v)} className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 lg:hidden"><ChevronUp size={18} className={`transition-transform ${aberto ? '' : 'rotate-180'}`} /></button>
      </div>
    </div>
    <div className={aberto ? 'mb-6' : 'lg:mb-6'}>{pesquisa}</div>
    <div id={id} className={aberto ? '' : 'hidden lg:block'}>{children}</div>
  </div>;
}
