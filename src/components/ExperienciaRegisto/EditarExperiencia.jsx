import { temFotoAnuncio } from '../../utils/fotosAnuncio';
import RegistoVisual, { EtapasRegisto, TituloRegisto } from '../RegistoVisual';
import BotaoAcaoRegisto from '../BotaoAcaoRegisto';
// src/components/ExperienciaRegisto/EditarExperiencia.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, ChevronRight, HelpCircle, User, Loader } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Localizacao from './Localizacao';
import Categoria from './Categoria';
import Inclusoes from './Inclusoes';
import Requisitos from './Requisitos';
import Idiomas from './Idiomas';
import ImagensUpload from './ImagensUpload';
import Disponibilidade from './Disponibilidade';
import { buscarExperienciaParaEdicao, salvarFluxoExperiencia } from '../../services/experienciaApiService';
import { useToast } from '../../Toast';

const EditarExperiencia = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { showToast } = useToast();

  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [experienciaId, setExperienciaId] = useState(id ? parseInt(id) : null);
  const [usuarioId, setUsuarioId] = useState(null);

  const [informacoes, setInformacoes] = useState({});
  const [endereco, setEndereco] = useState({});
  const [categoria, setCategoria] = useState('aventura');
  const [inclusoes, setInclusoes] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [disponibilidade, setDisponibilidade] = useState({ dias_disponiveis: [], horarios: [] });

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

  // Carregar dados da experiência
  useEffect(() => {
    const carregarExperiencia = async () => {
      if (!experienciaId) return;

      setLoading(true);
      try {
        const result = await buscarExperienciaParaEdicao(experienciaId);

        if (result.success && result.data) {
          const data = result.data;

          setInformacoes({
            titulo: data.titulo || '',
            descricao_curta: data.descricao_curta || '',
            descricao_longa: data.descricao_longa || '',
            descricao_completa: data.descricao_completa || '',
            preco: data.preco || '',
            preco_crianca: data.preco_crianca || '',
            preco_bebe: data.preco_bebe || '',
            duracao: data.duracao || '2 horas',
            max_pessoas: data.max_pessoas || 10,
            min_pessoas: data.min_pessoas || 1,
            inclui_guia: data.inclui_guia == 1,
            inclui_transporte: data.inclui_transporte == 1,
            inclui_refeicao: data.inclui_refeicao == 1,
            ponto_encontro: data.ponto_encontro || ''
          });

          setEndereco({
            morada: data.endereco || '',
            cidade: data.localizacao || '',
            ilha: data.ilha || '',
            lat: data.latitude || null,
            lng: data.longitude || null
          });

          setCategoria(data.categoria || 'aventura');
          setInclusoes(data.inclusoes || []);
          setRequisitos(data.requisitos || []);
          setIdiomas(data.idiomas || []);
          setImagens(data.imagens || []);
          setDisponibilidade({
            dias_disponiveis: data.dias_disponiveis || [],
            horarios: data.horarios || []
          });
        } else {
          showToast('Erro ao carregar experiência', 'error');
          navigate('/experiencia-registo/meus');
        }
      } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar dados da experiência', 'error');
        navigate('/experiencia-registo/meus');
      } finally {
        setLoading(false);
      }
    };

    carregarExperiencia();
  }, [experienciaId, navigate, showToast]);

  const handleNext = () => {
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
        imagens,
        ...disponibilidade
      };

      const result = await salvarFluxoExperiencia(dadosCompletos, experienciaId);

      if (result.success) {
        showToast(result.message || 'Alterações guardadas com sucesso!', 'success');
        navigate('/experiencia-registo/meus');
      } else {
        showToast(result.message || 'Erro ao guardar alterações', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao salvar as alterações. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => <EtapasRegisto dominio="experiencia" fase={fase} onStepChange={setFase} onBack={handleBack} onNext={handleNext} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-[#006ce4]" size={48} />
          <p className="mt-4 text-gray-600">Carregando experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <RegistoVisual>
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight"></div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-medium">{informacoes.titulo || 'Editar Experiência'}</div>
            <div className="text-[10px] opacity-80">
              {fase === 1 && 'Informações básicas'}
              {fase === 2 && 'Localização'}
              {fase === 3 && 'Categoria'}
              {fase === 4 && `${inclusoes.length} inclusão(ões)`}
              {fase === 5 && `${requisitos.length} requisito(s)`}
              {fase === 6 && `${idiomas.length} idioma(s)`}
              {fase === 7 && `${imagens.length} foto(s)`}
              {fase === 8 && 'Disponibilidade'}
            </div>
          </div>
          <div className="w-[1px] h-8 bg-blue-900"></div>

          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Ajuda</span> <HelpCircle size={18} />
          </div>

        </div>
      </header>
      <div className="mx-auto flex w-full max-w-4xl px-4 pt-4 sm:justify-end">
        <Link
          to="/gest/minhas-experiencias"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:w-auto"
        >
          {t('registo_atalho_sessoes')}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderProgressBar()}

        <div data-registo-card className="bg-white rounded-lg shadow-md p-8">
          {fase === 1 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <InformacoesBasicas
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 2 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Localizacao
                dados={endereco}
                onChange={setEndereco}
                readOnly={false}
                experienciaId={experienciaId}
              />
            </>
          )}

          {fase === 3 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Categoria
                value={categoria}
                onChange={setCategoria}
                readOnly={false}
              />
            </>
          )}

          {fase === 4 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Inclusoes
                items={inclusoes}
                onChange={setInclusoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 5 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Requisitos
                items={requisitos}
                onChange={setRequisitos}
                readOnly={false}
              />
            </>
          )}

          {fase === 6 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Idiomas
                items={idiomas}
                onChange={setIdiomas}
                readOnly={false}
              />
            </>
          )}

          {fase === 7 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <ImagensUpload
                imagens={imagens}
                onChange={setImagens}
                experienciaId={experienciaId}
                readOnly={false}
              />
            </>
          )}

          {fase === 8 && (
            <>
              <TituloRegisto dominio="experiencia" fase={fase} editar={true} />
              <Disponibilidade
                dados={disponibilidade}
                onChange={setDisponibilidade}
                readOnly={false}
              />
            </>
          )}

          <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>

            {fase < 8 && (
              <button
                onClick={handleNext}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto sm:min-w-64"
              >
                Continuar <ChevronRight size={18} />
              </button>
            )}

            {fase === 8 && (
              <BotaoAcaoRegisto onClick={handleFinalizar} loading={isSubmitting} modo="guardar" />
            )}
          </div>
        </div>
      </div>
    </RegistoVisual>
  );
};

export default EditarExperiencia;