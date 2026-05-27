// src/components/AlojamentoRegisto/RegistarLocalizacao.js
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, HelpCircle, User } from 'lucide-react';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import PropMenu from './PropMenu';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const BASE_ENDERECOS_CV = [
  { id: 'cv-1', titulo: 'Avenida Marginal, Mindelo', subtitulo: 'Concelho de São Vicente, 2110, Cabo Verde', cidade: 'Mindelo', codigoPostal: '2110', pais: 'Cabo Verde', lat: 16.8884, lng: -24.9896 },
  { id: 'cv-2', titulo: 'Praça Nova (Praça Amílcar Cabral)', subtitulo: 'Mindelo, Ilha de São Vicente, Cabo Verde', cidade: 'Mindelo', codigoPostal: '2110', pais: 'Cabo Verde', lat: 16.8893, lng: -24.9875 },
  { id: 'cv-3', titulo: 'Avenida Amílcar Cabral, Praia', subtitulo: 'Platô, Concelho da Praia, 7110, Cabo Verde', cidade: 'Praia', codigoPostal: '7110', pais: 'Cabo Verde', lat: 14.9212, lng: -23.5084 },
  { id: 'cv-4', titulo: 'Quebra Canela, Praia', subtitulo: 'Ilha de Santiago, Cabo Verde', cidade: 'Praia', codigoPostal: '7110', pais: 'Cabo Verde', lat: 14.9042, lng: -23.5218 },
  { id: 'cv-5', titulo: 'Rua Pedonal de Santa Maria', subtitulo: 'Santa Maria, Ilha do Sal, 4111, Cabo Verde', cidade: 'Santa Maria', codigoPostal: '4111', pais: 'Cabo Verde', lat: 16.5975, lng: -22.9051 },
  { id: 'cv-6', titulo: 'Largo de Santana, Espargos', subtitulo: 'Espargos, Ilha do Sal, Cabo Verde', cidade: 'Espargos', codigoPostal: '4110', pais: 'Cabo Verde', lat: 16.7554, lng: -22.9439 },
  { id: 'cv-7', titulo: 'Praça Sal Rei, Boa Vista', subtitulo: 'Sal Rei, Ilha da Boa Vista, 5110, Cabo Verde', cidade: 'Sal Rei', codigoPostal: '5110', pais: 'Cabo Verde', lat: 16.1792, lng: -22.9158 },
  { id: 'cv-8', titulo: 'Rua Direita, Cidade Velha', subtitulo: 'Ribeira Grande de Santiago, Ilha de Santiago, Cabo Verde', cidade: 'Cidade Velha', codigoPostal: '7120', pais: 'Cabo Verde', lat: 14.9157, lng: -23.6053 },
  { id: 'cv-9', titulo: 'Tarrafal de Santiago (Praia Mar)', subtitulo: 'Concelho do Tarrafal, Ilha de Santiago, Cabo Verde', cidade: 'Tarrafal', codigoPostal: '7310', pais: 'Cabo Verde', lat: 15.2778, lng: -23.7512 },
  { id: 'cv-10', titulo: 'São Filipe Centro', subtitulo: 'Ilha do Fogo, 8110, Cabo Verde', cidade: 'São Filipe', codigoPostal: '8110', pais: 'Cabo Verde', lat: 14.8961, lng: -24.4956 },
];

const RegistarLocalizacao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [propertyName, setPropertyName] = useState(location.state?.propertyName || '');
  const [pesquisa, setPesquisa] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [numApartamento, setNumApartamento] = useState('');
  const [pais, setPais] = useState('Cabo Verde');
  const [cidade, setCidade] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [atualizarAoMover, setAtualizarAoMover] = useState(true);
  const [moradaCompleta, setMoradaCompleta] = useState('');

  const [viewState, setViewState] = useState({
    latitude: 16.8884,
    longitude: -24.9896,
    zoom: 13,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    const savedAddress = localStorage.getItem('propertyAddress');
    if (savedAddress) {
      const address = JSON.parse(savedAddress);
      setPesquisa(address.morada || '');
      setNumApartamento(address.apartamento || '');
      setPais(address.pais || 'Cabo Verde');
      setCidade(address.cidade || '');
      setCodigoPostal(address.codigoPostal || '');
      setMoradaCompleta(address.moradaCompleta || '');
      if (address.coordenadas) {
        setViewState(prev => ({ ...prev, latitude: address.coordenadas.lat, longitude: address.coordenadas.lng, zoom: 16 }));
      }
    }
    
    const savedName = localStorage.getItem('propertyName');
    if (savedName && !propertyName) {
      setPropertyName(savedName);
    }
  }, []);

  const listaFiltrada = useMemo(() => {
    if (!pesquisa || pesquisa.trim() === '') return [];
    return BASE_ENDERECOS_CV.filter(item =>
      item.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.subtitulo.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);

  const handleSelecionarSugestao = (item) => {
    setPesquisa(item.titulo);
    setMostrarDropdown(false);
    setCidade(item.cidade);
    setCodigoPostal(item.codigoPostal);
    setPais(item.pais);
    setMoradaCompleta(`${item.titulo}, ${item.subtitulo}`);
    setViewState(prev => ({ ...prev, latitude: item.lat, longitude: item.lng, zoom: 16 }));
  };

  const handleDragMarker = (event) => {
    if (!atualizarAoMover) return;
    const { lng, lat } = event.lngLat;
    setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleEditName = () => {
    navigate('/alojamento/nome', { state: { propertyName } });
  };

  const handleEditLocation = () => {
    console.log('Editando localização');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dadosMorada = {
      morada: pesquisa,
      apartamento: numApartamento,
      pais,
      cidade,
      codigoPostal,
      moradaCompleta: `${pesquisa}${numApartamento ? `, ${numApartamento}` : ''}, ${cidade}, ${codigoPostal}, ${pais}`,
      coordenadas: { lat: viewState.latitude, lng: viewState.longitude }
    };
    
    localStorage.setItem('propertyAddress', JSON.stringify(dadosMorada));
    localStorage.setItem('propertyName', propertyName);
    
    alert('Morada salva com sucesso!');
    navigate('/alojamento/fluxo', { state: { step: 3 } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden font-sans antialiased text-gray-900">
      
      <header className="absolute top-0 left-0 right-0 bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm z-20">
        <div className="font-bold text-2xl tracking-tight">Booking.com</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <PropMenu 
              nomePropriedade={propertyName || 'Nova Propriedade'}
              onEditName={handleEditName}
              onEditLocation={handleEditLocation}
            />
            <div className="text-[10px] opacity-80">
              {moradaCompleta || 'Morada não definida'}
            </div>
          </div>
          <div className="w-[1px] h-8 bg-blue-900"></div>
          <div className="cursor-pointer hover:underline">PT</div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Ajuda</span> <HelpCircle size={18} />
          </div>
          <User size={24} className="cursor-pointer" />
        </div>
      </header>

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <Marker latitude={viewState.latitude} longitude={viewState.longitude} draggable={true} onDragEnd={handleDragMarker} anchor="bottom">
          <div className="cursor-pointer flex flex-col items-center">
            <div className="w-[26px] h-[26px] bg-[#d93025] rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#d93025] -mt-[2px]"></div>
          </div>
        </Marker>
      </Map>

      <div className="absolute top-[80px] left-8 z-30 w-full max-w-[420px]">
        <div className="bg-white rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)] p-6 border border-gray-200">
          
          <h2 className="text-[22px] font-bold text-gray-900 tracking-tight mb-5">
            Onde é a sua propriedade?
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-800 mb-1">Encontre a sua morada</label>
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => { setPesquisa(e.target.value); setMostrarDropdown(true); }}
                onFocus={() => setMostrarDropdown(true)}
                placeholder="Ex: Avenida Marginal, Praia, Santa Maria..."
                className="w-full px-3 py-2 border border-gray-400 rounded-sm text-sm focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
              />
              {mostrarDropdown && pesquisa.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 shadow-xl rounded-sm z-50 max-h-60 overflow-y-auto">
                  {listaFiltrada.length > 0 ? (
                    listaFiltrada.map((item) => (
                      <div key={item.id} onClick={() => handleSelecionarSugestao(item)} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <h4 className="text-xs font-bold text-gray-900">{item.titulo}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitulo}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-gray-500 text-center">Nenhuma morada encontrada em Cabo Verde.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Número do apartamento ou do piso <span className="text-gray-500 font-normal">(opcional)</span></label>
              <input type="text" value={numApartamento} onChange={(e) => setNumApartamento(e.target.value)} placeholder="Ex: 2º Esquerdo / Apt 12" className="w-full px-3 py-2 border border-gray-400 rounded-sm text-sm focus:outline-none focus:border-[#006ce4]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">País/região</label>
              <select value={pais} onChange={(e) => setPais(e.target.value)} className="w-full px-3 py-2 border border-gray-400 rounded-sm bg-white text-sm focus:outline-none focus:border-[#006ce4]">
                <option value="Cabo Verde">Cabo Verde</option>
                <option value="Portugal">Portugal</option>
                <option value="Angola">Angola</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Cidade</label>
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-3 py-2 border border-gray-400 rounded-sm text-sm focus:outline-none focus:border-[#006ce4]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Código postal</label>
                <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} className="w-full px-3 py-2 border border-gray-400 rounded-sm text-sm focus:outline-none focus:border-[#006ce4]" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input id="sync-map" type="checkbox" checked={atualizarAoMover} onChange={(e) => setAtualizarAoMover(e.target.checked)} className="w-4 h-4 text-[#006ce4] border-gray-400 rounded mt-0.5" />
              <label htmlFor="sync-map" className="text-xs text-gray-900 font-medium select-none cursor-pointer">Atualize a morada ao mover o pin no mapa.</label>
            </div>

            {mostrarAviso && (
              <div className="bg-[#f5f5f5] border border-gray-300 rounded-sm p-3 relative flex gap-3 mt-2">
                <div className="w-[18px] h-[18px] border border-gray-500 rounded-full flex items-center justify-center shrink-0 text-xs font-serif font-bold text-gray-600">i</div>
                <p className="text-[11px] text-gray-700 leading-normal pr-5">A localização do pin vermelho está incorreta? Retire a seleção da opção acima e clique no mapa para mover o pin para o local certo.</p>
                <button type="button" onClick={() => setMostrarAviso(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={handleBack} className="p-2.5 border border-[#006ce4] text-[#006ce4] bg-white rounded-sm hover:bg-blue-50 transition-colors"><ArrowLeft size={18} /></button>
              <button type="submit" className="flex-1 bg-[#006ce4] text-white text-sm font-semibold py-2.5 px-4 rounded-sm hover:bg-[#0053b3] transition-colors">Guardar e Continuar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistarLocalizacao;