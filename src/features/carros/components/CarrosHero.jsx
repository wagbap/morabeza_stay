import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const POSTER = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=75&w=1600';
const VIDEO_BASE = 'https://res.cloudinary.com/dpsrmzvsl/video/upload';
const VIDEO_ASSET = 'v1792829362/12510756_3840_2160_60fps_yn2el6.mp4';

const CarrosHero = () => {
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
        const width = window.matchMedia('(max-width: 767px)').matches ? 720 : 1280;
        // Remove audio and reduce the 4K/60fps source for a decorative background.
        video.src = `${VIDEO_BASE}/f_auto,q_auto,w_${width},c_limit,fps_24,ac_none/${VIDEO_ASSET}`;
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
    <div ref={heroRef} className="relative h-[450px] w-full overflow-hidden">
      <video
        ref={videoRef}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        onError={event => { event.currentTarget.removeAttribute('src'); event.currentTarget.load(); }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-900/20" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-4xl font-black uppercase italic tracking-tighter text-white md:text-6xl">
          {t('carros_hero_titulo', 'Car rental in Santiago')}
        </h1>
        <p className="max-w-2xl text-lg font-medium text-white/90 md:text-xl">
          {t('carros_hero_subtitulo', 'Find the ideal car to explore the island in comfort')}
        </p>
      </div>
    </div>
  );
};

export default CarrosHero;
