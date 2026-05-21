import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Map, Car, Gauge, Settings, Shield, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FiltrosLateraisCarros = ({ 
  orcamento, 
  setOrcamento, 
  tiposSelecionados, 
  setTiposSelecionados, 
  totalEncontrados 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const listaCategorias = [
    { id: 'Económico', label: t('economico'), icon: <Car size={16} /> },
    { id: 'SUV', label: t('suv'), icon: <Shield size={16} /> },
    { id: 'Familiar', label: t('familiar'), icon: <Users size={16} /> },
    { id: 'Eletrico', label: t('eletrico_categoria'), icon: <Zap size={16} /> },
    { id: 'Automatico', label: t('automatico'), icon: <Gauge size={16} /> },
    { id: 'Manual', label: t('manual'), icon: <Settings size={16} /> },
  ];

  const handleTipoChange = (tipoId) => {
    setTiposSelecionados(prev => 
      prev.includes(tipoId) ? prev.filter(t => t !== tipoId) : [...prev, tipoId]
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 🗺️ SECÇÃO DO MAPA - Adaptada para Carros */}
      <div 
        onClick={() => navigate('/mapa-carros')} 
        className="relative rounded-2xl overflow-hidden h-32 border-4 border-white shadow-lg cursor-pointer group"
      >
        <img 
          src="https://images.unsplash.com/photo-1449960232330-79ba99d70d41?q=80&w=400" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          alt={t('mapa_levantamento_alt')} 
        />
        <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center transition-colors group-hover:bg-blue-900/40">
          <div className="bg-white text-blue-700 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
            <Map size={14} /> {t('pontos_levantamento')}
          </div>
        </div>
      </div>

      {/* 🔍 BLOCO DE FILTROS */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-blue-900/5">
        
        {/* Título e Contador */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">
            {t('refinar_frota')}
          </h3>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[9px] font-black">
            {totalEncontrados} {t('veiculos')}
          </span>
        </div>

        {/* Filtro de Preço por Dia 💸 */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <label className="font-black text-gray-900 uppercase text-[10px] tracking-tight">
              {t('preco_diaria')}
            </label>
            <span className="text-blue-600 font-black text-xs">
              {t('ate')} {orcamento.toLocaleString('pt-PT')} CVE
            </span>
          </div>
          <input 
            type="range" 
            min="15000" 
            max="30000" 
            step="500" 
            value={orcamento} 
            onChange={(e) => setOrcamento(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
            <span>1.000 CVE</span>
            <span>30.000+ CVE</span>
          </div>
        </div>

        {/* Filtro de Categorias de Carros 🚗 */}
        <div className="space-y-4">
          <label className="block font-black text-gray-900 uppercase text-[10px] tracking-tight mb-2">
            {t('tipo_veiculo')}
          </label>
          <div className="space-y-3">
            {listaCategorias.map(tipo => (
              <div key={tipo.id} className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id={`car-${tipo.id}`} 
                  checked={tiposSelecionados.includes(tipo.id)}
                  onChange={() => handleTipoChange(tipo.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                />
                <label 
                  htmlFor={`car-${tipo.id}`} 
                  className="flex-1 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <span className="text-gray-400">{tipo.icon}</span>
                  {tipo.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botão para Limpar 🧹 */}
        {(tiposSelecionados.length > 0 || orcamento < 30000) && (
          <button 
            onClick={() => { setOrcamento(30000); setTiposSelecionados([]); }}
            className="w-full mt-8 pt-4 border-t border-gray-50 text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <X size={14} /> {t('remover_filtros')}
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltrosLateraisCarros;