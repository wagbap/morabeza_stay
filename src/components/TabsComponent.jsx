import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CardAlojamentoItem from '../features/alojamento/components/CardAlojamentoItem';

export default function TabsComponent({ alojamentos = [], loading }) {
  const { t } = useTranslation();
  return <section aria-labelledby="home-alojamentos">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 id="home-alojamentos" className="text-2xl font-bold tracking-tight text-slate-900">{t('home_alojamentos_destaque')}</h2>
      <Link to="/alojamentos" className="flex items-center gap-2 text-sm font-semibold text-blue-600">{t('ver_todos')}<ArrowRight size={19} /></Link>
    </div>
    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {loading && !alojamentos.length ? Array.from({length: 3}, (_, i) => <div key={i} aria-busy="true" className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />) : alojamentos.slice(0, 3).map(item => <CardAlojamentoItem key={item.id} {...item} />)}
    </div>
  </section>;
}
