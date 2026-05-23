// src/components/AlojamentoRegisto/FluxoRegisto.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight } from 'lucide-react';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras, { REGRAS_PADRAO } from './Regras';
import ImagensUpload from './ImagensUpload';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Base de Dados Local de Moradas Reais de Cabo Verde
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
  { id: 'cv-11', titulo: 'Ribeira Grande Centro', subtitulo: 'Ilha de Santo Antão, 1110, Cabo Verde', cidade: 'Ribeira Grande', codigoPostal: '1110', pais: 'Cabo Verde', lat: 17.1833, lng: -25.0667 },
  { id: 'cv-12', titulo: 'Porto Novo (Zona do Porto)', subtitulo: 'Porto Novo, Ilha de Santo Antão, Cabo Verde', cidade: 'Porto Novo', codigoPostal: '1120', pais: 'Cabo Verde', lat: 17.0197, lng: -25.0642 }
];

const FluxoRegisto = () => {
  const navigate = useNavigate();
  
  // Fase atual: 1-Informacoes, 2-Localizacao, 3-Comodidades, 4-Regras, 5-Fotos
  const [fase, setFase] = useState(1);
  
  // INFORMAÇÕES BÁSICAS
  const [informacoesBasicas, setInformacoesBasicas] = useState({
    titulo: '',
    tipo_propriedade: 'Apartamento',
    capacidade: 2,
    estrelas: 4.5,
    descricao: '',
    descricao_detalhada: '',
    preco_noite: '',
    tempo_resposta: 'Dentro de 1 hora',
    quartos: 1,
    camas: 1,
    casas_banho: 1
  });
  
  // Localização
  const [pesquisa, setPesquisa] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
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
  });
  
  // Comodidades
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState([]);
  
  // Regras da casa
  const [regras, setRegras] = useState(REGRAS_PADRAO);
  const [regrasAdicionais, setRegrasAdicionais] = useState('');
  
  // Fotos
  const [fotos, setFotos] = useState([]);
  
  // Carregar dados salvos
  useEffect(() => {
    const savedInfo = localStorage.getItem('propertyInformacoesBasicas');
    if (savedInfo) setInformacoesBasicas(JSON.parse(savedInfo));
    
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
        setViewState({ latitude: address.coordenadas.lat, longitude: address.coordenadas.lng, zoom: 16 });
      }
    }
    
    const savedComodidades = localStorage.getItem('propertyComodidades');
    if (savedComodidades) setComodidadesSelecionadas(JSON.parse(savedComodidades));
    
    const savedRegras = localStorage.getItem('propertyRegras');
    if (savedRegras) {
      const saved = JSON.parse(savedRegras);
      setRegras(saved.regras || REGRAS_PADRAO);
      setRegrasAdicionais(saved.regrasAdicionais || '');
    }
    
    const savedFotos = localStorage.getItem('propertyPhotos');
    if (savedFotos) setFotos(JSON.parse(savedFotos));
  }, []);
  
  const listaFiltrada = useMemo(() => {
    if (!pesquisa || pesquisa.trim() === '') return [];
    return BASE_ENDERECOS_CV.filter(item =>
      item.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.subtitulo.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);
  
  // Handler Fase 1 - Informações Básicas
  const handleSaveInformacoes = () => {
    if (!informacoesBasicas.titulo.trim()) {
      alert('O título da propriedade é obrigatório');
      return false;
    }
    if (!informacoesBasicas.descricao.trim()) {
      alert('A descrição curta é obrigatória');
      return false;
    }
    if (!informacoesBasicas.preco_noite) {
      alert('O preço por noite é obrigatório');
      return false;
    }
    localStorage.setItem('propertyInformacoesBasicas', JSON.stringify(informacoesBasicas));
    setFase(2);
    return true;
  };
  
  // Handler Fase 2 - Localização
  const handleSelecionarSugestao = (item) => {
    setPesquisa(item.titulo);
    setMostrarDropdown(false);
    setCidade(item.cidade);
    setCodigoPostal(item.codigoPostal);
    setPais(item.pais);
    setMoradaCompleta(`${item.titulo}, ${item.subtitulo}`);
    setViewState({ latitude: item.lat, longitude: item.lng, zoom: 16 });
  };
  
  const handleDragMarker = (event) => {
    if (!atualizarAoMover) return;
    const { lng, lat } = event.lngLat;
    setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };
  
  const handleSaveAddress = () => {
    if (!pesquisa.trim()) { alert('Por favor, insira a morada'); return false; }
    if (!cidade.trim()) { alert('Por favor, insira a cidade'); return false; }
    
    const dadosMorada = {
      morada: pesquisa,
      apartamento: numApartamento,
      pais, cidade, codigoPostal,
      moradaCompleta: `${pesquisa}${numApartamento ? `, ${numApartamento}` : ''}, ${cidade}, ${codigoPostal}, ${pais}`,
      coordenadas: { lat: viewState.latitude, lng: viewState.longitude }
    };
    
    localStorage.setItem('propertyAddress', JSON.stringify(dadosMorada));
    setFase(3);
    return true;
  };
  
  // Handler Fase 3 - Comodidades
  const handleComodidadeToggle = (comodidade) => {
    setComodidadesSelecionadas(prev =>
      prev.find(c => c.id === comodidade.id)
        ? prev.filter(c => c.id !== comodidade.id)
        : [...prev, comodidade]
    );
  };
  
  const handleSaveComodidades = () => {
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesSelecionadas));
    setFase(4);
    return true;
  };
  
  // Handler Fase 4 - Regras da casa
  const handleRegraToggle = (regraId) => {
    setRegras(prev => prev.map(r => 
      r.id === regraId ? { ...r, ativo: !r.ativo } : r
    ));
  };
  
  const handleSaveRegras = () => {
    const dadosRegras = {
      regras: regras,
      regrasAdicionais: regrasAdicionais
    };
    localStorage.setItem('propertyRegras', JSON.stringify(dadosRegras));
    setFase(5);
    return true;
  };
  
  // Handler Fase 5 - Fotos (usando ImagensUpload)
  const handleFinalizar = () => {
    localStorage.setItem('propertyPhotos', JSON.stringify(fotos));
    const dadosCompletos = {
      informacoes: informacoesBasicas,
      morada: { pesquisa, numApartamento, pais, cidade, codigoPostal, moradaCompleta, coordenadas: { lat: viewState.latitude, lng: viewState.longitude } },
      comodidades: comodidadesSelecionadas,
      regras: { regras, regrasAdicionais },
      fotos: fotos
    };
    localStorage.setItem('alojamentoCompleto', JSON.stringify(dadosCompletos));
    alert('Propriedade registada com sucesso!');
    navigate('/');
  };
  
  const handleBack = () => { if (fase > 1) setFase(fase - 1); else navigate(-1); };
  const handleEditInfo = () => setFase(1);
  const handleEditLocation = () => setFase(2);
  const handleEditComodidades = () => setFase(3);
  const handleEditRegras = () => setFase(4);
  
  const renderProgressBar = () => {
    const fasesLista = ['Informações', 'Localização', 'Comodidades', 'Regras', 'Fotos'];
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {fasesLista.map((nome, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`text-xs font-medium ${fase > index ? 'text-[#006ce4]' : fase === index + 1 ? 'text-[#006ce4]' : 'text-gray-400'}`}>{nome}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {fasesLista.map((_, index) => (
            <div key={index} className={`h-1 flex-1 rounded-full ${fase > index ? 'bg-[#006ce4]' : fase === index + 1 ? 'bg-[#006ce4] bg-opacity-50' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  };
  
  // FASE 1 - Informações Básicas
  const renderFaseInformacoes = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Informações básicas da propriedade</h1>
          <p className="text-gray-600 mb-8">Preencha os dados principais do seu alojamento.</p>
          
          <InformacoesBasicas 
            dados={informacoesBasicas}
            onDadosChange={setInformacoesBasicas}
            onNext={handleSaveInformacoes}
          />
        </div>
      </div>
    </div>
  );
  
  // FASE 2 - Localização com Mapa
  const renderFaseLocalizacao = () => (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      <Map {...viewState} onMove={evt => setViewState(evt.viewState)} mapStyle="mapbox://styles/mapbox/streets-v12" mapboxAccessToken={MAPBOX_TOKEN} style={{ width: '100%', height: '100%' }}>
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
      
      <button onClick={handleBack} className="absolute top-[80px] left-8 z-30 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg px-3 py-2 shadow-md">
        <ArrowLeft size={20} /><span>Voltar</span>
      </button>
      
      <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 z-30 w-96 bg-white rounded-lg shadow-md p-3">
        {renderProgressBar()}
      </div>
      
      <div className="absolute top-[140px] left-8 z-30 w-full max-w-[420px]">
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <h2 className="text-[22px] font-bold text-gray-900 mb-5">Onde é a sua propriedade?</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-800 mb-1">Encontre a sua morada</label>
              <input type="text" value={pesquisa} onChange={(e) => { setPesquisa(e.target.value); setMostrarDropdown(true); }} placeholder="Ex: Avenida Marginal, Praia..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#006ce4]" />
              {mostrarDropdown && pesquisa.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 shadow-xl rounded-md z-50 max-h-60 overflow-y-auto">
                  {listaFiltrada.map((item) => (<div key={item.id} onClick={() => handleSelecionarSugestao(item)} className="p-3 border-b hover:bg-gray-50 cursor-pointer"><h4 className="text-xs font-bold">{item.titulo}</h4><p className="text-[11px] text-gray-500">{item.subtitulo}</p></div>))}
                </div>
              )}
            </div>
            
            <div><label className="block text-xs font-bold text-gray-800 mb-1">Número do apartamento <span className="text-gray-500">(opcional)</span></label><input type="text" value={numApartamento} onChange={(e) => setNumApartamento(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-xs font-bold text-gray-800 mb-1">País/região</label><select value={pais} onChange={(e) => setPais(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>Cabo Verde</option><option>Portugal</option><option>Angola</option></select></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-gray-800 mb-1">Cidade</label><input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div><div><label className="block text-xs font-bold text-gray-800 mb-1">Código postal</label><input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div></div>
            <div className="flex gap-2 pt-2"><button onClick={handleBack} className="p-2.5 border border-[#006ce4] text-[#006ce4] bg-white rounded-md"><ArrowLeft size={18} /></button><button onClick={handleSaveAddress} className="flex-1 bg-[#006ce4] text-white py-2.5 px-4 rounded-md">Continuar</button></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // FASE 3 - Comodidades
  const renderFaseComodidades = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={20} /><span>Voltar</span></button>
        {renderProgressBar()}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comodidades da propriedade</h1>
          <p className="text-gray-600 mb-6">Selecione todas as comodidades disponíveis.</p>
          <Comodidades comodidadesSelecionadas={comodidadesSelecionadas} onComodidadeToggle={handleComodidadeToggle} />
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveComodidades} className="flex-1 bg-[#006ce4] text-white py-2.5 rounded-lg flex items-center justify-center gap-2">Continuar <ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // FASE 4 - Regras da casa
  const renderFaseRegras = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={20} /><span>Voltar</span></button>
        {renderProgressBar()}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regras da casa</h1>
          <p className="text-gray-600 mb-6">Defina as regras e políticas da sua propriedade.</p>
          
          <Regras 
            regrasSelecionadas={regras}
            onRegraToggle={handleRegraToggle}
            regrasAdicionais={regrasAdicionais}
            onRegrasAdicionaisChange={setRegrasAdicionais}
          />
          
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveRegras} className="flex-1 bg-[#006ce4] text-white py-2.5 rounded-lg flex items-center justify-center gap-2">Continuar <ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // FASE 5 - Fotos (usando o componente ImagensUpload)
  const renderFaseFotos = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos da sua propriedade</h1>
          <p className="text-gray-600 mb-8">
            As primeiras impressões são visuais. Adicione fotos de alta qualidade para atrair mais hóspedes.
          </p>
          
          <ImagensUpload 
            fotos={fotos}
            onFotosChange={setFotos}
            maxFotos={20}
          />
          
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Voltar
            </button>
            <button onClick={handleFinalizar} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              Finalizar Registo <Check size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {fase !== 2 && (
        <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
          <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <PropMenu 
                nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} 
                onEditName={handleEditInfo} 
                onEditLocation={handleEditLocation} 
                onEditComodidades={handleEditComodidades} 
                onEditRegras={handleEditRegras}
              />
              <div className="text-[10px] opacity-80">
                {fase === 1 && 'Preencher informações'}
                {fase === 3 && `${comodidadesSelecionadas.length} comodidade(s)`}
                {fase === 4 && `${regras.filter(r => r.ativo).length} regra(s)`}
                {fase === 5 && `${fotos.length} foto(s)`}
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
      )}
      
      {fase === 2 && (
        <header className="absolute top-0 left-0 right-0 bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm z-20">
          <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <PropMenu nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} />
            </div>
            <div className="w-[1px] h-8 bg-blue-900"></div>
            <div className="cursor-pointer hover:underline">PT</div>
            <div className="flex items-center gap-2 cursor-pointer hover:underline">
              <span>Ajuda</span> <HelpCircle size={18} />
            </div>
            <User size={24} className="cursor-pointer" />
          </div>
        </header>
      )}
      
      {fase === 1 && renderFaseInformacoes()}
      {fase === 2 && renderFaseLocalizacao()}
      {fase === 3 && renderFaseComodidades()}
      {fase === 4 && renderFaseRegras()}
      {fase === 5 && renderFaseFotos()}
    </>
  );
};

export default FluxoRegisto;