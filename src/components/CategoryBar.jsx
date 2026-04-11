import React from 'react';
import { useTranslation } from 'react-i18next';

const CategoryBar = () => {
  const { t } = useTranslation();

  // 1. Definição dos itens usando apenas URLs externas do Cloudinary ☁️
  const itensNavegacao = [
    {
      id: 'alojamentos',
      titulo: t('nav_alojamentos', 'Alojamentos'),
      subtitulo: t('nav_alojamentos_sub', 'CASAS E HOTÉIS'),
      // Substitui aqui pela tua URL do Cloudinary para Alojamentos
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773745742/caad9150-74a1-473c-b289-1047965ad67c_vqmzz8.png', 
      link: '/alojamentos'
    },
    {
      id: 'carros',
      titulo: t('nav_carros', 'Aluguer de Carros'),
      subtitulo: t('nav_carros_sub', 'RENT-A-CAR'),
      // A tua URL do Cloudinary para o Carro
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773745949/caad9150-74a1-473c-b289-1047965ad67c_1_o7vxh9.png',
      link: '/carros'
    },
    {
      id: 'experiencias',
      titulo: t('nav_experiencias', 'Experiências'),
      subtitulo: t('nav_experiencias_sub', 'PASSEIOS & TOURS'),
      // Substitui aqui pela tua URL do Cloudinary para Experiências
      imagem: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1773746453/1_2_qd2khd.png',
      link: '/experiencias'
    }
  ];
return (
    /* 1. Mudamos para max-w-[1200px] (ou a largura exata da tua search bar)
       2. mt-8 cria um espaço saudável entre a barra de busca e as categorias
       3. relative z-30 garante que ela apareça acima de fundos
    */
// Aumentamos para 1440px para dar aquele fôlego extra nas laterais
<div className="max-w-[1350px] max-w-7xl px-4 md:px-6 mt-10 relative z-30 font-sans">
      
      {/* Container principal: Agora com grid que se adapta melhor */}
      <div className="bg-white rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50 overflow-hidden">
        
        {itensNavegacao.map((item) => (
          <a 
            key={item.id}
            href={item.link}
            className="flex items-center gap-5 p-6 md:p-8 hover:bg-gray-50 transition-all group text-left"
          >
            {/* Círculo para a Imagem 🔵 */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <img 
                src={item.imagem} 
                alt={item.titulo}
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                referrerPolicy="no-referrer" 
              />
            </div>

            {/* Conteúdo de Texto ✍️ */}
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">
                {item.titulo}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                {item.subtitulo}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;