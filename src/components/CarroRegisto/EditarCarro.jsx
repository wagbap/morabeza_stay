import { temFotoAnuncio } from '../../utils/fotosAnuncio';
import RegistoVisual, { EtapasRegisto, TituloRegisto } from '../RegistoVisual';
import BotaoAcaoRegisto from '../BotaoAcaoRegisto';
// src/components/CarroRegisto/EditarCarro.jsx
// CORRIGIDO - Localização funcionando corretamente + Toast padrão do projeto

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, ChevronRight, HelpCircle, User, Loader } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Especificacoes from './Especificacoes';
import Localizacao from './Localizacao';
import Caracteristicas from './Caracteristicas';
import ImagensUpload from './ImagensUpload';
import { buscarCarro, salvarFluxoCarro } from '../../services/carroApiService';
import { useToast } from '../../Toast';

const EditarCarro = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { showToast } = useToast();

  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [carroId, setCarroId] = useState(id ? parseInt(id) : null);

  const [informacoes, setInformacoes] = useState({});
  const [especificacoes, setEspecificacoes] = useState({});

  // 🔥 CORRIGIDO: Estado da localização com todos os campos
  const [localizacao, setLocalizacao] = useState({
    local: '',
    cidade: '',
    ilha: ''
  });

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [imagens, setImagens] = useState([]);

  useEffect(() => {
    const carregarCarro = async () => {
      if (!carroId) return;

      setLoading(true);
      try {
        console.log(`🚗 Buscando carro ID: ${carroId}`);
        const result = await buscarCarro(carroId);

        console.log('📦 Dados recebidos:', result);

        if (result.success && result.data) {
          const data = result.data;

          setInformacoes({
            titulo: data.titulo || '',
            marca: data.marca || '',
            modelo: data.modelo || '',
            categoria_id: data.categoria_id || '',
            preco_dia: data.preco_dia || '',
            descricao: data.descricao || '',
            descricao_detalhada: data.descricao_detalhada || ''
          });

          setEspecificacoes({
            ano: data.ano || '',
            passageiros: data.passageiros || 5,
            portas: data.portas || 4,
            transmissao: data.transmissao || 'Manual',
            combustivel: data.combustivel || 'Gasolina',
            consumo: data.consumo || '',
            cor: data.cor || '',
            quilometragem: data.quilometragem || 0
          });

          // 🔥 CORRIGIDO: Carregar localização com todos os campos
          setLocalizacao({
            local: data.localizacao || data.cidade || '',
            cidade: data.cidade || data.localizacao || '',
            ilha: data.ilha || ''
          });

          console.log('📍 Localização carregada:', {
            local: data.localizacao,
            cidade: data.cidade,
            ilha: data.ilha
          });

          setCaracteristicas(data.caracteristicas || []);
          setImagens(data.imagens || []);
        } else {
          showToast('Erro ao carregar dados do veículo: ' + (result.message || ''), 'error');
          navigate('/carro-registo/meus');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        showToast('Erro ao carregar dados: ' + error.message, 'error');
        navigate('/carro-registo/meus');
      } finally {
        setLoading(false);
      }
    };

    carregarCarro();
  }, [carroId, navigate, showToast]);

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
      setFase(5);
      return;
    }
    setIsSubmitting(true);

    try {
      // 🔥 CORRIGIDO: Montar dados completos corretamente
      const dadosCompletos = {
        ...informacoes,
        ...especificacoes,
        localizacao: localizacao.local || localizacao.cidade || '',
        cidade: localizacao.cidade || localizacao.local || '',
        ilha: localizacao.ilha || '',
        caracteristicas: caracteristicas,
        imagens: imagens
      };

      console.log('📤 Enviando dados para atualização:', dadosCompletos);

      const result = await salvarFluxoCarro(dadosCompletos, carroId);

      if (result.success) {
        showToast(result.message || 'Alterações guardadas com sucesso!', 'success');
        navigate('/carro-registo/meus');
      } else {
        showToast(result.message || 'Erro ao guardar alterações', 'error');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      showToast('Erro ao salvar as alterações. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => <EtapasRegisto dominio="carro" fase={fase} onStepChange={setFase} onBack={handleBack} onNext={handleNext} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando veículo...</p>
      </div>
    );
  }

  return (
    <RegistoVisual>
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight"></div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-medium">{informacoes.titulo || 'Editar Veículo'}</div>
            <div className="text-[10px] opacity-80">
              {fase === 1 && 'Informações básicas'}
              {fase === 2 && 'Especificações'}
              {fase === 3 && 'Localização'}
              {fase === 4 && `${caracteristicas.length} característica(s)`}
              {fase === 5 && `${imagens.length} foto(s)`}
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
          to="/gest/unidades-veiculos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:w-auto"
        >
          {t('registo_atalho_unidades')}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderProgressBar()}

        <div data-registo-card className="bg-white rounded-lg shadow-md p-8">
          {fase === 1 && (
            <>
              <TituloRegisto dominio="carro" fase={fase} editar={true} />
              <InformacoesBasicas
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 2 && (
            <>
              <TituloRegisto dominio="carro" fase={fase} editar={true} />
              <Especificacoes
                dados={especificacoes}
                onChange={setEspecificacoes}
                readOnly={false}
              />
            </>
          )}

          {fase === 3 && (
            <>
              <TituloRegisto dominio="carro" fase={fase} editar={true} />
              <Localizacao
                dados={localizacao}
                onChange={setLocalizacao}
                readOnly={false}
                carroId={carroId}
              />
            </>
          )}

          {fase === 4 && (
            <>
              <TituloRegisto dominio="carro" fase={fase} editar={true} />
              <Caracteristicas
                items={caracteristicas}
                onChange={setCaracteristicas}
                readOnly={false}
              />
            </>
          )}

          {fase === 5 && (
            <>
              <TituloRegisto dominio="carro" fase={fase} editar={true} />
              <ImagensUpload
                imagens={imagens}
                onChange={setImagens}
                veiculoId={carroId}
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

            {fase < 5 && (
              <button
                onClick={handleNext}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto sm:min-w-64"
              >
                Continuar <ChevronRight size={18} />
              </button>
            )}

            {fase === 5 && (
              <BotaoAcaoRegisto onClick={handleFinalizar} loading={isSubmitting} modo="guardar" />
            )}
          </div>
        </div>
      </div>
    </RegistoVisual>
  );
};

export default EditarCarro;