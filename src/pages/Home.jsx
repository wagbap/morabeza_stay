import useDestaques from '../hooks/useDestaques';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Hero from '../features/alojamento/components/AlojamentoHeroHome';
import PesquisaServicos from '../components/PesquisaServicos';
import CategoryBar from '../components/CategoryBar';
import TabsComponent from '../components/TabsComponent';
import ExperiencesSection from '../features/experiencias/components/ExperiencesSection';

const Home = () => {
  const { alojamentos, carros, experiencias, loading, error, retry } = useDestaques();
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('home_seo_titulo')}</title>
        <meta name="description" content={t('home_seo_descricao')} />
        <link rel="canonical" href="https://morabezastay.cv/" />
        <meta property="og:title" content={t('home_seo_titulo')} />
        <meta property="og:description" content={t('home_seo_descricao')} />
        <meta property="og:url" content="https://morabezastay.cv/" />
        <meta property="og:image:alt" content="MorabezaStay" />
      </Helmet>
      <Hero />
      <div className="relative -mt-12 z-40 px-4">
        <PesquisaServicos />
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <CategoryBar />
      </div>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 text-left">
        {error && <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p>{t('home_destaques_erro')}</p><button type="button" onClick={retry} className="mt-2 min-h-11 font-semibold underline">{t('sidebar_tentar')}</button></div>}
        <TabsComponent 
          loading={loading}
          alojamentos={alojamentos}
          carros={carros}
          experiencias={experiencias}
        />

        <ExperiencesSection carros={carros} experiencias={experiencias} loading={loading} />

        {loading && <div className="py-10 text-center opacity-30 font-black uppercase text-xs">{t('carregando_morabeza')}</div>}
      </main>
    </>
  );
};

export default Home;
