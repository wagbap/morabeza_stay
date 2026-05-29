// src/components/ExperienciaRegisto/InformacoesBasicas.jsx
// ESTE É O COMPONENTE CORRETO PARA EXPERIÊNCIA, NÃO PARA ALOJAMENTO!

import React from 'react';
import { DollarSign, Users, Clock, MapPin, Info } from 'lucide-react';

const DURACOES = ['1 hora', '2 horas', '3 horas', '4 horas', '5 horas', '6 horas', 'Dia inteiro', '2 dias', '3 dias'];
const CAPACIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50];

const InformacoesBasicas = ({ dados = {}, onChange, readOnly = false }) => {
  const handleChange = (campo, valor) => {
    onChange({ ...dados, [campo]: valor });
  };
  
  const handleCheckbox = (campo) => {
    onChange({ ...dados, [campo]: !dados[campo] });
  };
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Título da Experiência <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={dados.titulo || ''}
          onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Ex: Mergulho com Tartarugas, Tour Cultural..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
          disabled={readOnly}
        />
      </div>
      
      {/* Descrição Curta */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição Curta <span className="text-red-500">*</span>
        </label>
        <textarea
          value={dados.descricao_curta || ''}
          onChange={(e) => handleChange('descricao_curta', e.target.value)}
          rows={3}
          placeholder="Uma breve descrição da experiência (máx 200 caracteres)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
          maxLength={200}
        />
        <p className="text-xs text-gray-400 mt-1">{(dados.descricao_curta?.length || 0)}/200 caracteres</p>
      </div>
      
      {/* Descrição Longa */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição Detalhada
        </label>
        <textarea
          value={dados.descricao_longa || ''}
          onChange={(e) => handleChange('descricao_longa', e.target.value)}
          rows={6}
          placeholder="Descreva detalhadamente a experiência: roteiro, atividades, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
        />
      </div>
      
      {/* Preços */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço Adulto (CVE) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={dados.preco || ''}
              onChange={(e) => handleChange('preco', parseFloat(e.target.value))}
              placeholder="Ex: 5000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço Criança
          </label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={dados.preco_crianca || ''}
              onChange={(e) => handleChange('preco_crianca', parseFloat(e.target.value))}
              placeholder="Ex: 2500"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-400">3-12 anos</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço Bebê
          </label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={dados.preco_bebe || ''}
              onChange={(e) => handleChange('preco_bebe', parseFloat(e.target.value))}
              placeholder="Ex: 0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-400">0-2 anos</p>
        </div>
      </div>
      
      {/* Duração e Capacidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duração <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            <select
              value={dados.duracao || '2 horas'}
              onChange={(e) => handleChange('duracao', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              {DURACOES.map(dur => <option key={dur} value={dur}>{dur}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capacidade Máxima <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            <select
              value={dados.max_pessoas || 10}
              onChange={(e) => handleChange('max_pessoas', parseInt(e.target.value))}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              {CAPACIDADES.map(cap => <option key={cap} value={cap}>{cap} pessoas</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {/* Mínimo de pessoas */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mínimo de pessoas
        </label>
        <select
          value={dados.min_pessoas || 1}
          onChange={(e) => handleChange('min_pessoas', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
        >
          {[1, 2, 3, 4, 5].map(cap => <option key={cap} value={cap}>{cap} pessoa(s)</option>)}
        </select>
      </div>
      
      {/* Ponto de encontro */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ponto de Encontro
        </label>
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-gray-400" />
          <input
            type="text"
            value={dados.ponto_encontro || ''}
            onChange={(e) => handleChange('ponto_encontro', e.target.value)}
            placeholder="Ex: Pier de Santa Maria, Entrada do hotel..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      {/* Checkboxes de inclusão */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">O que está incluído?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dados.inclui_guia || false}
              onChange={() => handleCheckbox('inclui_guia')}
              className="w-4 h-4 text-[#006ce4] rounded"
            />
            <span className="text-sm">🎯 Guia profissional</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dados.inclui_transporte || false}
              onChange={() => handleCheckbox('inclui_transporte')}
              className="w-4 h-4 text-[#006ce4] rounded"
            />
            <span className="text-sm">🚐 Transporte</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dados.inclui_refeicao || false}
              onChange={() => handleCheckbox('inclui_refeicao')}
              className="w-4 h-4 text-[#006ce4] rounded"
            />
            <span className="text-sm">🍽️ Refeição</span>
          </label>
        </div>
      </div>
      
      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
          <Info size={16} /> Dicas para uma experiência de sucesso:
        </h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• 📝 Seja detalhista na descrição</li>
          <li>• 💰 Preços competitivos atraem mais reservas</li>
          <li>• 📸 Fotos de qualidade aumentam as chances de reserva</li>
        </ul>
      </div>
    </div>
  );
};

export default InformacoesBasicas;