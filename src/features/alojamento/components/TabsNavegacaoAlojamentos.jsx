import React from 'react';
import { useTranslation } from 'react-i18next';

export const TabsNavegacaoAlojamentos = ({ activeTab = 0, totalAvaliacoes = 120 }) => {
  const { t } = useTranslation();
  
  const tabs = [
    t('descricao'), 
    t('comodidades'), 
    `${t('avaliacoes')} (${totalAvaliacoes})`, 
    t('localizacao'), 
    t('regras_casa'), 
    t('anfitriao')
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
      {activeTab === 0 && (
        <div className="max-w-3xl animate-in fade-in duration-500">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {t('descricao_padrao_alojamento_long')}
          </p>
          <button className="text-[#003580] text-xs font-bold underline hover:text-blue-800 transition-colors">
            {t('ler_mais')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TabsNavegacaoAlojamentos;