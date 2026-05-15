import React from 'react';

export const TabsNavegacaoAlojamentos = ({ activeTab = 0 }) => {
  const tabs = [
    'Descrição', 
    'Comodidades', 
    'Avaliações (120)', 
    'Localização', 
    'Regras da casa', 
    'Anfitrião'
  ];

  return (
    <div className="w-full">
      {/* LINHA DE ABAS */}
      <div className="border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-10">
          {tabs.map((tab, idx) => (
            <button 
              key={tab} 
              className={`pb-4 text-xs font-bold whitespace-nowrap transition-all relative ${
                idx === activeTab 
                  ? 'text-[#003580]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {/* Linha azul de indicação ativa */}
              {idx === activeTab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#003580]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO DA ABA (FORA DO MAP) */}
      {/* Aqui você renderiza o conteúdo baseado na aba ativa. Exemplo com a aba 0 (Descrição) */}
      {activeTab === 0 && (
        <div className="max-w-3xl animate-in fade-in duration-500">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Apartamento moderno e acolhedor com vista deslumbrante para o mar, localizado na melhor zona da Praia. 
            Perfeito para famílias, casais ou viajantes a negócios. Desfrute de uma estadia confortável com 
            todas as comodidades necessárias para se sentir em casa.
          </p>
          <button className="text-[#003580] text-xs font-bold underline hover:text-blue-800 transition-colors">
            Ler mais
          </button>
        </div>
      )}
    </div>
  );
};

export default TabsNavegacaoAlojamentos;