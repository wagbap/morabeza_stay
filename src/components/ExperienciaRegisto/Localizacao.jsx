// src/components/ExperienciaRegisto/Localizacao.jsx
// VERSÃO CORRIGIDA - ENVIA ENDEREÇO CORRETAMENTE

import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Search, Navigation, Home, AlertCircle, Loader } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const ILHAS_CABO_VERDE = [
  'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo', 
  'Santo Antão', 'Maio', 'São Nicolau', 'Brava', 'Santa Luzia'
];

const LOCALIZACOES_SUGESTAO = [
  { nome: 'Praia de Santa Maria', cidade: 'Santa Maria', ilha: 'Sal' },
  { nome: 'Mindelo Centro - Avenida Marginal', cidade: 'Mindelo', ilha: 'São Vicente' },
  { nome: 'Platô - Praia (Centro da Cidade)', cidade: 'Praia', ilha: 'Santiago' },
  { nome: 'Sal Rei - Beira Mar', cidade: 'Sal Rei', ilha: 'Boa Vista' },
  { nome: 'Cidade Velha - Centro Histórico', cidade: 'Cidade Velha', ilha: 'Santiago' },
  { nome: 'Tarrafal - Praia', cidade: 'Tarrafal', ilha: 'Santiago' },
  { nome: 'São Filipe - Centro', cidade: 'São Filipe', ilha: 'Fogo' },
  { nome: 'Chã das Caldeiras - Vulcão', cidade: 'Chã das Caldeiras', ilha: 'Fogo' },
  { nome: 'Ribeira Grande - Vale', cidade: 'Ribeira Grande', ilha: 'Santo Antão' },
  { nome: 'Porto Novo - Cais', cidade: 'Porto Novo', ilha: 'Santo Antão' },
  { nome: 'Espargos - Centro', cidade: 'Espargos', ilha: 'Sal' },
  { nome: 'Pedra de Lume - Salinas', cidade: 'Pedra de Lume', ilha: 'Sal' },
  { nome: 'Assomada - Mercado', cidade: 'Assomada', ilha: 'Santiago' },
  { nome: 'Ponta do Sol - Mirante', cidade: 'Ponta do Sol', ilha: 'Santo Antão' },
  { nome: 'Paul - Vale', cidade: 'Paul', ilha: 'Santo Antão' }
];

const Localizacao = ({ dados = {}, onChange, readOnly = false, experienciaId = null }) => {
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState('');
  const [ilha, setIlha] = useState('');
  const [pontoEncontro, setPontoEncontro] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregado, setCarregado] = useState(false);
  
  // 🔥 CARREGAR DADOS DA API
  useEffect(() => {
    const carregarEndereco = async () => {
      if (!experienciaId || carregado) return;
      
      setLoading(true);
      try {
        console.log(`📍 Buscando endereço para experiência ID: ${experienciaId}`);
        
        const response = await fetch(`${API_URL}/api/experiencia/buscar_localizacao.php?id=${experienciaId}`);
        const result = await response.json();
        
        console.log('📦 Resposta da API:', result);
        
        if (result.success && result.data) {
          const enderecoValue = result.data.endereco || result.data.morada || '';
          const cidadeValue = result.data.cidade || '';
          const ilhaValue = result.data.ilha || '';
          const pontoValue = result.data.ponto_encontro || '';
          
          setBusca(enderecoValue);
          setCidade(cidadeValue);
          setIlha(ilhaValue);
          setPontoEncontro(pontoValue);
          
          // 🔥 ENVIAR PARA O PAI NO FORMATO CORRETO
          onChange({
            endereco: enderecoValue,
            morada: enderecoValue,
            cidade: cidadeValue,
            ilha: ilhaValue,
            ponto_encontro: pontoValue
          });
          
          setCarregado(true);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar endereço:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarEndereco();
  }, [experienciaId, onChange, carregado]);
  
  // Atualizar quando dados prop mudar
  useEffect(() => {
    if (dados && !carregado) {
      if (dados.endereco) setBusca(dados.endereco);
      else if (dados.morada) setBusca(dados.morada);
      if (dados.cidade) setCidade(dados.cidade);
      if (dados.ilha) setIlha(dados.ilha);
      if (dados.ponto_encontro) setPontoEncontro(dados.ponto_encontro);
    }
  }, [dados, carregado]);
  
  // 🔥 HANDLERS - ENVIAM DADOS NO FORMATO CORRETO
  const handleEnderecoChange = (valor) => {
    setBusca(valor);
    onChange({
      endereco: valor,
      morada: valor,
      cidade: cidade,
      ilha: ilha,
      ponto_encontro: pontoEncontro
    });
  };
  
  const handleCidadeChange = (valor) => {
    setCidade(valor);
    onChange({
      endereco: busca,
      morada: busca,
      cidade: valor,
      ilha: ilha,
      ponto_encontro: pontoEncontro
    });
  };
  
  const handleIlhaChange = (valor) => {
    setIlha(valor);
    onChange({
      endereco: busca,
      morada: busca,
      cidade: cidade,
      ilha: valor,
      ponto_encontro: pontoEncontro
    });
  };
  
  const handlePontoEncontroChange = (valor) => {
    setPontoEncontro(valor);
    onChange({
      endereco: busca,
      morada: busca,
      cidade: cidade,
      ilha: ilha,
      ponto_encontro: valor
    });
  };
  
  const handleSelecionarSugestao = (sugestao) => {
    setBusca(sugestao.nome);
    setCidade(sugestao.cidade);
    setIlha(sugestao.ilha);
    
    onChange({
      endereco: sugestao.nome,
      morada: sugestao.nome,
      cidade: sugestao.cidade,
      ilha: sugestao.ilha,
      ponto_encontro: pontoEncontro
    });
    
    setMostrarSugestoes(false);
  };
  
  const sugestoesFiltradas = useMemo(() => {
    if (!busca || typeof busca !== 'string' || busca.trim() === '') return LOCALIZACOES_SUGESTAO;
    const termo = busca.toLowerCase().trim();
    return LOCALIZACOES_SUGESTAO.filter(s => 
      s.nome.toLowerCase().includes(termo) ||
      s.cidade.toLowerCase().includes(termo) ||
      s.ilha.toLowerCase().includes(termo)
    );
  }, [busca]);
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={32} />
        <p className="mt-2 text-sm text-gray-500">Carregando endereço salvo...</p>
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
            placeholder="Ex: Avenida Marginal, Praia de Santa Maria, Mindelo Centro..."
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
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* PONTO DE ENCONTRO */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ponto de Encontro (detalhado)
        </label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={pontoEncontro}
            onChange={(e) => handlePontoEncontroChange(e.target.value)}
            placeholder="Ex: Em frente ao pier, Entrada principal do hotel..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Local específico para encontro dos participantes</p>
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
      
      {/* INDICADOR DE DADOS CARREGADOS */}
      {carregado && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xs text-green-700">✅ Endereço carregado da sua experiência</p>
        </div>
      )}
      
      {/* DICA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">💡 Informações importantes:</p>
            <p>• Endereço completo ajuda os hóspedes a chegar</p>
            <p>• Ponto de encontro específico evita confusões</p>
            <p>• Cidade e ilha corretas facilitam a busca</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localizacao;