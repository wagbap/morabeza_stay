// src/components/CarroRegisto/EditarCarro.jsx
// CORRIGIDO - Localização funcionando corretamente

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, HelpCircle, User, Loader } from 'lucide-react';
import InformacoesBasicas from './InformacoesBasicas';
import Especificacoes from './Especificacoes';
import Localizacao from './Localizacao';
import Caracteristicas from './Caracteristicas';
import ImagensUpload from './ImagensUpload';
import { buscarCarro, salvarFluxoCarro } from '../../services/carroApiService';

const EditarCarro = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
          alert('Erro ao carregar dados do veículo: ' + (result.message || ''));
          navigate('/carro-registo/meus');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        alert('Erro ao carregar dados: ' + error.message);
        navigate('/carro-registo/meus');
      } finally {
        setLoading(false);
      }
    };
    
    carregarCarro();
  }, [carroId, navigate]);
  
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
        alert(`✅ ${result.message}`);
        navigate('/carro-registo/meus');
      } else {
        alert(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar as alterações.\n' + error.message);
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
        <p className="mt-4 text-gray-600">Carregando veículo...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
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
              <p className="text-gray-600 mb-6">Atualize os dados do veículo.</p>
              <InformacoesBasicas 
                dados={informacoes}
                onChange={setInformacoes}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Especificações</h1>
              <p className="text-gray-600 mb-6">Atualize os detalhes técnicos.</p>
              <Especificacoes 
                dados={especificacoes}
                onChange={setEspecificacoes}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 3 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Localização</h1>
              <p className="text-gray-600 mb-6">Atualize onde o veículo está disponível.</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Características</h1>
              <p className="text-gray-600 mb-6">Atualize os equipamentos do veículo.</p>
              <Caracteristicas 
                items={caracteristicas}
                onChange={setCaracteristicas}
                readOnly={false}
              />
            </>
          )}
          
          {fase === 5 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Fotos</h1>
              <p className="text-gray-600 mb-6">Atualize as fotos do veículo.</p>
              <ImagensUpload 
                imagens={imagens}
                onChange={setImagens}
                veiculoId={carroId}
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
                  <><Check size={18} /> Salvar Alterações</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarCarro;