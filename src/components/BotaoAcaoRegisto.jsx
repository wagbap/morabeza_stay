import React from 'react';
import { ArrowRight, Loader, Save, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BotaoAcaoRegisto = ({ onClick, loading = false, modo = 'guardar' }) => {
  const { t } = useTranslation();
  const Icone = modo === 'analise' ? Send : Save;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-64"
    >
      {loading ? <Loader size={21} className="animate-spin" /> : React.createElement(Icone, { size: 21 })}
      <span>{loading ? t('registo_acao_processando', 'Processing…') : modo === 'analise'
        ? t('registo_acao_analise', 'Send for review')
        : t('registo_acao_guardar', 'Save changes')}</span>
      {!loading && <ArrowRight size={20} />}
    </button>
  );
};

export default BotaoAcaoRegisto;
