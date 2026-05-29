// src/components/AlojamentoRegisto/FluxoRegisto.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight, Search, MapPin } from 'lucide-react';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import { salvarFluxoRegisto } from '../../services/apiService';
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
  { id: 'cv-11', titulo: 'Ribeira Grande Centro', subtitulo: 'Ilha de Santo Antão, 1110, Cabo Verde', cidade: 'Ribeira Grande', codigoPostal: '1110', pais: 'Cabo Verde', lat: 17.1833, lng: -25.0667 },
  { id: 'cv-12', titulo: 'Porto Novo (Zona do Porto)', subtitulo: 'Porto Novo, Ilha de Santo Antão, Cabo Verde', cidade: 'Porto Novo', codigoPostal: '1120', pais: 'Cabo Verde', lat: 17.0197, lng: -25.0642 }
];

const FluxoRegisto = () => {
  const navigate = useNavigate();
  
  // Estados das fases
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(null);
  
  // FASE 1 - Informações Básicas
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
  
  // FASE 2 - Localização
  const [pesquisa, setPesquisa] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [numApartamento, setNumApartamento] = useState('');
  const [pais, setPais] = useState('Cabo Verde');
  const [cidade, setCidade] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [atualizarAoMover, setAtualizarAoMover] = useState(true);
  const [moradaCompleta, setMoradaCompleta] = useState('');
  const [viewState, setViewState] = useState({ latitude: 16.8884, longitude: -24.9896, zoom: 13 });
  
  // FASE 3 - Comodidades
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState([]);
  
  // FASE 4 - Regras
  const [regrasIds, setRegrasIds] = useState([]);
  const [regrasAdicionais, setRegrasAdicionais] = useState('');
  const [regrasObjetos, setRegrasObjetos] = useState([]);
  
  // FASE 5 - Fotos e Quartos
  const [fotos, setFotos] = useState([]);
  const [quartosParaEnviar, setQuartosParaEnviar] = useState([]);
  
  // Refs para controlar carregamento inicial
  const isInitialLoad = useRef(true);
  
  // ==================== HANDLERS ====================
  
  const handleQuartosChange = useCallback((novosQuartos) => {
    console.log('📦 Quartos atualizados:', novosQuartos);
    const quartosArray = Array.isArray(novosQuartos) ? novosQuartos : [];
    setQuartosParaEnviar(quartosArray);
    localStorage.setItem('propertyQuartos', JSON.stringify(quartosArray));
  }, []);
  
  const handleComodidadesChange = useCallback((comodidades) => {
    console.log('📦 Comodidades selecionadas:', comodidades);
    const comodidadesArray = Array.isArray(comodidades) ? comodidades : [];
    setComodidadesSelecionadas(comodidadesArray);
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesArray));
  }, []);
  
  const handleRegrasChange = useCallback((dadosRegras) => {
    console.log('📋 Regras recebidas:', dadosRegras);
    
    const ids = dadosRegras.regras_ids || [];
    const texto = dadosRegras.regrasAdicionais || '';
    
    setRegrasIds(ids);
    setRegrasAdicionais(texto);
    setRegrasObjetos(dadosRegras.regras || []);
    
    localStorage.setItem('propertyRegrasSelecionadas', JSON.stringify(ids));
    localStorage.setItem('propertyRegrasAdicionais', texto);
    
    console.log('✅ Regras IDs salvas:', ids);
  }, []);
  
  // ==================== CARREGAR DADOS DO LOCALSTORAGE ====================
  
  useEffect(() => {
    try {
      // Informações básicas
      const savedInfo = localStorage.getItem('propertyInformacoesBasicas');
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setInformacoesBasicas(parsed);
        if (parsed.quartos && Array.isArray(parsed.quartos)) {
          setQuartosParaEnviar(parsed.quartos);
        }
      }
      
      // Localização
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
          setViewState({ 
            latitude: address.coordenadas.lat, 
            longitude: address.coordenadas.lng, 
            zoom: 16 
          });
        }
      }
      
      // Comodidades
      const savedComodidades = localStorage.getItem('propertyComodidades');
      if (savedComodidades) {
        const parsed = JSON.parse(savedComodidades);
        setComodidadesSelecionadas(Array.isArray(parsed) ? parsed : []);
      }
      
      // Regras
      const savedRegrasIds = localStorage.getItem('propertyRegrasSelecionadas');
      if (savedRegrasIds) {
        const parsed = JSON.parse(savedRegrasIds);
        setRegrasIds(Array.isArray(parsed) ? parsed : []);
      }
      
      const savedRegrasAdicionais = localStorage.getItem('propertyRegrasAdicionais');
      if (savedRegrasAdicionais) {
        setRegrasAdicionais(savedRegrasAdicionais);
      }
      
      // Quartos
      const savedQuartos = localStorage.getItem('propertyQuartos');
      if (savedQuartos) {
        const parsed = JSON.parse(savedQuartos);
        if (Array.isArray(parsed)) {
          setQuartosParaEnviar(parsed);
        }
      }
      
      // Fotos
      const savedFotos = localStorage.getItem('propertyFotos');
      if (savedFotos) {
        const parsed = JSON.parse(savedFotos);
        if (Array.isArray(parsed)) {
          setFotos(parsed);
        }
      }
      
      // ID do alojamento (se existir)
      const savedAlojamentoId = localStorage.getItem('propertyAlojamentoId');
      if (savedAlojamentoId) {
        setAlojamentoId(parseInt(savedAlojamentoId));
      }
      
      console.log('✅ Dados carregados do localStorage');
      
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
  }, []);
  
  // ==================== NAVEGAÇÃO ENTRE FASES ====================
  
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
  
  const handleSaveAddress = () => {
    if (!pesquisa.trim()) {
      alert('Por favor, insira a morada');
      return false;
    }
    if (!cidade.trim()) {
      alert('Por favor, insira a cidade');
      return false;
    }
    
    const moradaCompletaStr = `${pesquisa}${numApartamento ? `, ${numApartamento}` : ''}, ${cidade}, ${codigoPostal}, ${pais}`;
    setMoradaCompleta(moradaCompletaStr);
    
    const dadosMorada = {
      morada: pesquisa,
      apartamento: numApartamento,
      pais: pais,
      cidade: cidade,
      codigoPostal: codigoPostal,
      moradaCompleta: moradaCompletaStr,
      coordenadas: { lat: viewState.latitude, lng: viewState.longitude }
    };
    
    localStorage.setItem('propertyAddress', JSON.stringify(dadosMorada));
    setFase(3);
    return true;
  };
  
  const handleSaveComodidades = () => {
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesSelecionadas));
    setFase(4);
    return true;
  };
  
  const handleSaveRegras = () => {
    // As regras já estão salvas via handleRegrasChange
    setFase(5);
    return true;
  };
  
  // ==================== FINALIZAR REGISTO ====================
  
  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Validar fotos
      if (fotos.length === 0) {
        alert('⚠️ Adicione pelo menos uma foto do seu alojamento');
        setIsSubmitting(false);
        return;
      }
      
      // Garantir que quartos é array
      let quartosFinal = Array.isArray(quartosParaEnviar) ? quartosParaEnviar : [];
      
      const quartosFormatados = quartosFinal.map(q => ({
        tipo_quarto_id: q.tipo_quarto_id,
        quantidade_disponivel: q.quantidade_disponivel || 1,
        preco_personalizado: q.preco_personalizado || null
      }));
      
      // Obter IDs das comodidades
      const comodidadesIds = comodidadesSelecionadas.map(c => c.id || c);
      
      console.log('📤 === DADOS PARA API ===');
      console.log('📤 Informações:', informacoesBasicas);
      console.log('📤 Morada:', { pesquisa, cidade, pais });
      console.log('📤 Comodidades IDs:', comodidadesIds);
      console.log('📤 Regras IDs:', regrasIds);
      console.log('📤 Regras adicionais:', regrasAdicionais);
      console.log('📤 Quartos:', quartosFormatados);
      console.log('📤 Fotos:', fotos.length);
      
      // 🔥 PAYLOAD PARA O registrar.php
      const dadosParaAPI = {
        proprietario_id: 1,
        titulo: informacoesBasicas.titulo,
        tipo_propriedade: informacoesBasicas.tipo_propriedade,
        tipo: informacoesBasicas.tipo_propriedade,
        descricao: informacoesBasicas.descricao,
        descricao_detalhada: informacoesBasicas.descricao_detalhada || '',
        capacidade: parseInt(informacoesBasicas.capacidade) || 2,
        preco_noite: parseFloat(informacoesBasicas.preco_noite) || 0,
        estrelas: parseFloat(informacoesBasicas.estrelas) || 4.0,
        tempo_resposta: informacoesBasicas.tempo_resposta || 'Dentro de 1 hora',
        quartos: parseInt(informacoesBasicas.quartos) || 1,
        camas: parseInt(informacoesBasicas.camas) || 1,
        casas_banho: parseInt(informacoesBasicas.casas_banho) || 1,
        localizacao: cidade,
        latitude: viewState.latitude,
        longitude: viewState.longitude,
        comodidades: comodidadesIds,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais,
        morada: {
          endereco: pesquisa,
          apartamento: numApartamento,
          cidade: cidade,
          codigo_postal: codigoPostal,
          pais: pais,
          morada_completa: moradaCompleta,
          lat: viewState.latitude,
          lng: viewState.longitude
        },
        quartos: quartosFormatados,
        imagens: fotos
          .filter(foto => foto.url || foto.path)
          .map((foto, index) => ({
            url: foto.url || foto.path,
            principal: index === 0 ? 1 : 0,
            ordem: index
          }))
      };
      
      console.log('📤 Payload final:', JSON.stringify(dadosParaAPI, null, 2));
      
      const result = await salvarFluxoRegisto(dadosParaAPI);
      
      if (result.success) {
        // Limpar localStorage após sucesso
        localStorage.removeItem('propertyInformacoesBasicas');
        localStorage.removeItem('propertyAddress');
        localStorage.removeItem('propertyComodidades');
        localStorage.removeItem('propertyRegrasSelecionadas');
        localStorage.removeItem('propertyRegrasAdicionais');
        localStorage.removeItem('propertyQuartos');
        localStorage.removeItem('propertyFotos');
        localStorage.removeItem('propertyAlojamentoId');
        
        alert(`✅ ${result.message}`);
        navigate('/alojamento-registro/meus');
      } else {
        alert(`⚠️ Erro: ${result.message}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao finalizar:', error);
      alert('Erro ao processar o registo. Tente novamente.\n' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    if (fase > 1) {
      setFase(fase - 1);
    } else {
      navigate(-1);
    }
  };
  
  // ==================== FUNÇÕES DE UI ====================
  
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
  
  const listaFiltrada = useMemo(() => {
    if (!pesquisa?.trim()) return [];
    return BASE_ENDERECOS_CV.filter(item =>
      item.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.subtitulo.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);
  
  const renderProgressBar = () => {
    const fasesLista = ['Informações', 'Localização', 'Comodidades', 'Regras', 'Fotos'];
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {fasesLista.map((nome, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`text-xs font-medium ${fase > index + 1 ? 'text-[#006ce4]' : fase === index + 1 ? 'text-[#006ce4]' : 'text-gray-400'}`}>
                {nome}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {fasesLista.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 flex-1 rounded-full ${
                fase > index + 1 ? 'bg-[#006ce4]' : 
                fase === index + 1 ? 'bg-[#006ce4] bg-opacity-50' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  };
  
  // ==================== RENDERIZAÇÃO DAS FASES ====================
  
  const renderFaseInformacoes = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Informações básicas da propriedade</h1>
          <p className="text-gray-600 mb-8">Preencha os dados principais do seu alojamento.</p>
          
          <InformacoesBasicas 
            dados={informacoesBasicas} 
            onDadosChange={setInformacoesBasicas} 
            onQuartosChange={handleQuartosChange} 
            alojamentoId={null} 
            readOnly={false} 
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button 
              onClick={handleSaveInformacoes} 
              className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseLocalizacao = () => (
    <div className="w-screen h-screen relative bg-slate-100 overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <Marker 
          latitude={viewState.latitude} 
          longitude={viewState.longitude} 
          draggable={true} 
          onDragEnd={handleDragMarker} 
          anchor="bottom"
        >
          <div className="cursor-pointer flex flex-col items-center">
            <div className="w-[26px] h-[26px] bg-[#d93025] rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#d93025] -mt-[2px]"></div>
          </div>
        </Marker>
      </Map>
      
      <div className="absolute top-[80px] left-4 right-4 md:left-auto md:right-auto md:w-[400px] bg-white rounded-xl shadow-xl z-10 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#006ce4]" />
            <h3 className="font-semibold text-gray-900">Localização da propriedade</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Arraste o marcador no mapa para ajustar a localização exata</p>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={pesquisa}
              onChange={(e) => { setPesquisa(e.target.value); setMostrarDropdown(true); }}
              onFocus={() => setMostrarDropdown(true)}
              placeholder="Digite a morada do seu alojamento..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] text-sm"
            />
            {mostrarDropdown && listaFiltrada.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {listaFiltrada.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelecionarSugestao(item)} 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="font-medium text-sm text-gray-900">{item.titulo}</div>
                    <div className="text-xs text-gray-500">{item.subtitulo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={numApartamento}
            onChange={(e) => setNumApartamento(e.target.value)}
            placeholder="Número do apartamento / andar (opcional)"
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] text-sm"
          />
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] text-sm"
            />
            <input
              type="text"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              placeholder="Código Postal"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] text-sm"
            />
          </div>
          
          <input
            type="text"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            placeholder="País"
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] text-sm bg-gray-50"
            readOnly
          />
          
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleBack} 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button 
              onClick={handleSaveAddress} 
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 z-10">
        <MapPin size={12} /> Arraste o marcador para ajustar a localização exata
      </div>
    </div>
  );
  
  const renderFaseComodidades = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comodidades</h1>
          <p className="text-gray-600 mb-6">Selecione as comodidades oferecidas pela propriedade</p>
          
          <Comodidades 
            alojamentoId={null}
            onChange={handleComodidadesChange}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button 
              onClick={handleSaveComodidades} 
              className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseRegras = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regras da Casa</h1>
          <p className="text-gray-600 mb-6">Defina as regras para os hóspedes</p>
          
          <Regras 
            alojamentoId={null}
            onChange={handleRegrasChange}
            initialRegras={[]}
            initialRegrasAdicionais={regrasAdicionais}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button 
              onClick={handleSaveRegras} 
              className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseFotos = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos do Alojamento</h1>
          <p className="text-gray-600 mb-6">Adicione fotos para mostrar o seu espaço</p>
          
          <ImagensUpload 
            fotos={fotos} 
            onFotosChange={setFotos} 
            maxFotos={20} 
            alojamentoId={null} 
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button 
              onClick={handleFinalizar} 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Registando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Finalizar Registo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // ==================== RENDER PRINCIPAL ====================
  
  return (
    <>
      {/* Header para todas as fases exceto fase 2 (localização) */}
      {fase !== 2 && (
        <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
          <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <PropMenu 
                nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} 
                onEditName={() => setFase(1)} 
                onEditLocation={() => setFase(2)} 
                onEditComodidades={() => setFase(3)} 
                onEditRegras={() => setFase(4)} 
              />
              <div className="text-[10px] opacity-80">
                Passo {fase} de 5
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
      
      {/* Header especial para fase 2 (localização) */}
      {fase === 2 && (
        <header className="absolute top-0 left-0 right-0 bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm z-20">
          <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <PropMenu 
                nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} 
                onEditName={() => setFase(1)} 
                onEditLocation={() => setFase(2)} 
                onEditComodidades={() => setFase(3)} 
                onEditRegras={() => setFase(4)} 
              />
            </div>
            <div className="w-[1px] h-6 bg-blue-900"></div>
            <User size={22} className="cursor-pointer" />
          </div>
        </header>
      )}
      
      {/* Barra de progresso para fases 1, 3, 4, 5 */}
      {fase !== 2 && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          {renderProgressBar()}
        </div>
      )}
      
      {/* Renderização das fases */}
      {fase === 1 && renderFaseInformacoes()}
      {fase === 2 && renderFaseLocalizacao()}
      {fase === 3 && renderFaseComodidades()}
      {fase === 4 && renderFaseRegras()}
      {fase === 5 && renderFaseFotos()}
    </>
  );
};

export default FluxoRegisto;