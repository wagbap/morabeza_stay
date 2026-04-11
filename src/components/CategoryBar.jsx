import React from 'react';
import { Home, Hotel, Palmtree, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CategoryBar = () => {
  const { t } = useTranslation();
  const cats = [
    { id: 'ap', label: t('apartamento'), icon: <Building2 /> },
    { id: 'vi', label: t('villa'), icon: <Home /> },
    { id: 'gu', label: t('guesthouse'), icon: <Palmtree /> },
    { id: 'ho', label: t('hotel'), icon: <Hotel /> },
  ];

  return (
    <div className="flex justify-center gap-8 py-8 border-b border-gray-50 overflow-x-auto">
      {cats.map(cat => (
        <button key={cat.id} className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-600 transition">
          {cat.icon}
          <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;