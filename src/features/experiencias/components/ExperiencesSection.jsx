import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CardExperiencia from './CardExperiencia';
import CardCarro from '../../carros/components/CardCarro';
import CardPromocionalBanner from '../../../components/CardPromocionalBanner';

const ExperiencesSection = ({ carros = [], experiencias = [], loading = false }) => {
  const { t } = useTranslation();
  const empty = path => loading
    ? <div aria-busy="true" className="h-[462px] animate-pulse rounded-[14px] bg-slate-100" />
    : <Link to={path} className="flex min-h-[240px] items-center justify-center rounded-[14px] border border-slate-200 bg-white text-sm font-semibold text-blue-600">{t('ver_todos', 'Ver todos')}</Link>;
  return (
    <section className="mb-24 mt-20">
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
          {t('adicione_conforto_estadia')}
        </h2>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {carros.length ? <CardCarro carro={carros[0]} /> : empty('/carros')}
        {experiencias.length ? <CardExperiencia {...experiencias[0]} /> : empty('/experiencias')}
        <CardPromocionalBanner />
      </div>
    </section>
  );
};
export default ExperiencesSection;
