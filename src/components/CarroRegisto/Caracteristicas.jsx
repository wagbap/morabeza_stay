// src/components/CarroRegisto/Caracteristicas.jsx
// CORRIGIDO - Sem setState durante renderização

import React, { useState, useEffect } from 'react';
import { 
  Check, Loader, Search, Wifi, Snowflake, Tv, Coffee, 
  Utensils, Car, Map, Camera, Bluetooth, Shield, 
  Armchair, Sun, Smartphone, Wind, Volume2, Fan, 
  Thermometer, Video, Music, Battery, Key, Lock, 
  Flower2, Sparkles, Airplay, Radio 
} from 'lucide-react';
import { buscarCaracteristicas } from '../../services/carroApiService';

const getIcone = (iconeNome) => {
  const icons = {
    snowflake: <Snowflake size={18} />,
    map: <Map size={18} />,
    camera: <Camera size={18} />,
    bluetooth: <Bluetooth size={18} />,
    steering: <Car size={18} />,
    window: <Wind size={18} />,
    shield: <Shield size={18} />,
    brake: <Shield size={18} />,
    seat: <Armchair size={18} />,
    sun: <Sun size={18} />,
    smartphone: <Smartphone size={18} />,
    wifi: <Wifi size={18} />,
    tv: <Tv size={18} />,
    coffee: <Coffee size={18} />,
    utensils: <Utensils size={18} />,
    volume2: <Volume2 size={18} />,
    fan: <Fan size={18} />,
    thermomether: <Thermometer size={18} />,
    video: <Video size={18} />,
    music: <Music size={18} />,
    battery: <Battery size={18} />,
    key: <Key size={18} />,
    lock: <Lock size={18} />,
    flower: <Flower2 size={18} />,
    sparkles: <Sparkles size={18} />,
    airplay: <Airplay size={18} />,
    radio: <Radio size={18} />
  };
  return icons[iconeNome?.toLowerCase()] || <Check size={18} />;
};

const Caracteristicas = ({ items = [], onChange, readOnly = false }) => {
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');

  // Carregar características apenas uma vez
  useEffect(() => {
    const carregar = async () => {
      try {
        const result = await buscarCaracteristicas();
        if (result.success && result.data) {
          // Mapear com selecionada baseado nos items recebidos
          const lista = result.data.map(c => ({
            ...c,
            selecionada: items.includes(c.id)
          }));
          setCaracteristicas(lista);
        } else {
          // Fallback
          const fallback = [
            { id: 1, nome: 'Ar Condicionado', icone: 'snowflake', tipo: 'Conforto', selecionada: items.includes(1) },
            { id: 2, nome: 'GPS', icone: 'map', tipo: 'Tecnologia', selecionada: items.includes(2) },
            { id: 3, nome: 'Câmera de Ré', icone: 'camera', tipo: 'Segurança', selecionada: items.includes(3) },
            { id: 4, nome: 'Bluetooth', icone: 'bluetooth', tipo: 'Tecnologia', selecionada: items.includes(4) },
            { id: 5, nome: 'Direção Assistida', icone: 'steering', tipo: 'Conforto', selecionada: items.includes(5) },
            { id: 6, nome: 'Vidros Elétricos', icone: 'window', tipo: 'Conforto', selecionada: items.includes(6) },
            { id: 7, nome: 'Airbags', icone: 'shield', tipo: 'Segurança', selecionada: items.includes(7) },
            { id: 8, nome: 'ABS', icone: 'brake', tipo: 'Segurança', selecionada: items.includes(8) },
            { id: 9, nome: 'Bancos de Couro', icone: 'seat', tipo: 'Luxo', selecionada: items.includes(9) },
            { id: 10, nome: 'Teto Solar', icone: 'sun', tipo: 'Luxo', selecionada: items.includes(10) }
          ];
          setCaracteristicas(fallback);
        }
      } catch (error) {
        console.error('Erro ao carregar características:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregar();
  }, []); // Executa apenas uma vez

  // 🔥 CORREÇÃO: Não chamar onChange durante renderização
  const toggleCaracteristica = (id) => {
    if (readOnly) return;
    
    const novasCaracteristicas = caracteristicas.map(c => 
      c.id === id ? { ...c, selecionada: !c.selecionada } : c
    );
    
    setCaracteristicas(novasCaracteristicas);
    
    const selecionadasIds = novasCaracteristicas.filter(c => c.selecionada).map(c => c.id);
    onChange(selecionadasIds);
  };

  const caracteristicasFiltradas = caracteristicas.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const categorias = [...new Set(caracteristicas.map(c => c.tipo || 'Geral').filter(Boolean))];
  
  const caracteristicasPorCategoria = categoriaAtiva === 'todas' 
    ? caracteristicasFiltradas 
    : caracteristicasFiltradas.filter(c => (c.tipo || 'Geral') === categoriaAtiva);

  const totalSelecionadas = caracteristicas.filter(c => c.selecionada).length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={32} />
        <p className="mt-2 text-gray-500">Carregando características...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar características..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#006ce4]"
          />
        </div>
        <span className="text-sm text-gray-500">
          {totalSelecionadas} selecionada(s)
        </span>
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoriaAtiva === 'todas' 
                ? 'bg-[#006ce4] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoriaAtiva === cat 
                  ? 'bg-[#006ce4] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {caracteristicasPorCategoria.map(carac => (
          <button
            key={carac.id}
            type="button"
            onClick={() => toggleCaracteristica(carac.id)}
            disabled={readOnly}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              carac.selecionada
                ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={carac.selecionada ? 'text-[#006ce4]' : 'text-gray-500'}>
              {getIcone(carac.icone)}
            </div>
            <span className="text-sm flex-1 text-left">{carac.nome}</span>
            {carac.selecionada && <Check size={16} />}
          </button>
        ))}
      </div>

      {caracteristicasPorCategoria.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Nenhuma característica encontrada
        </div>
      )}
    </div>
  );
};

export default Caracteristicas;