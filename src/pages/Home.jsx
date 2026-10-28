import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../features/alojamento/components/AlojamentoHeroHome';
import SearchBar from '../features/alojamento/components/SearchBarAlojamento';
import CategoryBar from '../components/CategoryBar';
import TabsComponent from '../components/TabsComponent';
import ExperiencesSection from '../features/experiencias/components/ExperiencesSection';

const Home = ({ alojamentos, carros, experiencias, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <Hero />
      <div className="relative -mt-12 z-40 px-4">
        <SearchBar />
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <CategoryBar />
      </div>

      <main className="max-w-7xl mx-auto py-20 px-6 text-left">
        <div className="flex flex-col mb-12">
        
   
        </div>

        <TabsComponent 
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