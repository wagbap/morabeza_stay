// src/components/CarroRegisto/InformacoesBasicas.jsx

import React, { useState, useEffect } from 'react';
import { Car, Tag, DollarSign, FileText, Loader } from 'lucide-react';
import { buscarTiposCarro } from '../../services/carroApiService';

const InformacoesBasicas = ({ dados = {}, onChange, readOnly = false }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const carregarTipos = async () => {
      try {
        const result = await buscarTiposCarro();
        if (result.success) {
          setTipos(result.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar tipos:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarTipos();
  }, []);
  
  const handleChange = (campo, valor) => {
    onChange({ ...dados, [campo]: valor });
  };
  
  if (loading) {
    return <div className="text-center py-8"><Loader className="animate-spin mx-auto text-[#006ce4]" size={32} /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título do Anúncio <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dados.titulo || ''}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Toyota Hilux 2023 4x4"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoria
          </label>
          <div className="relative">
            <Car size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.categoria_id || ''}
              onChange={(e) => handleChange('categoria_id', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              <option value="">Selecione a categoria</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.icone} {tipo.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Marca
          </label>
          <input
            type="text"
            value={dados.marca || ''}
            onChange={(e) => handleChange('marca', e.target.value)}
            placeholder="Ex: Toyota, Honda, Hyundai"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Modelo
          </label>
          <input
            type="text"
            value={dados.modelo || ''}
            onChange={(e) => handleChange('modelo', e.target.value)}
            placeholder="Ex: Hilux, Civic, HB20"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
            disabled={readOnly}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preço por Dia (CVE) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={dados.preco_dia || ''}
              onChange={(e) => handleChange('preco_dia', parseFloat(e.target.value))}
              placeholder="Ex: 5000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição Curta
        </label>
        <textarea
          value={dados.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          rows={3}
          placeholder="Breve descrição do veículo..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] resize-none"
          disabled={readOnly}
          maxLength={200}
        />
        <p className="text-xs text-gray-400 mt-1">{(dados.descricao?.length || 0)}/200 caracteres</p>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição Detalhada
        </label>
        <textarea
          value={dados.descricao_detalhada || ''}
          onChange={(e) => handleChange('descricao_detalhada', e.target.value)}
          rows={5}
          placeholder="Descrição completa do veículo, incluindo estado, manutenção, diferenciais..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] resize-none"
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default InformacoesBasicas;