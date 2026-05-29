// src/components/CarroRegisto/Localizacao.jsx
// CORRIGIDO - Envia cidade corretamente

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

const Localizacao = ({ dados = {}, onChange, readOnly = false, carroId = null }) => {
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState('');
  const [ilha, setIlha] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregado, setCarregado] = useState(false);
  
  // 🔥 CARREGAR DADOS DA API (quando estiver editando)
  useEffect(() => {
    const carregarLocalizacao = async () => {
      if (!carroId || carregado) return;
      
      setLoading(true);
      try {
        console.log(`📍 Buscando localização para carro ID: ${carroId}`);
        
        const response = await fetch(`${API_URL}/api/carro/buscar.php?id=${carroId}`);
        const result = await response.json();
        
        console.log('📦 Resposta da API:', result);
        
        if (result.success && result.data) {
          const localizacaoValue = result.data.localizacao || '';
          const cidadeValue = result.data.cidade || result.data.localizacao || '';
          const ilhaValue = result.data.ilha || '';
          
          setBusca(localizacaoValue);
          setCidade(cidadeValue);
          setIlha(ilhaValue);
          
          // 🔥 ENVIAR PARA O PAI NO FORMATO CORRETO (com cidade!)
          onChange({
            local: localizacaoValue,
            localizacao: localizacaoValue,
            cidade: cidadeValue,
            ilha: ilhaValue
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
  }, [carroId, onChange, carregado]);
  
  // Atualizar quando dados prop mudar (vindo do pai)
  useEffect(() => {
    if (dados && !carregado) {
      console.log('📥 Dados recebidos do pai:', dados);
      
      // Priorizar campo cidade
      if (dados.cidade) setCidade(dados.cidade);
      else if (dados.local) setCidade(dados.local);
      else if (dados.localizacao) setCidade(dados.localizacao);
      
      // Campo de busca (localização)
      if (dados.local) setBusca(dados.local);
      else if (dados.localizacao) setBusca(dados.localizacao);
      else if (dados.cidade) setBusca(dados.cidade);
      
      // Ilha
      if (dados.ilha) setIlha(dados.ilha);
    }
  }, [dados, carregado]);
  
  // 🔥 HANDLERS - ENVIAM DADOS NO FORMATO CORRETO
  const handleLocalizacaoChange = (valor) => {
    setBusca(valor);
    setCidade(valor); // 🔥 Mantém cidade sincronizada com a busca
    onChange({
      local: valor,
      localizacao: valor,
      cidade: valor, // 🔥 Envia cidade!
      ilha: ilha
    });
  };
  
  const handleCidadeChange = (valor) => {
    setCidade(valor);
    setBusca(valor); // 🔥 Mantém busca sincronizada com a cidade
    onChange({
      local: valor,
      localizacao: valor,
      cidade: valor, // 🔥 Envia cidade!
      ilha: ilha
    });
  };
  
  const handleIlhaChange = (valor) => {
    setIlha(valor);
    onChange({
      local: busca,
      localizacao: busca,
      cidade: cidade,
      ilha: valor
    });
  };
  
  const handleSelecionarSugestao = (sugestao) => {
    setBusca(sugestao.nome);
    setCidade(sugestao.cidade);
    setIlha(sugestao.ilha);
    
    onChange({
      local: sugestao.nome,
      localizacao: sugestao.nome,
      cidade: sugestao.cidade, // 🔥 Envia a cidade da sugestão!
      ilha: sugestao.ilha
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
        <p className="mt-2 text-sm text-gray-500">Carregando localização salva...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* LOCALIZAÇÃO / CIDADE COM SUGESTÕES */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Localização / Cidade <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => handleLocalizacaoChange(e.target.value)}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
            placeholder="Ex: Praia, Mindelo, Santa Maria..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Cidade onde o veículo está disponível</p>
        
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
      
      {/* CIDADE (campo separado - sincronizado) */}
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
        <p className="text-xs text-gray-400 mt-1">Mesma informação do campo acima</p>
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
          <p className="text-xs text-green-700">✅ Localização carregada do veículo</p>
        </div>
      )}
      
      {/* DICA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">💡 Informações importantes:</p>
            <p>• Informe a cidade onde o veículo está disponível</p>
            <p>• Selecione a ilha correta para facilitar a busca</p>
            <p>• Use as sugestões para preenchimento rápido</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localizacao;