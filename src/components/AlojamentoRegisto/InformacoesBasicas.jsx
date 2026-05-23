// src/components/AlojamentoRegisto/InformacoesBasicas.jsx
import React, { useState } from 'react';
import { Info, Home, Users, Star, Check, ChevronRight, Clock, AlertCircle, ChevronDown, ChevronUp, Building, BedDouble, Bath } from 'lucide-react';

// Tipos de propriedade disponíveis (baseado no BD)
const TIPOS_PROPRIEDADE = [
  { id: 'Apartamento', nome: 'Apartamento', icone: <Building size={18} />, descricao: 'Espaço privado num edifício' },
  { id: 'Villa', nome: 'Villa', icone: <Home size={18} />, descricao: 'Casa inteira com privacidade total' },
  { id: 'Guesthouse', nome: 'Guesthouse', icone: <BedDouble size={18} />, descricao: 'Alojamento local partilhado' },
  { id: 'Hotel', nome: 'Hotel', icone: <Building size={18} />, descricao: 'Serviços completos de hotel' },
  { id: 'Casa', nome: 'Casa', icone: <Home size={18} />, descricao: 'Casa tradicional' },
  { id: 'Estúdio', nome: 'Estúdio', icone: <Building size={18} />, descricao: 'Espaço integrado e compacto' },
  { id: 'Resort', nome: 'Resort', icone: <Home size={18} />, descricao: 'Complexo turístico com lazer' },
];

// Opções de tempo de resposta
const TEMPO_RESPOSTA = [
  'Dentro de 1 hora',
  'Dentro de 2 horas',
  'Dentro de 6 horas',
  'Dentro de 12 horas',
  'Dentro de 24 horas',
  'Dentro de 48 horas'
];

// Capacidades sugeridas
const CAPACIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

const InformacoesBasicas = ({ 
  dados, 
  onDadosChange, 
  readOnly = false,
  onNext 
}) => {
  const [erros, setErros] = useState({});
  const [expandirDicas, setExpandirDicas] = useState(false);
  
  // Handlers para atualizar os dados
  const handleChange = (campo, valor) => {
    onDadosChange({ ...dados, [campo]: valor });
    // Limpar erro do campo
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }));
    }
  };
  
  // Validação do formulário
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!dados.titulo || dados.titulo.trim() === '') {
      novosErros.titulo = 'O título da propriedade é obrigatório';
    } else if (dados.titulo.length < 5) {
      novosErros.titulo = 'O título deve ter pelo menos 5 caracteres';
    } else if (dados.titulo.length > 100) {
      novosErros.titulo = 'O título não pode ter mais de 100 caracteres';
    }
    
    if (!dados.descricao || dados.descricao.trim() === '') {
      novosErros.descricao = 'A descrição curta é obrigatória';
    } else if (dados.descricao.length < 20) {
      novosErros.descricao = 'A descrição deve ter pelo menos 20 caracteres';
    }
    
    if (!dados.capacidade || dados.capacidade < 1) {
      novosErros.capacidade = 'A capacidade é obrigatória';
    }
    
    if (!dados.preco_noite || dados.preco_noite <= 0) {
      novosErros.preco_noite = 'O preço por noite é obrigatório';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = () => {
    if (validarFormulario() && onNext) {
      onNext();
    }
  };
  
  // Renderizar estrelas
  const renderEstrelas = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && handleChange('estrelas', star)}
            disabled={readOnly}
            className={`text-2xl transition-colors ${
              dados.estrelas >= star ? 'text-yellow-400' : 'text-gray-300'
            } ${!readOnly && 'hover:scale-110 hover:text-yellow-400'} ${readOnly && 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Título da propriedade */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Título da propriedade <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={dados.titulo || ''}
          onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Ex: Villa Maravilha - Vista deslumbrante para o mar"
          className={`w-full px-4 py-3 border ${erros.titulo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors`}
          disabled={readOnly}
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {erros.titulo && <p className="text-sm text-red-500">{erros.titulo}</p>}
          <p className="text-xs text-gray-400 ml-auto">
            {(dados.titulo?.length || 0)}/100 caracteres
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Um bom título atrai mais hóspedes. Inclua características únicas da sua propriedade.
        </p>
      </div>
      
      {/* Tipo de propriedade */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de propriedade <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TIPOS_PROPRIEDADE.map(tipo => (
            <button
              key={tipo.id}
              type="button"
              onClick={() => !readOnly && handleChange('tipo_propriedade', tipo.id)}
              disabled={readOnly}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                dados.tipo_propriedade === tipo.id
                  ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${readOnly && 'cursor-default'}`}
            >
              <span className={dados.tipo_propriedade === tipo.id ? 'text-[#006ce4]' : 'text-gray-500'}>
                {tipo.icone}
              </span>
              <div className="text-left">
                <p className="text-sm font-medium">{tipo.nome}</p>
                <p className="text-xs text-gray-400 hidden md:block">{tipo.descricao}</p>
              </div>
              {dados.tipo_propriedade === tipo.id && <Check size={16} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>
      
      {/* Capacidade e detalhes do espaço */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capacidade */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capacidade máxima (pessoas) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            <select
              value={dados.capacidade || 2}
              onChange={(e) => handleChange('capacidade', parseInt(e.target.value))}
              className={`flex-1 px-4 py-3 border ${erros.capacidade ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] bg-white`}
              disabled={readOnly}
            >
              {CAPACIDADES.map(cap => (
                <option key={cap} value={cap}>{cap} {cap === 1 ? 'pessoa' : 'pessoas'}</option>
              ))}
            </select>
          </div>
          {erros.capacidade && <p className="text-sm text-red-500 mt-1">{erros.capacidade}</p>}
        </div>
        
        {/* Classificação por estrelas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Classificação (estrelas)
          </label>
          <div className="flex items-center gap-3">
            <Star size={20} className="text-yellow-400" />
            {renderEstrelas()}
            {dados.estrelas && (
              <span className="text-sm text-gray-500">({dados.estrelas} estrelas)</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            A classificação será atualizada com base nas avaliações dos hóspedes
          </p>
        </div>
      </div>
      
      {/* Detalhes adicionais do espaço (opcionais) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Home size={16} /> Detalhes adicionais do espaço (opcional)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de quartos</label>
            <select
              value={dados.quartos || 1}
              onChange={(e) => handleChange('quartos', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              disabled={readOnly}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => <option key={num} value={num}>{num} {num === 1 ? 'quarto' : 'quartos'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de camas</label>
            <select
              value={dados.camas || 1}
              onChange={(e) => handleChange('camas', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              disabled={readOnly}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => <option key={num} value={num}>{num} {num === 1 ? 'cama' : 'camas'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de casas de banho</label>
            <select
              value={dados.casas_banho || 1}
              onChange={(e) => handleChange('casas_banho', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              disabled={readOnly}
            >
              {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {num === 1 ? 'casa de banho' : 'casas de banho'}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {/* Descrição curta */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição curta <span className="text-red-500">*</span>
        </label>
        <textarea
          value={dados.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          rows={3}
          placeholder="Descreva brevemente a sua propriedade. Destaque os principais atrativos..."
          className={`w-full px-4 py-3 border ${erros.descricao ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] resize-none`}
          disabled={readOnly}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {erros.descricao && <p className="text-sm text-red-500">{erros.descricao}</p>}
          <p className="text-xs text-gray-400 ml-auto">
            {(dados.descricao?.length || 0)}/500 caracteres
          </p>
        </div>
      </div>
      
      {/* Descrição detalhada */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição detalhada
        </label>
        <textarea
          value={dados.descricao_detalhada || ''}
          onChange={(e) => handleChange('descricao_detalhada', e.target.value)}
          rows={6}
          placeholder="Descreva detalhadamente a sua propriedade: localização, decoração, comodidades especiais, pontos turísticos próximos, etc. Quanto mais detalhes, mais confiança os hóspedes terão."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] resize-none"
          disabled={readOnly}
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {(dados.descricao_detalhada?.length || 0)}/2000 caracteres
        </p>
      </div>
      
      {/* Preço por noite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço por noite (CVE) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={dados.preco_noite || ''}
              onChange={(e) => handleChange('preco_noite', parseFloat(e.target.value))}
              placeholder="Ex: 5000"
              className={`w-full pl-8 pr-4 py-3 border ${erros.preco_noite ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4]`}
              disabled={readOnly}
              min={0}
              step={100}
            />
          </div>
          {erros.preco_noite && <p className="text-sm text-red-500 mt-1">{erros.preco_noite}</p>}
          <p className="text-xs text-gray-400 mt-1">Preço em escudos cabo-verdianos (CVE)</p>
        </div>
        
        {/* Tempo de resposta */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tempo de resposta
          </label>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            <select
              value={dados.tempo_resposta || 'Dentro de 1 hora'}
              onChange={(e) => handleChange('tempo_resposta', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {TEMPO_RESPOSTA.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">Tempo médio para responder aos hóspedes</p>
        </div>
      </div>
      
      {/* Dicas e recomendações - expansível */}
      <div className="border border-blue-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setExpandirDicas(!expandirDicas)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-blue-600" />
            <span className="font-medium text-blue-800">💡 Dicas para um anúncio de sucesso</span>
          </div>
          {expandirDicas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expandirDicas && (
          <div className="p-4 bg-white space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">1</div>
              <div><p className="font-medium">Título atraente</p><p className="text-sm text-gray-600">Use palavras como "Vista mar", "Perto da praia", "Recém renovado"</p></div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">2</div>
              <div><p className="font-medium">Fotos de qualidade</p><p className="text-sm text-gray-600">Propriedades com mais de 10 fotos recebem 40% mais reservas</p></div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">3</div>
              <div><p className="font-medium">Preço competitivo</p><p className="text-sm text-gray-600">Pesquise propriedades semelhantes na sua região</p></div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">4</div>
              <div><p className="font-medium">Descrição detalhada</p><p className="text-sm text-gray-600">Inclua informações sobre transportes, supermercados e restaurantes próximos</p></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Botão de avançar (se não estiver em modo leitura) */}
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
            <Info size={16} /> Resumo das informações
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Título:</span> <span className="font-medium">{dados.titulo || '-'}</span></div>
            <div><span className="text-gray-500">Tipo:</span> <span className="font-medium">{dados.tipo_propriedade || '-'}</span></div>
            <div><span className="text-gray-500">Capacidade:</span> <span className="font-medium">{dados.capacidade || '-'} pessoas</span></div>
            <div><span className="text-gray-500">Classificação:</span> <span className="font-medium">{dados.estrelas || '-'} ★</span></div>
            <div><span className="text-gray-500">Preço/noite:</span> <span className="font-medium">{dados.preco_noite ? `${dados.preco_noite} CVE` : '-'}</span></div>
            <div><span className="text-gray-500">Resposta:</span> <span className="font-medium">{dados.tempo_resposta || '-'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformacoesBasicas;