// MapaExperiencias.jsx - UI IDÊNTICO ao PaginaMapa (Alojamentos)
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ChevronRight, Clock } from 'lucide-react';
import axios from 'axios';

// Importar o CSS do Mapbox
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapaExperiencias = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [experiencias, setExperiencias] = useState([]);
  const [selectedExperiencia, setSelectedExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focoId, setFocoId] = useState(null);

  // Coordenadas por ilha (nomes em inglês para compatibilidade)
  const coordenadasPorIlha = {
    'Santo Antão': { lat: 17.0667, lng: -25.1667 },
    'São Vicente': { lat: 16.8333, lng: -24.9833 },
    'Santa Luzia': { lat: 16.75, lng: -24.75 },
    'São Nicolau': { lat: 16.6167, lng: -24.2667 },
    'Sal': { lat: 16.7167, lng: -22.9167 },
    'Ilha do Sal': { lat: 16.7167, lng: -22.9167 },
    'Boa Vista': { lat: 16.1, lng: -22.8 },
    'Maio': { lat: 15.1333, lng: -23.2167 },
    'Santiago': { lat: 15.0667, lng: -23.5833 },
    'Fogo': { lat: 14.9167, lng: -24.3333 },
    'Ilha do Fogo': { lat: 14.9167, lng: -24.3333 },
    'Brava': { lat: 14.8667, lng: -24.7 }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const foco = params.get('foco');
    if (foco) {
      setFocoId(parseInt(foco));
    }
  }, [location.search]);

  const [viewState, setViewState] = useState({
    latitude: 15.0,
    longitude: -23.5,
    zoom: 7,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await axios.get('https://welovepalop.com/api/get_experiencias.php');
        const dados = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setExperiencias(dados);
        
        if (focoId) {
          const focoExp = dados.find(e => e.id === focoId);
          if (focoExp && focoExp.ilha) {
            const coords = coordenadasPorIlha[focoExp.ilha];
            if (coords) {
              setViewState(prev => ({
                ...prev,
                latitude: coords.lat,
                longitude: coords.lng,
                zoom: 12
              }));
              setSelectedExperiencia(focoExp);
            }
          }
        } else {
          const foco = dados.find(e => e.ilha && coordenadasPorIlha[e.ilha]);
          if (foco) {
            const coords = coordenadasPorIlha[foco.ilha];
            setViewState(prev => ({
              ...prev,
              latitude: coords.lat,
              longitude: coords.lng,
              zoom: 8
            }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar mapa:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [focoId]);

  const centralizarNaExperiencia = (exp) => {
    if (exp.ilha && coordenadasPorIlha[exp.ilha]) {
      const coords = coordenadasPorIlha[exp.ilha];
      setViewState(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        zoom: 12
      }));
      setSelectedExperiencia(exp);
    }
  };

  const experienciasPorIlha = experiencias.reduce((acc, exp) => {
    const ilha = exp.ilha || t('outras');
    if (!acc[ilha]) acc[ilha] = [];
    acc[ilha].push(exp);
    return acc;
  }, {});

  const marcadores = useMemo(() => 
    experiencias.map((exp) => {
      const coords = coordenadasPorIlha[exp.ilha];
      if (!coords) return null;

      const isSelected = selectedExperiencia?.id === exp.id;
      const preco = Number(exp.preco || 0);

      return (
        <Marker 
          key={exp.id} 
          latitude={coords.lat} 
          longitude={coords.lng} 
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedExperiencia(exp);
          }}
        >
          <div 
            className={`
              px-3 py-1.5 rounded-full border-2 border-white shadow-lg font-black text-[11px] transition-all cursor-pointer whitespace-nowrap
              ${isSelected ? 'bg-black text-white scale-110' : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            {preco.toLocaleString()} {t('cve')}
          </div>
        </Marker>
      );
    }), [experiencias, selectedExperiencia]);

  const handleSelecionarExperiencia = (exp) => {
    centralizarNaExperiencia(exp);
  };

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all border border-gray-100"
        >
          <ArrowLeft size={18} /> {t('voltar')}
        </button>
      </div>

      <div className="absolute top-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-blue-900 text-white">
          <h3 className="font-black text-sm uppercase tracking-wider">{t('experiencias_disponiveis')}</h3>
          <p className="text-[10px] text-blue-200 mt-1">{experiencias.length} {t('experiencias_encontradas')}</p>
        </div>
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
          {Object.entries(experienciasPorIlha).map(([ilha, lista]) => (
            <div key={ilha}>
              <div className="px-3 pt-3 pb-1 bg-slate-50">
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-blue-600" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{ilha}</span>
                  <span className="text-[8px] text-slate-400">({lista.length})</span>
                </div>
              </div>
              {lista.map((exp) => (
                <div 
                  key={exp.id}
                  onClick={() => handleSelecionarExperiencia(exp)}
                  className={`p-3 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedExperiencia?.id === exp.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <img 
                      src={exp.imagem_principal || exp.imagens?.[0]?.caminho_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100'}
                      className="w-16 h-16 rounded-xl object-cover"
                      alt={exp.titulo}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100'}
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{exp.titulo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          <span className="text-[9px] font-bold">{exp.rating_formatado || '5.0'}</span>
                        </div>
                        <span className="text-[8px] text-slate-400">•</span>
                        <div className="flex items-center gap-0.5">
                          <Clock size={8} className="text-slate-400" />
                          <span className="text-[8px] text-slate-500">{exp.duracao || t('flexivel')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-blue-600">
                          {Number(exp.preco).toLocaleString()} {t('cve')}
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase">{exp.categoria_nome || t('experiencia')}</span>
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
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">{t('carregando_mapa')}</p>
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

        {selectedExperiencia && (
          <Popup
            latitude={coordenadasPorIlha[selectedExperiencia.ilha]?.lat || 15.0667}
            longitude={coordenadasPorIlha[selectedExperiencia.ilha]?.lng || -23.5833}
            onClose={() => setSelectedExperiencia(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="top"
            offset={15}
            maxWidth="280px"
          >
            <div 
              className="p-2 cursor-pointer"
              onClick={() => navigate(`/experiencia/${selectedExperiencia.slug || selectedExperiencia.id}`)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <img 
                  src={selectedExperiencia.imagem_principal || selectedExperiencia.imagens?.[0]?.caminho_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200'}
                  alt={selectedExperiencia.titulo}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200'}
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-sm">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {selectedExperiencia.rating_formatado || '5.0'}
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                  {selectedExperiencia.categoria_nome || t('experiencia')}
                </div>
              </div>
              
              <h4 className="font-black text-xs uppercase tracking-tighter text-gray-900 line-clamp-1">
                {selectedExperiencia.titulo}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 mb-2 flex items-center gap-1">
                <MapPin size={10} /> {selectedExperiencia.ilha}, {selectedExperiencia.localizacao}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <div>
                  <span className="text-blue-600 font-black text-xs">
                    {Number(selectedExperiencia.preco).toLocaleString()} {t('cve')}
                  </span>
                  <span className="text-[8px] font-normal text-slate-400">{t('por_pessoa')}</span>
                </div>
                <span className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1">
                  {t('ver_detalhes')} <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapaExperiencias;