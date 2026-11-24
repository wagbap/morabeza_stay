import { useTranslation } from 'react-i18next';

export default function AcoesCalendario({ onLimpar, onFechar, disabled = false }) {
  const { t } = useTranslation();
  return <div className="flex w-full items-center justify-between gap-4 border-t border-slate-100 p-2">
    <button type="button" disabled={disabled} onClick={onLimpar} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50">{t('limpar', 'Limpar')}</button>
    <button type="button" onClick={onFechar} className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">{t('fechar', 'Fechar')}</button>
  </div>;
}
