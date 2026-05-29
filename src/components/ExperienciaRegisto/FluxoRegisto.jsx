// src/components/ExperienciaRegisto/FluxoRegisto.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle, User, Loader } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Localizacao from './Localizacao';
import Categoria from './Categoria';
import Inclusoes from './Inclusoes';
import Requisitos from './Requisitos';
import Idiomas from './Idiomas';
import ImagensUpload from './ImagensUpload';
import Disponibilidade from './Disponibilidade';
import { salvarFluxoExperiencia } from '../../services/experienciaApiService';


const FluxoRegisto = () => {
  const navigate = useNavigate();
  
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experienciaId, setExperienciaId] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
  
  // Carregar dados salvos
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const savedInfo = localStorage.getItem('expInformacoes');
        if (savedInfo) setInformacoes(JSON.parse(savedInfo));
        
        const savedEndereco = localStorage.getItem('expEndereco');
        if (savedEndereco) setEndereco(JSON.parse(savedEndereco));
        
        const savedCategoria = localStorage.getItem('expCategoria');
        if (savedCategoria) setCategoria(savedCategoria);
        
        const savedInclusoes = localStorage.getItem('expInclusoes');
        if (savedInclusoes) setInclusoes(JSON.parse(savedInclusoes));
        
        const savedRequisitos = localStorage.getItem('expRequisitos');
        if (savedRequisitos) setRequisitos(JSON.parse(savedRequisitos));
        
        const savedIdiomas = localStorage.getItem('expIdiomas');
        if (savedIdiomas) setIdiomas(JSON.parse(savedIdiomas));
        
        const savedImagens = localStorage.getItem('expImagens');
        if (savedImagens) setImagens(JSON.parse(savedImagens));
        
        const savedDisponibilidade = localStorage.getItem('expDisponibilidade');
        if (savedDisponibilidade) setDisponibilidade(JSON.parse(savedDisponibilidade));
        
        const savedId = localStorage.getItem('expExperienciaId');
        if (savedId) setExperienciaId(parseInt(savedId));
        
      } catch (e) {
        console.warn('Erro ao carregar dados:', e);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);
  
  const salvarProgresso = () => {
    localStorage.setItem('expInformacoes', JSON.stringify(informacoes));
    localStorage.setItem('expEndereco', JSON.stringify(endereco));
    localStorage.setItem('expCategoria', categoria);
    localStorage.setItem('expInclusoes', JSON.stringify(inclusoes));
    localStorage.setItem('expRequisitos', JSON.stringify(requisitos));
    localStorage.setItem('expIdiomas', JSON.stringify(idiomas));
    localStorage.setItem('expImagens', JSON.stringify(imagens));
    localStorage.setItem('expDisponibilidade', JSON.stringify(disponibilidade));
    if (experienciaId) localStorage.setItem('expExperienciaId', experienciaId);
  };
  
  const handleNext = () => {
    salvarProgresso();
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
    setIsSubmitting(true);
    
    try {
      const dadosCompletos = {
        usuario_id: 1,
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
        // Limpar localStorage
        localStorage.removeItem('expInformacoes');
        localStorage.removeItem('expEndereco');
        localStorage.removeItem('expCategoria');
        localStorage.removeItem('expInclusoes');
        localStorage.removeItem('expRequisitos');
        localStorage.removeItem('expIdiomas');
        localStorage.removeItem('expImagens');
        localStorage.removeItem('expDisponibilidade');
        localStorage.removeItem('expExperienciaId');
        
        alert(`✅ ${result.message}`);
        navigate('/experiencia-registo/meus');
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar o registo. Tente novamente.\n' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <div key={index} className={`h-1 flex-1 rounded-full ${fase > index + 1 ? 'bg-[#006ce4]' : fase === index + 1 ? 'bg-[#006ce4]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  };
  
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
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-medium">{informacoes.titulo || 'Nova Experiência'}</div>
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
          <div className="cursor-pointer hover:underline">PT</div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Ajuda</span> <HelpCircle size={18} />
          </div>
          <User size={24} className="cursor-pointer" />
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
                experienciaId={experienciaId}  // ← ADICIONE ESTA LINHA
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
          
          {/* Botões de navegação */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            
            {fase < 8 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
              >
                Continuar <ChevronRight size={18} />
              </button>
            )}
            
            {fase === 8 && (
              <button
                onClick={handleFinalizar}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Salvando...
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
  );
};

export default FluxoRegisto;