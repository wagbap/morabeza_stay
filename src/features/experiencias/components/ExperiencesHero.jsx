import React from 'react';
import { useTranslation } from 'react-i18next';

const ExperiencesHero = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative h-[450px] w-full overflow-hidden">
      <img 
        src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1776794055/ChatGPT_Image_21_04_2026_18_53_49_tjncp9.png" 
        className="absolute inset-0 w-full h-full object-cover"
        alt={t('experiencias_hero_alt')}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/20 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
          {t('passeio_experiencia_santiago')}
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium">
          {t('descubra_melhor_ilha')}
        </p>
      </div>
    </div>
  );
};

export default ExperiencesHero;