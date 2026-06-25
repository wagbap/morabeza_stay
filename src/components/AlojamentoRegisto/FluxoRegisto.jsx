// src/components/AlojamentoRegisto/FluxoRegisto.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight, Loader } from 'lucide-react';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao';
import { salvarFluxoRegisto, buscarAlojamentoParaEdicao } from '../../services/apiService';
import 'mapbox-gl/dist/mapbox-gl.css';

const FluxoRegisto = () => {
  const navigate = useNavigate();
  
  // Estados das fases
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
  const [localizacaoDados, setLocalizacaoDados] = useState({
    endereco: '',
    cidade: '',
    ilha: '',
    codigo_postal: '',
    num_apartamento: '',
    morada_completa: '',
    latitude: null,
    longitude: null,
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
  const isEditing = useRef(false);
  
  // ==================== CARREGAR DADOS PARA EDIÇÃO ====================
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      isEditing.current = true;
      setAlojamentoId(parseInt(id));
      carregarDadosParaEdicao(parseInt(id));
    }
  }, []);
  
  const carregarDadosParaEdicao = async (id) => {
    setIsLoading(true);
    try {
      console.log(`🔍 Carregando dados para edição do alojamento #${id}`);
      
      const result = await buscarAlojamentoParaEdicao(id);
      
      if (!result.success || !result.data) {
        console.error('❌ Erro ao carregar dados:', result.message);
        alert('Erro ao carregar dados do alojamento para edição.');
        return;
      }
      
      const data = result.data;
      console.log('📦 Dados carregados:', data);
      
      // 1. Preencher Informações Básicas
      setInformacoesBasicas({
        titulo: data.titulo || '',
        tipo_propriedade: data.tipo_propriedade || data.tipo || 'Apartamento',
        capacidade: data.capacidade || 2,
        estrelas: data.estrelas || 4.5,
        descricao: data.descricao || '',
        descricao_detalhada: data.descricao_detalhada || '',
        preco_noite: data.preco_noite || '',
        tempo_resposta: data.tempo_resposta || 'Dentro de 1 hora',
        quartos: data.quartos || 1,
        camas: data.camas || 1,
        casas_banho: data.casas_banho || 1
      });
      
      // 2. Preencher Localização
      if (data.morada) {
        const morada = data.morada;
        setLocalizacaoDados({
          endereco: morada.endereco || data.localizacao || '',
          cidade: morada.cidade || data.cidade || '',
          ilha: morada.ilha || data.ilha || '',
          codigo_postal: morada.codigo_postal || morada.codigoPostal || data.codigo_postal || '',
          num_apartamento: morada.num_apartamento || morada.apartamento || data.num_apartamento || '',
          morada_completa: morada.morada_completa || data.morada_completa || '',
          latitude: morada.coordenadas?.lat || morada.lat || data.latitude || null,
          longitude: morada.coordenadas?.lng || morada.lng || data.longitude || null,
          coordenadas: {
            lat: morada.coordenadas?.lat || morada.lat || data.latitude || null,
            lng: morada.coordenadas?.lng || morada.lng || data.longitude || null
          }
        });
      } else {
        setLocalizacaoDados({
          endereco: data.localizacao || '',
          cidade: data.cidade || '',
          ilha: data.ilha || '',
          codigo_postal: data.codigo_postal || '',
          num_apartamento: data.num_apartamento || '',
          morada_completa: data.morada_completa || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          coordenadas: {
            lat: data.latitude || null,
            lng: data.longitude || null
          }
        });
      }
      
      // 3. Preencher Comodidades
      if (data.comodidades && Array.isArray(data.comodidades)) {
        setComodidadesSelecionadas(data.comodidades);
      }
      
      // 4. Preencher Regras
      if (data.regras) {
        if (data.regras.regras_ids) {
          setRegrasIds(data.regras.regras_ids);
        } else if (Array.isArray(data.regras)) {
          const ids = data.regras.map(r => r.id || r);
          setRegrasIds(ids);
          setRegrasObjetos(data.regras);
        }
        setRegrasAdicionais(data.regras.regras_adicionais || data.regras_adicionais || '');
      }
      
      // 5. Preencher Fotos
      if (data.fotos && Array.isArray(data.fotos)) {
        setFotos(data.fotos);
      }
      
      // 6. Preencher Quartos
      if (data.quartos && Array.isArray(data.quartos)) {
        setQuartosParaEnviar(data.quartos);
      }
      
      console.log('✅ Dados carregados com sucesso para edição!');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados para edição:', error);
      alert('Erro ao carregar dados do alojamento para edição.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== HANDLERS ====================
  
  const handleQuartosChange = useCallback((novosQuartos) => {
    console.log('📦 Quartos atualizados:', novosQuartos);
    const quartosArray = Array.isArray(novosQuartos) ? novosQuartos : [];
    setQuartosParaEnviar(quartosArray);
  }, []);
  
  const handleComodidadesChange = useCallback((comodidades) => {
    console.log('📦 Comodidades selecionadas:', comodidades);
    const comodidadesArray = Array.isArray(comodidades) ? comodidades : [];
    setComodidadesSelecionadas(comodidadesArray);
  }, []);
  
  const handleRegrasChange = useCallback((dadosRegras) => {
    console.log('📋 Regras recebidas:', dadosRegras);
    const ids = dadosRegras.regras_ids || [];
    const texto = dadosRegras.regrasAdicionais || '';
    
    setRegrasIds(ids);
    setRegrasAdicionais(texto);
    setRegrasObjetos(dadosRegras.regras || []);
    console.log('✅ Regras IDs:', ids);
  }, []);
  
  const handleLocalizacaoChange = useCallback((dados) => {
    console.log('📍 Localização atualizada:', dados);
    setLocalizacaoDados(dados);
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
    setFase(4);
    return true;
  };
  
  const handleSaveRegras = () => {
    setFase(5);
    return true;
  };
  
  // ==================== FINALIZAR REGISTO (ÚNICA VERSÃO) ====================
  
  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (fotos.length === 0) {
        alert('⚠️ Adicione pelo menos uma foto do seu alojamento');
        setIsSubmitting(false);
        return;
      }
      
      let quartosFinal = Array.isArray(quartosParaEnviar) ? quartosParaEnviar : [];
      
      const quartosFormatados = quartosFinal.map(q => ({
        tipo_quarto_id: q.tipo_quarto_id,
        quantidade_disponivel: q.quantidade_disponivel || 1,
        preco_personalizado: q.preco_personalizado || null
      }));
      
      const comodidadesIds = comodidadesSelecionadas.map(c => c.id || c);
      
      // ✅ EXTRAIR CIDADE E ILHA DO localizacaoDados
      const cidade = localizacaoDados.cidade || '';
      const ilha = localizacaoDados.ilha || '';
      const endereco = localizacaoDados.endereco || '';
      const codigo_postal = localizacaoDados.codigo_postal || '';
      const num_apartamento = localizacaoDados.num_apartamento || '';
      const morada_completa = localizacaoDados.morada_completa || '';
      const latitude = localizacaoDados.coordenadas?.lat || localizacaoDados.latitude || null;
      const longitude = localizacaoDados.coordenadas?.lng || localizacaoDados.longitude || null;

      console.log('📍 Cidade do localizacaoDados:', cidade);
      console.log('📍 Ilha do localizacaoDados:', ilha);
      console.log('📍 localizacaoDados completo:', localizacaoDados);
      
      // ==================== CORREÇÃO DAS IMAGENS ====================
      // Garantir que cada imagem tenha 'url' e 'principal'
      const imagensFormatadas = fotos
        .filter(foto => {
          // Verificar se tem URL em qualquer formato
          const hasUrl = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho;
          if (!hasUrl) {
            console.warn('⚠️ Imagem sem URL encontrada:', foto);
          }
          return hasUrl;
        })
        .map((foto, index) => {
          // 🔥 PEGAR A URL DE QUALQUER LUGAR
          const url = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho || '';
          
          return {
            url: url,
            caminho_url: url, // Para compatibilidade com o backend
            principal: index === 0 ? 1 : 0,
            ordem: index
          };
        });

      console.log('📸 Imagens formatadas:', imagensFormatadas);
      
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
        
        // ✅ CAMPOS DE LOCALIZAÇÃO DIRETOS (OBRIGATÓRIOS)
        cidade: cidade,
        ilha: ilha,
        endereco: endereco,
        localizacao: endereco,
        codigo_postal: codigo_postal,
        num_apartamento: num_apartamento,
        morada_completa: morada_completa,
        latitude: latitude,
        longitude: longitude,
        
        comodidades: comodidadesIds,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais,
        
        morada: {
          endereco: endereco,
          apartamento: num_apartamento,
          cidade: cidade,
          ilha: ilha,
          codigo_postal: codigo_postal,
          pais: 'Cabo Verde',
          morada_completa: morada_completa,
          lat: latitude,
          lng: longitude,
          coordenadas: { lat: latitude, lng: longitude }
        },
        
        quartos: quartosFormatados,
        
        // ==================== IMAGENS CORRIGIDAS ====================
        imagens: imagensFormatadas,
        fotos: imagensFormatadas // Também enviar como fotos para compatibilidade
      };

      console.log('📤 Payload final:', JSON.stringify(dadosParaAPI, null, 2));
      console.log('📍 Cidade no payload final:', dadosParaAPI.cidade);
      console.log('📍 Ilha no payload final:', dadosParaAPI.ilha);
      console.log('📸 Imagens no payload final:', dadosParaAPI.imagens);
      
      const result = await salvarFluxoRegisto(dadosParaAPI, alojamentoId);
      
      if (result.success) {
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
            alojamentoId={alojamentoId} 
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
            alojamentoId={alojamentoId}
            onChange={handleComodidadesChange}
            initialComodidades={comodidadesSelecionadas}
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
            alojamentoId={alojamentoId}
            onChange={handleRegrasChange}
            initialRegras={regrasObjetos}
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
            alojamentoId={alojamentoId} 
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
                  {alojamentoId ? 'Atualizando...' : 'Registando...'}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {alojamentoId ? 'Atualizar Alojamento' : 'Finalizar Registo'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-[#006ce4]" size={48} />
          <p className="mt-4 text-gray-600">Carregando dados do alojamento...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>

<header className="bg-[#003580] text-white px-4 py-2 flex items-center justify-between shadow-sm">
  {/* Lado esquerdo - Logo */}
  <div className="flex items-center">
    <div className="font-bold text-lg tracking-tight truncate max-w-[140px]">
      morabezastay.cv
    </div>
  </div>

  {/* Lado direito - Menu e ações */}
  <div className="flex items-center gap-3">
    {/* Info do passo - versão mobile compacta */}
    <div className="flex flex-col items-end">
      <PropMenu 
        nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} 
        onEditName={() => setFase(1)} 
        onEditLocation={() => setFase(2)} 
        onEditComodidades={() => setFase(3)} 
        onEditRegras={() => setFase(4)} 
      />
      <div className="text-[8px] opacity-80 mt-0.5">
        {alojamentoId ? 'Editando' : 'Novo'} {fase}/5
      </div>
    </div>

    {/* Divider vertical */}
    <div className="w-[1px] h-6 bg-blue-900"></div>

    {/* Botão ajuda mobile */}
    <div className="flex items-center gap-1 cursor-pointer hover:underline">
      <HelpCircle size={16} />
    </div>
  </div>
</header>
      
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {renderProgressBar()}
      </div>
      
      {fase === 1 && renderFaseInformacoes()}
      {fase === 2 && renderFaseLocalizacao()}
      {fase === 3 && renderFaseComodidades()}
      {fase === 4 && renderFaseRegras()}
      {fase === 5 && renderFaseFotos()}
    </>
  );
};

export default FluxoRegisto;