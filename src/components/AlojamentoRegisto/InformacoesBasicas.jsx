// src/components/AlojamentoRegisto/InformacoesBasicas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Info, Home, Users, Star, Check, ChevronRight, Clock, AlertCircle, ChevronDown, ChevronUp, Building, BedDouble, Bed, Plus, Trash2, Minus, DollarSign, DoorOpen, Loader } from 'lucide-react';
import { buscarTiposQuarto, buscarQuartosDoAlojamento, salvarQuartos, removerQuarto as removerQuartoApi } from '../../services/apiService';

const TIPOS_PROPRIEDADE = [
  { id: 'Apartamento', nome: 'Apartamento', icone: <Building size={18} />, descricao: 'Espaço privado num edifício' },
  { id: 'Villa', nome: 'Villa', icone: <Home size={18} />, descricao: 'Casa inteira com privacidade total' },
  { id: 'Guesthouse', nome: 'Guesthouse', icone: <BedDouble size={18} />, descricao: 'Alojamento local partilhado' },
  { id: 'Hotel', nome: 'Hotel', icone: <Building size={18} />, descricao: 'Serviços completos de hotel' },
  { id: 'Casa', nome: 'Casa', icone: <Home size={18} />, descricao: 'Casa tradicional' },
  { id: 'Estúdio', nome: 'Estúdio', icone: <Building size={18} />, descricao: 'Espaço integrado e compacto' },
  { id: 'Resort', nome: 'Resort', icone: <Home size={18} />, descricao: 'Complexo turístico com lazer' },
];

const TEMPO_RESPOSTA = [
  'Dentro de 1 hora',
  'Dentro de 2 horas',
  'Dentro de 6 horas',
  'Dentro de 12 horas',
  'Dentro de 24 horas',
  'Dentro de 48 horas'
];

const CAPACIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

const InformacoesBasicas = ({ 
  dados = {}, 
  onDadosChange, 
  readOnly = false,
  onNext,
  alojamentoId = null,
  onQuartosChange
}) => {
  const [erros, setErros] = useState({});
  const [expandirDicas, setExpandirDicas] = useState(false);
  const [tiposQuarto, setTiposQuarto] = useState([]);
  const [quartosSelecionados, setQuartosSelecionados] = useState([]);
  const [loadingQuartos, setLoadingQuartos] = useState(false);
  const [savingQuartos, setSavingQuartos] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Carregar os tipos de quartos disponíveis (Master Data)
  useEffect(() => {
    const carregarTipos = async () => {
      setLoadingQuartos(true);
      const result = await buscarTiposQuarto();
      if (result.success) setTiposQuarto(result.data || []);
      setLoadingQuartos(false);
    };
    carregarTipos();
  }, []);

  // =============== CORREÇÃO DO LOCALSTORAGE ===============
  // Puxar os quartos do LocalStorage quando estamos no Modo Registo
  useEffect(() => {
    if (!alojamentoId) {
      const quartosGuardados = localStorage.getItem('propertyQuartos');
      if (quartosGuardados) {
        try {
          const parsedQuartos = JSON.parse(quartosGuardados);
          if (Array.isArray(parsedQuartos) && parsedQuartos.length > 0) {
            console.log('📦 Quartos recuperados do LocalStorage:', parsedQuartos);
            setQuartosSelecionados(parsedQuartos);
            
            // Avisa o pai (FluxoRegisto) que recuperou os quartos
            if (onQuartosChange) {
              onQuartosChange(parsedQuartos);
            }
          }
        } catch (e) {
          console.error('Erro ao ler quartos do localStorage:', e);
        }
      }
    }
  }, [alojamentoId, onQuartosChange]);
  // =========================================================

  // Carregar os quartos do alojamento específico da API (Apenas modo Edição)
  useEffect(() => {
    const carregarQuartosBackend = async () => {
      if (!alojamentoId) return;
      
      try {
        const result = await buscarQuartosDoAlojamento(alojamentoId);
        if (result.success && result.data) {
          // Proteção contra nome de coluna 'ativo' vs 'activo'
          const ativos = result.data.filter(q => q.ativo === 1 || q.ativo === true || q.activo === 1 || q.activo === true);
          setQuartosSelecionados(ativos);
          if (onQuartosChange) onQuartosChange(ativos);
        }
      } catch(e) {
        console.error("Erro ao carregar quartos do backend", e);
      }
    };
    carregarQuartosBackend();
  }, [alojamentoId, onQuartosChange]);

  // Sincronizar dados do pai APENAS na carga inicial se o estado local estiver vazio
  useEffect(() => {
    if (dados?.quartos?.length > 0 && quartosSelecionados.length === 0 && !alojamentoId) {
      setQuartosSelecionados(dados.quartos);
    }
  }, [dados?.quartos, quartosSelecionados.length, alojamentoId]);

  // =============== LÓGICA ROBUSTA DE QUARTOS (SEM LOOPS) ===============
  
  const sincronizarComPai = (novosQuartos) => {
    if (onQuartosChange) onQuartosChange(novosQuartos);
    if (onDadosChange) onDadosChange({ ...dados, quartos: novosQuartos });
  };

  const adicionarQuarto = async (tipoQuarto) => {
    if (!tipoQuarto) return;
    if (quartosSelecionados.some(q => q.tipo_quarto_id === tipoQuarto.id)) return;

    const novoQuarto = {
      id: Date.now(),
      tipo_quarto_id: tipoQuarto.id,
      tipo_nome: tipoQuarto.nome,
      quantidade_disponivel: 1,
      preco_personalizado: null,
      capacidade: tipoQuarto.capacidade || 2,
      camas: tipoQuarto.camas || 1,
      icone: tipoQuarto.icone,
      imagem_url: tipoQuarto.imagem_url,
      multiplicador_preco: tipoQuarto.multiplicador_preco || 1
    };

    const novosQuartos = [...quartosSelecionados, novoQuarto];
    const quartosAnteriores = [...quartosSelecionados];

    // Atualização Optimista (atualiza UI primeiro)
    setQuartosSelecionados(novosQuartos);

    if (alojamentoId) {
      setSavingQuartos(true);
      try {
        const payload = novosQuartos.map(q => ({
          tipo_quarto_id: q.tipo_quarto_id,
          quantidade_disponivel: q.quantidade_disponivel || 1,
          preco_personalizado: q.preco_personalizado || null
        }));
        
        const result = await salvarQuartos(alojamentoId, payload);
        if (result.success) {
          sincronizarComPai(novosQuartos);
          showToast(`${tipoQuarto.nome} adicionado!`, 'success');
        } else {
          // Reverte em caso de erro da API
          setQuartosSelecionados(quartosAnteriores);
          showToast(result.message || 'Erro ao adicionar', 'error');
        }
      } catch (err) {
        setQuartosSelecionados(quartosAnteriores);
        showToast('Erro de conexão', 'error');
      } finally {
        setSavingQuartos(false);
      }
    } else {
      // Modo Registo (Apenas LocalStorage)
      localStorage.setItem('propertyQuartos', JSON.stringify(novosQuartos));
      sincronizarComPai(novosQuartos);
      showToast(`${tipoQuarto.nome} adicionado!`, 'success');
    }
  };

  const atualizarQuartoPropriedade = async (tipo_quarto_id, campo, valor) => {
    const quartosAnteriores = [...quartosSelecionados];
    const novosQuartos = quartosSelecionados.map(q => {
      if (q.tipo_quarto_id === tipo_quarto_id) {
        return { ...q, [campo]: valor };
      }
      return q;
    });

    setQuartosSelecionados(novosQuartos);

    if (alojamentoId) {
      setSavingQuartos(true);
      try {
        const payload = novosQuartos.map(q => ({
          tipo_quarto_id: q.tipo_quarto_id,
          quantidade_disponivel: q.quantidade_disponivel || 1,
          preco_personalizado: q.preco_personalizado || null
        }));
        
        const result = await salvarQuartos(alojamentoId, payload);
        if (result.success) {
          sincronizarComPai(novosQuartos);
        } else {
          setQuartosSelecionados(quartosAnteriores);
          showToast('Erro ao atualizar quarto', 'error');
        }
      } catch (err) {
        setQuartosSelecionados(quartosAnteriores);
        showToast('Erro de conexão', 'error');
      } finally {
        setSavingQuartos(false);
      }
    } else {
      localStorage.setItem('propertyQuartos', JSON.stringify(novosQuartos));
      sincronizarComPai(novosQuartos);
    }
  };

  const atualizarQuantidade = (tipo_quarto_id, delta) => {
    const quarto = quartosSelecionados.find(q => q.tipo_quarto_id === tipo_quarto_id);
    if (quarto) {
      const novaQuantidade = Math.max(1, (quarto.quantidade_disponivel || 1) + delta);
      atualizarQuartoPropriedade(tipo_quarto_id, 'quantidade_disponivel', novaQuantidade);
    }
  };

  const atualizarPrecoPersonalizado = (tipo_quarto_id, preco) => {
    const valor = preco === '' ? null : parseFloat(preco);
    const precoFinal = isNaN(valor) ? null : valor;
    atualizarQuartoPropriedade(tipo_quarto_id, 'preco_personalizado', precoFinal);
  };

  const removerQuartoEspecifico = async (tipo_quarto_id) => {
    const quartosAnteriores = [...quartosSelecionados];
    const novosQuartos = quartosSelecionados.filter(q => q.tipo_quarto_id !== tipo_quarto_id);
    
    setQuartosSelecionados(novosQuartos);

    if (alojamentoId) {
      setSavingQuartos(true);
      try {
        const result = await removerQuartoApi(alojamentoId, tipo_quarto_id);
        if (result.success) {
          sincronizarComPai(novosQuartos);
          showToast('Quarto removido', 'success');
        } else {
          setQuartosSelecionados(quartosAnteriores);
          showToast(result.message || 'Erro ao remover', 'error');
        }
      } catch (err) {
        setQuartosSelecionados(quartosAnteriores);
        showToast('Erro de conexão', 'error');
      } finally {
        setSavingQuartos(false);
      }
    } else {
      localStorage.setItem('propertyQuartos', JSON.stringify(novosQuartos));
      sincronizarComPai(novosQuartos);
      showToast('Quarto removido', 'success');
    }
  };

  // =============== RESTO DO COMPONENTE (FORMULÁRIO E RENDER) ===============

  const handleChange = (campo, valor) => {
    if (onDadosChange) onDadosChange({ ...dados, [campo]: valor });
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: null }));
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!dados?.titulo?.trim()) novosErros.titulo = 'O título da propriedade é obrigatório';
    else if (dados.titulo.length < 5) novosErros.titulo = 'O título deve ter pelo menos 5 caracteres';
    else if (dados.titulo.length > 100) novosErros.titulo = 'O título não pode ter mais de 100 caracteres';
    
    if (!dados?.descricao?.trim()) novosErros.descricao = 'A descrição curta é obrigatória';
    else if (dados.descricao.length < 20) novosErros.descricao = 'A descrição deve ter pelo menos 20 caracteres';
    
    if (!dados?.capacidade || dados.capacidade < 1) novosErros.capacidade = 'A capacidade é obrigatória';
    if (!dados?.preco_noite || dados.preco_noite <= 0) novosErros.preco_noite = 'O preço por noite é obrigatório';
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = () => {
    if (validarFormulario() && onNext) onNext();
  };
  
  const renderEstrelas = () => {
    const estrelasAtuais = dados?.estrelas || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button" onClick={() => !readOnly && handleChange('estrelas', star)} disabled={readOnly}
            className={`text-2xl transition-colors ${estrelasAtuais >= star ? 'text-yellow-400' : 'text-gray-300'} ${!readOnly && 'hover:scale-110'} ${readOnly && 'cursor-default'}`}>★</button>
        ))}
      </div>
    );
  };
  
  const capacidadeTotalQuartos = Array.isArray(quartosSelecionados) 
    ? quartosSelecionados.reduce((total, q) => total + ((q.capacidade || 2) * (q.quantidade_disponivel || 1)), 0) : 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Título da propriedade <span className="text-red-500">*</span></label>
        <input type="text" value={dados?.titulo || ''} onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Ex: Villa Maravilha - Vista deslumbrante para o mar"
          className={`w-full px-4 py-3 border ${erros.titulo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4]`}
          disabled={readOnly} maxLength={100} />
        <div className="flex justify-between mt-1">
          {erros.titulo && <p className="text-sm text-red-500">{erros.titulo}</p>}
          <p className="text-xs text-gray-400 ml-auto">{(dados?.titulo?.length || 0)}/100 caracteres</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de propriedade <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TIPOS_PROPRIEDADE.map(tipo => (
            <button key={tipo.id} type="button" onClick={() => !readOnly && handleChange('tipo_propriedade', tipo.id)} disabled={readOnly}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${dados?.tipo_propriedade === tipo.id ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${readOnly && 'cursor-default'}`}>
              <span className={dados?.tipo_propriedade === tipo.id ? 'text-[#006ce4]' : 'text-gray-500'}>{tipo.icone}</span>
              <div className="text-left"><p className="text-sm font-medium">{tipo.nome}</p><p className="text-xs text-gray-400 hidden md:block">{tipo.descricao}</p></div>
              {dados?.tipo_propriedade === tipo.id && <Check size={16} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidade máxima (pessoas) <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-gray-400" />
          <select value={dados?.capacidade || 2} onChange={(e) => handleChange('capacidade', parseInt(e.target.value))}
            className={`flex-1 px-4 py-3 border ${erros.capacidade ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] bg-white`} disabled={readOnly}>
            {CAPACIDADES.map(cap => <option key={cap} value={cap}>{cap} {cap === 1 ? 'pessoa' : 'pessoas'}</option>)}
          </select>
        </div>
        {erros.capacidade && <p className="text-sm text-red-500 mt-1">{erros.capacidade}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Classificação (estrelas)</label>
        <div className="flex items-center gap-3"><Star size={20} className="text-yellow-400" />{renderEstrelas()}</div>
      </div>
      
      {/* SEÇÃO DE QUARTOS */}
      <div className="border-2 border-[#006ce4] rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#006ce4] text-white p-4">
          <div className="flex items-center gap-2"><Bed size={20} /><span className="font-semibold">🏠 Configure os quartos da propriedade</span></div>
          <p className="text-sm text-blue-100 mt-1">Adicione os tipos de quarto disponíveis. As alterações são salvas automaticamente!</p>
          {savingQuartos && <div className="mt-2 text-xs text-blue-200 flex items-center gap-1"><Loader size={12} className="animate-spin" />Salvando alterações...</div>}
        </div>
        
        <div className="p-4 bg-white">
          {loadingQuartos && (
            <div className="text-center py-8"><Loader className="animate-spin mx-auto text-[#006ce4]" size={32} /><p className="mt-2 text-sm text-gray-500">Carregando tipos de quarto...</p></div>
          )}
          
          {!loadingQuartos && tiposQuarto.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><DoorOpen size={16} className="text-[#006ce4]" />Tipos de quarto disponíveis:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tiposQuarto.map(tipo => {
                  const jaAdicionado = quartosSelecionados.some(q => q.tipo_quarto_id === tipo.id);
                  return (
                    <button key={tipo.id} type="button" onClick={() => adicionarQuarto(tipo)} disabled={jaAdicionado || savingQuartos}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${jaAdicionado ? 'border-green-300 bg-green-50 opacity-70 cursor-not-allowed' : 'border-gray-200 hover:border-[#006ce4] hover:bg-blue-50 cursor-pointer'}`}>
                      {tipo.imagem_url && <img src={tipo.imagem_url} alt={tipo.nome} className="w-12 h-12 object-cover rounded-lg" />}
                      <div className="flex-1 text-left"><p className="text-sm font-medium">{tipo.nome}</p><p className="text-xs text-gray-500">👥 {tipo.capacidade} pessoas | 🛏️ {tipo.camas}</p></div>
                      {jaAdicionado ? <Check size={16} className="text-green-500" /> : <Plus size={16} className="text-[#006ce4]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {quartosSelecionados.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Check size={16} className="text-green-500" />Quartos adicionados ({quartosSelecionados.length}):</h4>
              <div className="space-y-3">
                {quartosSelecionados.map(quarto => (
                  <div key={quarto.id || quarto.tipo_quarto_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {quarto.imagem_url && <img src={quarto.imagem_url} alt={quarto.tipo_nome} className="w-14 h-14 object-cover rounded-lg" />}
                        <div><h5 className="font-semibold text-gray-900">{quarto.tipo_nome}</h5><p className="text-xs text-gray-500">Capacidade: {quarto.capacidade || 2} pessoas | {quarto.camas || 1} cama(s)</p></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Quantidade:</span>
                          <button type="button" onClick={() => atualizarQuantidade(quarto.tipo_quarto_id, -1)} disabled={savingQuartos} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Minus size={14} /></button>
                          <span className="w-10 text-center font-semibold text-[#006ce4]">{quarto.quantidade_disponivel || 1}</span>
                          <button type="button" onClick={() => atualizarQuantidade(quarto.tipo_quarto_id, 1)} disabled={savingQuartos} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Plus size={14} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-gray-500" />
                          <input type="number" value={quarto.preco_personalizado || ''} onChange={(e) => atualizarPrecoPersonalizado(quarto.tipo_quarto_id, e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-sm" placeholder="Preço padrão" step="100" disabled={savingQuartos} />
                          <span className="text-xs text-gray-500">CVE/noite</span>
                        </div>
                        <button type="button" onClick={() => removerQuartoEspecifico(quarto.tipo_quarto_id)} disabled={savingQuartos}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">📊 <strong>Resumo:</strong> Capacidade total dos quartos = <strong>{capacidadeTotalQuartos} pessoas</strong>
                  {capacidadeTotalQuartos !== (dados?.capacidade || 2) && <span className="text-yellow-600 ml-2">(⚠️ Atenção: A capacidade total dos quartos ({capacidadeTotalQuartos}) é diferente da capacidade definida ({dados?.capacidade || 2} pessoas)</span>}
                </p>
              </div>
            </div>
          )}
          
          {!loadingQuartos && quartosSelecionados.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Bed size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhum quarto adicionado</p>
              <p className="text-xs mt-1">Clique nos tipos de quarto acima para adicionar à sua propriedade</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição curta <span className="text-red-500">*</span></label>
        <textarea value={dados?.descricao || ''} onChange={(e) => handleChange('descricao', e.target.value)} rows={3}
          placeholder="Descreva brevemente a sua propriedade. Destaque os principais atrativos..."
          className={`w-full px-4 py-3 border ${erros.descricao ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] resize-none`}
          disabled={readOnly} maxLength={500} />
        <div className="flex justify-between mt-1">
          {erros.descricao && <p className="text-sm text-red-500">{erros.descricao}</p>}
          <p className="text-xs text-gray-400 ml-auto">{(dados?.descricao?.length || 0)}/500 caracteres</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição detalhada</label>
        <textarea value={dados?.descricao_detalhada || ''} onChange={(e) => handleChange('descricao_detalhada', e.target.value)} rows={5}
          placeholder="Descreva detalhadamente a sua propriedade: localização, decoração, comodidades especiais, pontos turísticos próximos, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] resize-none"
          disabled={readOnly} maxLength={2000} />
        <p className="text-xs text-gray-400 mt-1 text-right">{(dados?.descricao_detalhada?.length || 0)}/2000 caracteres</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preço base por noite (CVE) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input type="number" value={dados?.preco_noite || ''} onChange={(e) => handleChange('preco_noite', parseFloat(e.target.value))}
              placeholder="Ex: 5000" className={`w-full pl-8 pr-4 py-3 border ${erros.preco_noite ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4]`}
              disabled={readOnly} min={0} step={100} />
          </div>
          {erros.preco_noite && <p className="text-sm text-red-500 mt-1">{erros.preco_noite}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de resposta</label>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            <select value={dados?.tempo_resposta || 'Dentro de 1 hora'} onChange={(e) => handleChange('tempo_resposta', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white" disabled={readOnly}>
              {TEMPO_RESPOSTA.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="border border-blue-200 rounded-lg overflow-hidden">
        <button type="button" onClick={() => setExpandirDicas(!expandirDicas)} className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100">
          <div className="flex items-center gap-2"><AlertCircle size={18} className="text-blue-600" /><span className="font-medium text-blue-800">💡 Dicas para um anúncio de sucesso</span></div>
          {expandirDicas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandirDicas && (
          <div className="p-4 bg-white space-y-3">
            <div className="flex gap-3"><div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div><div><p className="font-medium">Título atraente</p><p className="text-sm text-gray-600">Use palavras como "Vista mar", "Perto da praia", "Recém renovado"</p></div></div>
            <div className="flex gap-3"><div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div><div><p className="font-medium">Configure os quartos corretamente</p><p className="text-sm text-gray-600">Adicione todos os tipos de quarto disponíveis na sua propriedade</p></div></div>
            <div className="flex gap-3"><div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div><div><p className="font-medium">Fotos de qualidade</p><p className="text-sm text-gray-600">Propriedades com mais de 10 fotos recebem 40% mais reservas</p></div></div>
          </div>
        )}
      </div>
      
      {!readOnly && onNext && (
        <div className="flex justify-end pt-4">
          <button onClick={handleSubmit} className="bg-[#006ce4] text-white px-8 py-3 rounded-lg hover:bg-[#0053b3] font-medium flex items-center gap-2">
            Continuar <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InformacoesBasicas;