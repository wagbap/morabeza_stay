import { useId } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PesquisaNomeFiltro({ value, onChange, titulo, placeholder, ajuda, divider = true }) {
  const id = useId();
  const { t } = useTranslation();
  return <div className={divider ? "mb-6 border-b border-gray-100 pb-6" : ""}>
    <label htmlFor={id} className="mb-3 block text-[11px] font-black uppercase text-gray-900">{t(titulo)}</label>
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"><Search size={20} strokeWidth={1.8} /></span>
      <input id={id} type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={t(placeholder)} aria-describedby={`${id}-ajuda`} className="min-h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
    </div>
    <p id={`${id}-ajuda`} className="mt-2 text-xs leading-relaxed text-gray-500">{t(ajuda)}</p>
  </div>;
}
