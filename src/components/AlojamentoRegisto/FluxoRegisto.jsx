// src/components/AlojamentoRegisto/FluxoRegisto.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight, Search, MapPin, Loader } from 'lucide-react';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao'; // Importe o componente de localização
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
  
  // FASE 2 - Localização (usando o novo componente)
  const [localizacaoDados, setLocalizacaoDados] = useState({
    endereco: '',
    cidade: '',
    ilha: '',
    codigo_postal: '',
    num_apartamento: '',
    morada_completa: '',
    coordenadas: { lat: null, lng: null }
  });
  
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
  
  // Handler para localização
  const handleLocalizacaoChange = useCallback((dados) => {
    console.log('📍 Localização atualizada:', dados);
    setLocalizacaoDados(dados);
    localStorage.setItem('propertyLocalizacao', JSON.stringify(dados));
    
    // Também salvar no formato antigo para compatibilidade
    const dadosMorada = {
      morada: dados.endereco,
      apartamento: dados.num_apartamento,
      pais: 'Cabo Verde',
      cidade: dados.cidade,
      ilha: dados.ilha,
      codigoPostal: dados.codigo_postal,
      moradaCompleta: dados.morada_completa,
      coordenadas: dados.coordenadas
    };
    localStorage.setItem('propertyAddress', JSON.stringify(dadosMorada));
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
      
      // Localização (novo formato)
      const savedLocalizacao = localStorage.getItem('propertyLocalizacao');
      if (savedLocalizacao) {
        const parsed = JSON.parse(savedLocalizacao);
        setLocalizacaoDados(parsed);
      } else {
        // Tentar carregar do formato antigo
        const savedAddress = localStorage.getItem('propertyAddress');
        if (savedAddress) {
          const address = JSON.parse(savedAddress);
          setLocalizacaoDados({
            endereco: address.morada || '',
            cidade: address.cidade || '',
            ilha: address.ilha || '',
            codigo_postal: address.codigoPostal || '',
            num_apartamento: address.apartamento || '',
            morada_completa: address.moradaCompleta || '',
            coordenadas: address.coordenadas || { lat: null, lng: null }
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
  
  const handleSaveLocalizacao = () => {
    if (!localizacaoDados.endereco?.trim()) {
      alert('Por favor, insira o endereço');
      return false;
    }
    if (!localizacaoDados.cidade?.trim()) {
      alert('Por favor, insira a cidade');
      return false;
    }
    if (!localizacaoDados.ilha?.trim()) {
      alert('Por favor, selecione a ilha');
      return false;
    }
    
    setFase(3);
    return true;
  };
  
  const handleSaveComodidades = () => {
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesSelecionadas));
    setFase(4);
    return true;
  };
  
  const handleSaveRegras = () => {
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
      console.log('📤 Localização:', localizacaoDados);
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
        localizacao: localizacaoDados.cidade,
        latitude: localizacaoDados.coordenadas?.lat || 16.8884,
        longitude: localizacaoDados.coordenadas?.lng || -24.9896,
        comodidades: comodidadesIds,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais,
        morada: {
          endereco: localizacaoDados.endereco,
          apartamento: localizacaoDados.num_apartamento,
          cidade: localizacaoDados.cidade,
          ilha: localizacaoDados.ilha,
          codigo_postal: localizacaoDados.codigo_postal,
          pais: 'Cabo Verde',
          morada_completa: localizacaoDados.morada_completa,
          lat: localizacaoDados.coordenadas?.lat || 16.8884,
          lng: localizacaoDados.coordenadas?.lng || -24.9896
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
        localStorage.removeItem('propertyLocalizacao');
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📍 Localização do Alojamento</h2>
          <p className="text-gray-600 mb-6">Onde fica a sua propriedade?</p>
          
          <RegistarLocalizacao
            dados={localizacaoDados}
            onChange={handleLocalizacaoChange}
            alojamentoId={alojamentoId}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-6">
            <button 
              onClick={handleBack} 
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Voltar
            </button>
            <button 
              onClick={handleSaveLocalizacao}
              className="px-6 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
            >
              Continuar
            </button>
          </div>
        </div>
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
      {/* Header */}
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
      
      {/* Barra de progresso */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {renderProgressBar()}
      </div>
      
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