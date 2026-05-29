// src/components/ExperienciaRegisto/Requisitos.jsx

import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

const REQUISITOS_SUGERIDOS = [
  'Saber nadar',
  'Idade mínima: 10 anos',
  'Boa condição física',
  'Não ter problemas cardíacos',
  'Calçado confortável',
  'Protetor solar',
  'Roupa adequada',
  'Levar água',
  'Documento de identificação'
];

const Requisitos = ({ items = [], onChange, readOnly = false }) => {
  const [novoRequisito, setNovoRequisito] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  
  const adicionarRequisito = () => {
    if (!novoRequisito.trim()) return;
    
    const novo = {
      id: Date.now(),
      requisito: novoRequisito.trim(),
      obrigatorio: 1,
      ordem: items.length
    };
    
    onChange([...items, novo]);
    setNovoRequisito('');
    setMostrarForm(false);
  };
  
  const removerRequisito = (id) => {
    onChange(items.filter(item => item.id !== id));
  };
  
  const adicionarSugerido = (sugestao) => {
    if (items.some(i => i.requisito === sugestao)) return;
    
    const novo = {
      id: Date.now(),
      requisito: sugestao,
      obrigatorio: 1,
      ordem: items.length
    };
    
    onChange([...items, novo]);
  };
  
  return (
    <div className="space-y-4">
      {/* Sugestões rápidas */}
      {!readOnly && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Sugestões rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {REQUISITOS_SUGERIDOS.map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => adicionarSugerido(sug)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista de requisitos */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle size={16} className="text-orange-500" />
              <span className="flex-1 text-sm text-gray-700">{item.requisito}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removerRequisito(item.id)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} />
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
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={novoRequisito}
                onChange={(e) => setNovoRequisito(e.target.value)}
                placeholder="Ex: É necessário saber nadar, Idade mínima 12 anos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={adicionarRequisito}
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
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 text-[#006ce4] hover:text-[#0053b3]"
            >
              <Plus size={18} /> Adicionar requisito
            </button>
          )}
        </>
      )}
      
      {items.length === 0 && !readOnly && (
        <p className="text-gray-400 text-center py-4">
          Adicione requisitos importantes para os participantes
        </p>
      )}
      
      {items.length === 0 && readOnly && (
        <p className="text-gray-400 text-center py-4">Nenhum requisito listado</p>
      )}
    </div>
  );
};

export default Requisitos;