import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info, MapPin, Star, FileText, Image, Settings, Tag, CheckCircle, ShieldCheck, Languages, CalendarDays, House, Car, Compass, ArrowLeft, ArrowRight } from 'lucide-react';

const steps = {
  alojamento: [['info', Info], ['local', MapPin], ['comodidades', Star], ['regras', FileText], ['fotos', Image]],
  carro: [['info', Info], ['especificacoes', Settings], ['local', MapPin], ['caracteristicas', Star], ['fotos', Image]],
  experiencia: [['info', Info], ['local', MapPin], ['categoria', Tag], ['inclusoes', CheckCircle], ['requisitos', ShieldCheck], ['idiomas', Languages], ['fotos', Image], ['disponibilidade', CalendarDays]],
};

export const EtapasRegisto = ({ dominio, fase, onBack, onNext }) => {
  const { t } = useTranslation();
  const list = steps[dominio];
  return <div className="mb-6">
    <div className="mb-5 flex items-center justify-between text-sm font-medium text-blue-950">
      <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 rounded-lg px-1 hover:text-blue-600"><ArrowLeft size={20} />{t('crud_voltar')}</button>
      {fase < list.length && <button type="button" onClick={onNext} className="flex min-h-11 items-center gap-2 rounded-lg px-1 hover:text-blue-600">{t('crud_proximo')}<ArrowRight size={20} /></button>}
    </div>
    <nav aria-label={t('crud_etapas')} className="overflow-x-auto pb-2">
      <ol className="flex min-w-full gap-2">
        {list.map(([key, Icon], index) => <li key={key} aria-current={fase === index + 1 ? 'step' : undefined} className={`flex min-w-[64px] flex-1 flex-col items-center gap-2 text-center ${fase === index + 1 ? 'font-semibold text-blue-600' : 'text-slate-500'}`}>
          {React.createElement(Icon, { size: 22, strokeWidth: 1.8 })}
          <span className="text-[10px] leading-tight sm:text-xs">{t(`crud_etapa_${key}`)}</span>
          <span className={`mt-1 h-1 w-full rounded-full ${fase === index + 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </li>)}
      </ol>
    </nav>
  </div>;
};

export const TituloRegisto = ({ dominio, fase, editar = false }) => {
  const { t } = useTranslation();
  const Icon = dominio === 'carro' ? Car : dominio === 'experiencia' ? Compass : House;
  const key = steps[dominio][fase - 1]?.[0] || 'info';
  return <div className="mb-7 flex items-start gap-3 sm:gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">{React.createElement(Icon, { size: 28, strokeWidth: 1.8 })}</div>
    <div className="min-w-0"><h1 className="text-xl font-bold leading-tight tracking-tight text-[#0b183b] sm:text-2xl">{fase === 1 ? t(editar ? `crud_editar_${dominio}` : `crud_criar_${dominio}`) : t(`crud_etapa_${key}`)}</h1>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{t(fase === 1 ? `crud_intro_${dominio}` : 'crud_intro_etapa')}</p></div>
  </div>;
};

const RegistoVisual = ({ children }) => <div className="registo-visual min-h-screen bg-[#f5f8fc] text-slate-800">
  {children}
  <style>{`
    .registo-visual > header { min-height: 64px; height: auto; padding: 14px 20px; background: #064b9e; gap: 12px; }
    .registo-visual > header > div { min-width: 0; }
    .registo-visual [data-registo-card] { border: 1px solid #eef2f7; border-radius: 24px; padding: 28px; background: white; box-shadow: 0 6px 24px #17345d08; }
    .registo-visual input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=hidden]),
    .registo-visual textarea, .registo-visual select { border-radius: 12px; border-color: #d5dce7; min-height: 46px; background-color: white; font-size: 14px; }
    .registo-visual input:focus, .registo-visual textarea:focus, .registo-visual select:focus { outline-color: #2563eb; }
    .registo-visual label { color: #172b4d; }
    .registo-visual [data-registo-card] > h1, .registo-visual [data-registo-card] > h2 { color: #0b183b; }
    .registo-visual .bg-gray-50 { background-color: #f5f8fc; }
    @media(max-width: 639px) {
      .registo-visual [data-registo-card] { padding: 20px 16px; border-radius: 20px; }
      .registo-visual > header { padding: 14px 16px; flex-wrap: wrap; }
      .registo-visual > header > div:last-child { gap: 12px; max-width: 100%; }
      .registo-visual .py-10 { padding-top: 20px; padding-bottom: 24px; }
      .registo-visual .py-8 { padding-top: 20px; padding-bottom: 24px; }
    }
  `}</style>
</div>;
export default RegistoVisual;
