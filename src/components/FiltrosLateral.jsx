import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Building2, Home, Palmtree, Hotel, Map } from 'lucide-react';

const FiltrosLaterais = ({ orcamento, setOrcamento, tiposSelecionados, setTiposSelecionados, totalEncontrados }) => {
  const { t } = useTranslation();

  const listaTipos = [
    { id: 'Apartamento', label: t('apartamento', 'Apartamento'), icon: <Building2 size={16} /> },
    { id: 'Villa', label: t('villa', 'Villa'), icon: <Home size={16} /> },
    { id: 'Guesthouse', label: t('guesthouse', 'Guesthouse'), icon: <Palmtree size={16} /> },
    { id: 'Hotel', label: t('hotel', 'Hotel'), icon: <Hotel size={16} /> },
  ];

  const handleTipoChange = (tipoId) => {
    setTiposSelecionados(prev => 
      prev.includes(tipoId) ? prev.filter(t => t !== tipoId) : [...prev, tipoId]
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* BOTÃO MAPA */}
      <div className="relative rounded-2xl overflow-hidden h-32 border-4 border-white shadow-lg cursor-pointer group">
        <img src="https://images.unsplash.com/photo-1547127607-07082fdb52b9?q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Map" />
        <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
          <button className="bg-white text-blue-700 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
            <Map size={14} /> Ver no Mapa
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-blue-900/5">
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">{t('filtrar_por', 'Filtrar por')}</h3>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[9px] font-black">{totalEncontrados}</span>
        </div>

        {/* PREÇO */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <label className="font-black text-gray-900 uppercase text-[10px] tracking-tight">{t('orcamento', 'Orçamento')}</label>
            <span className="text-blue-600 font-black text-xs">Até {orcamento.toLocaleString('pt-PT')} CVE</span>
          </div>
          <input 
            type="range" min="1000" max="30000" step="500" 
            value={orcamento} 
            onChange={(e) => setOrcamento(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* TIPOS */}
        <div className="space-y-4">
          <label className="block font-black text-gray-900 uppercase text-[10px] tracking-tight mb-2">{t('tipo_alojamento', 'Tipo')}</label>
          <div className="space-y-3">
            {listaTipos.map(tipo => (
              <div key={tipo.id} className="flex items-center gap-3">
                <input 
                  type="checkbox" id={`f-${tipo.id}`} 
                  checked={tiposSelecionados.includes(tipo.id)}
                  onChange={() => handleTipoChange(tipo.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <label htmlFor={`f-${tipo.id}`} className="flex-1 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors">
                  {tipo.icon} {tipo.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* LIMPAR */}
        {(tiposSelecionados.length > 0 || orcamento < 30000) && (
          <button 
            onClick={() => { setOrcamento(30000); setTiposSelecionados([]); }}
            className="w-full mt-8 pt-4 border-t border-gray-50 text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <X size={14} /> {t('limpar_filtros', 'Limpar')}
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltrosLaterais;