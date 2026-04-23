import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, Car, Palmtree } from 'lucide-react';
import CardAlojamentoItem from './CardAlojamentoItem';
import CardCarro from './CardCarro';
import CardExperienciaTab from './CardExperienciaTab';

const TabsComponent = ({ alojamentos, carros, experiencias, loading }) => {
  const [activeTab, setActiveTab] = useState('alojamentos');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Garantir que os dados são arrays
  const alojamentosList = Array.isArray(alojamentos) ? alojamentos : [];
  const carrosList = Array.isArray(carros) ? carros : [];
  const experienciasList = Array.isArray(experiencias) ? experiencias : [];

  const tabs = [
    { id: 'alojamentos', label: 'Alojamentos', icon: <Home size={18} />, data: alojamentosList },
    { id: 'carros', label: 'Carros', icon: <Car size={18} />, data: carrosList },
    { id: 'experiencias', label: 'Experiências', icon: <Palmtree size={18} />, data: experienciasList }
  ];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeTab]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentData = currentTab?.data || [];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16">
      {/* Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-3 rounded-xl border transition-all ${
              canScrollLeft 
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' 
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-3 rounded-xl border transition-all ${
              canScrollRight 
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' 
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {currentData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-300 mb-2">
              {activeTab === 'alojamentos' && <Home size={48} className="mx-auto opacity-30" />}
              {activeTab === 'carros' && <Car size={48} className="mx-auto opacity-30" />}
              {activeTab === 'experiencias' && <Palmtree size={48} className="mx-auto opacity-30" />}
            </div>
            <p className="text-gray-400 text-sm font-medium">
              Nenhum {currentTab?.label?.toLowerCase()} disponível no momento.
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {currentData.map((item, index) => (
              <div key={item.id || index} className="min-w-[280px] md:min-w-[320px] lg:min-w-[350px] flex-shrink-0">
                {activeTab === 'alojamentos' && <CardAlojamentoItem {...item} />}
                {activeTab === 'carros' && <CardCarro carro={item} />}
                {activeTab === 'experiencias' && <CardExperienciaTab experiencia={item} />}
              </div>
            ))}
          </div>
        )}

        {/* Gradientes */}
        {currentData.length > 0 && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#f8f9fc] to-transparent pointer-events-none"></div>
        )}
        {currentData.length > 0 && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f8f9fc] to-transparent pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default TabsComponent;