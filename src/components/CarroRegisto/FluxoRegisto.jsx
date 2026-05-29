// src/components/CarroRegisto/FluxoRegisto.jsx
// CORRIGIDO - Localização com todos os campos

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle, User, Loader } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Especificacoes from './Especificacoes';
import Localizacao from './Localizacao';
import Caracteristicas from './Caracteristicas';
import ImagensUpload from './ImagensUpload';
import { salvarFluxoCarro } from '../../services/carroApiService';

const FluxoRegisto = () => {
  const navigate = useNavigate();
  
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carroId, setCarroId] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
  
  // 🔥 CORRIGIDO: Estado da localização com todos os campos
  const [localizacao, setLocalizacao] = useState({
    local: '',
    cidade: '',
    ilha: ''
  });
  
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [imagens, setImagens] = useState([]);
  
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const savedInfo = localStorage.getItem('carroInformacoes');
        if (savedInfo) setInformacoes(JSON.parse(savedInfo));
        
        const savedEspec = localStorage.getItem('carroEspecificacoes');
        if (savedEspec) setEspecificacoes(JSON.parse(savedEspec));
        
        // 🔥 CORRIGIDO: Carregar localização com todos os campos
        const savedLoc = localStorage.getItem('carroLocalizacao');
        if (savedLoc) {
          const parsedLoc = JSON.parse(savedLoc);
          setLocalizacao({
            local: parsedLoc.local || parsedLoc.cidade || '',
            cidade: parsedLoc.cidade || parsedLoc.local || '',
            ilha: parsedLoc.ilha || ''
          });
        }
        
        const savedCarac = localStorage.getItem('carroCaracteristicas');
        if (savedCarac) setCaracteristicas(JSON.parse(savedCarac));
        
        const savedImgs = localStorage.getItem('carroImagens');
        if (savedImgs) setImagens(JSON.parse(savedImgs));
        
        const savedId = localStorage.getItem('carroId');
        if (savedId) setCarroId(parseInt(savedId));
        
      } catch (e) {
        console.warn('Erro ao carregar dados:', e);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);
  
  const salvarProgresso = () => {
    localStorage.setItem('carroInformacoes', JSON.stringify(informacoes));
    localStorage.setItem('carroEspecificacoes', JSON.stringify(especificacoes));
    // 🔥 CORRIGIDO: Salvar localização com todos os campos
    localStorage.setItem('carroLocalizacao', JSON.stringify(localizacao));
    localStorage.setItem('carroCaracteristicas', JSON.stringify(caracteristicas));
    localStorage.setItem('carroImagens', JSON.stringify(imagens));
    if (carroId) localStorage.setItem('carroId', carroId);
  };
  
  const handleNext = () => {
    // Validar campos obrigatórios antes de avançar
    if (fase === 1) {
      if (!informacoes.titulo) {
        alert('O título do veículo é obrigatório');
        return;
      }
      if (!informacoes.preco_dia) {
        alert('O preço por dia é obrigatório');
        return;
      }
    }
    
    if (fase === 3) {
      if (!localizacao.ilha) {
        alert('A ilha é obrigatória');
        return;
      }
      if (!localizacao.local && !localizacao.cidade) {
        alert('A localização/cidade é obrigatória');
        return;
      }
    }
    
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
      
      console.log('📤 Enviando dados para criação:', dadosCompletos);
      
      const result = await salvarFluxoCarro(dadosCompletos, carroId);
      
      if (result.success) {
        localStorage.removeItem('carroInformacoes');
        localStorage.removeItem('carroEspecificacoes');
        localStorage.removeItem('carroLocalizacao');
        localStorage.removeItem('carroCaracteristicas');
        localStorage.removeItem('carroImagens');
        localStorage.removeItem('carroId');
        
        alert(`✅ ${result.message}`);
        navigate('/carro-registo/meus');
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
            <div key={index} className={`h-1 flex-1 rounded-full ${fase > index + 1 ? 'bg-[#006ce4]' : fase === index + 1 ? 'bg-[#006ce4]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={48} />
        <p className="mt-4 text-gray-600">Carregando dados...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-medium">{informacoes.titulo || 'Novo Carro'}</div>
            <div className="text-[10px] opacity-80">
              {fase === 1 && 'Informações básicas'}
              {fase === 2 && 'Especificações'}
              {fase === 3 && 'Localização'}
              {fase === 4 && `${caracteristicas.length} característica(s)`}
              {fase === 5 && `${imagens.length} foto(s)`}
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
                // carroId NÃO é passado em criação (é null)
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
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            
            {fase < 5 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#006ce4] text-white rounded-lg font-semibold hover:bg-[#0053b3]"
              >
                Continuar <ChevronRight size={18} />
              </button>
            )}
            
            {fase === 5 && (
              <button
                onClick={handleFinalizar}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader size={18} className="animate-spin" /> Salvando...</>
                ) : (
                  <><Check size={18} /> Finalizar Registo</>
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