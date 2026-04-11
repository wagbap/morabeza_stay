import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t, i18n } = useTranslation();

  return (
    <div key={i18n.language} className="relative h-[650px] w-full flex flex-col items-center justify-center text-white overflow-hidden bg-slate-900">
      
      {/* BACKGROUND: Imagem com brilho real, sem ser baça */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541417904950-b855846fe074?q=80&w=2000')" }}
      >
        {/* Overlay de contraste: Escurece apenas o necessário para o branco brilhar */}
        <div className="absolute inset-0 bg-black/30 backdrop-contrast-125"></div>
      </div>

      {/* CONTEÚDO: Direto e Forte */}
      <div className="relative z-10 text-center px-4">
        
        {/* TÍTULO: Letras grandes, brancas puras e com sombra forte */}
        <h1 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter drop-shadow-[0_8px_30px_rgb(0,0,0,0.8)]">
          {t('welcome')}
        </h1>
        
        {/* SUBTÍTULO: Branco nítido com fundo de leitura */}
        <p className="text-xl md:text-3xl font-medium tracking-wide text-white drop-shadow-lg">
          {t('subtitle')}
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