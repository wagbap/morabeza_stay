// src/components/AlojamentoRegisto/EditarAlojamento.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight } from 'lucide-react';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import { salvarFluxoRegisto, buscarAlojamentoParaEdicao, buscarQuartosDoAlojamento, buscarLocalizacaoPersistente } from '../../services/apiService';
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

// 🔥 FUNÇÃO PARA EXTRAIR CIDADE DO ENDEREÇO
const extrairCidadeDoEndereco = (endereco) => {
  if (!endereco) return '';
  
  // Lista de cidades de Cabo Verde
  const cidadesCV = [
    'Mindelo', 'Praia', 'Santa Maria', 'Espargos', 'Sal Rei', 
    'Cidade Velha', 'Tarrafal', 'São Filipe', 'Ribeira Grande', 
    'Porto Novo', 'Assomada', 'Pedra Badejo', 'Calheta', 'Pombas'
  ];
  
  // Tentar encontrar cidade no endereço
  for (const cidade of cidadesCV) {
    if (endereco.toLowerCase().includes(cidade.toLowerCase())) {
      return cidade;
    }
  }
  
  // Se não encontrar, tentar extrair da lista BASE_ENDERECOS_CV
  const encontrado = BASE_ENDERECOS_CV.find(item => 
    endereco.toLowerCase().includes(item.titulo.toLowerCase()) ||
    endereco.toLowerCase().includes(item.cidade.toLowerCase())
  );
  
  return encontrado ? encontrado.cidade : '';
};

// 🔥 FUNÇÃO PARA EXTRAIR CÓDIGO POSTAL DO ENDEREÇO
const extrairCodigoPostalDoEndereco = (endereco) => {
  if (!endereco) return '';
  
  const encontrado = BASE_ENDERECOS_CV.find(item => 
    endereco.toLowerCase().includes(item.titulo.toLowerCase()) ||
    endereco.toLowerCase().includes(item.cidade.toLowerCase())
  );
  
  return encontrado ? encontrado.codigoPostal : '';
};

const EditarAlojamento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(id ? parseInt(id) : null);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);
  
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
  
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState([]);
  const [regras, setRegras] = useState([]);
  const [regrasAdicionais, setRegrasAdicionais] = useState('');
  const [fotos, setFotos] = useState([]);
  
  // 🔥 FUNÇÃO CORRIGIDA PARA CARREGAR TODOS OS DADOS
  const carregarDadosAlojamento = async (alojamentoIdParam) => {
    if (!alojamentoIdParam) return;
    
    setIsLoading(true);
    try {
      console.log(`📥 Carregando alojamento ID: ${alojamentoIdParam} para edição`);
      
      // Buscar dados completos do alojamento
      const resultado = await buscarAlojamentoParaEdicao(alojamentoIdParam);
      console.log('📦 Dados carregados:', resultado);
      
      if (resultado.success && resultado.data) {
        const dados = resultado.data;
        
        // 1. Preparar o objeto de Informações Básicas
        const infoBasicas = {
          titulo: dados.titulo || '',
          tipo_propriedade: dados.tipo_propriedade || 'Apartamento',
          capacidade: dados.capacidade || 2,
          estrelas: dados.estrelas || 4.5,
          descricao: dados.descricao || '',
          descricao_detalhada: dados.descricao_detalhada || '',
          preco_noite: dados.preco_noite || '',
          tempo_resposta: dados.tempo_resposta || 'Dentro de 1 hora',
          quartos: dados.quartos || 1,
          camas: dados.camas || 1,
          casas_banho: dados.casas_banho || 1
        };
        
        setInformacoesBasicas(infoBasicas);
        
        // 2. Carregar Quartos
        let quartosDaBd = [];
        if (dados.quartos && Array.isArray(dados.quartos) && dados.quartos.length > 0) {
          quartosDaBd = dados.quartos;
        } else {
          const quartosResult = await buscarQuartosDoAlojamento(alojamentoIdParam);
          if (quartosResult.success && quartosResult.data) {
            quartosDaBd = quartosResult.data;
          }
        }
        setQuartosSelecionados(quartosDaBd);
        
        // 3. 🔥 CARREGAR MORADA COMPLETAMENTE
        console.log('📍 Processando morada...');
        
        // Tentar buscar localização da API específica
        const locResult = await buscarLocalizacaoPersistente(alojamentoIdParam);
        console.log('📍 Localização da API:', locResult);
        
        if (locResult.success && locResult.data) {
          // Dados da API
          const enderecoCompleto = locResult.data.endereco || '';
          const numApt = locResult.data.num_apartamento || locResult.data.apartamento || '';
          
          // 🔥 EXTRAIR CIDADE E CÓDIGO POSTAL DO ENDEREÇO
          const cidadeExtraida = extrairCidadeDoEndereco(enderecoCompleto);
          const codigoPostalExtraido = extrairCodigoPostalDoEndereco(enderecoCompleto);
          
          setPesquisa(enderecoCompleto.split(',')[0] || enderecoCompleto);
          setNumApartamento(numApt);
          setMoradaCompleta(enderecoCompleto);
          setCidade(cidadeExtraida);
          setCodigoPostal(codigoPostalExtraido);
          setPais('Cabo Verde');
          
          console.log('📍 Cidade extraída da API:', cidadeExtraida);
          console.log('📍 Código Postal extraído da API:', codigoPostalExtraido);
          
          if (locResult.data.coordenadas?.lat) {
            setViewState({
              latitude: locResult.data.coordenadas.lat,
              longitude: locResult.data.coordenadas.lng,
              zoom: 16
            });
          }
        } 
        // Fallback: usar dados.morada se existir
        else if (dados.morada) {
          console.log('📍 Usando dados.morada como fallback:', dados.morada);
          
          const enderecoMorada = dados.morada.morada || dados.morada.endereco || '';
          const enderecoCompletoMorada = dados.morada.moradaCompleta || dados.morada.endereco || '';
          const numAptMorada = dados.morada.apartamento || dados.morada.num_apartamento || '';
          
          // 🔥 EXTRAIR CIDADE E CÓDIGO POSTAL DO ENDEREÇO
          const cidadeExtraida = extrairCidadeDoEndereco(enderecoMorada || enderecoCompletoMorada);
          const codigoPostalExtraido = extrairCodigoPostalDoEndereco(enderecoMorada || enderecoCompletoMorada);
          
          setPesquisa(enderecoMorada);
          setNumApartamento(numAptMorada);
          setPais(dados.morada.pais || 'Cabo Verde');
          setCidade(cidadeExtraida || dados.morada.cidade || '');
          setCodigoPostal(codigoPostalExtraido || dados.morada.codigoPostal || dados.morada.codigo_postal || '');
          setMoradaCompleta(enderecoCompletoMorada);
          
          console.log('📍 Cidade extraída do fallback:', cidadeExtraida);
          
          if (dados.morada.coordenadas) {
            setViewState({
              latitude: dados.morada.coordenadas.lat,
              longitude: dados.morada.coordenadas.lng,
              zoom: 16
            });
          }
        }
        
        // 4. Comodidades, Regras e Fotos
        const comodidadesList = Array.isArray(dados.comodidades) ? dados.comodidades : [];
        setComodidadesSelecionadas(comodidadesList);
        
        const regrasList = dados.regras?.regras || [];
        const regrasAdd = dados.regras?.regrasAdicionais || '';
        setRegras(regrasList);
        setRegrasAdicionais(regrasAdd);
        
        const fotosList = Array.isArray(dados.fotos) ? dados.fotos : [];
        setFotos(fotosList);
        
        // 5. Salvar no localStorage
        setAlojamentoId(dados.id);
        localStorage.setItem('propertyAlojamentoId', dados.id);
        localStorage.setItem('propertyInformacoesBasicas', JSON.stringify(infoBasicas));
        localStorage.setItem('propertyQuartos', JSON.stringify(quartosDaBd));
        
        // Salvar morada no localStorage
        const moradaObj = {
          morada: pesquisa || dados.morada?.morada || '',
          endereco: moradaCompleta || dados.morada?.endereco || '',
          apartamento: numApartamento || dados.morada?.apartamento || '',
          num_apartamento: numApartamento || dados.morada?.num_apartamento || '',
          pais: pais || dados.morada?.pais || 'Cabo Verde',
          cidade: cidade || dados.morada?.cidade || '',
          codigoPostal: codigoPostal || dados.morada?.codigoPostal || '',
          codigo_postal: codigoPostal || dados.morada?.codigo_postal || '',
          moradaCompleta: moradaCompleta || dados.morada?.moradaCompleta || '',
          coordenadas: viewState || dados.morada?.coordenadas || { lat: 16.8884, lng: -24.9896 }
        };
        localStorage.setItem('propertyAddress', JSON.stringify(moradaObj));
        localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesList));
        localStorage.setItem('propertyRegras', JSON.stringify({ regras: regrasList, regrasAdicionais: regrasAdd }));
        localStorage.setItem('propertyFotos', JSON.stringify(fotosList));
        
        console.log('✅ Todos os dados carregados com sucesso!');
        console.log('📍 Cidade:', cidade);
        console.log('📍 Código Postal:', codigoPostal);
        console.log('📍 País:', pais);
        
      } else {
        alert(`Erro ao carregar dados do alojamento: ${resultado.message}`);
        navigate('/alojamento-registro/meus');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      alert('Erro ao carregar dados do alojamento. Tente novamente.');
      navigate('/alojamento-registro/meus');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) carregarDadosAlojamento(id);
  }, [id]);
  
  const listaFiltrada = useMemo(() => {
    if (!pesquisa || pesquisa.trim() === '') return [];
    return BASE_ENDERECOS_CV.filter(item =>
      item.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.subtitulo.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);
  
  const handleSaveInformacoes = () => {
    if (!informacoesBasicas.titulo.trim()) { alert('O título da propriedade é obrigatório'); return false; }
    if (!informacoesBasicas.descricao.trim()) { alert('A descrição curta é obrigatória'); return false; }
    if (!informacoesBasicas.preco_noite) { alert('O preço por noite é obrigatório'); return false; }
    
    const infoComQuartos = { ...informacoesBasicas, quartos: quartosSelecionados };
    localStorage.setItem('propertyInformacoesBasicas', JSON.stringify(infoComQuartos));
    setFase(2);
    return true;
  };
  
  const handleSelecionarSugestao = (item) => {
    console.log('📍 Selecionando sugestão:', item);
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
    console.log(`📍 Marcador movido para: lat=${lat}, lng=${lng}`);
  };
  
  const handleSaveAddress = () => {
    if (!pesquisa.trim()) { alert('Por favor, insira a morada'); return false; }
    if (!cidade.trim()) { alert('Por favor, insira a cidade'); return false; }
    
    const dadosMorada = {
      morada: pesquisa,
      endereco: pesquisa,
      apartamento: numApartamento,
      num_apartamento: numApartamento,
      pais: pais,
      cidade: cidade,
      codigoPostal: codigoPostal,
      codigo_postal: codigoPostal,
      moradaCompleta: `${pesquisa}${numApartamento ? `, ${numApartamento}` : ''}, ${cidade}, ${codigoPostal}, ${pais}`,
      coordenadas: { lat: viewState.latitude, lng: viewState.longitude }
    };
    
    console.log('💾 Salvando morada:', dadosMorada);
    localStorage.setItem('propertyAddress', JSON.stringify(dadosMorada));
    setFase(3);
    return true;
  };
  
  const handleSaveComodidades = () => {
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesSelecionadas));
    setFase(4);
    return true;
  };
  
  const handleRegrasChange = (dadosRegras) => {
    setRegras(dadosRegras.regras);
    setRegrasAdicionais(dadosRegras.regrasAdicionais);
  };
  
  const handleSaveRegras = () => {
    localStorage.setItem('propertyRegras', JSON.stringify({ regras, regrasAdicionais }));
    setFase(5);
    return true;
  };
  
  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const dadosParaAPI = {
        proprietario_id: 1,
        informacoes: informacoesBasicas,
        morada: {
          morada: pesquisa,
          endereco: pesquisa,
          apartamento: numApartamento,
          num_apartamento: numApartamento,
          pais: pais,
          cidade: cidade,
          codigoPostal: codigoPostal,
          codigo_postal: codigoPostal,
          moradaCompleta: moradaCompleta,
          coordenadas: { lat: viewState.latitude, lng: viewState.longitude }
        },
        comodidades: comodidadesSelecionadas.map(c => c.id || c),
        regras: {
          regras_ids: regras.map(r => r.id || r),
          regras_adicionais: regrasAdicionais
        },
        quartos: quartosSelecionados,
        fotos: fotos
      };
      
      const result = await salvarFluxoRegisto(dadosParaAPI, alojamentoId);
      
      if (result.success) {
        localStorage.removeItem('propertyInformacoesBasicas');
        localStorage.removeItem('propertyAddress');
        localStorage.removeItem('propertyComodidades');
        localStorage.removeItem('propertyRegras');
        localStorage.removeItem('propertyQuartos');
        
        alert(`✅ ${result.message}`);
        navigate('/alojamento-registro/meus');
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      alert('Erro ao processar o registo. Tente novamente.\n' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => { if (fase > 1) setFase(fase - 1); else navigate('/alojamento-registro/meus'); };
  const handleEditInfo = () => setFase(1);
  const handleEditLocation = () => setFase(2);
  const handleEditComodidades = () => setFase(3);
  const handleEditRegras = () => setFase(4);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#006ce4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do alojamento...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }
  
  const renderProgressBar = () => {
    const fasesLista = ['Informações', 'Localização', 'Comodidades', 'Regras', 'Fotos'];
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {fasesLista.map((nome, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`text-xs font-medium ${fase > index + 1 ? 'text-[#006ce4]' : fase === index + 1 ? 'text-[#006ce4]' : 'text-gray-400'}`}>{nome}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {fasesLista.map((_, index) => (
            <div key={index} className={`h-1 flex-1 rounded-full ${fase > index + 1 ? 'bg-[#006ce4]' : fase === index + 1 ? 'bg-[#006ce4]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  };
  
  const renderFaseInformacoes = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar informações da propriedade</h1>
          <p className="text-gray-600 mb-8">Atualize os dados principais do seu alojamento.</p>
          
          <InformacoesBasicas 
            dados={informacoesBasicas}
            onDadosChange={setInformacoesBasicas}
            onQuartosChange={setQuartosSelecionados}
            onNext={handleSaveInformacoes}
            alojamentoId={alojamentoId}  
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
  
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
            <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-gray-800 mb-1">Cidade</label><input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Mindelo, Praia, Santa Maria..." className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div><div><label className="block text-xs font-bold text-gray-800 mb-1">Código postal</label><input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder="Ex: 2110, 7110" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div></div>
            <div className="flex gap-2 pt-2"><button onClick={handleBack} className="p-2.5 border border-[#006ce4] text-[#006ce4] bg-white rounded-md"><ArrowLeft size={18} /></button><button onClick={handleSaveAddress} className="flex-1 bg-[#006ce4] text-white py-2.5 px-4 rounded-md">Continuar</button></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseComodidades = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comodidades da propriedade</h1>
          <p className="text-gray-600 mb-6">Selecione todas as comodidades disponíveis.</p>
          
          <Comodidades 
            alojamentoId={alojamentoId}
            onChange={(selecionadas) => {
              setComodidadesSelecionadas(selecionadas);
              localStorage.setItem('propertyComodidades', JSON.stringify(selecionadas));
            }}
            readOnly={false}
          />
          
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveComodidades} className="flex-1 bg-[#006ce4] text-white py-2.5 rounded-lg flex items-center justify-center gap-2">
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseRegras = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={20} /><span>Voltar</span></button>
        {renderProgressBar()}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regras da casa</h1>
          <p className="text-gray-600 mb-6">Defina as regras e políticas da sua propriedade.</p>
          
          <Regras 
            alojamentoId={alojamentoId}
            onChange={handleRegrasChange}
            initialRegras={regras}
            initialRegrasAdicionais={regrasAdicionais}
            readOnly={false}
          />
          
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveRegras} className="flex-1 bg-[#006ce4] text-white py-2.5 rounded-lg flex items-center justify-center gap-2">
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
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={20} /><span>Voltar</span></button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos da sua propriedade</h1>
          <p className="text-gray-600 mb-8">As primeiras impressões são visuais. Adicione fotos de alta qualidade para atrair mais hóspedes.</p>
          
          <ImagensUpload fotos={fotos} onFotosChange={setFotos} maxFotos={20} />
          
          <div className="flex gap-3 mt-8">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Voltar</button>
            <button onClick={handleFinalizar} disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Atualizando...</>) : (<>Atualizar Registo <Check size={18} /></>)}
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
                alojamentoId={alojamentoId}
                onEditName={handleEditInfo} 
                onEditLocation={handleEditLocation} 
                onEditComodidades={handleEditComodidades} 
                onEditRegras={handleEditRegras}
              />
              <div className="text-[10px] opacity-80">
                {fase === 1 && 'Editar informações'}
                {fase === 3 && `${comodidadesSelecionadas.length} comodidade(s)`}
                {fase === 4 && `${regras.length} regra(s)`}
                {fase === 5 && `${fotos.length} foto(s)`}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-blue-900"></div>
            <div className="cursor-pointer hover:underline">PT</div>
            <div className="flex items-center gap-2 cursor-pointer hover:underline"><span>Ajuda</span> <HelpCircle size={18} /></div>
            <User size={24} className="cursor-pointer" />
          </div>
        </header>
      )}
      
      {fase === 2 && (
        <header className="absolute top-0 left-0 right-0 bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm z-20">
          <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right"><PropMenu nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} alojamentoId={alojamentoId} /></div>
            <div className="w-[1px] h-8 bg-blue-900"></div>
            <div className="cursor-pointer hover:underline">PT</div>
            <div className="flex items-center gap-2 cursor-pointer hover:underline"><span>Ajuda</span> <HelpCircle size={18} /></div>
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

export default EditarAlojamento;