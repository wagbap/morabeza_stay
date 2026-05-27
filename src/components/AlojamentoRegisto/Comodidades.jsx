// src/components/AlojamentoRegisto/Comodidades.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Wifi, Coffee, Tv, Utensils, Snowflake, Wind, Dumbbell, Car, Waves, Volume2, Fan, Flame, Refrigerator, Mic, Bath, Shirt, Baby, DoorOpen, Lock, ShoppingBag, Sun, Loader, AlertCircle, Search } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const getIcone = (iconeNome) => {
  const icons = {
    wifi: <Wifi size={20} />,
    snowflake: <Snowflake size={20} />,
    tv: <Tv size={20} />,
    coffee: <Coffee size={20} />,
    utensils: <Utensils size={20} />,
    waves: <Waves size={20} />,
    car: <Car size={20} />,
    sun: <Sun size={20} />,
    baby: <Baby size={20} />,
    dumbbell: <Dumbbell size={20} />,
    wind: <Wind size={20} />,
    flame: <Flame size={20} />,
    refrigerator: <Refrigerator size={20} />,
    mic: <Mic size={20} />,
    shirt: <Shirt size={20} />,
    lock: <Lock size={20} />,
    doorOpen: <DoorOpen size={20} />,
    volume2: <Volume2 size={20} />,
    fan: <Fan size={20} />,
    shoppingBag: <ShoppingBag size={20} />,
    bath: <Bath size={20} />,
  };
  return icons[iconeNome?.toLowerCase()] || <Check size={20} />;
};

const Comodidades = ({ alojamentoId, onChange, readOnly = false, initialComodidades = [] }) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [comodidades, setComodidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔥 FUNÇÃO PARA SALVAR NO LOCALSTORAGE
  const salvarNoLocalStorage = useCallback((comodidadesSelecionadas) => {
    const comodidadesParaSalvar = comodidadesSelecionadas.map(c => ({
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      categoria: c.categoria
    }));
    localStorage.setItem('propertyComodidades', JSON.stringify(comodidadesParaSalvar));
    console.log('💾 Comodidades salvas no localStorage:', comodidadesParaSalvar);
  }, []);

  // 🔥 FUNÇÃO PARA CARREGAR DO LOCALSTORAGE
  const carregarDoLocalStorage = useCallback(() => {
    const saved = localStorage.getItem('propertyComodidades');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('📦 Comodidades carregadas do localStorage:', parsed);
          return parsed;
        }
      } catch (e) {
        console.error('Erro ao carregar localStorage:', e);
      }
    }
    return [];
  }, []);

  // Carregar comodidades da API
  const fetchComodidades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Se tiver alojamentoId (modo edição), buscar da API com seleção
      let url;
      if (alojamentoId) {
        url = `${API_URL}/api/alojamento/buscar_comodidades_com_selecao.php?id=${alojamentoId}`;
      } else {
        url = `${API_URL}/api/alojamento/buscar_comodidades.php`;
      }
      
      console.log(`🔄 Buscando comodidades de: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      console.log('📦 Resposta da API:', data);
      
      let comodidadesLista = [];
      
      if (alojamentoId) {
        // Modo edição: API retorna com selecionada true/false
        if (data.success && Array.isArray(data.data)) {
          comodidadesLista = data.data;
        } else if (data.success && Array.isArray(data.comodidades)) {
          comodidadesLista = data.comodidades;
        }
      } else {
        // Modo criação: API retorna todas as comodidades
        if (data.success && Array.isArray(data.data)) {
          // Carregar do localStorage as que já foram selecionadas
          const savedComodidades = carregarDoLocalStorage();
          const savedIds = new Set(savedComodidades.map(c => c.id));
          
          comodidadesLista = data.data.map(c => ({
            ...c,
            selecionada: savedIds.has(c.id)
          }));
        }
      }
      
      if (comodidadesLista.length > 0) {
        setComodidades(comodidadesLista);
        
        // Notificar pai com as selecionadas
        const selecionadas = comodidadesLista.filter(c => c.selecionada);
        if (onChange) {
          onChange(selecionadas);
        }
        
        // Salvar no localStorage se for modo criação
        if (!alojamentoId && selecionadas.length > 0) {
          salvarNoLocalStorage(selecionadas);
        }
      } else {
        setComodidades([]);
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar comodidades:', err);
      setError(err.message);
      
      // Em caso de erro, tentar carregar do localStorage
      const savedComodidades = carregarDoLocalStorage();
      if (savedComodidades.length > 0) {
        console.log('📦 Usando comodidades do localStorage como fallback');
        setComodidades(savedComodidades.map(c => ({ ...c, selecionada: true })));
        if (onChange) onChange(savedComodidades);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComodidades();
  }, [alojamentoId]);

  // 🔥 TOGGLE COMODIDADE - SALVA NO LOCALSTORAGE
  const toggleComodidade = async (id) => {
    if (readOnly) return;
    
    const comodidade = comodidades.find(c => c.id === id);
    if (!comodidade) return;
    
    const novoEstado = !comodidade.selecionada;
    
    // Atualizar UI imediatamente
    setComodidades(prev => {
      const novas = prev.map(c => 
        c.id === id ? { ...c, selecionada: novoEstado } : c
      );
      
      // Filtrar as selecionadas
      const selecionadas = novas.filter(c => c.selecionada);
      
      // 🔥 SALVAR NO LOCALSTORAGE (sempre!)
      salvarNoLocalStorage(selecionadas);
      
      // Notificar o pai (FluxoRegisto)
      if (onChange) {
        onChange(selecionadas);
      }
      
      return novas;
    });
    
    // Mostrar feedback
    showToast(
      novoEstado ? `${comodidade.nome} adicionada` : `${comodidade.nome} removida`,
      novoEstado ? 'success' : 'info'
    );
    
    // Se for modo edição, persistir no backend também
    if (alojamentoId) {
      setSaving(true);
      try {
        const response = await fetch(`${API_URL}/api/alojamento/alternar_comodidade.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alojamento_id: alojamentoId,
            comodidade_id: id,
            ativar: novoEstado ? 1 : 0
          })
        });
        const data = await response.json();
        if (!data.success) {
          console.error('Erro ao salvar no backend');
        }
      } catch (error) {
        console.error('Erro ao salvar no backend:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // 🔥 LIMPAR TODAS AS COMODIDADES
  const limparTodas = () => {
    if (readOnly) return;
    
    setComodidades(prev => {
      const novas = prev.map(c => ({ ...c, selecionada: false }));
      salvarNoLocalStorage([]);
      if (onChange) onChange([]);
      return novas;
    });
    showToast('Todas as comodidades removidas', 'info');
  };

  // 🔥 SELECIONAR TODAS AS COMODIDADES DA CATEGORIA ATUAL
  const selecionarTodasDaCategoria = () => {
    if (readOnly) return;
    
    setComodidades(prev => {
      const novas = prev.map(c => {
        const categoria = c.categoria || 'Outros';
        if (categoriaAtiva === 'todas' || categoria === categoriaAtiva) {
          return { ...c, selecionada: true };
        }
        return c;
      });
      
      const selecionadas = novas.filter(c => c.selecionada);
      salvarNoLocalStorage(selecionadas);
      if (onChange) onChange(selecionadas);
      return novas;
    });
    showToast(`Todas as comodidades da categoria selecionadas`, 'success');
  };

  const categorias = ['todas', ...new Set(comodidades.map(c => c.categoria || 'Outros').filter(c => c))];
  
  const comodidadesFiltradas = comodidades.filter(com => {
    if (categoriaAtiva !== 'todas' && (com.categoria || 'Outros') !== categoriaAtiva) return false;
    if (busca && !com.nome?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalSelecionadas = comodidades.filter(c => c.selecionada).length;
  const totalDisponiveis = comodidades.length;
  const porcentagemSelecionadas = totalDisponiveis > 0 ? Math.round((totalSelecionadas / totalDisponiveis) * 100) : 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={40} />
        <p className="mt-3 text-gray-600">Carregando comodidades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
        <p className="text-red-700">Erro: {error}</p>
        <button 
          onClick={() => fetchComodidades()}
          className="mt-4 px-4 py-2 bg-[#006ce4] text-white rounded-lg"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Indicador de salvamento */}
      {saving && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 z-50">
          <Loader size={14} className="animate-spin" /> Salvando...
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar comodidades..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          disabled={readOnly}
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Cabeçalho com estatísticas */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={limparTodas}
            disabled={readOnly || totalSelecionadas === 0}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpar todas
          </button>
          <button
            type="button"
            onClick={selecionarTodasDaCategoria}
            disabled={readOnly}
            className="px-3 py-1.5 text-sm bg-blue-50 text-[#006ce4] rounded-lg hover:bg-blue-100"
          >
            Selecionar todas ({categoriaAtiva === 'todas' ? 'ativas' : 'da categoria'})
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {totalSelecionadas} de {totalDisponiveis} comodidades selecionadas
          <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-[#006ce4] rounded-full transition-all duration-300"
              style={{ width: `${porcentagemSelecionadas}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categorias */}
      {categorias.length > 1 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {categorias.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaAtiva(cat)}
              disabled={readOnly}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                categoriaAtiva === cat 
                  ? 'bg-[#006ce4] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'todas' ? 'Todas' : cat}
              {cat !== 'todas' && (
                <span className="ml-2 text-xs">
                  ({comodidades.filter(c => (c.categoria || 'Outros') === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grade de comodidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comodidadesFiltradas.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            {busca ? 'Nenhuma comodidade encontrada para esta busca' : 'Nenhuma comodidade disponível'}
          </div>
        )}
        
        {comodidadesFiltradas.map(com => (
          <button
            key={com.id}
            type="button"
            onClick={() => toggleComodidade(com.id)}
            disabled={readOnly}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              com.selecionada
                ? 'border-[#006ce4] bg-blue-50 text-[#006ce4] shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`${com.selecionada ? 'text-[#006ce4]' : 'text-gray-500'}`}>
              {getIcone(com.icone)}
            </div>
            <span className="text-sm flex-1 text-left font-medium">{com.nome}</span>
            {com.selecionada && <Check size={16} className="text-[#006ce4]" />}
          </button>
        ))}
      </div>

      {/* Resumo das selecionadas */}
      {totalSelecionadas > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Check size={16} className="text-green-500" /> 
            Comodidades selecionadas ({totalSelecionadas})
          </h4>
          <div className="flex flex-wrap gap-2">
            {comodidades.filter(c => c.selecionada).map(com => (
              <span key={com.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
                {getIcone(com.icone)}
                {com.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de nenhuma selecionada */}
      {totalSelecionadas === 0 && !readOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <AlertCircle size={24} className="mx-auto text-yellow-600 mb-2" />
          <p className="text-yellow-700 text-sm">Nenhuma comodidade selecionada. Selecione as comodidades disponíveis na sua propriedade.</p>
        </div>
      )}

      {/* Dica para o usuário */}
      {totalSelecionadas > 0 && totalSelecionadas < 5 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-700 text-sm">💡 Dica: Adicione mais comodidades para aumentar a visibilidade do seu anúncio!</p>
        </div>
      )}
    </div>
  );
};

export default Comodidades;