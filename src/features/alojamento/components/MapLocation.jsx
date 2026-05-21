import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin, Navigation, Maximize2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapLocation = ({ localizacao, pontosProximos, endereco, latitude, longitude, alojamentoId }) => {
  const navigate = useNavigate();
  const mapContainer = React.useRef(null);
  const map = React.useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Verificar se temos coordenadas válidas
  const temCoordenadas = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
  
  // Token do Mapbox
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  
  const textoLocalizacao = endereco || localizacao || 'Localização não informada';
  const cidadeNome = textoLocalizacao.split(',').shift();
  
  // Inicializar o mapa quando tivermos coordenadas
  useEffect(() => {
    if (!temCoordenadas || !mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token não configurado');
      return;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
      interactive: false, // Desativa interação para não conflitar com o clique
      attributionControl: false
    });
    
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Adicionar marcador
      new mapboxgl.Marker({
        color: '#1e3a8a',
        scale: 1.2
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
      
      // Adicionar controle de zoom (opcional, mas pode remover)
      // map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    });
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [temCoordenadas, latitude, longitude, MAPBOX_TOKEN]);
  
  // Função para abrir a página de mapa interna
  const abrirPaginaMapa = () => {
    if (alojamentoId) {
      navigate(`/mapa?foco=${alojamentoId}`);
    } else {
      navigate('/mapa');
    }
  };
  
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
        </div>
      </div>
      
      {/* MAPA REAL COM MAPBOX */}
      {temCoordenadas && MAPBOX_TOKEN ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          {/* Container do Mapa */}
          <div 
            ref={mapContainer} 
            className="relative w-full h-[200px] bg-slate-100"
            style={{ cursor: 'pointer' }}
            onClick={abrirPaginaMapa}
          />
          
          {/* Loading overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Overlay com botão central - APENAS "Ver mapa" */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <button 
              onClick={abrirPaginaMapa}
              className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 z-10 cursor-pointer"
            >
              <MapPin size={14} className="fill-white" />
              Ver mapa completo
            </button>
          </div>
          
          {/* Badge de endereço */}
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md pointer-events-none">
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-red-500" />
              <span className="text-[9px] font-bold text-slate-700">{cidadeNome}</span>
            </div>
          </div>
          
          {/* Botão de zoom (abre mapa completo) */}
          <button 
            onClick={abrirPaginaMapa}
            className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-lg p-1.5 shadow-md transition-all pointer-events-auto"
            title="Expandir mapa"
          >
            <Maximize2 size={14} className="text-slate-600" />
          </button>
        </div>
      ) : (
        /* FALLBACK - Quando não há coordenadas ou token */
        <div 
          onClick={abrirPaginaMapa}
          className="relative w-full h-[140px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-100 cursor-pointer group"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <MapPin size={32} className="text-blue-600 mb-2 opacity-50" />
            <p className="text-[10px] text-slate-500 text-center px-4">
              {temCoordenadas ? 'Configure a chave do Mapbox' : 'Coordenadas não disponíveis'}
            </p>
            <p className="text-[8px] text-slate-400 mt-1">{textoLocalizacao}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-transform group-hover:scale-110">
              <MapPin size={20} className="text-blue-900" />
            </div>
          </div>
        </div>
      )}
      
      {/* Botão "Ver mapa" abaixo */}
      <div className="mt-3">
        <button 
          onClick={abrirPaginaMapa}
          className="text-blue-600 text-[10px] font-bold hover:underline transition-colors flex items-center justify-center gap-1 w-full py-1"
        >
          <Navigation size={12} />
          Ver mapa interativo
          <ExternalLink size={10} />
        </button>
      </div>
      
      {/* Pontos Próximos */}
      {pontosProximos && pontosProximos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-600 mb-2">📍 Próximo de:</p>
          <ul className="space-y-1">
            {pontosProximos.slice(0, 3).map((ponto, i) => (
              <li key={i} className="text-[9px] text-slate-500 flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Informação de coordenadas (debug - pode remover em produção) */}
      {temCoordenadas && import.meta.env.DEV && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <p className="text-[8px] text-slate-400 text-center">
            📍 {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapLocation;