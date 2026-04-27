import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Car, Palmtree, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import CardAlojamentoItem from './CardAlojamentoItem';
import CardCarro from './CardCarro';
import CardExperienciaTab from './CardExperienciaTab';
import { Link } from 'react-router-dom';

const TabsComponent = ({ alojamentos, carros, experiencias, loading }) => {
  const [activeTab, setActiveTab] = useState('alojamentos');

  const tabs = [
    { id: 'alojamentos', label: 'Alojamentos', icon: <Home size={14} />, data: alojamentos || [], link: '/alojamentos' },
    { id: 'carros', label: 'Carros', icon: <Car size={14} />, data: carros || [], link: '/carros' },
    { id: 'experiencias', label: 'Experiências', icon: <Palmtree size={14} />, data: experiencias || [], link: '/experiencias' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentData = currentTab?.data || [];

  const prevButtonId = `prev-${activeTab}`;
  const nextButtonId = `next-${activeTab}`;

  if (loading) return (
    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 overflow-hidden">
      
      {/* 1. SELETOR DE TABS - Versão Ultra Pequena */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span className={activeTab === tab.id ? 'block' : 'hidden xs:block'}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. TÍTULO E VER TODOS - Alinhados */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm md:text-xl font-black text-[#1a2b6d]">
          {currentTab.label} em destaque
        </h2>
        <Link 
          to={currentTab.link} 
          className="flex items-center gap-1 text-blue-700 font-bold text-[9px] md:text-xs hover:underline"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      {/* 3. CONTAINER DO CARROSSEL COM SETAS CORRIGIDAS */}
      <div className="relative group px-2 md:px-0">
        
        {/* Setas - Agora com posicionamento fixo para não "estragar" o layout */}
        <button 
          className={`${prevButtonId} absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-40 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 border border-gray-100 disabled:opacity-0 transition-opacity`}
        >
          <ChevronLeft size={18} strokeWidth={3} />
        </button>

        <button 
          className={`${nextButtonId} absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-40 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 border border-gray-100 disabled:opacity-0 transition-opacity`}
        >
          <ChevronRight size={18} strokeWidth={3} />
        </button>

        <Swiper
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={1.2}
          navigation={{
            prevEl: `.${prevButtonId}`,
            nextEl: `.${nextButtonId}`,
          }}
          breakpoints={{
            480: { slidesPerView: 1.8, spaceBetween: 12 },
            768: { slidesPerView: 2.5, spaceBetween: 15 },
            1024: { slidesPerView: 4, spaceBetween: 20 }
          }}
          className="!overflow-visible" 
        >
          {currentData.map((item, index) => (
            <SwiperSlide key={item.id || index} className="h-auto pb-4">
              {activeTab === 'alojamentos' && <CardAlojamentoItem {...item} />}
              {activeTab === 'carros' && <CardCarro carro={item} />}
              {activeTab === 'experiencias' && <CardExperienciaTab experiencia={item} />}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TabsComponent;