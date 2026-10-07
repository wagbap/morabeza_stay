// PaginaMapa.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, MapPin, X } from 'lucide-react';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const COORDENADAS_ILHAS = {
  'Santiago': { lat: 15.0667, lng: -23.5833 },
  'São Vicente': { lat: 16.8333, lng: -24.9833 },
  'Sal': { lat: 16.7167, lng: -22.9167 },
  'Ilha do Sal': { lat: 16.7167, lng: -22.9167 },
  'Boa Vista': { lat: 16.1000, lng: -22.8000 },
  'Fogo': { lat: 14.9167, lng: -24.3333 },
  'Ilha do Fogo': { lat: 14.9167, lng: -24.3333 },
  'Santo Antão': { lat: 17.0667, lng: -25.1667 },
  'Maio': { lat: 15.1333, lng: -23.2167 },
  'São Nicolau': { lat: 16.6167, lng: -24.2667 },
  'Brava': { lat: 14.8667, lng: -24.7000 }
};

const PaginaMapa = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [alojamentos, setAlojamentos] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focoId, setFocoId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const foco = params.get('foco');
    if (foco) setFocoId(parseInt(foco, 10));
  }, [location.search]);

  const [viewState, setViewState] = useState({
    latitude: 16.8884,
    longitude: -24.9896,
    zoom: 7,
    pitch: 0,
    bearing: 0
  });

  const obterCoordenadasValidas = (hotel) => {
    const lat = parseFloat(hotel?.latitude);
    const lng = parseFloat(hotel?.longitude);
    
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng, zoom: 15 };
    }
    
    const ilhaNome = hotel?.ilha || hotel?.cidade;
    if (ilhaNome && COORDENADAS_ILHAS[ilhaNome]) {
      return { lat: COORDENADAS_ILHAS[ilhaNome].lat, lng: COORDENADAS_ILHAS[ilhaNome].lng, zoom: 12 };
    }
    
    return { lat: 14.9315, lng: -23.5125, zoom: 10 };
  };

  const processarCoordenadasUnicas = (lista) => {
    const contagem = {};
    return lista.map(hotel => {
      const ponto = obterCoordenadasValidas(hotel);
      const chave = `${ponto.lat.toFixed(4)}-${ponto.lng.toFixed(4)}`;
      
      if (contagem[chave] === undefined) {
        contagem[chave] = 0;
      }
      
      const index = contagem[chave];
      contagem[chave]++;
      
      let latFinal = ponto.lat;
      let lngFinal = ponto.lng;
      
      if (index > 0) {
        const raio = 0.0004 * Math.ceil(index / 6);
        const angulo = (index % 6) * (Math.PI / 3);
        latFinal += raio * Math.cos(angulo);
        lngFinal += raio * Math.sin(angulo);
      }

      return { ...hotel, latFinal, lngFinal, zoomFinal: ponto.zoom };
    });
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        let dadosRaw = Array.isArray(res.data) ? res.data : (res.data?.data ? [res.data.data] : []);
        
        const dadosProcessados = processarCoordenadasUnicas(dadosRaw);
        setAlojamentos(dadosProcessados);
        
        if (focoId) {
          const focoHotel = dadosProcessados.find(h => parseInt(h.id, 10) === focoId);
          if (focoHotel) {
            setViewState(prev => ({
              ...prev,
              latitude: focoHotel.latFinal,
              longitude: focoHotel.lngFinal,
              zoom: focoHotel.zoomFinal
            }));
            setSelectedHotel(focoHotel);
          }
        } else if (dadosProcessados.length > 0) {
          setViewState(prev => ({
            ...prev,
            latitude: dadosProcessados[0].latFinal,
            longitude: dadosProcessados[0].lngFinal,
            zoom: 12
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar mapa de alojamentos:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [focoId]);

  const handleSelecionarHotel = (hotel) => {
    setSelectedHotel(hotel);
    setViewState(prev => ({
      ...prev,
      latitude: hotel.latFinal,
      longitude: hotel.lngFinal,
      zoom: 16
    }));
  };

  const marcadores = useMemo(() => 
    alojamentos.map((hotel) => {
      const isSelected = selectedHotel?.id === hotel.id;
      const preco = Number(hotel.preco_noite || 0);

      return (
        <Marker 
          key={hotel.id} 
          latitude={hotel.latFinal} 
          longitude={hotel.lngFinal} 
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            handleSelecionarHotel(hotel);
          }}
        >
          <div 
            className={`
              px-3 py-1.5 rounded-full border-2 border-white shadow-xl font-black text-[11px] transition-all cursor-pointer whitespace-nowrap
              ${isSelected ? 'bg-black text-white scale-110 z-50 relative ring-4 ring-blue-400/50' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 z-10'}
            `}
          >
            {preco.toLocaleString()} CVE
          </div>
        </Marker>
      );
    }), [alojamentos, selectedHotel]);

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-gray-100 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} /> {t('voltar')}
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-[10px] uppercase text-blue-600 tracking-wider">{t('carregando_coordenadas')}</p>
        </div>
      )}

      {/* Componente do Mapa em Tela Cheia */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedHotel(null)}
      >
        <NavigationControl position="bottom-right" />
        {marcadores}
      </Map>

      {/* Card Flutuante Inferior (Centralizada) */}
      {selectedHotel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedHotel(null);
            }}
            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
          >
            <X size={14} />
          </button>

          <div 
            className="p-3 cursor-pointer flex gap-3 items-center text-left"
            onClick={() => navigate(`/alojamento/${selectedHotel.slug || selectedHotel.id}`)}
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0">
              <img 
                src={selectedHotel.imagem_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} 
                alt={selectedHotel.titulo}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
              />
              <div className="absolute bottom-1 left-1 bg-white/95 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 shadow">
                <Star size={8} className="fill-yellow-400 text-yellow-400" /> {Number(selectedHotel.estrelas || 4.5).toFixed(1)}
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h4 className="font-black text-xs uppercase text-gray-900 truncate">
                {selectedHotel.titulo}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5 flex items-center gap-1">
                <MapPin size={10} className="text-orange-500 shrink-0" /> {selectedHotel.cidade || selectedHotel.localizacao}
              </p>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <span className="text-blue-600 font-black text-xs">
                  {Number(selectedHotel.preco_noite).toLocaleString()} CVE <span className="text-[8px] font-normal text-slate-400">{t('por_noite_curto')}</span>
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-blue-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-sm">
                  {t('ver')} <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaMapa;