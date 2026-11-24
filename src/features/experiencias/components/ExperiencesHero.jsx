import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const VIDEO_URL = '/media/experiences-19147576.mp4';
const POSTER = '/media/experiences-19147576-poster.jpg';

const ExperiencesHero = () => {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const updatePlayback = () => {
      const saveData = navigator.connection?.saveData;
      if (reducedMotion.matches || saveData) {
        video.pause();
        if (video.hasAttribute('src')) {
          video.removeAttribute('src');
          video.load();
        }
        return;
      }
      if (!visible || document.visibilityState === 'hidden') {
        video.pause();
        return;
      }
      if (!video.hasAttribute('src')) {
        video.src = VIDEO_URL;
      }
      video.play().catch(() => { /* The poster remains visible if autoplay is blocked. */ });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }, { threshold: 0.01 });
    observer.observe(heroRef.current);
    reducedMotion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  
  return (
    <div ref={heroRef} className="relative h-[390px] md:h-[450px] w-full overflow-hidden">
      <video
        ref={videoRef}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onError={event => { event.currentTarget.removeAttribute('src'); event.currentTarget.load(); }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/20"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-20 pb-12">
        <h1 className="mb-4 text-[28px] font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
          {t('passeio_experiencia_santiago')}
        </h1>
        <p className="mx-auto max-w-4xl text-base font-medium leading-relaxed text-white drop-shadow-md sm:text-lg lg:text-xl">
          {t('descubra_melhor_ilha')}
        </p>
        <div className="mt-6 flex justify-center" aria-hidden="true">
          <div className="h-1.5 w-32 rounded-full bg-[#a5d6a7] shadow-[0_0_15px_#a5d6a7]" />
        </div>
      </div>
    </div>
  );
};

export default ExperiencesHero;
