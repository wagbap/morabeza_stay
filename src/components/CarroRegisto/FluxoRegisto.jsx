// src/components/CarroRegisto/FluxoRegisto.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle, Loader, Save, X, AlertCircle } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Especificacoes from './Especificacoes';
import Localizacao from './Localizacao';
import Caracteristicas from './Caracteristicas';
import ImagensUpload from './ImagensUpload';
import { salvarFluxoCarro } from '../../services/carroApiService';
import { useToast } from '../../Toast';

// ==================== CHAVE DO RASCUNHO ====================
const RASCUNHO_KEY = 'morabeza_rascunho_carro';

const FluxoRegisto = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carroId, setCarroId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mostrarConfirmacaoRemover, setMostrarConfirmacaoRemover] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  const [informacoes, setInformacoes] = useState({
    titulo: '',
    marca: '',
    modelo: '',
    categoria_id: '',
    preco_dia: '',
    descricao: '',
    descricao_detalhada: ''
  });

  const [especificacoes, setEspecificacoes] = useState({
    ano: '',
    passageiros: 5,
    portas: 4,
    transmissao: 'Manual',
    combustivel: 'Gasolina',
    consumo: '',
    cor: '',
    quilometragem: 0
  });

  const [localizacao, setLocalizacao] = useState({
    local: '',
    cidade: '',
    ilha: ''
  });

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [imagens, setImagens] = useState([]);

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

      // Fallback para as chaves tradicionais no LocalStorage
      const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
      for (const chave of chaves) {
        const savedUser = localStorage.getItem(chave);
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user?.id) {
            setUsuarioId(user.id);
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
      especificacoes,
      localizacao,
      caracteristicas,
      imagens,
      carroId,
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
      marca: '',
      modelo: '',
      categoria_id: '',
      preco_dia: '',
      descricao: '',
      descricao_detalhada: ''
    });
    setEspecificacoes({
      ano: '',
      passageiros: 5,
      portas: 4,
      transmissao: 'Manual',
      combustivel: 'Gasolina',
      consumo: '',
      cor: '',
      quilometragem: 0
    });
    setLocalizacao({
      local: '',
      cidade: '',
      ilha: ''
    });
    setCaracteristicas([]);
    setImagens([]);
    setFase(1);
    setCarroId(null);

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
          if (dados.especificacoes) setEspecificacoes(dados.especificacoes);
          if (dados.localizacao) setLocalizacao(dados.localizacao);
          if (dados.caracteristicas) setCaracteristicas(dados.caracteristicas);
          if (dados.imagens) setImagens(dados.imagens);
          if (dados.fase) setFase(dados.fase);
          if (dados.carroId) setCarroId(dados.carroId);

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
      if (!informacoes.titulo) {
        showToast('O título do veículo é obrigatório', 'error');
        return;
      }
      if (!informacoes.preco_dia) {
        showToast('O preço por dia é obrigatório', 'error');
        return;
      }
    }

    if (fase === 3) {
      if (!localizacao.ilha) {
        showToast('A ilha é obrigatória', 'error');
        return;
      }
      if (!localizacao.local && !localizacao.cidade) {
        showToast('A localização/cidade é obrigatória', 'error');
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
        ...informacoes,
        ...especificacoes,
        usuario_id: usuarioId,
        localizacao: localizacao.local || localizacao.cidade || '',
        cidade: localizacao.cidade || localizacao.local || '',
        ilha: localizacao.ilha || '',
        caracteristicas: caracteristicas,
        imagens: imagens
      };

      console.log('📤 Enviando dados para criação:', dadosCompletos);

      const result = await salvarFluxoCarro(dadosCompletos, carroId);

      if (result.success) {
        localStorage.removeItem(RASCUNHO_KEY);
        showToast(result.message || 'Veículo registado com sucesso!', 'success');
        navigate('/carro-registo/meus');
      } else {
        showToast(result.message || 'Erro ao registar veículo', 'error');
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
    const fasesLista = ['Info', 'Especificações', 'Localização', 'Características', 'Fotos'];
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
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003580] text-white px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div className="font-bold text-lg tracking-tight truncate max-w-[140px]"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="font-medium text-sm truncate max-w-[120px]">
              {informacoes.titulo || 'Novo Carro'}
            </div>
            <div className="text-[8px] opacity-80 mt-0.5">
              {fase === 1 && 'Básicas'}
              {fase === 2 && 'Especificações'}
              {fase === 3 && 'Localização'}
              {fase === 4 && `${caracteristicas.length} carac.`}
              {fase === 5 && `${imagens.length} fotos`}
            </div>
          </div>

          <div className="w-[1px] h-6 bg-blue-900"></div>

          <div className="flex items-center gap-1 cursor-pointer hover:underline">
            <HelpCircle size={16} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderProgressBar()}

        <div className="bg-white rounded-lg shadow-md p-8">
          {fase === 1 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Informações do Veículo</h1>
              <p className="text-gray-600 mb-6">Preencha os dados básicos do carro.</p>
              <InformacoesBasicas
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Especificações Técnicas</h1>
              <p className="text-gray-600 mb-6">Detalhes técnicos do veículo.</p>
              <Especificacoes
                dados={especificacoes}
                onChange={setEspecificacoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 3 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Localização</h1>
              <p className="text-gray-600 mb-6">Onde o veículo está disponível?</p>
              <Localizacao
                dados={localizacao}
                onChange={setLocalizacao}
                readOnly={false}
              />
            </>
          )}

          {fase === 4 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Características</h1>
              <p className="text-gray-600 mb-6">Selecione os equipamentos do veículo.</p>
              <Caracteristicas
                items={caracteristicas}
                onChange={setCaracteristicas}
                readOnly={false}
              />
            </>
          )}

          {fase === 5 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos do Veículo</h1>
              <p className="text-gray-600 mb-6">Adicione fotos para mostrar o carro.</p>
              <ImagensUpload
                imagens={imagens}
                onChange={setImagens}
                veiculoId={carroId}
                tipo="carro"
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

              {fase < 5 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              )}

              {fase === 5 && (
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