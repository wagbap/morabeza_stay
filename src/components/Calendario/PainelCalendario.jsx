import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AcoesCalendario from './AcoesCalendario';

export default function PainelCalendario({ children, onLimpar, disabled }) {
  const [aberto, setAberto] = useState(true);
  const { t } = useTranslation();
  return <>
    {!aberto && <button type="button" onClick={() => setAberto(true)} className="min-h-11 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700">{t('calendario_abrir', 'Abrir calendário')}</button>}
    <div hidden={!aberto}>
      {children}
      <AcoesCalendario onLimpar={onLimpar} onFechar={() => setAberto(false)} disabled={disabled} />
    </div>
  </>;
}
