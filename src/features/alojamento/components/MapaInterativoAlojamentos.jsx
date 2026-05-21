import React, { useState, useEffect, useMemo } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, MapPin } from 'lucide-react';
import axios from 'axios';

// Importar o CSS do Mapbox
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const PaginaMapa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alojamentos, setAlojamentos] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focoId, setFocoId] = useState(null);

  // Extrair parâmetro de foco da URL (?foco=id)
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
        const res = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        const dados = Array.isArray(res.data) ? res.data : (res.data?.data ? [res.data.data] : []);
        setAlojamentos(dados);
        
        if (focoId) {
          const focoHotel = dados.find(h => parseInt(h.id, 10) === focoId);
          if (focoHotel) {
            setViewState(prev => ({
              ...prev,
              latitude: parseFloat(focoHotel.latitude),
              longitude: parseFloat(focoHotel.longitude),
              zoom: 13
            }));
            setSelectedHotel(focoHotel);
          }
        } else if (dados.length > 0) {
          const foco = dados.find(h => h.latitude && h.longitude);
          if (foco) {
            setViewState(prev => ({
              ...prev,
              latitude: parseFloat(foco.latitude),
              longitude: parseFloat(foco.longitude),
              zoom: 9
            }));
          }
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
      latitude: parseFloat(hotel.latitude),
      longitude: parseFloat(hotel.longitude),
      zoom: 13
    }));
  };

  const marcadores = useMemo(() => 
    alojamentos.map((hotel) => {
      const lat = parseFloat(hotel.latitude);
      const lng = parseFloat(hotel.longitude);
      if (isNaN(lat) || isNaN(lng)) return null;

      const isSelected = selectedHotel?.id === hotel.id;
      const preco = Number(hotel.preco_noite || 0);

      return (
        <Marker 
          key={hotel.id} 
          latitude={lat} 
          longitude={lng} 
          anchor="bottom"
          onClick={e => {
            // ESSENCIAL: Evita bolhas de propagação que fecham o card na mesma hora
            e.originalEvent.stopPropagation();
            setSelectedHotel(hotel);
          }}
        >
          <div 
            className={`
              px-3 py-1.5 rounded-full border-2 border-white shadow-lg font-black text-[11px] transition-all cursor-pointer whitespace-nowrap z-10
              ${isSelected ? 'bg-black text-white scale-110 z-30' : 'bg-blue-600 text-white hover:bg-blue-700'}
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
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-gray-100"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      {/* Sidebar lateral */}
      <div className="absolute top-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-blue-900 text-white text-left">
          <h3 className="font-black text-sm uppercase tracking-wider">Alojamentos</h3>
          <p className="text-[10px] text-blue-200 mt-1">{alojamentos.length} propriedades listadas</p>
        </div>
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto text-left">
          {alojamentos.map((hotel) => (
            <div 
              key={hotel.id}
              onClick={() => handleSelecionarHotel(hotel)}
              className={`p-3 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedHotel?.id === hotel.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex gap-3">
                <img 
                  src={hotel.imagem_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'}
                  className="w-16 h-16 rounded-xl object-cover"
                  alt={hotel.titulo}
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'}
                />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{hotel.titulo}</h4>
                  <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-orange-500" /> {hotel.localizacao}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-orange-400 text-orange-400" />
                      <span className="text-[9px] font-bold">{Number(hotel.estrelas || 4.5).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">
                      {Number(hotel.preco_noite).toLocaleString()} CVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-[10px] uppercase text-blue-600 tracking-wider">Carregando coordenadas dos hotéis...</p>
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
            latitude={parseFloat(selectedHotel.latitude)}
            longitude={parseFloat(selectedHotel.longitude)}
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
              <div className="relative h-32 rounded-xl overflow-hidden mb-2.5">
                <img 
                  src={selectedHotel.imagem_url} 
                  alt={selectedHotel.titulo}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> {Number(selectedHotel.estrelas || 4.5).toFixed(1)}
                </div>
              </div>
              
              <h4 className="font-black text-xs uppercase text-gray-900 line-clamp-1">
                {selectedHotel.titulo}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 mb-2 flex items-center gap-1">
                <MapPin size={10} /> {selectedHotel.localizacao}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                <span className="text-blue-600 font-black text-xs">
                  {Number(selectedHotel.preco_noite).toLocaleString()} CVE <span className="text-[8px] font-normal text-slate-400">/noite</span>
                </span>
                <span className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-0.5">
                  Ver <ChevronRight size={10} />
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