// src/components/AlojamentoRegisto/Regras.jsx - CORRIGIDO (mesmo padrão das comodidades)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Clock, Ban, Moon, Baby, Volume2, Users, Car, AlertCircle, Search, Loader, Shield, DoorOpen, Calendar, XCircle, RefreshCw } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const getIcone = (iconeNome) => {
  const icons = {
    clock: <Clock size={20} />,
    ban: <Ban size={20} />,
    moon: <Moon size={20} />,
    baby: <Baby size={20} />,
    volume2: <Volume2 size={20} />,
    users: <Users size={20} />,
    car: <Car size={20} />,
    calendar: <Calendar size={20} />,
    shield: <Shield size={20} />,
    doorOpen: <DoorOpen size={20} />,
  };
  return icons[iconeNome?.toLowerCase()] || <AlertCircle size={20} />;
};

// ==================== FUNÇÕES DE API (mesmo padrão das comodidades) ====================

// Buscar regras disponíveis (GET sem id) - igual ao buscar_comodidades.php
export async function buscarRegrasDisponiveis() {
  try {
    const response = await fetch(`${API_URL}/api/alojamento/regras.php`);
    const data = await response.json();
    if (data.success) {
      return data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar regras:', error);
    return [];
  }
}

// Buscar regras de um alojamento específico com seleção (GET com id) - igual ao comodidades.php?id=xx
export async function buscarRegrasDoAlojamento(id) {
  try {
    const response = await fetch(`${API_URL}/api/alojamento/regras.php?id=${id}`);
    const data = await response.json();
    if (data.success && data.data) {
      return {
        success: true,
        data: {
          regras: data.data.regras || [],
          regras_adicionais: data.data.regras_adicionais || ''
        }
      };
    }
    return { success: false, data: { regras: [], regras_adicionais: '' } };
  } catch (error) {
    console.error('Erro ao buscar regras do alojamento:', error);
    return { success: false, data: { regras: [], regras_adicionais: '' } };
  }
}

// Salvar regras (POST) - igual ao comodidades.php POST
export async function salvarRegras(alojamentoId, regrasIds, regrasAdicionais = '') {
  try {
    const response = await fetch(`${API_URL}/api/alojamento/regras.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alojamento_id: alojamentoId,
        regras_ids: regrasIds,
        regras_adicionais: regrasAdicionais
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar regras:', error);
    return { success: false, message: 'Erro de conexão' };
  }
}

// Alternar status de uma regra (igual ao alternar_comodidade.php)
export async function alternarStatusRegra(alojamentoId, regraId, ativar) {
  try {
    const response = await fetch(`${API_URL}/api/alojamento/alternar_status_regra.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alojamento_id: alojamentoId,
        regra_id: regraId,
        ativar: ativar ? 1 : 0
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return { success: false, message: 'Erro de conexão' };
  }
}

// ==================== COMPONENTE PRINCIPAL ====================

const Regras = ({ 
  alojamentoId, 
  onChange, 
  readOnly = false, 
  initialRegras = [], 
  initialRegrasAdicionais = '' 
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [regrasAdicionais, setRegrasAdicionais] = useState(initialRegrasAdicionais || '');
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  
  const isInitialMount = useRef(true);
  const prevAlojamentoId = useRef(alojamentoId);
  const notifyingParent = useRef(false);

  const notificarPai = useCallback((novasRegras, novoTextoAdicional) => {
    if (!onChange) return;
    if (notifyingParent.current) return;
    
    const selecionadas = novasRegras.filter(r => r.selecionada === true);
    const regrasIds = selecionadas.map(r => r.id);
    
    console.log('📤 Notificando pai - Regras IDs:', regrasIds);
    console.log('📤 Notificando pai - Regras adicionais:', novoTextoAdicional);
    
    notifyingParent.current = true;
    
    onChange({
      regras: selecionadas,
      regras_ids: regrasIds,
      regrasAdicionais: novoTextoAdicional
    });
    
    setTimeout(() => { notifyingParent.current = false; }, 100);
  }, [onChange]);

  // Carregar regras (igual ao padrão das comodidades)
  const carregarRegras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando regras - alojamentoId:', alojamentoId);
      
      let regrasLista = [];
      let regrasAdicionaisTexto = '';
      
      if (alojamentoId) {
        // Modo EDIÇÃO - usar buscarRegrasDoAlojamento (GET com id)
        const resultado = await buscarRegrasDoAlojamento(alojamentoId);
        if (resultado.success && resultado.data) {
          regrasLista = resultado.data.regras || [];
          regrasAdicionaisTexto = resultado.data.regras_adicionais || '';
          console.log('✏️ Modo EDIÇÃO - regras carregadas:', regrasLista.length);
        }
      } else {
        // Modo REGISTO - usar buscarRegrasDisponiveis (GET sem id)
        const regrasDisponiveis = await buscarRegrasDisponiveis();
        
        const savedRegrasIds = localStorage.getItem('propertyRegrasSelecionadas');
        const savedRegrasAdicionais = localStorage.getItem('propertyRegrasAdicionais');
        
        if (savedRegrasIds) {
          const savedIds = JSON.parse(savedRegrasIds);
          regrasLista = (regrasDisponiveis || []).map(r => ({ 
            ...r, 
            selecionada: savedIds.includes(r.id) 
          }));
          console.log('🆕 Modo REGISTO - regras do localStorage IDs:', savedIds);
        } else {
          regrasLista = (regrasDisponiveis || []).map(r => ({ ...r, selecionada: false }));
        }
        
        if (savedRegrasAdicionais) {
          regrasAdicionaisTexto = savedRegrasAdicionais;
        }
        
        console.log('🆕 Modo REGISTO - total regras carregadas:', regrasLista.length);
      }
      
      setRegras(regrasLista);
      setRegrasAdicionais(regrasAdicionaisTexto);
      
      setTimeout(() => {
        notificarPai(regrasLista, regrasAdicionaisTexto);
      }, 50);
      
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [alojamentoId, notificarPai]);

  useEffect(() => {
    if (prevAlojamentoId.current !== alojamentoId) {
      prevAlojamentoId.current = alojamentoId;
      carregarRegras();
    } else if (isInitialMount.current) {
      isInitialMount.current = false;
      carregarRegras();
    }
  }, [alojamentoId, carregarRegras]);

  const prevRegrasRef = useRef(regras);
  const prevRegrasAdicionaisRef = useRef(regrasAdicionais);
  
  useEffect(() => {
    if (isInitialMount.current) return;
    
    const regrasChanged = JSON.stringify(prevRegrasRef.current) !== JSON.stringify(regras);
    const adicionaisChanged = prevRegrasAdicionaisRef.current !== regrasAdicionais;
    
    if ((regrasChanged || adicionaisChanged) && !loading) {
      console.log('🔄 Mudança nas regras detectada, notificando pai...');
      notificarPai(regras, regrasAdicionais);
    }
    
    prevRegrasRef.current = regras;
    prevRegrasAdicionaisRef.current = regrasAdicionais;
  }, [regras, regrasAdicionais, loading, notificarPai]);

  // Alternar regra
  const toggleRegra = async (regraId, currentStatus) => {
    if (readOnly) return;
    
    const novoStatus = !currentStatus;
    
    console.log(`🔄 Toggle regra ${regraId}: ${currentStatus} -> ${novoStatus}`);
    
    // Atualizar UI imediatamente
    setRegras(prev => {
      const novas = prev.map(r => 
        r.id === regraId ? { ...r, selecionada: novoStatus } : r
      );
      
      // Modo registo: salvar no localStorage
      if (!alojamentoId) {
        const selecionadasIds = novas.filter(r => r.selecionada).map(r => r.id);
        localStorage.setItem('propertyRegrasSelecionadas', JSON.stringify(selecionadasIds));
        localStorage.setItem('propertyRegrasAdicionais', regrasAdicionais);
        console.log('💾 Modo REGISTO - Regras salvas no localStorage:', selecionadasIds);
      }
      
      return novas;
    });
    
    // Modo edição: persistir no backend
    if (alojamentoId) {
      setTogglingId(regraId);
      setError(null);
      
      try {
        const result = await alternarStatusRegra(alojamentoId, regraId, novoStatus);
        
        if (result.success) {
          setSuccessMessage(novoStatus ? 'Regra ativada!' : 'Regra desativada!');
          setTimeout(() => setSuccessMessage(null), 2000);
          console.log(`✅ Regra ${regraId} ${novoStatus ? 'ativada' : 'desativada'} no backend`);
        } else {
          throw new Error(result.message || 'Erro ao alterar status');
        }
      } catch (err) {
        console.error('❌ Erro ao alternar:', err);
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleRegrasAdicionaisChange = (e) => {
    const novoTexto = e.target.value;
    setRegrasAdicionais(novoTexto);
    
    if (!alojamentoId) {
      localStorage.setItem('propertyRegrasAdicionais', novoTexto);
      console.log('💾 Regras adicionais salvas no localStorage:', novoTexto);
    }
  };

  const handleSalvarRegrasAdicionais = async () => {
    if (!alojamentoId) {
      setSuccessMessage('Regras adicionais guardadas!');
      setTimeout(() => setSuccessMessage(null), 2000);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const regrasIds = regras.filter(r => r.selecionada).map(r => r.id);
      const result = await salvarRegras(alojamentoId, regrasIds, regrasAdicionais);
      
      if (result.success) {
        setSuccessMessage('Regras adicionais salvas!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(result.message || 'Erro ao salvar');
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const categorias = ['todas', ...new Set(regras.map(r => r.categoria || 'Gerais').filter(c => c && c !== ''))];
  
  const regrasFiltradas = regras.filter(regra => {
    if (categoriaAtiva !== 'todas' && (regra.categoria || 'Gerais') !== categoriaAtiva) return false;
    if (busca && !regra.titulo?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalSelecionadas = regras.filter(r => r.selecionada === true).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto text-[#006ce4]" size={40} />
        <p className="mt-3 text-gray-600">Carregando regras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="mx-auto text-red-500 mb-3" size={48} />
        <p className="text-red-700 font-medium">Erro</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          onClick={() => carregarRegras()} 
          className="mt-4 px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3] transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} /> Tentar novamente
        </button>
      </div>
    );
  }

  if (regras.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Shield className="mx-auto text-yellow-500 mb-3" size={48} />
        <p className="text-yellow-700">⚠️ Nenhuma regra encontrada</p>
        <button onClick={carregarRegras} className="mt-4 px-4 py-2 bg-[#006ce4] text-white rounded-lg">
          Recarregar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 text-right">
        {alojamentoId ? (
          <span className="flex items-center justify-end gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            ✏️ Modo edição - {totalSelecionadas} regra(s) ativa(s)
          </span>
        ) : (
          <span className="flex items-center justify-end gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            📝 Modo registo - {totalSelecionadas} regra(s) selecionada(s)
          </span>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Check size={18} className="text-green-500" />
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar regras..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          disabled={readOnly}
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {categorias.length > 1 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {categorias.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                categoriaAtiva === cat 
                  ? 'bg-[#006ce4] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'todas' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {regrasFiltradas.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            {busca ? 'Nenhuma regra encontrada' : 'Nenhuma regra disponível'}
          </div>
        )}
        
        {regrasFiltradas.map(regra => {
          const isAtiva = regra.selecionada === true;
          const isLoading = togglingId === regra.id;
          
          return (
            <button
              key={regra.id}
              type="button"
              onClick={() => toggleRegra(regra.id, isAtiva)}
              disabled={readOnly || regra.obrigatorio || isLoading}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                isAtiva
                  ? 'border-[#006ce4] bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${(readOnly || regra.obrigatorio) ? 'cursor-default' : 'cursor-pointer'}
              ${isLoading ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className={`transition-transform duration-200 ${isAtiva ? 'scale-110' : 'scale-100'} ${isAtiva ? 'text-[#006ce4]' : 'text-gray-500'}`}>
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  getIcone(regra.icone)
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${isAtiva ? 'text-[#006ce4]' : 'text-gray-700'}`}>
                    {regra.titulo}
                  </span>
                  {regra.obrigatorio && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Obrigatório</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{regra.descricao}</p>
              </div>
              
              {!regra.obrigatorio && (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isAtiva 
                    ? 'bg-[#006ce4] border-[#006ce4]' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {isAtiva && <Check size={12} className="text-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="mt-6 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regras adicionais personalizadas
          </label>
          <textarea
            value={regrasAdicionais}
            onChange={handleRegrasAdicionaisChange}
            rows={4}
            placeholder="Adicione regras específicas da sua propriedade (ex: Horário de silêncio, Proibido fumar, etc.)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          />
          
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSalvarRegrasAdicionais}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#006ce4] text-white rounded-lg text-sm font-medium hover:bg-[#0053b3] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {alojamentoId ? 'Salvar regras' : 'Guardar regras'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {totalSelecionadas > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            Regras selecionadas ({totalSelecionadas})
          </h4>
          <div className="flex flex-wrap gap-2">
            {regras.filter(r => r.selecionada).map(regra => (
              <span key={regra.id} className="px-3 py-1 bg-white border border-[#006ce4] rounded-full text-sm flex items-center gap-1 text-[#006ce4]">
                {getIcone(regra.icone)}
                {regra.titulo}
              </span>
            ))}
          </div>
          {regrasAdicionais && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">Regras adicionais:</p>
              <p className="text-sm text-gray-700 mt-1">{regrasAdicionais}</p>
            </div>
          )}
        </div>
      )}

      {totalSelecionadas === 0 && !readOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <AlertCircle size={18} className="inline-block mr-2 text-yellow-500" />
          <p className="text-yellow-700 text-sm inline">
            Nenhuma regra selecionada. Clique nas regras acima para selecionar.
          </p>
        </div>
      )}
    </div>
  );
};

export const RegrasResumo = ({ regras, regrasAdicionais, className = "" }) => {
  const regrasAtivas = (regras || []).filter(r => r && (r.selecionada === true || r.id));
  
  if (regrasAtivas.length === 0 && !regrasAdicionais) {
    return <p className="text-gray-400 text-sm">Nenhuma regra definida</p>;
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {regrasAtivas.map(regra => (
        <div key={regra.id} className="flex items-start gap-3">
          <div className="text-gray-500 mt-0.5">{getIcone(regra.icone)}</div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{regra.titulo}</p>
            <p className="text-xs text-gray-500">{regra.descricao}</p>
          </div>
        </div>
      ))}
      
      {regrasAdicionais && (
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-0.5"><AlertCircle size={16} /></div>
          <div>
            <p className="font-medium text-gray-800 text-sm">Regras adicionais</p>
            <p className="text-xs text-gray-500 whitespace-pre-line">{regrasAdicionais}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regras;