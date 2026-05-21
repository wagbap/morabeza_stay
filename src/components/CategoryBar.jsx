import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CategoryBar = () => {
  const { t } = useTranslation();

  const itensNavegacao = [
    {
      id: 'alojamentos',
      titulo: t('nav_alojamentos'),
      subtitulo: t('nav_alojamentos_sub'),
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773745742/caad9150-74a1-473c-b289-1047965ad67c_vqmzz8.png', 
      link: '/alojamentos'
    },
    {
      id: 'carros',
      titulo: t('nav_carros'),
      subtitulo: t('nav_carros_sub'),
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773745949/caad9150-74a1-473c-b289-1047965ad67c_1_o7vxh9.png',
      link: '/carros'
    },
    {
      id: 'experiencias',
      titulo: t('nav_experiencias'),
      subtitulo: t('nav_experiencias_sub'),
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773746453/1_2_qd2khd.png',
      link: '/experiencias'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10 relative z-30 font-sans">
      <div className="bg-white rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50 overflow-hidden">
        
        {itensNavegacao.map((item) => (
          <Link 
            key={item.id}
            to={item.link}
            className="flex items-center gap-5 p-6 md:p-8 hover:bg-gray-50 transition-all group text-left outline-none"
            aria-label={t('ver', { item: item.titulo })}
          >
            {/* Círculo para a Imagem */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <img 
                src={item.imagem} 
                alt="" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                loading="lazy"
              />
            </div>

            {/* Conteúdo de Texto */}
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black text-gray-900 uppercase tracking-tighter leading-none mb-1 group-hover:text-blue-700 transition-colors">
                {item.titulo}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                {item.subtitulo}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;