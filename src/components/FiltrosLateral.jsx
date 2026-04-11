import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Importar o hook

const FiltrosLateral = ({ preco, setPreco, tipo, setTipo, resultados }) => {
  const { t } = useTranslation(); // 2. Inicializar a tradução

  // Usamos as chaves para os tipos para que mudem com o idioma
  const tipos = ['Apartamento', 'Villa', 'Guesthouse', 'Hotel'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 space-y-8">
      {/* CABEÇALHO */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
          {t('filtrar_por')}:
        </h3>
        <p className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full uppercase">
          {resultados} {t('alojamentos_encontrados')}
        </p>
      </div>

      {/* FILTRO DE ORÇAMENTO */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-black uppercase text-[10px] text-gray-700">
            {t('orcamento')}
          </label>
          <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">
            {t('ate')} {preco} CVE
          </span>
        </div>

        <input 
          type="range" 
          min="1000" 
          max="30000" 
          value={preco} 
          onChange={(e) => setPreco(Number(e.target.value))} 
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        
        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
          <span>1.000 CVE</span>
          <span>30.000+ CVE</span>
        </div>
      </div>

      {/* FILTRO DE TIPO DE ALOJAMENTO */}
      <div className="space-y-4 pt-2">
        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest block">
          {t('tipo_alojamento')}
        </label>
        <div className="space-y-3">
          {tipos.map((t_item) => (
            <label key={t_item} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={tipo === t_item}
                  onChange={() => setTipo(tipo === t_item ? '' : t_item)}
                  className="peer h-5 w-5 appearance-none rounded-md border-2 border-gray-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                />
                <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`ml-3 text-sm font-medium transition-colors ${tipo === t_item ? 'text-blue-600 font-bold' : 'text-gray-500 group-hover:text-gray-800'}`}>
                {t(t_item.toLowerCase())} {/* Traduz cada tipo dinamicamente */}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* BOTÃO LIMPAR */}
      <button 
        onClick={() => {setPreco(30000); setTipo('');}}
        className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors border-t border-gray-50 pt-4"
      >
        {t('limpar_filtros')}
      </button>
    </div>
  );
};

export default FiltrosLateral;