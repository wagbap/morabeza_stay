// src/components/ExperienciaRegisto/Categoria.jsx

import React from 'react';

const CATEGORIAS = [
  { id: 'aventura', nome: '🏔️ Aventura', descricao: 'Experiências cheias de adrenalina', cor: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'cultural', nome: '🏛️ Cultural', descricao: 'Mergulhe na cultura local', cor: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'gastronomia', nome: '🍽️ Gastronomia', descricao: 'Sabores autênticos de Cabo Verde', cor: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'natureza', nome: '🌿 Natureza', descricao: 'Explore as maravilhas naturais', cor: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'relax', nome: '🌅 Relax', descricao: 'Momentos de paz e tranquilidade', cor: 'bg-purple-50 border-purple-200 text-purple-700' }
];

const Categoria = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CATEGORIAS.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => !readOnly && onChange(cat.id)}
          disabled={readOnly}
          className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
            value === cat.id
              ? 'border-[#006ce4] bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${readOnly && 'cursor-default'}`}
        >
          <div className={`text-2xl ${value === cat.id ? 'scale-110' : ''} transition-transform`}>
            {cat.nome.split(' ')[0]}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${value === cat.id ? 'text-[#006ce4]' : 'text-gray-800'}`}>
              {cat.nome}
            </h3>
            <p className="text-xs text-gray-500">{cat.descricao}</p>
          </div>
          {value === cat.id && (
            <div className="w-6 h-6 bg-[#006ce4] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default Categoria;