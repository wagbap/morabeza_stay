// src/components/AlojamentoRegisto/Localizacao.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, Home, AlertCircle, Loader, Navigation, Building } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const ILHAS_CABO_VERDE = [
  'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo', 
  'Santo Antão', 'Maio', 'São Nicolau', 'Brava', 'Santa Luzia'
];

const LOCALIZACOES_SUGESTAO = [
  // Santiago
  { nome: 'Platô - Praia Centro', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110' },
  { nome: 'Achada Santo António', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110' },
  { nome: 'Palmarejo', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110' },
  { nome: 'Quebra Canela', cidade: 'Praia', ilha: 'Santiago', codigoPostal: '7110' },
  { nome: 'Tarrafal - Praia', cidade: 'Tarrafal', ilha: 'Santiago', codigoPostal: '7310' },
  { nome: 'Cidade Velha - Centro Histórico', cidade: 'Cidade Velha', ilha: 'Santiago', codigoPostal: '7120' },
  { nome: 'Assomada - Mercado', cidade: 'Assomada', ilha: 'Santiago', codigoPostal: '7310' },
  
  // São Vicente
  { nome: 'Avenida Marginal - Mindelo', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110' },
  { nome: 'Praça Nova - Mindelo Centro', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110' },
  { nome: 'Lazareto', cidade: 'Mindelo', ilha: 'São Vicente', codigoPostal: '2110' },
  
  // Sal
  { nome: 'Santa Maria - Zona Turística', cidade: 'Santa Maria', ilha: 'Sal', codigoPostal: '4111' },
  { nome: 'Rua Pedonal de Santa Maria', cidade: 'Santa Maria', ilha: 'Sal', codigoPostal: '4111' },
  { nome: 'Espargos - Centro', cidade: 'Espargos', ilha: 'Sal', codigoPostal: '4110' },
  
  // Boa Vista
  { nome: 'Sal Rei - Beira Mar', cidade: 'Sal Rei', ilha: 'Boa Vista', codigoPostal: '5110' },
  { nome: 'Praia de Chaves', cidade: 'Sal Rei', ilha: 'Boa Vista', codigoPostal: '5110' },
  
  // Fogo
  { nome: 'São Filipe - Centro', cidade: 'São Filipe', ilha: 'Fogo', codigoPostal: '8110' },
  { nome: 'Chã das Caldeiras - Vulcão', cidade: 'Chã das Caldeiras', ilha: 'Fogo', codigoPostal: '8110' },
  
  // Santo Antão
  { nome: 'Ribeira Grande - Vale', cidade: 'Ribeira Grande', ilha: 'Santo Antão', codigoPostal: '1110' },
  { nome: 'Porto Novo - Cais', cidade: 'Porto Novo', ilha: 'Santo Antão', codigoPostal: '1120' },
  { nome: 'Ponta do Sol - Mirante', cidade: 'Ponta do Sol', ilha: 'Santo Antão', codigoPostal: '1110' },
  { nome: 'Paul - Vale', cidade: 'Paul', ilha: 'Santo Antão', codigoPostal: '1110' }
];

const LocalizacaoAlojamento = ({ dados = {}, onChange, readOnly = false, alojamentoId = null }) => {
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState('');
  const [ilha, setIlha] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [numApartamento, setNumApartamento] = useState('');
  const [moradaCompleta, setMoradaCompleta] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const [coordenadas, setCoordenadas] = useState({ lat: null, lng: null });
  
  // CARREGAR DADOS DA API
  useEffect(() => {
    const carregarLocalizacao = async () => {
      if (!alojamentoId || carregado) return;
      
      setLoading(true);
      try {
        console.log(`📍 Buscando localização para alojamento ID: ${alojamentoId}`);
        
        const response = await fetch(`${API_URL}/api/alojamento/buscar_localizacao.php?id=${alojamentoId}`);
        const result = await response.json();
        
        console.log('📦 Resposta da API:', result);
        
        if (result.success && result.data) {
          const enderecoValue = result.data.endereco || result.data.morada || '';
          const cidadeValue = result.data.cidade || '';
          const ilhaValue = result.data.ilha || '';
          const codigoPostalValue = result.data.codigo_postal || result.data.codigoPostal || '';
          const numApartamentoValue = result.data.num_apartamento || result.data.apartamento || '';
          const moradaCompletaValue = result.data.morada_completa || result.data.moradaCompleta || '';
          
          setBusca(enderecoValue);
          setCidade(cidadeValue);
          setIlha(ilhaValue);
          setCodigoPostal(codigoPostalValue);
          setNumApartamento(numApartamentoValue);
          setMoradaCompleta(moradaCompletaValue);
          
          if (result.data.latitude && result.data.longitude) {
            setCoordenadas({ lat: result.data.latitude, lng: result.data.longitude });
          }
          
          onChange({
            endereco: enderecoValue,
            morada: enderecoValue,
            cidade: cidadeValue,
            ilha: ilhaValue,
            codigo_postal: codigoPostalValue,
            num_apartamento: numApartamentoValue,
            morada_completa: moradaCompletaValue,
            coordenadas: { lat: result.data.latitude, lng: result.data.longitude }
          });
          
          setCarregado(true);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar localização:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarLocalizacao();
  }, [alojamentoId, onChange, carregado]);
  
  // Atualizar quando dados prop mudar
  useEffect(() => {
    if (dados && !carregado) {
      if (dados.endereco) setBusca(dados.endereco);
      else if (dados.morada) setBusca(dados.morada);
      if (dados.cidade) setCidade(dados.cidade);
      if (dados.ilha) setIlha(dados.ilha);
      if (dados.codigo_postal || dados.codigoPostal) setCodigoPostal(dados.codigo_postal || dados.codigoPostal);
      if (dados.num_apartamento || dados.apartamento) setNumApartamento(dados.num_apartamento || dados.apartamento);
      if (dados.morada_completa || dados.moradaCompleta) setMoradaCompleta(dados.morada_completa || dados.moradaCompleta);
      if (dados.coordenadas) setCoordenadas(dados.coordenadas);
    }
  }, [dados, carregado]);
  
  // Construir morada completa
  const construirMoradaCompleta = (endereco, apartamento, cidadeLocal, codigoLocal, ilhaLocal) => {
    const partes = [];
    if (endereco) partes.push(endereco);
    if (apartamento) partes.push(apartamento);
    if (cidadeLocal) partes.push(cidadeLocal);
    if (codigoLocal) partes.push(codigoLocal);
    if (ilhaLocal) partes.push(ilhaLocal);
    partes.push('Cabo Verde');
    return partes.join(', ');
  };
  
  // HANDLERS
  const handleEnderecoChange = (valor) => {
    setBusca(valor);
    const novaMoradaCompleta = construirMoradaCompleta(valor, numApartamento, cidade, codigoPostal, ilha);
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: valor,
      morada: valor,
      cidade: cidade,
      ilha: ilha,
      codigo_postal: codigoPostal,
      num_apartamento: numApartamento,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
  };
  
  const handleNumApartamentoChange = (valor) => {
    setNumApartamento(valor);
    const novaMoradaCompleta = construirMoradaCompleta(busca, valor, cidade, codigoPostal, ilha);
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: busca,
      morada: busca,
      cidade: cidade,
      ilha: ilha,
      codigo_postal: codigoPostal,
      num_apartamento: valor,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
  };
  
  const handleCidadeChange = (valor) => {
    setCidade(valor);
    const novaMoradaCompleta = construirMoradaCompleta(busca, numApartamento, valor, codigoPostal, ilha);
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: busca,
      morada: busca,
      cidade: valor,
      ilha: ilha,
      codigo_postal: codigoPostal,
      num_apartamento: numApartamento,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
  };
  
  const handleIlhaChange = (valor) => {
    setIlha(valor);
    const novaMoradaCompleta = construirMoradaCompleta(busca, numApartamento, cidade, codigoPostal, valor);
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: busca,
      morada: busca,
      cidade: cidade,
      ilha: valor,
      codigo_postal: codigoPostal,
      num_apartamento: numApartamento,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
  };
  
  const handleCodigoPostalChange = (valor) => {
    setCodigoPostal(valor);
    const novaMoradaCompleta = construirMoradaCompleta(busca, numApartamento, cidade, valor, ilha);
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: busca,
      morada: busca,
      cidade: cidade,
      ilha: ilha,
      codigo_postal: valor,
      num_apartamento: numApartamento,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
  };
  
  const handleSelecionarSugestao = (sugestao) => {
    setBusca(sugestao.nome);
    setCidade(sugestao.cidade);
    setIlha(sugestao.ilha);
    setCodigoPostal(sugestao.codigoPostal || '');
    
    const novaMoradaCompleta = construirMoradaCompleta(
      sugestao.nome, 
      numApartamento, 
      sugestao.cidade, 
      sugestao.codigoPostal || '', 
      sugestao.ilha
    );
    setMoradaCompleta(novaMoradaCompleta);
    
    onChange({
      endereco: sugestao.nome,
      morada: sugestao.nome,
      cidade: sugestao.cidade,
      ilha: sugestao.ilha,
      codigo_postal: sugestao.codigoPostal || '',
      num_apartamento: numApartamento,
      morada_completa: novaMoradaCompleta,
      coordenadas: coordenadas
    });
    
    setMostrarSugestoes(false);
  };
  
  const sugestoesFiltradas = useMemo(() => {
    if (!busca || typeof busca !== 'string' || busca.trim() === '') return LOCALIZACOES_SUGESTAO.slice(0, 10);
    const termo = busca.toLowerCase().trim();
    return LOCALIZACOES_SUGESTAO.filter(s => 
      s.nome.toLowerCase().includes(termo) ||
      s.cidade.toLowerCase().includes(termo) ||
      s.ilha.toLowerCase().includes(termo)
    ).slice(0, 10);
  }, [busca]);
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={32} />
        <p className="mt-2 text-sm text-gray-500">Carregando localização salva...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* ENDEREÇO COMPLETO */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Endereço Completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => handleEnderecoChange(e.target.value)}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
            placeholder="Ex: Avenida Marginal, Praia de Santa Maria, Rua Pedonal..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Rua/Avenida, número, bairro</p>
        
        {mostrarSugestoes && sugestoesFiltradas.length > 0 && !readOnly && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {sugestoesFiltradas.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelecionarSugestao(sug)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
              >
                <MapPin size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{sug.nome}</p>
                  <p className="text-xs text-gray-500">{sug.cidade}, {sug.ilha}</p>
                  {sug.codigoPostal && <p className="text-xs text-gray-400">CP: {sug.codigoPostal}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* NÚMERO DO APARTAMENTO/PISO */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Número do apartamento/piso <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={numApartamento}
            onChange={(e) => handleNumApartamentoChange(e.target.value)}
            placeholder="Ex: 2º Esquerdo, Apartamento 12, 3º Andar..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Especifique o andar, apartamento ou unidade</p>
      </div>
      
      {/* CIDADE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cidade <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={cidade}
            onChange={(e) => handleCidadeChange(e.target.value)}
            placeholder="Ex: Santa Maria, Mindelo, Praia..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
      </div>
      
      {/* ILHA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ilha <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Navigation size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={ilha}
            onChange={(e) => handleIlhaChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
            disabled={readOnly}
          >
            <option value="">Selecione a ilha</option>
            {ILHAS_CABO_VERDE.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* CÓDIGO POSTAL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Código Postal <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={codigoPostal}
            onChange={(e) => handleCodigoPostalChange(e.target.value)}
            placeholder="Ex: 7110, 2110, 4111..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Código postal da localização</p>
      </div>
      
      {/* MORADA COMPLETA (PREVIEW) */}
      {moradaCompleta && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">📋 Morada Completa:</p>
          <p className="text-sm text-gray-800">{moradaCompleta}, Cabo Verde</p>
        </div>
      )}
      
      {/* INDICADOR DE DADOS CARREGADOS */}
      {carregado && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xs text-green-700">✅ Localização carregada do seu alojamento</p>
        </div>
      )}
      
      {/* DICA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">💡 Dicas para localização:</p>
            <p>• Endereço completo ajuda hóspedes a chegar</p>
            <p>• Número de apartamento evita confusões</p>
            <p>• Cidade e ilha corretas facilitam a busca</p>
            <p>• Código postal ajuda na navegação GPS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizacaoAlojamento;