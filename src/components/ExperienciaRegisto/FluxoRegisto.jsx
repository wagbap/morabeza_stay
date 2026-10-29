import { obterUtilizadorRegisto } from '../../utils/registoSession';
import { temFotoAnuncio } from '../../utils/fotosAnuncio';
import RegistoVisual, { EtapasRegisto, TituloRegisto } from '../RegistoVisual';
import BotaoAcaoRegisto from '../BotaoAcaoRegisto';
// src/components/ExperienciaRegisto/FluxoRegisto.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    const user = obterUtilizadorRegisto(localStorage);
    setUsuarioId(user?.id ?? null);
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
    if (!temFotoAnuncio(imagens)) {
      showToast(t('anuncio_foto_obrigatoria'), 'error');
      setFase(7);
      return;
    }

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
        const novoId = Number(result.data?.experiencia_id);
        navigate(Number.isInteger(novoId) && novoId > 0
          ? `/gest/experiencia/${novoId}/sessoes`
          : '/gest/minhas-experiencias');
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
  const renderProgressBar = () => <EtapasRegisto dominio="experiencia" fase={fase} onStepChange={setFase} onBack={handleBack} onNext={handleNext} />;

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
    <RegistoVisual>
      {/* Header */}
      <header className="bg-[#003580] text-white px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <Link
            to="/gest/minhas-experiencias"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            {t('registo_atalho_sessoes')}
          </Link>
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

        <div data-registo-card className="bg-white rounded-lg shadow-md p-8">
          {/* FASE 1 - Informações Básicas */}
          {fase === 1 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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
              <TituloRegisto dominio="experiencia" fase={fase} editar={false} />
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

            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
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
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto sm:min-w-64"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              )}

              {fase === 8 && (
                <BotaoAcaoRegisto onClick={handleFinalizar} loading={isSubmitting} modo="analise" />
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
    </RegistoVisual>
  );
};

export default FluxoRegisto;