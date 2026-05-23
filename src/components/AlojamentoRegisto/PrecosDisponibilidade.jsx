// src/components/AlojamentoRegisto/PrecosDisponibilidade.jsx
import React, { useState } from 'react';
import { 
  DollarSign, Calendar, Clock, AlertCircle, Check, ChevronRight, 
  Percent, TrendingUp, CalendarDays, Ban, Plus, X, Edit2,
  Users, Bed, Bath, Home, Sun, Moon, Zap, Shield, Award
} from 'lucide-react';

const PrecosDisponibilidade = ({ 
  dados, 
  onDadosChange, 
  onNext,
  readOnly = false 
}) => {
  const [erros, setErros] = useState({});
  const [precosSazonais, setPrecosSazonais] = useState(dados?.precos_sazonais || []);
  const [bloqueios, setBloqueios] = useState(dados?.bloqueios || []);
  const [mostrarFormPrecoSazonal, setMostrarFormPrecoSazonal] = useState(false);
  const [mostrarFormBloqueio, setMostrarFormBloqueio] = useState(false);
  
  // Novo preço sazonal
  const [novoPrecoSazonal, setNovoPrecoSazonal] = useState({
    nome: '',
    data_inicio: '',
    data_fim: '',
    preco_multiplier: 1.0,
    preco_fixo: null
  });
  
  // Novo bloqueio
  const [novoBloqueio, setNovoBloqueio] = useState({
    data_inicio: '',
    data_fim: '',
    motivo: ''
  });
  
  // Handlers para atualizar os dados
  const handleChange = (campo, valor) => {
    onDadosChange({ ...dados, [campo]: valor });
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }));
    }
  };
  
  // Calcular preço final com descontos
  const calcularPrecoFinal = () => {
    const precoBase = dados.preco_base || 0;
    let desconto = 0;
    
    if (dados.desconto_semanal) desconto = Math.max(desconto, 10);
    if (dados.desconto_mensal) desconto = Math.max(desconto, 20);
    if (dados.desconto_primeira_reserva) desconto = Math.max(desconto, 15);
    
    const precoComDesconto = precoBase * (1 - desconto / 100);
    return {
      base: precoBase,
      desconto: desconto,
      final: precoComDesconto
    };
  };
  
  // Validação do formulário
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!dados.preco_base || dados.preco_base <= 0) {
      novosErros.preco_base = 'O preço base é obrigatório';
    }
    
    if (!dados.moeda) {
      novosErros.moeda = 'A moeda é obrigatória';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = () => {
    if (validarFormulario() && onNext) {
      const dadosCompletos = {
        ...dados,
        precos_sazonais: precosSazonais,
        bloqueios: bloqueios
      };
      onDadosChange(dadosCompletos);
      onNext();
    }
  };
  
  // Adicionar preço sazonal
  const adicionarPrecoSazonal = () => {
    if (novoPrecoSazonal.nome && novoPrecoSazonal.data_inicio && novoPrecoSazonal.data_fim) {
      setPrecosSazonais([...precosSazonais, { ...novoPrecoSazonal, id: Date.now() }]);
      setNovoPrecoSazonal({ nome: '', data_inicio: '', data_fim: '', preco_multiplier: 1.0, preco_fixo: null });
      setMostrarFormPrecoSazonal(false);
    }
  };
  
  // Remover preço sazonal
  const removerPrecoSazonal = (id) => {
    setPrecosSazonais(precosSazonais.filter(p => p.id !== id));
  };
  
  // Adicionar bloqueio
  const adicionarBloqueio = () => {
    if (novoBloqueio.data_inicio && novoBloqueio.data_fim) {
      setBloqueios([...bloqueios, { ...novoBloqueio, id: Date.now() }]);
      setNovoBloqueio({ data_inicio: '', data_fim: '', motivo: '' });
      setMostrarFormBloqueio(false);
    }
  };
  
  // Remover bloqueio
  const removerBloqueio = (id) => {
    setBloqueios(bloqueios.filter(b => b.id !== id));
  };
  
  const precoCalculado = calcularPrecoFinal();
  
  return (
    <div className="space-y-6">
      {/* Preço base */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-green-600" />
          Preço base por noite
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço base (CVE) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={dados.preco_base || ''}
                onChange={(e) => handleChange('preco_base', parseFloat(e.target.value))}
                placeholder="Ex: 5000"
                className={`w-full pl-8 pr-4 py-3 border ${erros.preco_base ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]`}
                disabled={readOnly}
                min={0}
                step={100}
              />
            </div>
            {erros.preco_base && <p className="text-sm text-red-500 mt-1">{erros.preco_base}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda
            </label>
            <select
              value={dados.moeda || 'CVE'}
              onChange={(e) => handleChange('moeda', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              <option value="CVE">Escudo cabo-verdiano (CVE)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dólar Americano ($)</option>
              <option value="GBP">Libra Esterlina (£)</option>
            </select>
          </div>
        </div>
        
        {/* Resumo de preços */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preço base por noite:</span>
            <span className="font-medium">{precoCalculado.base} CVE</span>
          </div>
          {precoCalculado.desconto > 0 && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Desconto aplicado ({precoCalculado.desconto}%):</span>
              <span className="text-green-600">-{Math.round(precoCalculado.base * precoCalculado.desconto / 100)} CVE</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200">
            <span>Preço final por noite:</span>
            <span className="text-[#006ce4]">{Math.round(precoCalculado.final)} CVE</span>
          </div>
        </div>
      </div>
      
      {/* Descontos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Percent size={20} className="text-orange-500" />
          Descontos para estadias longas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Estadia semanal</p>
              <p className="text-xs text-gray-400">7+ noites</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dados.desconto_semanal || false}
                onChange={(e) => handleChange('desconto_semanal', e.target.checked)}
                className="w-5 h-5 text-[#006ce4] rounded"
                disabled={readOnly}
              />
              <span className="text-green-600 font-medium">-10%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Estadia mensal</p>
              <p className="text-xs text-gray-400">28+ noites</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dados.desconto_mensal || false}
                onChange={(e) => handleChange('desconto_mensal', e.target.checked)}
                className="w-5 h-5 text-[#006ce4] rounded"
                disabled={readOnly}
              />
              <span className="text-green-600 font-medium">-20%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Primeira reserva</p>
              <p className="text-xs text-gray-400">Novos hóspedes</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dados.desconto_primeira_reserva || false}
                onChange={(e) => handleChange('desconto_primeira_reserva', e.target.checked)}
                className="w-5 h-5 text-[#006ce4] rounded"
                disabled={readOnly}
              />
              <span className="text-green-600 font-medium">-15%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preços sazonais */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Preços sazonais
          </h3>
          {!readOnly && (
            <button
              onClick={() => setMostrarFormPrecoSazonal(!mostrarFormPrecoSazonal)}
              className="text-sm text-[#006ce4] hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Adicionar período
            </button>
          )}
        </div>
        
        {/* Formulário para adicionar preço sazonal */}
        {mostrarFormPrecoSazonal && !readOnly && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Nome do período (ex: Alta temporada)"
                value={novoPrecoSazonal.nome}
                onChange={(e) => setNovoPrecoSazonal({ ...novoPrecoSazonal, nome: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={novoPrecoSazonal.data_inicio}
                  onChange={(e) => setNovoPrecoSazonal({ ...novoPrecoSazonal, data_inicio: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <span className="self-center">a</span>
                <input
                  type="date"
                  value={novoPrecoSazonal.data_fim}
                  onChange={(e) => setNovoPrecoSazonal({ ...novoPrecoSazonal, data_fim: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={novoPrecoSazonal.preco_multiplier}
                onChange={(e) => setNovoPrecoSazonal({ ...novoPrecoSazonal, preco_multiplier: parseFloat(e.target.value), preco_fixo: null })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="0.8">-20% (Baixa temporada)</option>
                <option value="0.9">-10% (Meia estação)</option>
                <option value="1.0">Preço normal</option>
                <option value="1.2">+20% (Alta temporada)</option>
                <option value="1.5">+50% (Feriados)</option>
                <option value="2.0">+100% (Época alta)</option>
              </select>
              <button
                onClick={adicionarPrecoSazonal}
                className="px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
              >
                Adicionar
              </button>
              <button
                onClick={() => setMostrarFormPrecoSazonal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {/* Lista de preços sazonais */}
        {precosSazonais.length > 0 && (
          <div className="space-y-2">
            {precosSazonais.map(preco => (
              <div key={preco.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{preco.nome}</p>
                  <p className="text-xs text-gray-500">
                    {preco.data_inicio} até {preco.data_fim}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${preco.preco_multiplier >= 1 ? 'text-orange-600' : 'text-green-600'}`}>
                    {preco.preco_multiplier >= 1 ? '+' : ''}
                    {Math.round((preco.preco_multiplier - 1) * 100)}%
                  </span>
                  {!readOnly && (
                    <button onClick={() => removerPrecoSazonal(preco.id)} className="text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {precosSazonais.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum preço sazonal definido</p>
        )}
      </div>
      
      {/* Bloqueios de agenda */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Ban size={20} className="text-red-500" />
            Bloqueios de agenda
          </h3>
          {!readOnly && (
            <button
              onClick={() => setMostrarFormBloqueio(!mostrarFormBloqueio)}
              className="text-sm text-[#006ce4] hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Bloquear datas
            </button>
          )}
        </div>
        
        {/* Formulário para adicionar bloqueio */}
        {mostrarFormBloqueio && !readOnly && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-3 mb-3">
              <input
                type="date"
                value={novoBloqueio.data_inicio}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, data_inicio: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <span className="self-center">a</span>
              <input
                type="date"
                value={novoBloqueio.data_fim}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, data_fim: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Motivo (opcional)"
                value={novoBloqueio.motivo}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, motivo: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={adicionarBloqueio}
                className="px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
              >
                Bloquear
              </button>
              <button
                onClick={() => setMostrarFormBloqueio(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {/* Lista de bloqueios */}
        {bloqueios.length > 0 && (
          <div className="space-y-2">
            {bloqueios.map(bloqueio => (
              <div key={bloqueio.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">
                    {bloqueio.data_inicio} até {bloqueio.data_fim}
                  </p>
                  {bloqueio.motivo && <p className="text-xs text-red-600">{bloqueio.motivo}</p>}
                </div>
                {!readOnly && (
                  <button onClick={() => removerBloqueio(bloqueio.id)} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {bloqueios.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum bloqueio definido</p>
        )}
      </div>
      
      {/* Informações adicionais */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-purple-500" />
          Políticas adicionais
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Política de cancelamento
            </label>
            <select
              value={dados.politica_cancelamento || 'flexivel'}
              onChange={(e) => handleChange('politica_cancelamento', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              <option value="flexivel">✅ Flexível - Cancelamento grátis até 5 dias antes</option>
              <option value="moderado">🟡 Moderado - Cancelamento grátis até 14 dias antes</option>
              <option value="rigido">🔴 Rígido - Cancelamento grátis até 30 dias antes</option>
              <option value="super_rigido">⚠️ Super rígido - Sem reembolso</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in (a partir das)
              </label>
              <input
                type="time"
                value={dados.check_in || '15:00'}
                onChange={(e) => handleChange('check_in', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out (até às)
              </label>
              <input
                type="time"
                value={dados.check_out || '11:00'}
                onChange={(e) => handleChange('check_out', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
                disabled={readOnly}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estadia mínima (noites)
            </label>
            <input
              type="number"
              value={dados.estadia_minima || 1}
              onChange={(e) => handleChange('estadia_minima', parseInt(e.target.value))}
              min={1}
              max={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
      
      {/* Dicas de precificação */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
          <TrendingUp size={16} /> Dicas para otimizar seus ganhos:
        </h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• 📊 Pesquise propriedades semelhantes na sua região</li>
          <li>• 🎯 Ofereça descontos para estadias longas (7+ noites)</li>
          <li>• 🌟 Propriedades com boas avaliações podem ter preços mais altos</li>
          <li>• 📅 Ajuste os preços sazonalmente (alta/baixa temporada)</li>
          <li>• ⚡ Preços competitivos atraem mais reservas rápidas</li>
        </ul>
      </div>
      
      {/* Botão de avançar */}
      {!readOnly && onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#006ce4] text-white px-8 py-3 rounded-lg hover:bg-[#0053b3] transition-colors font-medium flex items-center gap-2"
          >
            Continuar <ChevronRight size={18} />
          </button>
        </div>
      )}
      
      {/* Resumo para modo leitura */}
      {readOnly && dados && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign size={16} /> Resumo de preços
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Preço base:</span> <span className="font-medium">{dados.preco_base} {dados.moeda || 'CVE'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Desconto semanal:</span> <span className="font-medium">{dados.desconto_semanal ? 'Sim (-10%)' : 'Não'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Desconto mensal:</span> <span className="font-medium">{dados.desconto_mensal ? 'Sim (-20%)' : 'Não'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Períodos especiais:</span> <span className="font-medium">{precosSazonais.length} períodos</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bloqueios:</span> <span className="font-medium">{bloqueios.length} períodos</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-in/out:</span> <span className="font-medium">{dados.check_in || '15:00'} / {dados.check_out || '11:00'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrecosDisponibilidade;