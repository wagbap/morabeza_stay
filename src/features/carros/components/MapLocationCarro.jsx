import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin, Maximize2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapaInterativoCarros from './MapaInterativoCarros';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapLocationCarro = ({ localizacao, ilha, latitude, longitude, carroId }) => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMapaInterativoOpen, setIsMapaInterativoOpen] = useState(false);
  
  const getCoordenadasPorIlha = (nomeIlha) => {
    const coordenadas = {
      'Santo Antão': { lat: 17.0667, lng: -25.1667 },
      'São Vicente': { lat: 16.8333, lng: -24.9833 },
      'Santa Luzia': { lat: 16.75, lng: -24.75 },
      'São Nicolau': { lat: 16.6167, lng: -24.2667 },
      'Sal': { lat: 16.7167, lng: -22.9167 },
      'Boa Vista': { lat: 16.1, lng: -22.8 },
      'Maio': { lat: 15.1333, lng: -23.2167 },
      'Santiago': { lat: 15.0667, lng: -23.5833 },
      'Fogo': { lat: 14.9167, lng: -24.3333 },
      'Brava': { lat: 14.8667, lng: -24.7 }
    };
    return coordenadas[nomeIlha] || { lat: 15.0667, lng: -23.5833 };
  };
  
  // Tratamento rigoroso de tipos para evitar que strings vazias quebrem o Mapbox
  const validLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
  const validLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;
  const temCoordenadasExatas = validLat !== null && validLng !== null;
  
  const coordenadas = temCoordenadasExatas 
    ? { lat: validLat, lng: validLng }
    : getCoordenadasPorIlha(ilha);
  
  const textoLocalizacao = `${ilha || 'Cabo Verde'}, ${localizacao || 'Localização não informada'}`;
  const cidadeNome = localizacao || ilha || 'Cabo Verde';
  
  const abrirPaginaMapa = (e) => {
    e.stopPropagation(); // Evita dupla execução caso cliques propaguem
    if (carroId) {
      navigate(`/mapa-carros?foco=${carroId}`);
    } else {
      navigate('/mapa-carros');
    }
  };
  
  const abrirMapaInterativo = (e) => {
    e.stopPropagation();
    setIsMapaInterativoOpen(true);
  };
  
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token não configurado');
      return;
    }
    
    // Destruir mapa existente antes de criar um novo (evita vazamento de memória e bugs de render)
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordenadas.lng, coordenadas.lat],
      zoom: temCoordenadasExatas ? 13 : 10,
      interactive: false,
      attributionControl: false
    });
    
    map.current.on('load', () => {
      setMapLoaded(true);
      
      new mapboxgl.Marker({
        color: '#1e3a8a',
        scale: 1.2
      })
        .setLngLat([coordenadas.lng, coordenadas.lat])
        .addTo(map.current);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordenadas.lat, coordenadas.lng, temCoordenadasExatas]);
  
  const getPontosProximos = () => {
    const localLower = (localizacao || '').toLowerCase();
    const ilhaLower = (ilha || '').toLowerCase();
    
    const pontosMap = {
      'praia': ['Aeroporto Nelson Mandela', 'Porto da Praia', 'Platô Centro Histórico'],
      'santa maria': ['Praia de Santa Maria', 'Ponta Sinó', 'Zona Hoteleira de Santa Maria'],
      'mindelo': ['Porto Grande', 'Praia da Laginha', 'Rua de Lisboa'],
      'palmeira': ['Porto da Palmeira', 'Pedra de Lume', 'Espargos Centro'],
      'tarrafal': ['Baía de Tarrafal', 'Mercado Municipal', 'Monte Graciosa'],
      'sal rei': ['Porto de Sal Rei', 'Praia de Chaves', 'Praia do Estoril'],
    };
    
    for (const [key, pontos] of Object.entries(pontosMap)) {
      if (localLower.includes(key)) return pontos;
    }
    
    const pontosIlha = {
      'sal': ['Aeroporto Amílcar Cabral', 'Santa Maria', 'Espargos'],
      'santiago': ['Cidade da Praia', 'Assomada', 'Tarrafal'],
      'são vicente': ['Mindelo', 'Monte Verde', 'Baía das Gatas'],
      'santo antão': ['Porto Novo', 'Ribeira Grande', 'Paul'],
      'fogo': ['São Filipe', 'Chã das Caldeiras', 'Mosteiros'],
      'boa vista': ['Sal Rei', 'Rabil', 'Povoação Velha'],
    };
    
    if (ilhaLower && pontosIlha[ilhaLower]) return pontosIlha[ilhaLower];
    
    return ['Aeroporto da Ilha', 'Centro Comercial / Cidade', 'Estação Central de Recolha'];
  };
  
  const pontosProximos = getPontosProximos();
  
  return (
    <>
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm text-left w-full">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização de Levantamento</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{textoLocalizacao}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={abrirMapaInterativo}
              className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
            >
              Mapa Ilhas <ExternalLink size={10} />
            </button>
            <button 
              onClick={abrirPaginaMapa}
              className="flex items-center gap-1 text-blue-900 text-[10px] font-bold hover:underline transition-colors"
            >
              Ver Mapa <ExternalLink size={10} />
            </button>
          </div>
        </div>
        
        {MAPBOX_TOKEN ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm h-[160px]">
            <div 
              ref={mapContainer} 
              className="w-full h-full bg-slate-100 cursor-pointer"
              onClick={abrirPaginaMapa}
            />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button 
                onClick={abrirPaginaMapa}
                className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 z-10 cursor-pointer"
              >
                <MapPin size={14} className="fill-white" />
                Ver no mapa grande
              </button>
            </div>
            
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md pointer-events-none">
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-red-500" />
                <span className="text-[9px] font-bold text-slate-700">{cidadeNome}</span>
              </div>
            </div>
            
            <button 
              onClick={abrirPaginaMapa}
              className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-lg p-1.5 shadow-md transition-all pointer-events-auto"
              title="Expandir mapa"
            >
              <Maximize2 size={14} className="text-slate-600" />
            </button>
          </div>
        ) : (
          <div 
            onClick={abrirPaginaMapa}
            className="relative w-full h-[160px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer group"
          >
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400&h=200&fit=crop" 
              alt="Mapa de contingência" 
              className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-all duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <MapPin size={24} className="text-blue-900 fill-blue-900" />
              </div>
            </div>
          </div>
        )}
        
        {pontosProximos.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-600 mb-2">📍 Locais úteis para entrega:</p>
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
      </div>

      <MapaInterativoCarros
        isOpen={isMapaInterativoOpen}
        onClose={() => setIsMapaInterativoOpen(false)}
        dadosAlojamentos={[]}
      />
    </>
  );
};

export default MapLocationCarro;