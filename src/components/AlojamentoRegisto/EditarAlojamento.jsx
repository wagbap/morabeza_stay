// src/components/AlojamentoRegisto/EditarAlojamento.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User, ChevronRight, Loader } from 'lucide-react';
import PropMenu from './PropMenu';
import Comodidades from './Comodidades';
import InformacoesBasicas from './InformacoesBasicas';
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import RegistarLocalizacao from './RegistarLocalizacao'; // Importar o componente de localização
import { salvarFluxoRegisto, buscarAlojamentoParaEdicao, buscarQuartosDoAlojamento } from '../../services/apiService';
import 'mapbox-gl/dist/mapbox-gl.css';

const EditarAlojamento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [fase, setFase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alojamentoId, setAlojamentoId] = useState(id ? parseInt(id) : null);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);
  
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
  
  // FASE 2 - Localização (usando o novo componente)
  const [localizacaoDados, setLocalizacaoDados] = useState({
    endereco: '',
    cidade: '',
    ilha: '',
    codigo_postal: '',
    num_apartamento: '',
    morada_completa: '',
    coordenadas: { lat: null, lng: null }
  });
  
  // FASE 3 - Comodidades
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState([]);
  
  // FASE 4 - Regras
  const [regras, setRegras] = useState([]);
  const [regrasAdicionais, setRegrasAdicionais] = useState('');
  
  // FASE 5 - Fotos
  const [fotos, setFotos] = useState([]);
  
  // CARREGAR DADOS DO ALOJAMENTO
  const carregarDadosAlojamento = async (alojamentoIdParam) => {
    if (!alojamentoIdParam) return;
    
    setIsLoading(true);
    try {
      console.log(`📥 Carregando alojamento ID: ${alojamentoIdParam} para edição`);
      
      const resultado = await buscarAlojamentoParaEdicao(alojamentoIdParam);
      console.log('📦 Dados carregados:', resultado);
      
      if (resultado.success && resultado.data) {
        const dados = resultado.data;
        
        // 1. Informações Básicas
        const infoBasicas = {
          titulo: dados.titulo || '',
          tipo_propriedade: dados.tipo_propriedade || 'Apartamento',
          capacidade: dados.capacidade || 2,
          estrelas: dados.estrelas || 4.5,
          descricao: dados.descricao || '',
          descricao_detalhada: dados.descricao_detalhada || '',
          preco_noite: dados.preco_noite || '',
          tempo_resposta: dados.tempo_resposta || 'Dentro de 1 hora',
          quartos: dados.quartos || 1,
          camas: dados.camas || 1,
          casas_banho: dados.casas_banho || 1
        };
        setInformacoesBasicas(infoBasicas);
        
        // 2. Quartos
        let quartosDaBd = [];
        if (dados.quartos && Array.isArray(dados.quartos) && dados.quartos.length > 0) {
          quartosDaBd = dados.quartos;
        } else {
          const quartosResult = await buscarQuartosDoAlojamento(alojamentoIdParam);
          if (quartosResult.success && quartosResult.data) {
            quartosDaBd = quartosResult.data;
          }
        }
        setQuartosSelecionados(quartosDaBd);
        
        // 3. Localização
        console.log('📍 Processando morada...');
        
        // Tentar extrair localização dos dados
        if (dados.morada) {
          const enderecoCompleto = dados.morada.moradaCompleta || dados.morada.endereco || '';
          const endereco = dados.morada.morada || dados.morada.endereco || '';
          const cidadeValue = dados.morada.cidade || '';
          const ilhaValue = dados.morada.ilha || '';
          const codigoPostalValue = dados.morada.codigoPostal || dados.morada.codigo_postal || '';
          const numApartamentoValue = dados.morada.apartamento || dados.morada.num_apartamento || '';
          const coordenadasValue = dados.morada.coordenadas || { lat: dados.latitude || 16.8884, lng: dados.longitude || -24.9896 };
          
          setLocalizacaoDados({
            endereco: endereco,
            cidade: cidadeValue,
            ilha: ilhaValue,
            codigo_postal: codigoPostalValue,
            num_apartamento: numApartamentoValue,
            morada_completa: enderecoCompleto,
            coordenadas: coordenadasValue
          });
        } else if (dados.endereco || dados.localizacao) {
          // Fallback
          setLocalizacaoDados({
            endereco: dados.endereco || dados.localizacao || '',
            cidade: dados.cidade || '',
            ilha: dados.ilha || '',
            codigo_postal: dados.codigo_postal || '',
            num_apartamento: dados.num_apartamento || '',
            morada_completa: dados.morada_completa || '',
            coordenadas: { lat: dados.latitude || 16.8884, lng: dados.longitude || -24.9896 }
          });
        }
        
        // 4. Comodidades
        const comodidadesList = Array.isArray(dados.comodidades) ? dados.comodidades : [];
        setComodidadesSelecionadas(comodidadesList);
        
        // 5. Regras
        const regrasList = dados.regras?.regras || [];
        const regrasAdd = dados.regras?.regrasAdicionais || '';
        setRegras(regrasList);
        setRegrasAdicionais(regrasAdd);
        
        // 6. Fotos
        const fotosList = Array.isArray(dados.fotos) ? dados.fotos : [];
        setFotos(fotosList);
        
        // 7. Salvar no localStorage
        setAlojamentoId(dados.id);
        localStorage.setItem('propertyAlojamentoId', dados.id);
        localStorage.setItem('propertyInformacoesBasicas', JSON.stringify(infoBasicas));
        localStorage.setItem('propertyQuartos', JSON.stringify(quartosDaBd));
        localStorage.setItem('propertyLocalizacao', JSON.stringify(localizacaoDados));
        localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesList));
        localStorage.setItem('propertyRegras', JSON.stringify({ regras: regrasList, regrasAdicionais: regrasAdd }));
        localStorage.setItem('propertyFotos', JSON.stringify(fotosList));
        
        console.log('✅ Todos os dados carregados com sucesso!');
        
      } else {
        alert(`Erro ao carregar dados do alojamento: ${resultado.message}`);
        navigate('/alojamento-registro/meus');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      alert('Erro ao carregar dados do alojamento. Tente novamente.');
      navigate('/alojamento-registro/meus');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) carregarDadosAlojamento(id);
  }, [id]);
  
  // HANDLERS
  const handleLocalizacaoChange = (dados) => {
    console.log('📍 Localização atualizada:', dados);
    setLocalizacaoDados(dados);
    localStorage.setItem('propertyLocalizacao', JSON.stringify(dados));
  };
  
  const handleComodidadesChange = (comodidades) => {
    setComodidadesSelecionadas(comodidades);
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidades));
  };
  
  const handleRegrasChange = (dadosRegras) => {
    setRegras(dadosRegras.regras || []);
    setRegrasAdicionais(dadosRegras.regrasAdicionais || '');
    localStorage.setItem('propertyRegras', JSON.stringify(dadosRegras));
  };
  
  const handleQuartosChange = (quartos) => {
    setQuartosSelecionados(quartos);
    localStorage.setItem('propertyQuartos', JSON.stringify(quartos));
  };
  
  const handleSaveInformacoes = () => {
    if (!informacoesBasicas.titulo.trim()) {
      alert('O título da propriedade é obrigatório');
      return false;
    }
    if (!informacoesBasicas.descricao.trim()) {
      alert('A descrição curta é obrigatória');
      return false;
    }
    if (!informacoesBasicas.preco_noite) {
      alert('O preço por noite é obrigatório');
      return false;
    }
    
    localStorage.setItem('propertyInformacoesBasicas', JSON.stringify(informacoesBasicas));
    setFase(2);
    return true;
  };
  
  const handleSaveLocalizacao = () => {
    if (!localizacaoDados.endereco?.trim()) {
      alert('Por favor, insira o endereço');
      return false;
    }
    if (!localizacaoDados.cidade?.trim()) {
      alert('Por favor, insira a cidade');
      return false;
    }
    if (!localizacaoDados.ilha?.trim()) {
      alert('Por favor, selecione a ilha');
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
  
  const handleFinalizar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Validar fotos
      if (fotos.length === 0) {
        alert('⚠️ Adicione pelo menos uma foto do seu alojamento');
        setIsSubmitting(false);
        return;
      }
      
      const quartosFormatados = quartosSelecionados.map(q => ({
        tipo_quarto_id: q.tipo_quarto_id,
        quantidade_disponivel: q.quantidade_disponivel || 1,
        preco_personalizado: q.preco_personalizado || null
      }));
      
      const comodidadesIds = comodidadesSelecionadas.map(c => c.id || c);
      const regrasIds = regras.map(r => r.id || r);
      
      const dadosParaAPI = {
        proprietario_id: 1,
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
        localizacao: localizacaoDados.cidade,
        latitude: localizacaoDados.coordenadas?.lat || 16.8884,
        longitude: localizacaoDados.coordenadas?.lng || -24.9896,
        comodidades: comodidadesIds,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais,
        morada: {
          endereco: localizacaoDados.endereco,
          apartamento: localizacaoDados.num_apartamento,
          cidade: localizacaoDados.cidade,
          ilha: localizacaoDados.ilha,
          codigo_postal: localizacaoDados.codigo_postal,
          pais: 'Cabo Verde',
          morada_completa: localizacaoDados.morada_completa,
          lat: localizacaoDados.coordenadas?.lat || 16.8884,
          lng: localizacaoDados.coordenadas?.lng || -24.9896
        },
        quartos: quartosFormatados,
        imagens: fotos
          .filter(foto => foto.url || foto.path)
          .map((foto, index) => ({
            url: foto.url || foto.path,
            principal: index === 0 ? 1 : 0,
            ordem: index
          }))
      };
      
      console.log('📤 Payload final:', JSON.stringify(dadosParaAPI, null, 2));
      
      const result = await salvarFluxoRegisto(dadosParaAPI, alojamentoId);
      
      if (result.success) {
        localStorage.removeItem('propertyInformacoesBasicas');
        localStorage.removeItem('propertyLocalizacao');
        localStorage.removeItem('propertyComodidades');
        localStorage.removeItem('propertyRegras');
        localStorage.removeItem('propertyQuartos');
        localStorage.removeItem('propertyFotos');
        
        alert(`✅ ${result.message}`);
        navigate('/alojamento-registro/meus');
      } else {
        alert(`⚠️ Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar:', error);
      alert('Erro ao processar o registo. Tente novamente.\n' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    if (fase > 1) {
      setFase(fase - 1);
    } else {
      navigate('/alojamento-registro/meus');
    }
  };
  
  const handleEditInfo = () => setFase(1);
  const handleEditLocation = () => setFase(2);
  const handleEditComodidades = () => setFase(3);
  const handleEditRegras = () => setFase(4);
  
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
            <div key={index} className={`h-1 flex-1 rounded-full ${fase > index + 1 ? 'bg-[#006ce4]' : fase === index + 1 ? 'bg-[#006ce4] bg-opacity-50' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-[#006ce4] mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do alojamento...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }
  
  // RENDERIZAÇÃO DAS FASES
  const renderFaseInformacoes = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar informações da propriedade</h1>
          <p className="text-gray-600 mb-8">Atualize os dados principais do seu alojamento.</p>
          
          <InformacoesBasicas 
            dados={informacoesBasicas}
            onDadosChange={setInformacoesBasicas}
            onQuartosChange={handleQuartosChange}
            alojamentoId={alojamentoId}  
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveInformacoes} className="px-6 py-2.5 bg-[#006ce4] text-white rounded-lg flex items-center gap-2">
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseLocalizacao = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📍 Localização do Alojamento</h2>
          <p className="text-gray-600 mb-6">Onde fica a sua propriedade?</p>
          
          <RegistarLocalizacao
            dados={localizacaoDados}
            onChange={handleLocalizacaoChange}
            alojamentoId={alojamentoId}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-6">
            <button onClick={handleBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Voltar
            </button>
            <button onClick={handleSaveLocalizacao} className="px-6 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseComodidades = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Comodidades da propriedade</h1>
          <p className="text-gray-600 mb-6">Selecione todas as comodidades disponíveis.</p>
          
          <Comodidades 
            alojamentoId={alojamentoId}
            onChange={handleComodidadesChange}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveComodidades} className="px-6 py-2.5 bg-[#006ce4] text-white rounded-lg flex items-center gap-2">
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseRegras = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regras da casa</h1>
          <p className="text-gray-600 mb-6">Defina as regras e políticas da sua propriedade.</p>
          
          <Regras 
            alojamentoId={alojamentoId}
            onChange={handleRegrasChange}
            initialRegras={regras}
            initialRegrasAdicionais={regrasAdicionais}
            readOnly={false}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button onClick={handleSaveRegras} className="px-6 py-2.5 bg-[#006ce4] text-white rounded-lg flex items-center gap-2">
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFaseFotos = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /><span>Voltar</span>
        </button>
        {renderProgressBar()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fotos da sua propriedade</h1>
          <p className="text-gray-600 mb-8">As primeiras impressões são visuais. Adicione fotos de alta qualidade para atrair mais hóspedes.</p>
          
          <ImagensUpload 
            fotos={fotos} 
            onFotosChange={setFotos} 
            maxFotos={20} 
            alojamentoId={alojamentoId}
          />
          
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg">Voltar</button>
            <button 
              onClick={handleFinalizar} 
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Atualizar Registo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <PropMenu 
              nomePropriedade={informacoesBasicas.titulo || 'Nova Propriedade'} 
              alojamentoId={alojamentoId}
              onEditName={handleEditInfo} 
              onEditLocation={handleEditLocation} 
              onEditComodidades={handleEditComodidades} 
              onEditRegras={handleEditRegras}
            />
            <div className="text-[10px] opacity-80">
              {fase === 1 && 'Editar informações'}
              {fase === 2 && 'Editar localização'}
              {fase === 3 && `${comodidadesSelecionadas.length} comodidade(s)`}
              {fase === 4 && `${regras.length} regra(s)`}
              {fase === 5 && `${fotos.length} foto(s)`}
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
      
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {fase !== 2 && renderProgressBar()}
      </div>
      
      {fase === 1 && renderFaseInformacoes()}
      {fase === 2 && renderFaseLocalizacao()}
      {fase === 3 && renderFaseComodidades()}
      {fase === 4 && renderFaseRegras()}
      {fase === 5 && renderFaseFotos()}
    </>
  );
};

export default EditarAlojamento;