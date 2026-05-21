import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Monitor } from 'lucide-react';

const MapaInterativo = ({ isOpen, onClose, dadosAlojamentos }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  // Definição das 10 ilhas com posições geográficas aproximadas (nomes em português para referência)
  const ilhas = [
    { id: 'santo_antao', nome: t('santo_antao'), top: '15%', left: '10%' },
    { id: 'sao_vicente', nome: t('sao_vicente'), top: '22%', left: '22%' },
    { id: 'santa_luzia', nome: t('santa_luzia'), top: '25%', left: '32%' },
    { id: 'sao_nicolau', nome: t('sao_nicolau'), top: '30%', left: '45%' },
    { id: 'sal', nome: t('sal'), top: '22%', left: '78%' },
    { id: 'boa_vista', nome: t('boa_vista'), top: '42%', left: '82%' },
    { id: 'maio', nome: t('maio'), top: '68%', left: '75%' },
    { id: 'santiago', nome: t('santiago'), top: '78%', left: '60%' },
    { id: 'fogo', nome: t('fogo'), top: '82%', left: '35%' },
    { id: 'brava', nome: t('brava'), top: '85%', left: '20%' },
  ];

  const contarPorIlha = (nomeIlha) => {
    if (!dadosAlojamentos || !Array.isArray(dadosAlojamentos)) return 0;
    return dadosAlojamentos.filter(a => 
      a.localizacao?.toLowerCase().includes(nomeIlha.toLowerCase())
    ).length;
  };

  const getTotalAlojamentos = () => {
    if (!dadosAlojamentos || !Array.isArray(dadosAlojamentos)) return 0;
    return dadosAlojamentos.length;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl aspect-video bg-[#f8fafc] rounded-[40px] border border-gray-200 overflow-hidden shadow-2xl">
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-50 p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all"
        >
          <X size={24} />
        </button>

        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/ocean-texture.png')]"></div>

        <div className="relative w-full h-full p-12">
          {ilhas.map((ilha) => {
            const total = contarPorIlha(ilha.nome);
            return (
              <div 
                key={ilha.id}
                className="absolute flex flex-col items-center group transition-all"
                style={{ top: ilha.top, left: ilha.left }}
              >
                {total > 0 && (
                  <div className="mb-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center justify-center shadow-lg min-w-[24px]">
                    {total}
                  </div>
                )}
                
                <div className={`bg-white p-2 rounded-lg border-2 shadow-md transition-all duration-300 ${
                  total > 0 
                    ? 'border-blue-600 group-hover:bg-blue-600 group-hover:border-blue-700' 
                    : 'border-gray-800 group-hover:bg-gray-800'
                }`}>
                  <Monitor 
                    size={24} 
                    strokeWidth={2.5} 
                    className={total > 0 ? 'text-blue-600 group-hover:text-white' : 'text-gray-800 group-hover:text-white'}
                  />
                </div>
                
                <span className={`mt-2 text-[10px] font-black uppercase tracking-tighter transition-colors ${
                  total > 0 ? 'text-gray-800 group-hover:text-blue-600' : 'text-gray-400'
                }`}>
                  {ilha.nome}
                </span>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-12 border-l-4 border-blue-600 pl-4">
          <h2 className="text-gray-900 font-black uppercase tracking-[0.2em] text-sm">{t('arquipelago_cabo_verde')}</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            {t('mapa_interativo')} | {getTotalAlojamentos()} {t('alojamentos_disponiveis')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapaInterativo;