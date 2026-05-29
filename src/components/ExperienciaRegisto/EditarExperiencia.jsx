// src/components/ExperienciaRegisto/EditarExperiencia.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditarExperiencia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [experienciaId, setExperienciaId] = useState(id ? parseInt(id) : null);
  
  const [informacoes, setInformacoes] = useState({});
  const [endereco, setEndereco] = useState({});
  const [categoria, setCategoria] = useState('aventura');
  const [inclusoes, setInclusoes] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [disponibilidade, setDisponibilidade] = useState({ dias_disponiveis: [], horarios: [] });
  
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
          alert('Erro ao carregar experiência');
          navigate('/experiencia-registo/meus');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados da experiência');
        navigate('/experiencia-registo/meus');
      } finally {
        setLoading(false);
      }
    };
    
    carregarExperiencia();
  }, [experienciaId, navigate]);
  
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
    setIsSubmitting(true);
    
    try {
      const dadosCompletos = {
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
        alert(`✅ ${result.message}`);
        navigate('/experiencia-registo/meus');
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar as alterações.\n' + error.message);
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
          <p className="mt-4 text-gray-600">Carregando experiência...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
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
          {fase === 1 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Informações</h1>
              <p className="text-gray-600 mb-6">Atualize os dados da sua experiência.</p>
              <InformacoesBasicas 
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Localização</h1>
              <p className="text-gray-600 mb-6">Atualize o local da experiência.</p>
           <Localizacao 
            dados={endereco}
            onChange={setEndereco}
            readOnly={false}
            experienciaId={experienciaId}  // ← ADICIONE ESTA LINHA
          />
            </>
          )}
          
          {fase === 3 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Categoria</h1>
              <p className="text-gray-600 mb-6">Atualize a categoria da experiência.</p>
              <Categoria 
                value={categoria}
                onChange={setCategoria}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 4 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Inclusões</h1>
              <p className="text-gray-600 mb-6">Atualize os itens inclusos na experiência.</p>
              <Inclusoes 
                items={inclusoes}
                onChange={setInclusoes}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 5 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Requisitos</h1>
              <p className="text-gray-600 mb-6">Atualize os requisitos da experiência.</p>
              <Requisitos 
                items={requisitos}
                onChange={setRequisitos}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 6 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Idiomas</h1>
              <p className="text-gray-600 mb-6">Atualize os idiomas falados.</p>
              <Idiomas 
                items={idiomas}
                onChange={setIdiomas}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 7 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Fotos</h1>
              <p className="text-gray-600 mb-6">Atualize as fotos da experiência.</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Disponibilidade</h1>
              <p className="text-gray-600 mb-6">Atualize os dias e horários da experiência.</p>
              <Disponibilidade 
                dados={disponibilidade}
                onChange={setDisponibilidade}
                readOnly={false}
              />
            </>
          )}
          
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
                    Salvar Alterações
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

export default EditarExperiencia;