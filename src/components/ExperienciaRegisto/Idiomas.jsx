// src/components/ExperienciaRegisto/Idiomas.jsx

import React, { useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';

const IDIOMAS_DISPONIVEIS = [
  'Português', 'Inglês', 'Francês', 'Espanhol', 'Italiano', 
  'Alemão', 'Holandês', 'Russo', 'Mandarim', 'Japonês', 'Crioulo'
];

const NIVEIS = ['Básico', 'Intermediário', 'Fluente', 'Nativo'];

const Idiomas = ({ items = [], onChange, readOnly = false }) => {
  const [novoIdioma, setNovoIdioma] = useState('');
  const [novoNivel, setNovoNivel] = useState('Fluente');
  const [mostrarForm, setMostrarForm] = useState(false);
  
  const adicionarIdioma = () => {
    if (!novoIdioma) return;
    if (items.some(i => i.idioma === novoIdioma)) return;
    
    const novo = {
      id: Date.now(),
      idioma: novoIdioma,
      nivel: novoNivel
    };
    
    onChange([...items, novo]);
    setNovoIdioma('');
    setNovoNivel('Fluente');
    setMostrarForm(false);
  };
  
  const removerIdioma = (id) => {
    onChange(items.filter(item => item.id !== id));
  };
  
  return (
    <div className="space-y-4">
      {/* Lista de idiomas */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
              <Globe size={14} className="text-blue-500" />
              <span className="text-sm font-medium text-blue-800">{item.idioma}</span>
              <span className="text-xs text-blue-600">({item.nivel})</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removerIdioma(item.id)}
                  className="ml-1 text-blue-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Botão adicionar */}
      {!readOnly && (
        <>
          {mostrarForm ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-gray-500 mb-1">Idioma</label>
                <select
                  value={novoIdioma}
                  onChange={(e) => setNovoIdioma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
                >
                  <option value="">Selecione</option>
                  {IDIOMAS_DISPONIVEIS.map(idioma => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-500 mb-1">Nível</label>
                <select
                  value={novoNivel}
                  onChange={(e) => setNovoNivel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
                >
                  {NIVEIS.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={adicionarIdioma}
                className="px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3]"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 text-[#006ce4] hover:text-[#0053b3]"
            >
              <Plus size={18} /> Adicionar idioma
            </button>
          )}
        </>
      )}
      
      {items.length === 0 && !readOnly && (
        <p className="text-gray-400 text-center py-4">
          Adicione os idiomas falados pelos guias
        </p>
      )}
      
      {items.length === 0 && readOnly && (
        <p className="text-gray-400 text-center py-4">Nenhum idioma informado</p>
      )}
    </div>
  );
};

export default Idiomas;