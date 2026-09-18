// src/components/AlojamentoRegisto/FluxoRegisto.jsx
import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight, Loader, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao';
import { salvarFluxoRegisto, buscarAlojamentoParaEdicao } from '../../services/apiService';
import 'mapbox-gl/dist/mapbox-gl.css';
import { modeloVendaPorTipo, aceitaQuartos } from '../../utils/tipoAlojamento';

// ==================== TOAST INTERNO (Garante que nunca dá erro de Provider) ====================
const ToastContext = createContext(null);

const ToastProviderInterno = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white bg-gray-900 border border-gray-800 transition-all">
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-400 shrink-0" />}
          <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

// ==================== COMPONENTE PRINCIPAL ====================
const FluxoRegistoContent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  // ==================== MODELO DE VENDA (DERIVADO DO TIPO) ====================

  // Modelo de venda derivado do tipo de propriedade escolhido
  const modeloVenda = modeloVendaPorTipo(informacoesBasicas.tipo_propriedade);
  const mostraQuartos = modeloVenda === 'por_quarto';

  // 🔎 Diagnóstico temporário — apaga quando confirmares que funciona
  useEffect(() => {
    console.log(
      '🔎 tipo:', informacoesBasicas.tipo_propriedade,
      '→ modelo:', modeloVenda,
      '→ mostraQuartos:', mostraQuartos
    );
  }, [informacoesBasicas.tipo_propriedade, modeloVenda, mostraQuartos]);

  // Quando o tipo muda para "inteiro", limpar quartos já selecionados
  useEffect(() => {
    if (!mostraQuartos && quartosParaEnviar.length > 0) {
      console.log('🏠 Tipo inteiro — a limpar quartos selecionados');
      setQuartosParaEnviar([]);
    }
  }, [mostraQuartos, quartosParaEnviar.length]);

  // ==================== CLEANUP PARA NOVO REGISTO ====================

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      console.log('🧹 Novo registo - limpando dados antigos...');

      try {
        const storageKeys = [
          'quartos_temporarios', 'quartos_editando', 'quartos_alojamento_id',
          'informacoes_basicas_temp', 'localizacao_temp', 'comodidades_temp',
          'regras_temp', 'fotos_temp'
        ];

        storageKeys.forEach(key => {
          if (localStorage.getItem(key)) localStorage.removeItem(key);
        });

        const sessionKeys = ['quartos_temp', 'alojamento_temp'];
        sessionKeys.forEach(key => {
          if (sessionStorage.getItem(key)) sessionStorage.removeItem(key);
        });

      } catch (error) {
        console.warn('⚠️ Erro ao limpar localStorage:', error);
      }

      setQuartosParaEnviar([]);
      setFotos([]);
      setComodidadesSelecionadas([]);
      setRegrasIds([]);
      setRegrasAdicionais('');
      setRegrasObjetos([]);
      setAlojamentoId(null);
    }
  }, []);

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
      const result = await buscarAlojamentoParaEdicao(id);

      if (!result.success || !result.data) {
        showToast('Erro ao carregar dados do alojamento para edição.', 'error');
        return;
      }

      const data = result.data;

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

      if (data.comodidades && Array.isArray(data.comodidades)) {
        setComodidadesSelecionadas(data.comodidades);
      }

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

      if (data.fotos && Array.isArray(data.fotos)) {
        setFotos(data.fotos);
      }

      if (data.quartos && Array.isArray(data.quartos)) {
        setQuartosParaEnviar(data.quartos);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados para edição:', error);
      showToast('Erro ao carregar dados do alojamento para edição.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleQuartosChange = useCallback((novosQuartos) => {
    const quartosArray = Array.isArray(novosQuartos) ? novosQuartos : [];
    setQuartosParaEnviar(quartosArray);
  }, []);

  const handleComodidadesChange = useCallback((comodidades) => {
    const comodidadesArray = Array.isArray(comodidades) ? comodidades : [];
    setComodidadesSelecionadas(comodidadesArray);
  }, []);

  const handleRegrasChange = useCallback((dadosRegras) => {
    const ids = dadosRegras.regras_ids || [];
    const texto = dadosRegras.regrasAdicionais || '';

    setRegrasIds(ids);
    setRegrasAdicionais(texto);
    setRegrasObjetos(dadosRegras.regras || []);
  }, []);

  const handleLocalizacaoChange = useCallback((dados) => {
    setLocalizacaoDados(dados);
  }, []);

  // ==================== NAVEGAÇÃO ENTRE FASES ====================

  const handleSaveInformacoes = () => {
    if (!informacoesBasicas.titulo.trim()) {
      showToast('O título da propriedade é obrigatório', 'error');
      return false;
    }
    if (!informacoesBasicas.descricao.trim()) {
      showToast('A descrição curta é obrigatória', 'error');
      return false;
    }
    if (!informacoesBasicas.preco_noite) {
      showToast('O preço por noite é obrigatório', 'error');
      return false;
    }

    setFase(2);
    return true;
  };

  const handleSaveLocalizacao = () => {
    if (!localizacaoDados.endereco?.trim()) {
      showToast('Por favor, insira o endereço', 'error');
      return false;
    }
    if (!localizacaoDados.cidade?.trim()) {
      showToast('Por favor, insira a cidade', 'error');
      return false;
    }
    if (!localizacaoDados.ilha?.trim()) {
      showToast('Por favor, selecione a ilha', 'error');
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

  // ==================== FINALIZAR REGISTO ====================

  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (fotos.length === 0) {
        showToast('⚠️ Adicione pelo menos uma foto do seu alojamento', 'error');
        setIsSubmitting(false);
        return;
      }

      let quartosFinal = Array.isArray(quartosParaEnviar) ? quartosParaEnviar : [];

      const quartosFormatados = quartosFinal.map(q => {
        const fotosQuarto = q.fotos || q.imagens || q.quarto_imagens || [];
        const fotosLimpasQuarto = fotosQuarto
          .map(f => (typeof f === 'string' ? f : f.caminho_url || f.url || f.path))
          .filter(Boolean);

        return {
          id: q.id || q.quarto_id || null,
          tipo_quarto_id: q.tipo_quarto_id || q.tipo_catalogo_id || q.id,
          tipo_catalogo_id: q.tipo_catalogo_id || q.tipo_quarto_id,
          quantidade_disponivel: q.quantidade_disponivel || q.quantidade || 1,
          quantidade: q.quantidade ?? q.quantidade_disponivel ?? 1,
          preco_personalizado: q.preco_personalizado ?? q.preco_noite ?? null,
          preco_noite: q.preco_noite ?? q.preco_personalizado ?? null,
          fotos: fotosLimpasQuarto,
          imagens: fotosLimpasQuarto
        };
      });

      const comodidadesIds = comodidadesSelecionadas.map(c => c.id || c);

      const cidade = localizacaoDados.cidade || '';
      const ilha = localizacaoDados.ilha || '';
      const endereco = localizacaoDados.endereco || '';
      const codigo_postal = localizacaoDados.codigo_postal || '';
      const num_apartamento = localizacaoDados.num_apartamento || '';
      const morada_completa = localizacaoDados.morada_completa || '';
      const latitude = localizacaoDados.coordenadas?.lat || localizacaoDados.latitude || null;
      const longitude = localizacaoDados.coordenadas?.lng || localizacaoDados.longitude || null;

      const imagensFormatadas = fotos
        .filter(foto => {
          const hasUrl = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho;
          return hasUrl;
        })
        .map((foto, index) => {
          const url = foto.url || foto.path || foto.caminho_url || foto.src || foto.caminho || '';

          return {
            url: url,
            caminho_url: url,
            principal: index === 0 ? 1 : 0,
            ordem: index
          };
        });

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

        // 🔑 MODELO DE VENDA — derivado do tipo de propriedade
        modelo_venda: modeloVenda,

        // 🔑 Quartos só vão se o modelo for por_quarto
        quartos: mostraQuartos ? quartosFormatados : [],

        imagens: imagensFormatadas,
        fotos: imagensFormatadas
      };

      const result = await salvarFluxoRegisto(dadosParaAPI, alojamentoId);

      if (result.success) {
        showToast(`✅ ${result.message}`, 'success');
        setTimeout(() => navigate('/alojamento-registro/meus'), 1500);
      } else {
        showToast(`⚠️ Erro: ${result.message}`, 'error');
      }

    } catch (error) {
      console.error('❌ Erro ao finalizar:', error);
      showToast('Erro ao processar o registo. Tente novamente.', 'error');
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
            quartosIniciais={quartosParaEnviar}
            alojamentoId={alojamentoId}
            readOnly={false}
            mostraQuartos={mostraQuartos}
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
            <button onClick={handleBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Voltar</button>
            <button onClick={handleSaveLocalizacao} className="px-6 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]">Continuar</button>
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
            <button onClick={handleBack} className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"><ArrowLeft size={18} /> Voltar</button>
            <button onClick={handleSaveComodidades} className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]">Continuar <ChevronRight size={18} /></button>
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
            <button onClick={handleBack} className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"><ArrowLeft size={18} /> Voltar</button>
            <button onClick={handleSaveRegras} className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]">Continuar <ChevronRight size={18} /></button>
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
            quartos={quartosParaEnviar}
            onQuartosChange={handleQuartosChange}
            maxFotos={20}
            alojamentoId={alojamentoId}
            mostraQuartos={mostraQuartos}
          />

          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleBack} className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"><ArrowLeft size={18} /> Voltar</button>
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
        <div className="flex items-center">
          <div className="font-bold text-lg tracking-tight truncate max-w-[140px]">morabezastay.cv</div>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="w-[1px] h-6 bg-blue-900"></div>

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

// Componente Wrapper final que exporta o FluxoRegisto com o Provider interno garantido
const FluxoRegisto = () => (
  <ToastProviderInterno>
    <FluxoRegistoContent />
  </ToastProviderInterno>
);

export default FluxoRegisto;