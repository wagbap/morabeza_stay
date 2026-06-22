// PaginaMapa.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, MapPin } from 'lucide-react';
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
    latitude: 16.8884, // Centro Mindelo default
    longitude: -24.9896,
    zoom: 7,
    pitch: 0,
    bearing: 0
  });

  // Função auxiliar para extrair coordenadas base
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

  // ALGORITMO DE ESPALHAMENTO (Jitter) para alojamentos sobrepostos
  const processarCoordenadasUnicas = (lista) => {
    const contagem = {};
    return lista.map(hotel => {
      const ponto = obterCoordenadasValidas(hotel);
      // Chave única para aquela coordenada com 4 casas decimais (~10 metros de precisão)
      const chave = `${ponto.lat.toFixed(4)}-${ponto.lng.toFixed(4)}`;
      
      if (contagem[chave] === undefined) {
        contagem[chave] = 0;
      }
      
      const index = contagem[chave];
      contagem[chave]++;
      
      let latFinal = ponto.lat;
      let lngFinal = ponto.lng;
      
      // Se houver mais do que 1 alojamento no mesmo sítio, espalhamos em círculo
      if (index > 0) {
        const raio = 0.0004 * Math.ceil(index / 6); // Afasta cerca de ~40 metros
        const angulo = (index % 6) * (Math.PI / 3); // Distribui em 6 direções
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
        
        // Aplica o espalhamento para que os teus testes não fiquem colados uns aos outros
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
    setViewState({
      latitude: hotel.latFinal,
      longitude: hotel.lngFinal,
      zoom: 16,
      pitch: 0,
      bearing: 0,
      transitionDuration: 800 // Esta linha faz a animação de voo suave no mapa!
    });
  };

  const alojamentosPorIlha = useMemo(() => {
    return alojamentos.reduce((acc, hotel) => {
      const ilha = hotel.ilha || hotel.cidade || hotel.localizacao || t('outras');
      if (!acc[ilha]) acc[ilha] = [];
      acc[ilha].push(hotel);
      return acc;
    }, {});
  }, [alojamentos, t]);

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
              px-3 py-1.5 rounded-full border-2 border-white shadow-lg font-black text-[11px] transition-all cursor-pointer whitespace-nowrap
              ${isSelected ? 'bg-black text-white scale-110 z-50 relative' : 'bg-blue-600 text-white hover:bg-blue-700 z-10'}
            `}
          >
            {preco.toLocaleString()} CVE
          </div>
        </Marker>
      );
    }), [alojamentos, selectedHotel]);

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-gray-100 transition-all"
        >
          <ArrowLeft size={18} /> {t('voltar')}
        </button>
      </div>

      <div className="absolute top-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-48px)]">
        <div className="p-4 bg-blue-900 text-white text-left shrink-0">
          <h3 className="font-black text-sm uppercase tracking-wider">{t('alojamentos')}</h3>
          <p className="text-[10px] text-blue-200 mt-1">{alojamentos.length} {t('propriedades_listadas')}</p>
        </div>
        
        <div className="overflow-y-auto text-left flex-1 bg-white relative">
          {Object.keys(alojamentosPorIlha).length === 0 && !loading && (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              Nenhum alojamento encontrado.
            </div>
          )}

          {Object.entries(alojamentosPorIlha).map(([ilha, lista]) => (
            <div key={ilha}>
              <div className="px-3 pt-3 pb-1.5 bg-slate-50/95 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-blue-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{ilha}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-md">
                    {lista.length}
                  </span>
                </div>
              </div>
              
              {lista.map((hotel) => (
                <div 
                  key={hotel.id}
                  onClick={() => handleSelecionarHotel(hotel)}
                  className={`p-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative ${
                    selectedHotel?.id === hotel.id ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {selectedHotel?.id === hotel.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}

                  <div className="flex gap-3">
                    <img 
                      src={hotel.imagem_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                      alt={hotel.titulo}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'}
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 pr-2">{hotel.titulo}</h4>
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={9} className="text-orange-500" /> {hotel.cidade || hotel.localizacao}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50/50">
                        <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded text-orange-600">
                          <Star size={8} className="fill-current" />
                          <span className="text-[9px] font-bold">{Number(hotel.estrelas || 4.5).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-600">
                          {Number(hotel.preco_noite).toLocaleString()} CVE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-[10px] uppercase text-blue-600 tracking-wider">{t('carregando_coordenadas')}</p>
        </div>
      )}

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        {marcadores}

        {selectedHotel && (
          <Popup
            latitude={selectedHotel.latFinal}
            longitude={selectedHotel.lngFinal}
            onClose={() => setSelectedHotel(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="top"
            offset={15}
            maxWidth="280px"
          >
            <div 
              className="p-1 cursor-pointer text-left"
              onClick={() => navigate(`/alojamento/${selectedHotel.slug || selectedHotel.id}`)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-2.5 shadow-sm">
                <img 
                  src={selectedHotel.imagem_url} 
                  alt={selectedHotel.titulo}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                />
                <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-md">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {Number(selectedHotel.estrelas || 4.5).toFixed(1)}
                </div>
              </div>
              
              <h4 className="font-black text-xs uppercase text-gray-900 line-clamp-1 pr-4">
                {selectedHotel.titulo}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 mb-2 flex items-center gap-1">
                <MapPin size={10} /> {selectedHotel.cidade || selectedHotel.localizacao}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                <span className="text-blue-600 font-black text-xs">
                  {Number(selectedHotel.preco_noite).toLocaleString()} CVE <span className="text-[8px] font-normal text-slate-400">{t('por_noite_curto')}</span>
                </span>
                <span className="text-[9px] font-black uppercase text-white bg-blue-600 px-2 py-1 rounded flex items-center gap-0.5 hover:bg-blue-700 transition-colors">
                  {t('ver')} <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default PaginaMapa;