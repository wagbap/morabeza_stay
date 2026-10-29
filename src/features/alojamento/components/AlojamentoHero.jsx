import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t, i18n } = useTranslation();

  return (
    <div key={i18n.language} className="relative h-[450px] w-full flex flex-col items-center justify-center text-white overflow-hidden bg-slate-900">
      
      {/* BACKGROUND: Imagem com brilho real, sem ser baça */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/dc/e9/18/hotel-riu-touareg.jpg?w=1200&h=-1&s=1')" }}
      >
        {/* Overlay de contraste: Escurece apenas o necessário para o branco brilhar */}
        <div className="absolute inset-0 bg-black/30 backdrop-contrast-125"></div>
      </div>

      {/* CONTEÚDO: Direto e Forte */}
      <div className="relative z-10 text-center px-4">
        
        {/* TÍTULO: Letras grandes, brancas puras e com sombra forte */}
        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          {t('welcome_alojamento')}
        </h1>
        
        {/* SUBTÍTULO: Branco nítido com fundo de leitura */}
        <p className="mx-auto max-w-4xl text-lg font-medium leading-relaxed text-white drop-shadow-md sm:text-xl md:text-3xl">
          {t('subtitle_alojamento')}
        </p>

        {/* Detalhe de "Vida": Linha de cor vibrante */}
        <div className="mt-10 flex justify-center">
          <div className="h-1.5 w-32 bg-[#a5d6a7] rounded-full shadow-[0_0_15px_#a5d6a7]"></div>
        </div>
      </div>

    </div>
  );
};

export default Hero;