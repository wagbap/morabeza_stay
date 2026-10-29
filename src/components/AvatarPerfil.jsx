import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function urlsFoto(value) {
  if (typeof value !== 'string') return [];
  const path = value.trim().replace(/\\/g, '/');
  if (!path || /^(null|undefined|false)$/i.test(path)) return [];
  try {
    const url = new URL(path, 'https://welovepalop.com/');
    if (!['http:', 'https:'].includes(url.protocol)) return [];
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('/')) return [url.href];
    // Older records can store a path relative to /api instead of the host root.
    return [...new Set([url.href, new URL(path, 'https://welovepalop.com/api/').href])];
  } catch { return []; }
}

function ImagemAvatar({ urls, nome, className }) {
  const [falhadas, setFalhadas] = useState([]);
  const [carregada, setCarregada] = useState(null);
  const src = urls.find(url => !falhadas.includes(url));
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const iniciais = [partes[0], partes.length > 1 ? partes.at(-1) : null]
    .filter(Boolean).map(parte => Array.from(parte)[0]).join('').toLocaleUpperCase();
  return <span role="img" aria-label={nome} className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-900 font-semibold text-white ${className}`}>
    <span aria-hidden="true">{iniciais}</span>
    {src && <img key={src} src={src} alt="" aria-hidden="true" decoding="async" referrerPolicy="no-referrer"
      className={`absolute inset-0 h-full w-full object-cover ${carregada === src ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setCarregada(src)} onError={() => setFalhadas(values => [...values, src])} />}
  </span>;
}

export default function AvatarPerfil({ usuario, className = 'h-10 w-10' }) {
  const { t } = useTranslation();
  const nome = [usuario?.nome, usuario?.name, usuario?.email].find(value => typeof value === 'string' && value.trim()) || t('sidebar_utilizador');
  const urls = [...new Set([usuario?.foto, usuario?.foto_perfil, usuario?.picture, usuario?.avatar].flatMap(urlsFoto))];
  return <ImagemAvatar key={JSON.stringify([usuario?.id, urls, nome])} urls={urls} nome={nome} className={className} />;
}
