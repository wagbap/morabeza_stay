import React, { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl'; 
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Star } from 'lucide-react';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9tYXJpb2xlbGEiLCJhIjoiY20wdHB6MjFsMHdrbzJwb2FpaHR1djNlNSJ9.bY3p1PcxssBGQFXw5PuSAg';

const PaginaMapa = () => {
  const navigate = useNavigate();
  const [alojamentos, setAlojamentos] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null); // Para mostrar detalhes ao clicar
  const [viewport, setViewport] = useState({
    latitude: 16.002,
    longitude: -24.013,
    zoom: 7
  });

  useEffect(() => {
    axios.get('https://welovepalop.com/api/get_alojamentos.php')
      .then(res => {
        const dados = Array.isArray(res.data) ? res.data : [];
        setAlojamentos(dados);
        
        // Se houver dados, focar no primeiro hotel que tenha coordenadas reais
        const primeiroValido = dados.find(h => h.latitude && h.longitude);
        if (primeiroValido) {
          setViewport(prev => ({
            ...prev,
            latitude: parseFloat(primeiroValido.latitude),
            longitude: parseFloat(primeiroValido.longitude),
            zoom: 12
          }));
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#e5e7eb' }}>
      
      {/* HUD de Navegação */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'white', padding: '12px 24px', borderRadius: '16px', cursor: 'pointer', border: 'none', fontWeight: '900', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', textTransform: 'uppercase' }}
        >
          <ArrowLeft size={16} /> Voltar à Lista
        </button>
      </div>

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />

        {alojamentos.map((hotel) => {
          const lat = parseFloat(hotel.latitude);
          const lng = parseFloat(hotel.longitude);

          // SÓ DESENHA SE TIVER COORDENADAS NA BASE DE DADOS
          if (!lat || !lng) return null;

          return (
            <Marker key={hotel.id} latitude={lat} longitude={lng} anchor="bottom">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotel(hotel);
                }}
                style={{ 
                  background: selectedHotel?.id === hotel.id ? '#000' : '#2563eb', 
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '900',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: '2px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {hotel.preco_noite || hotel.preco} CVE
              </div>
            </Marker>
          );
        })}

        {/* POPUP DE DETALHE (Igual ao Airbnb) */}
        {selectedHotel && (
          <Popup
            latitude={parseFloat(selectedHotel.latitude)}
            longitude={parseFloat(selectedHotel.longitude)}
            onClose={() => setSelectedHotel(null)}
            closeButton={false}
            anchor="top"
            offset={10}
          >
            <div style={{ padding: '4px', maxWidth: '200px', cursor: 'pointer' }} onClick={() => navigate(`/alojamento/${selectedHotel.id}`)}>
              <img 
                src={selectedHotel.foto_principal} 
                style={{ width: '100%', height: '100px', objectCover: 'cover', borderRadius: '8px', marginBottom: '8px' }} 
              />
              <h4 style={{ margin: '0', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>{selectedHotel.nome}</h4>
              <p style={{ margin: '4px 0', fontSize: '10px', color: '#2563eb', fontWeight: '800' }}>⭐ 4.9 • Reservar Agora</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default PaginaMapa;