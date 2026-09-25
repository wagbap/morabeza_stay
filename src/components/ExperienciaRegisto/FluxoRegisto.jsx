// src/components/ExperienciaRegisto/FluxoRegisto.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle, Loader, Save, X, AlertCircle } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Localizacao from './Localizacao';
import Categoria from './Categoria';
import Inclusoes from './Inclusoes';
import Requisitos from './Requisitos';
import Idiomas from './Idiomas';
import ImagensUpload from './ImagensUpload';
import Disponibilidade from './Disponibilidade';
import { salvarFluxoExperiencia } from '../../services/experienciaApiService';
import { useToast } from '../../Toast';

// ==================== CHAVE DO RASCUNHO ====================
const RASCUNHO_KEY = 'morabeza_rascunho_experiencia';

const FluxoRegisto = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experienciaId, setExperienciaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mostrarConfirmacaoRemover, setMostrarConfirmacaoRemover] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // Estados do formulário
  const [informacoes, setInformacoes] = useState({
    titulo: '',
    descricao_curta: '',
    descricao_longa: '',
    descricao_completa: '',
    preco: '',
    preco_crianca: '',
    preco_bebe: '',
    duracao: '2 horas',
    max_pessoas: 10,
    min_pessoas: 1,
    inclui_guia: true,
    inclui_transporte: false,
    inclui_refeicao: false,
    ponto_encontro: ''
  });

  const [endereco, setEndereco] = useState({
    morada: '',
    cidade: '',
    ilha: '',
    lat: null,
    lng: null
  });

  const [categoria, setCategoria] = useState('aventura');
  const [inclusoes, setInclusoes] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [disponibilidade, setDisponibilidade] = useState({
    dias_disponiveis: [],
    horarios: []
  });

  // ==================== OBTER ID DO UTILIZADOR (JWT) ====================
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        const userData = parsed.data || parsed;
        if (userData?.id) {
          setUsuarioId(userData.id);
          return;
        }
      }

      const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
      for (const chave of chaves) {
        const raw = localStorage.getItem(chave);
        if (raw) {
          const user = JSON.parse(raw);
          const uid = user?.id || user?.sub || user?.user_id;
          if (uid) {
            setUsuarioId(uid);
            break;
          }
        }
      }
    } catch (e) {
      console.error('Erro ao obter ID do utilizador:', e);
    }
  }, []);

  // ==================== GUARDAR RASCUNHO ====================
  const guardarRascunhoLocal = () => {
    const dados = {
      fase,
      informacoes,
      endereco,
      categoria,
      inclusoes,
      requisitos,
      idiomas,
      imagens,
      disponibilidade,
      experienciaId,
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

  // ==================== ABRIR CONFIRMAÇÃO ====================
  const pedirConfirmacaoRemoverRascunho = () => {
    setMostrarConfirmacaoRemover(true);
  };

  // ==================== CONFIRMAR E REMOVER ====================
  const confirmarRemoverRascunho = () => {
    localStorage.removeItem(RASCUNHO_KEY);

    setInformacoes({
      titulo: '',
      descricao_curta: '',
      descricao_longa: '',
      descricao_completa: '',
      preco: '',
      preco_crianca: '',
      preco_bebe: '',
      duracao: '2 horas',
      max_pessoas: 10,
      min_pessoas: 1,
      inclui_guia: true,
      inclui_transporte: false,
      inclui_refeicao: false,
      ponto_encontro: ''
    });
    setEndereco({
      morada: '',
      cidade: '',
      ilha: '',
      lat: null,
      lng: null
    });
    setCategoria('aventura');
    setInclusoes([]);
    setRequisitos([]);
    setIdiomas([]);
    setImagens([]);
    setDisponibilidade({
      dias_disponiveis: [],
      horarios: []
    });
    setFase(1);
    setExperienciaId(null);

    setMostrarConfirmacaoRemover(false);
    showToast('Rascunho removido', 'success');
  };

  // ==================== CARREGAR RASCUNHO ====================
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const raw = localStorage.getItem(RASCUNHO_KEY);
        if (raw) {
          const dados = JSON.parse(raw);

          if (dados.informacoes) setInformacoes(dados.informacoes);
          if (dados.endereco) setEndereco(dados.endereco);
          if (dados.categoria) setCategoria(dados.categoria);
          if (dados.inclusoes) setInclusoes(dados.inclusoes);
          if (dados.requisitos) setRequisitos(dados.requisitos);
          if (dados.idiomas) setIdiomas(dados.idiomas);
          if (dados.imagens) setImagens(dados.imagens);
          if (dados.disponibilidade) setDisponibilidade(dados.disponibilidade);
          if (dados.fase) setFase(dados.fase);
          if (dados.experienciaId) setExperienciaId(dados.experienciaId);

          showToast('Rascunho recuperado', 'info');
        }
      } catch (e) {
        console.warn('Erro ao carregar rascunho:', e);
        localStorage.removeItem(RASCUNHO_KEY);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // ==================== NAVEGAÇÃO ====================
  const handleNext = () => {
    if (fase === 1) {
      if (!informacoes.titulo || !informacoes.titulo.trim()) {
        showToast('O título da experiência é obrigatório', 'error');
        return;
      }
      if (!informacoes.preco || Number(informacoes.preco) <= 0) {
        showToast('O preço é obrigatório', 'error');
        return;
      }
    }

    if (fase === 2) {
      if (!endereco.ilha) {
        showToast('A ilha é obrigatória', 'error');
        return;
      }
    }

    setFase(fase + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (fase > 1) {
      setFase(fase - 1);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  };

  // ==================== FINALIZAR ====================
  const handleFinalizar = async () => {
    if (isSubmitting) return;

    if (!usuarioId) {
      showToast('Utilizador não autenticado. Faça login novamente.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const dadosCompletos = {
        usuario_id: usuarioId,
        ...informacoes,
        endereco,
        categoria,
        inclusoes,
        requisitos,
        idiomas,
        imagens: imagens.map(img => ({
          url: img.caminho_url || img.url,
          principal: img.principal || false
        })),
        ...disponibilidade
      };

      console.log('📤 Enviando dados:', dadosCompletos);

      const result = await salvarFluxoExperiencia(dadosCompletos, experienciaId);

      if (result.success) {
        localStorage.removeItem(RASCUNHO_KEY);
        showToast(result.message || 'Experiência registada com sucesso!', 'success');
        navigate('/experiencia-registo/meus');
      } else {
        showToast(result.message || 'Erro ao registar experiência', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao processar o registo. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== BARRA DE PROGRESSO ====================
  const renderProgressBar = () => {
    const fasesLista = ['Info', 'Local', 'Categoria', 'Inclusões', 'Requisitos', 'Idiomas', 'Fotos', 'Disponibilidade'];
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
                fase === index + 1 ? 'bg-[#006ce4]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const temRascunho = !!localStorage.getItem(RASCUNHO_KEY);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-[#006ce4]" size={48} />
          <p className="mt-4 text-gray-600">Carregando dados da experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003580] text-white px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div className="font-bold text-base tracking-tight truncate max-w-[130px]"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="font-medium text-xs truncate max-w-[90px]">
              {informacoes.titulo || 'Nova Exp.'}
            </div>
            <div className="text-[7px] opacity-80 mt-0.5">
              {fase === 1 && 'Básicas'}
              {fase === 2 && 'Localização'}
              {fase === 3 && 'Categoria'}
              {fase === 4 && `${inclusoes.length} incl.`}
              {fase === 5 && `${requisitos.length} req.`}
              {fase === 6 && `${idiomas.length} idiomas`}
              {fase === 7 && `${imagens.length} fotos`}
              {fase === 8 && 'Disponib.'}
            </div>
          </div>

          <div className="w-[1px] h-5 bg-blue-900"></div>

          <div className="flex items-center cursor-pointer hover:opacity-80">
            <HelpCircle size={15} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderProgressBar()}

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* FASE 1 - Informações Básicas */}
          {fase === 1 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Informações da Experiência</h1>
              <p className="text-gray-600 mb-6">Preencha os dados principais da sua experiência.</p>
              <InformacoesBasicas
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 2 - Localização */}
          {fase === 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Onde acontece?</h1>
              <p className="text-gray-600 mb-6">Informe o local da experiência.</p>
              <Localizacao
                dados={endereco}
                onChange={setEndereco}
                readOnly={false}
                experienciaId={experienciaId}
              />
            </>
          )}

          {/* FASE 3 - Categoria */}
          {fase === 3 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Categoria</h1>
              <p className="text-gray-600 mb-6">Selecione a categoria da experiência.</p>
              <Categoria
                value={categoria}
                onChange={setCategoria}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 4 - Inclusões */}
          {fase === 4 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">O que está incluído?</h1>
              <p className="text-gray-600 mb-6">Liste os itens inclusos na experiência.</p>
              <Inclusoes
                items={inclusoes}
                onChange={setInclusoes}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 5 - Requisitos */}
          {fase === 5 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Requisitos</h1>
              <p className="text-gray-600 mb-6">O que os participantes precisam saber?</p>
              <Requisitos
                items={requisitos}
                onChange={setRequisitos}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 6 - Idiomas */}
          {fase === 6 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Idiomas</h1>
              <p className="text-gray-600 mb-6">Quais idiomas são falados?</p>
              <Idiomas
                items={idiomas}
                onChange={setIdiomas}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 7 - Fotos */}
          {fase === 7 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos da Experiência</h1>
              <p className="text-gray-600 mb-6">Adicione fotos para mostrar sua experiência.</p>
              <ImagensUpload
                imagens={imagens}
                onChange={setImagens}
                experienciaId={experienciaId}
                readOnly={false}
              />
            </>
          )}

          {/* FASE 8 - Disponibilidade */}
          {fase === 8 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Disponibilidade</h1>
              <p className="text-gray-600 mb-6">Defina os dias e horários da experiência.</p>
              <Disponibilidade
                dados={disponibilidade}
                onChange={setDisponibilidade}
                readOnly={false}
              />
            </>
          )}

          {/* ==================== BOTÕES ==================== */}
          <div className="flex flex-wrap justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>

            <div className="flex flex-wrap gap-3">
              {/* Guardar rascunho */}
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

              {fase < 8 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              )}

              {fase === 8 && (
                <button
                  onClick={handleFinalizar}
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
                      Finalizar Registo
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default FluxoRegisto;