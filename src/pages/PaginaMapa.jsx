import React, { useState, useEffect, useMemo } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl'; 
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Star, Info } from 'lucide-react';
import axios from 'axios';

// OBRIGATÓRIO PARA O BUILD: Importar o CSS do Mapbox aqui
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9tYXJpb2xlbGEiLCJhIjoiY20wdHB6MjFsMHdrbzJwb2FpaHR1djNlNSJ9.bY3p1PcxssBGQFXw5PuSAg';

const PaginaMapa = () => {
  const navigate = useNavigate();
  const [alojamentos, setAlojamentos] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState({
    latitude: 16.002,
    longitude: -24.013,
    zoom: 7,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        const dados = Array.isArray(res.data) ? res.data : [];
        setAlojamentos(dados);
        
        // Focar no primeiro hotel válido para não abrir no meio do oceano
        const foco = dados.find(h => h.latitude && h.longitude);
        if (foco) {
          setViewState(prev => ({
            ...prev,
            latitude: parseFloat(foco.latitude),
            longitude: parseFloat(foco.longitude),
            zoom: 12
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar mapa:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // Memorizar marcadores para evitar re-renders lentos no build de produção
  const marcadores = useMemo(() => 
    alojamentos.map((hotel) => {
      const lat = parseFloat(hotel.latitude);
      const lng = parseFloat(hotel.longitude);
      if (!lat || !lng) return null;

      return (
        <Marker 
          key={hotel.id} 
          latitude={lat} 
          longitude={lng} 
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedHotel(hotel);
          }}
        >
          <div className={`
            px-3 py-1.5 rounded-full border-2 border-white shadow-lg font-black text-[11px] transition-all
            ${selectedHotel?.id === hotel.id ? 'bg-black text-white scale-110' : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}>
            {Number(hotel.preco_noite || hotel.preco).toLocaleString()} CVE
          </div>
        </Marker>
      );
    }), [alojamentos, selectedHotel]);

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      
      {/* Botão Voltar - Estilo Flutuante Profissional */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all border border-gray-100"
        >
          <ArrowLeft size={18} /> Voltar à Morabeza
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">Mapeando Cabo Verde...</p>
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
            closeButton={false}
            anchor="top"
            offset={15}
            maxWidth="240px"
          >
            <div 
              className="p-1 group cursor-pointer"
              onClick={() => navigate(`/alojamento/${selectedHotel.id}`)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <img 
                  src={selectedHotel.foto_principal} 
                  alt={selectedHotel.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 shadow-sm">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.9
                </div>
              </div>
              
              <h4 className="font-black text-xs uppercase tracking-tighter text-gray-900 line-clamp-1">
                {selectedHotel.nome}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 mb-2">
                {selectedHotel.localizacao}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-blue-600 font-black text-xs">
                  {Number(selectedHotel.preco_noite).toLocaleString()} CVE
                </span>
                <span className="text-[9px] font-black uppercase text-gray-400 underline">Detalhes</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default PaginaMapa;