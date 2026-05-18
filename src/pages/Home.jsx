import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../features/alojamento/components/AlojamentoHeroHome';
import SearchBar from '../features/alojamento/components/SearchBarAlojamento';
import CategoryBar from '../components/CategoryBar';
import TabsComponent from '../components/TabsComponent';
import CardGridItem from '../components/CardGridItem';
import CardPromocionalBanner from '../components/CardPromocionalBanner';

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
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
            {t('menu_alojamentos') || 'Alojamentos'}
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
        </div>

        <TabsComponent 
          alojamentos={alojamentos}
          carros={carros}
          experiencias={experiencias}
        />

        <section className="mb-24 mt-20">
          <div className="flex flex-col mb-8 text-left">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
              Adicione ainda mais conforto à sua estadia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {carros.length > 0 ? <CardGridItem item={carros[0]} /> : <div className="h-[450px] bg-gray-100 animate-pulse rounded-[2.5rem]"></div>}
            {experiencias.length > 0 ? <CardGridItem item={experiencias[0]} /> : <div className="h-[450px] bg-gray-100 animate-pulse rounded-[2.5rem]"></div>}
            <CardPromocionalBanner />
          </div>
        </section>

        {loading && <div className="py-10 text-center opacity-30 font-black uppercase text-xs">Carregando Morabeza...</div>}
      </main>
    </>
  );
};

export default Home;