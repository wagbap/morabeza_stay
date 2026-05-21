// MapaCarros.jsx - Totalmente compatível com o novo formato do PHP
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ChevronRight, Gauge } from 'lucide-react';
import axios from 'axios';

// Importar o CSS do Mapbox
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapaCarros = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [carros, setCarros] = useState([]);
  const [selectedCarro, setSelectedCarro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focoId, setFocoId] = useState(null);

  // Coordenadas por ilha para Fallback absoluto se a lat/lng do banco falhar
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

  // Extrair parâmetro de foco da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const foco = params.get('foco');
    if (foco) {
      setFocoId(parseInt(foco, 10));
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
        setLoading(true);
        const res = await axios.get('https://welovepalop.com/api/get_carro_detalhes.php');
        
        let dados = [];
        if (res.data && res.data.success && res.data.data) {
          dados = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } else if (res.data && res.data.data) {
          dados = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } else {
          dados = Array.isArray(res.data) ? res.data : [];
        }

        setCarros(dados);
        
        if (focoId) {
          const focoCarro = dados.find(c => parseInt(c.id, 10) === focoId);
          if (focoCarro) {
            const lat = parseFloat(focoCarro.latitude);
            const lng = parseFloat(focoCarro.longitude);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              setViewState(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                zoom: 12
              }));
              setSelectedCarro(focoCarro);
            }
          }
        } else if (dados.length > 0) {
          const primeiroValido = dados[0];
          const lat = parseFloat(primeiroValido.latitude);
          const lng = parseFloat(primeiroValido.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setViewState(prev => ({ ...prev, latitude: lat, longitude: lng, zoom: 8 }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar mapa de carros:", err);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [focoId]);

  const handleSelecionarCarro = (carro) => {
    const lat = parseFloat(carro.latitude);
    const lng = parseFloat(carro.longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setViewState(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        zoom: 13
      }));
      setSelectedCarro(carro);
    }
  };

  const carrosPorIlha = useMemo(() => {
    return carros.reduce((acc, carro) => {
      const ilha = carro.ilha || t('outras');
      if (!acc[ilha]) acc[ilha] = [];
      acc[ilha].push(carro);
      return acc;
    }, {});
  }, [carros, t]);

  const marcadores = useMemo(() => {
    return carros.map((carro) => {
      const lat = parseFloat(carro.latitude);
      const lng = parseFloat(carro.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return null;

      const isSelected = selectedCarro?.id === carro.id;
      const preco = Number(carro.preco_dia || 0);

      return (
        <Marker 
          key={carro.id} 
          latitude={lat} 
          longitude={lng} 
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedCarro(carro);
          }}
        >
          <div 
            className={`
              px-3 py-1.5 rounded-full border-2 border-white shadow-lg font-black text-[11px] transition-all cursor-pointer whitespace-nowrap
              ${isSelected ? 'bg-black text-white scale-110 z-50' : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            {preco.toLocaleString()} {t('cve')}
          </div>
        </Marker>
      );
    });
  }, [carros, selectedCarro, t]);

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all border border-gray-100"
        >
          <ArrowLeft size={18} /> {t('voltar')}
        </button>
      </div>

      {/* Sidebar de Veículos */}
      <div className="absolute top-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-blue-900 text-white text-left">
          <h3 className="font-black text-sm uppercase tracking-wider">{t('frota_veiculos')}</h3>
          <p className="text-[10px] text-blue-200 mt-1">{carros.length} {t('carros_disponiveis')}</p>
        </div>
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto text-left">
          {Object.entries(carrosPorIlha).map(([ilha, lista]) => (
            <div key={ilha}>
              <div className="px-3 pt-3 pb-1 bg-slate-50">
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-blue-600" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{ilha}</span>
                  <span className="text-[8px] text-slate-400">({lista.length})</span>
                </div>
              </div>
              {lista.map((carroItem) => (
                <div 
                  key={carroItem.id}
                  onClick={() => handleSelecionarCarro(carroItem)}
                  className={`p-3 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedCarro?.id === carroItem.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <img 
                      src={carroItem.imagem_url || (carroItem.imagens && carroItem.imagens[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100'}
                      className="w-16 h-16 rounded-xl object-cover"
                      alt={carroItem.titulo}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100'}
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{carroItem.titulo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          <span className="text-[9px] font-bold">{Number(carroItem.estrelas || 5).toFixed(1)}</span>
                        </div>
                        <span className="text-[8px] text-slate-400">•</span>
                        <div className="flex items-center gap-0.5">
                          <Gauge size={9} className="text-slate-400" />
                          <span className="text-[8px] text-slate-500">{carroItem.transmissao || t('manual')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-blue-600">
                          {Number(carroItem.preco_dia).toLocaleString()} {t('cve')} <span className="text-[8px] text-slate-400 font-normal">{t('por_dia')}</span>
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase bg-slate-100 px-1 rounded">{carroItem.tipo || 'SUV'}</span>
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
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">{t('carregando_mapa_frotas')}</p>
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

        {selectedCarro && (
          <Popup
            latitude={parseFloat(selectedCarro.latitude)}
            longitude={parseFloat(selectedCarro.longitude)}
            onClose={() => setSelectedCarro(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="top"
            offset={15}
            maxWidth="280px"
          >
            <div 
              className="p-1 cursor-pointer text-left"
              onClick={() => navigate(`/carro/${selectedCarro.slug || selectedCarro.id}`)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-2.5">
                <img 
                  src={selectedCarro.imagem_url || (selectedCarro.imagens && selectedCarro.imagens[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200'}
                  alt={selectedCarro.titulo}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200'}
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {Number(selectedCarro.estrelas || 5).toFixed(1)}
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                  {selectedCarro.tipo || 'SUV'}
                </div>
              </div>
              
              <h4 className="font-black text-xs uppercase tracking-tighter text-gray-900 line-clamp-1">
                {selectedCarro.titulo}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 mb-2 flex items-center gap-1">
                <MapPin size={10} /> {selectedCarro.ilha}, {selectedCarro.localizacao}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                <div>
                  <span className="text-blue-600 font-black text-xs">
                    {Number(selectedCarro.preco_dia).toLocaleString()} {t('cve')}
                  </span>
                  <span className="text-[8px] font-normal text-slate-400"> {t('por_dia')}</span>
                </div>
                <span className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-0.5">
                  {t('alugar')} <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapaCarros;