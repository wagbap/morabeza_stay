import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const POSTER = `${import.meta.env.BASE_URL}media/home-beach-29984774-poster.jpg`;
const VIDEO_MOBILE = `${import.meta.env.BASE_URL}media/home-beach-29984774-mobile.mp4`;
const VIDEO_DESKTOP = `${import.meta.env.BASE_URL}media/home-beach-29984774-desktop.mp4`;

const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const useMobile = window.matchMedia('(max-width: 767px)').matches || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
    const source = useMobile ? VIDEO_MOBILE : VIDEO_DESKTOP;
    let visible = false;
    let retries = 0;
    let resumeAt = null;
    let retryTimer;
    let disposed = false;
    const shouldPlay = () => !disposed && visible && document.visibilityState !== 'hidden' && !reducedMotion.matches && !connection?.saveData;
    const updatePlayback = () => {
      if (!shouldPlay()) {
        video.pause();
        return;
      }
      if (!video.hasAttribute('src')) {
        // Buffer the complete lightweight clip while visible, rather than streaming 4K.
        video.preload = 'auto';
        video.muted = true;
        video.defaultMuted = true;
        video.src = source;
        video.load();
      }
      video.play().catch(() => { /* Mobile autoplay restrictions keep the poster visible. */ });
    };
    const restorePosition = () => {
      if (resumeAt !== null && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(resumeAt, Math.max(0, video.duration - 0.1));
        resumeAt = null;
      }
    };
    const recover = () => {
      if (disposed || retries >= 1) return;
      retries++;
      resumeAt = video.currentTime || 0;
      retryTimer = window.setTimeout(() => {
        if (disposed) return;
        video.load();
        updatePlayback();
      }, 1000);
    };
    // Retry blocked autoplay on the next user interaction without restarting the clip.
    const onGesture = () => { if (video.paused && shouldPlay()) updatePlayback(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }, { threshold: 0.01 });
    observer.observe(heroRef.current);
    video.addEventListener('loadedmetadata', restorePosition);
    video.addEventListener('canplay', updatePlayback);
    video.addEventListener('error', recover);
    reducedMotion.addEventListener('change', updatePlayback);
    connection?.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    document.addEventListener('pointerdown', onGesture, { passive: true });
    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      observer.disconnect();
      video.removeEventListener('loadedmetadata', restorePosition);
      video.removeEventListener('canplay', updatePlayback);
      video.removeEventListener('error', recover);
      reducedMotion.removeEventListener('change', updatePlayback);
      connection?.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      document.removeEventListener('pointerdown', onGesture);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);


  return (
    <div ref={heroRef} className="relative h-[450px] w-full flex flex-col items-center justify-center text-white overflow-hidden bg-slate-900">
      
      <video
        ref={videoRef}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTEÚDO: Direto e Forte */}
      <div className="relative z-10 text-center px-4">
        
        {/* TÍTULO: Letras grandes, brancas puras e com sombra forte */}
        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          {t('welcome')}
        </h1>
        
        {/* SUBTÍTULO: Branco nítido com fundo de leitura */}
        <p className="mx-auto max-w-4xl text-lg font-medium leading-relaxed text-white drop-shadow-md sm:text-xl md:text-3xl">
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