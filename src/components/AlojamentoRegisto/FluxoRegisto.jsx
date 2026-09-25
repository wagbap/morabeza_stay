// src/components/AlojamentoRegisto/FluxoRegisto.jsx
import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, ChevronRight, Loader, CheckCircle, AlertCircle, Info, X, Save, Eye } from 'lucide-react';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao';
import { salvarFluxoRegisto, buscarAlojamentoParaEdicao } from '../../services/apiService';
import 'mapbox-gl/dist/mapbox-gl.css';
import { modeloVendaPorTipo } from '../../utils/tipoAlojamento';

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

// ==================== CHAVE DO RASCUNHO ====================
const RASCUNHO_KEY = 'morabeza_rascunho_alojamento';

// ==================== COMPONENTE PRINCIPAL ====================
const FluxoRegistoContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Estados das fases
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusAtual, setStatusAtual] = useState('rascunho');
  const [mostrarConfirmacaoRemover, setMostrarConfirmacaoRemover] = useState(false);

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
  const modeloVenda = modeloVendaPorTipo(informacoesBasicas.tipo_propriedade);
  const mostraQuartos = modeloVenda === 'por_quarto';

  // Diagnóstico temporário
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

  // ==================== GUARDAR RASCUNHO NO LOCALSTORAGE ====================
  const guardarRascunhoLocal = () => {
    const dados = {
      fase,
      informacoesBasicas,
      localizacaoDados,
      comodidadesSelecionadas,
      regrasIds,
      regrasAdicionais,
      regrasObjetos,
      fotos,
      quartosParaEnviar,
      modeloVenda,
      atualizadoEm: new Date().toISOString()
    };

    try {
      localStorage.setItem(RASCUNHO_KEY, JSON.stringify(dados));
      showToast('Rascunho guardado localmente', 'success');
    } catch (err) {
      console.error('Erro ao guardar rascunho:', err);
      showToast('Não foi possível guardar o rascunho', 'error');
    }
  };

  // ==================== ABRIR CAIXA DE CONFIRMAÇÃO ====================
  const pedirConfirmacaoRemoverRascunho = () => {
    setMostrarConfirmacaoRemover(true);
  };

  // ==================== CONFIRMAR E REMOVER RASCUNHO ====================
  const confirmarRemoverRascunho = () => {
    localStorage.removeItem(RASCUNHO_KEY);

    // Limpa o formulário
    setInformacoesBasicas({
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
    setLocalizacaoDados({
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
    setComodidadesSelecionadas([]);
    setRegrasIds([]);
    setRegrasAdicionais('');
    setRegrasObjetos([]);
    setFotos([]);
    setQuartosParaEnviar([]);
    setFase(1);
    setAlojamentoId(null);
    setStatusAtual('rascunho');

    navigate('/alojamento-registro', { replace: true });

    setMostrarConfirmacaoRemover(false);
    showToast('Rascunho removido', 'success');
  };

  // ==================== CARREGAR RASCUNHO DO LOCALSTORAGE (só novo registo) ====================
  useEffect(() => {
    const id = searchParams.get('id');

    // Se tem ID → é edição de anúncio já existente → não usa localStorage
    if (id) return;

    try {
      const raw = localStorage.getItem(RASCUNHO_KEY);
      if (!raw) return;

      const dados = JSON.parse(raw);

      if (dados.informacoesBasicas) setInformacoesBasicas(dados.informacoesBasicas);
      if (dados.localizacaoDados) setLocalizacaoDados(dados.localizacaoDados);
      if (dados.comodidadesSelecionadas) setComodidadesSelecionadas(dados.comodidadesSelecionadas);
      if (dados.regrasIds) setRegrasIds(dados.regrasIds);
      if (dados.regrasAdicionais) setRegrasAdicionais(dados.regrasAdicionais);
      if (dados.regrasObjetos) setRegrasObjetos(dados.regrasObjetos);
      if (dados.fotos) setFotos(dados.fotos);
      if (dados.quartosParaEnviar) setQuartosParaEnviar(dados.quartosParaEnviar);
      if (dados.fase) setFase(dados.fase);

      showToast('Rascunho recuperado', 'info');
    } catch (err) {
      console.warn('Erro ao carregar rascunho:', err);
      localStorage.removeItem(RASCUNHO_KEY);
    }
  }, [searchParams]);

  // ==================== CLEANUP PARA NOVO REGISTO (quando não há rascunho) ====================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      // Só limpa storages antigos se NÃO existir rascunho
      const temRascunho = !!localStorage.getItem(RASCUNHO_KEY);
      if (!temRascunho) {
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
      }
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

      setStatusAtual(data.status || 'rascunho');

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

  // ==================== MONTAR PAYLOAD PARA API ====================
 // ==================== MONTAR PAYLOAD PARA API ====================
  const montarPayload = (statusDestino) => {
    const quartosFormatados = (Array.isArray(quartosParaEnviar) ? quartosParaEnviar : []).map(q => {
      const fotosQuarto = (q.fotos || q.imagens || q.quarto_imagens || [])
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
        fotos: fotosQuarto,
        imagens: fotosQuarto
      };
    });

    let fotosComPrincipal = [...fotos];
    const temPrincipal = fotosComPrincipal.some(f => f.principal === 1 || f.principal === true);
    if (!temPrincipal && fotosComPrincipal.length > 0) {
      fotosComPrincipal = fotosComPrincipal.map((f, i) => ({
        ...f,
        principal: i === 0 ? 1 : 0,
        ordem: i
      }));
    } else {
      fotosComPrincipal = fotosComPrincipal.map((f, i) => ({
        ...f,
        principal: (f.principal === 1 || f.principal === true) ? 1 : 0,
        ordem: typeof f.ordem === 'number' ? f.ordem : i
      }));
    }

    const imagensFormatadas = fotosComPrincipal
      .filter(f => f.url || f.caminho_url || f.path || f.src || f.caminho)
      .map((foto, index) => {
        const url = foto.url || foto.caminho_url || foto.path || foto.src || foto.caminho || '';
        return {
          url: url,
          caminho_url: url,
          principal: foto.principal ? 1 : 0,
          ordem: foto.ordem ?? index
        };
      });

    const cidade = localizacaoDados.cidade || '';
    const ilha = localizacaoDados.ilha || '';
    const endereco = localizacaoDados.endereco || '';
    const codigo_postal = localizacaoDados.codigo_postal || '';
    const num_apartamento = localizacaoDados.num_apartamento || '';
    const morada_completa = localizacaoDados.morada_completa || '';
    const latitude = localizacaoDados.coordenadas?.lat || localizacaoDados.latitude || null;
    const longitude = localizacaoDados.coordenadas?.lng || localizacaoDados.longitude || null;

    return {
      // 🔑 Removido o proprietario_id fixo. O backend lê o utilizador diretamente através do Token JWT.
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

      comodidades: comodidadesSelecionadas.map(c => c.id || c),
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

      modelo_venda: modeloVenda,
      quartos: mostraQuartos ? quartosFormatados : [],
      imagens: imagensFormatadas,
      fotos: imagensFormatadas,
      status: statusDestino
    };
  };

  // ==================== ENVIAR PARA ANÁLISE (API) ====================
  const handleEnviarParaAnalise = async () => {
    if (isSubmitting) return;

    // Validações mínimas para enviar para análise
    if (!informacoesBasicas.titulo?.trim()) {
      showToast('O título é obrigatório', 'error');
      setFase(1);
      return;
    }
    if (!informacoesBasicas.descricao?.trim()) {
      showToast('A descrição é obrigatória', 'error');
      setFase(1);
      return;
    }
    if (!informacoesBasicas.preco_noite) {
      showToast('O preço por noite é obrigatório', 'error');
      setFase(1);
      return;
    }
    if (!localizacaoDados.endereco?.trim() || !localizacaoDados.cidade?.trim() || !localizacaoDados.ilha?.trim()) {
      showToast('Complete a localização', 'error');
      setFase(2);
      return;
    }
    if (fotos.length === 0) {
      showToast('Adicione pelo menos uma foto', 'error');
      setFase(5);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = montarPayload('em_analise');
      const result = await salvarFluxoRegisto(payload, alojamentoId);

      if (result.success) {
        // Limpa o rascunho local depois de enviar com sucesso
        localStorage.removeItem(RASCUNHO_KEY);

        if (result.data?.id && !alojamentoId) {
          setAlojamentoId(result.data.id);
        }

        setStatusAtual('em_analise');
        showToast(`✅ ${result.message || 'Anúncio enviado para análise'}`, 'success');
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

  const handlePreVisualizar = () => {
    if (!alojamentoId) {
      showToast('Guarde primeiro como rascunho no servidor para pré-visualizar', 'info');
      return;
    }
    window.open(`/alojamento/${alojamentoId}?preview=1`, '_blank');
  };

  const handleBack = () => {
    if (fase > 1) {
      setFase(fase - 1);
    } else {
      navigate(-1);
    }
  };

  // ==================== BOTÕES DE AÇÃO COMUNS ====================
  const BotoesAcao = ({ mostrarContinuar = true, onContinuar, continuarLabel = 'Continuar' }) => {
    const temRascunho = !!localStorage.getItem(RASCUNHO_KEY);

    return (
      <div className="flex flex-wrap justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex flex-wrap gap-3">
          {/* Guardar rascunho (localStorage) */}
          <button
            onClick={guardarRascunhoLocal}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            <Save size={18} />
            Guardar rascunho
          </button>

          {/* Remover rascunho */}
          {temRascunho && (
            <button
              onClick={pedirConfirmacaoRemoverRascunho}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
            >
              <X size={18} />
              Remover rascunho
            </button>
          )}

          {/* Pré-visualizar (só se já tiver ID no servidor) */}
          {alojamentoId && (
            <button
              onClick={handlePreVisualizar}
              className="flex items-center gap-2 px-5 py-2.5 border border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50"
            >
              <Eye size={18} /> Pré-visualizar
            </button>
          )}

          {mostrarContinuar && (
            <button
              onClick={onContinuar}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
            >
              {continuarLabel} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ==================== BARRA DE PROGRESSO ====================
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

  // ==================== FASES ====================
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

          <BotoesAcao onContinuar={handleSaveInformacoes} />
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

          <BotoesAcao onContinuar={handleSaveLocalizacao} />
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

          <BotoesAcao onContinuar={handleSaveComodidades} />
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

          <BotoesAcao onContinuar={handleSaveRegras} />
        </div>
      </div>
    </div>
  );

  const renderFaseFotos = () => {
    const temRascunho = !!localStorage.getItem(RASCUNHO_KEY);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos do Alojamento</h1>
            <p className="text-gray-600 mb-6">
              Adicione fotos e escolha manualmente a fotografia principal (clique na estrela ou no botão “Principal”).
            </p>

            <ImagensUpload
              fotos={fotos}
              onFotosChange={setFotos}
              quartos={quartosParaEnviar}
              onQuartosChange={handleQuartosChange}
              maxFotos={20}
              alojamentoId={alojamentoId}
              mostraQuartos={mostraQuartos}
            />

            <div className="flex flex-wrap justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                <ArrowLeft size={18} /> Voltar
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={guardarRascunhoLocal}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <Save size={18} />
                  Guardar rascunho
                </button>

                {temRascunho && (
                  <button
                    onClick={pedirConfirmacaoRemoverRascunho}
                    className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
                  >
                    <X size={18} />
                    Remover rascunho
                  </button>
                )}

                {alojamentoId && (
                  <button
                    onClick={handlePreVisualizar}
                    className="flex items-center gap-2 px-5 py-2.5 border border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50"
                  >
                    <Eye size={18} /> Pré-visualizar
                  </button>
                )}

                <button
                  onClick={handleEnviarParaAnalise}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Enviar para análise
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg tracking-tight truncate max-w-[200px]">
            {informacoesBasicas.titulo || 'Nova Propriedade'}
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            {statusAtual === 'rascunho' ? 'Rascunho' : statusAtual === 'em_analise' ? 'Em análise' : statusAtual}
          </span>
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

      {/* ========== CAIXA DE CONFIRMAÇÃO REMOVER RASCUNHO ========== */}
      {mostrarConfirmacaoRemover && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Remover rascunho?
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tens a certeza que queres apagar o rascunho? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarConfirmacaoRemover(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemoverRascunho}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}
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