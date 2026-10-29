import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Landmark, Utensils, Leaf, Sunset, Waves, Check } from 'lucide-react';

const categorias = [
  { id: 'aventura', icon: Mountain }, { id: 'cultural', icon: Landmark },
  { id: 'gastronomia', icon: Utensils }, { id: 'natureza', icon: Leaf },
  { id: 'relax', icon: Sunset }, { id: 'jetski', icon: Waves },
];

export default function Categoria({ value, onChange, readOnly = false }) {
  const { t } = useTranslation();
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {categorias.map(({ id, icon }) => <button key={id} type="button" disabled={readOnly}
      aria-pressed={value === id} onClick={() => onChange(id)}
      className={`flex items-center gap-4 rounded-lg border-2 p-4 text-left transition ${value === id ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'} disabled:cursor-default`}>
      <span className="shrink-0 text-blue-600">{React.createElement(icon, { size: 26 })}</span>
      <span className="min-w-0 flex-1"><span className="block font-semibold text-gray-900">{t(`experiencia_categoria_${id}`)}</span><span className="mt-1 block text-xs text-gray-500">{t(`experiencia_categoria_${id}_descricao`)}</span></span>
      {value === id && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"><Check size={14} /></span>}
    </button>)}
  </div>;
}
