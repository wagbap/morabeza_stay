import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Fuel, Gauge, Star, ArrowRight } from 'lucide-react';
import BotaoFavorito from '../../../components/BotaoFavorito';

const IMAGENS_ENDPOINT = 'https://welovepalop.com/api/carro/imagem.php';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect fill="#f1f5f9" width="400" height="300"/>
      <path fill="#cbd5e1" d="M160 130a20 20 0 1 1 40 0 20 20 0 0 1-40 0zm-70 90l60-80 50 60 40-40 60 60H90z"/>
      <text x="200" y="260" font-family="system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">Sem imagem</text>
    </svg>`
  );

// Cache global — 1 pedido por sessão para todos os cards
let cacheMapa = null;
let promessa = null;

function carregarMapa() {
  if (cacheMapa) return Promise.resolve(cacheMapa);
  if (promessa) return promessa;

  promessa = fetch(IMAGENS_ENDPOINT)
    .then((r) => r.json())
    .then((res) => {
      cacheMapa = (res?.success && res.imagens) ? res.imagens : {};
      return cacheMapa;
    })
    .catch(() => {
      cacheMapa = {};
      return cacheMapa;
    });

  return promessa;
}

const CardCarro = ({ carro, isList = false }) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    if (!carro?.id) return;

    // Já vem no objeto?
    const doObjeto =
      (typeof carro.imagem_principal === 'string' && carro.imagem_principal.startsWith('http'))
        ? carro.imagem_principal
        : (typeof carro.imagem_capa === 'string' && carro.imagem_capa.startsWith('http'))
          ? carro.imagem_capa
          : null;

    if (doObjeto) {
      setImg(doObjeto);
      return;
    }

    // Vai buscar ao mapa global
    let cancelado = false;
    carregarMapa().then((mapa) => {
      if (cancelado) return;
      const url = mapa?.[String(carro.id)];
      if (url) setImg(url);
    });

    return () => { cancelado = true; };
  }, [carro?.id, carro?.imagem_principal, carro?.imagem_capa]);

  if (!carro || (!carro.id && !carro.slug)) return null;

  const linkTo = carro.slug ? `/carros/${carro.slug}` : `/carros/${carro.id}`;
  const titulo = carro.titulo || 'Carro sem título';
  const localizacao = carro.localizacao || carro.cidade || carro.ilha || 'Cabo Verde';
  const capaFinal = img || PLACEHOLDER;
  const badge = carro.tipo || carro.categoria_nome || 'Carro';

  return (
    <div
      className={`relative group bg-white border border-gray-100 overflow-hidden transition-shadow duration-200 hover:shadow-lg ${
        isList
          ? 'flex flex-col md:flex-row rounded-[40px] p-4 gap-6 w-full'
          : 'flex flex-col h-full w-full rounded-[2.5rem]'
      }`}
    >
      <div
        className={`relative overflow-hidden shrink-0 bg-slate-100 ${
          isList
            ? 'w-full md:w-[320px] lg:w-[360px] h-56 md:h-64 rounded-[32px]'
            : 'aspect-[4/3] w-full rounded-t-[2.5rem]'
        }`}
      >
        <img
          src={capaFinal}
          alt={titulo}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md z-10">
          {badge}
        </div>
        <BotaoFavorito
          tipo="carros"
          item={{
            id: carro.id, titulo, localizacao,
            imagem_url: capaFinal,
            preco_dia: carro.preco_dia,
            estrelas: carro.estrelas,
            slug: carro.slug,
            tipo: 'carro',
          }}
          size={18}
          className="absolute top-3 right-3 z-10"
        />
      </div>

      <div className={`flex flex-col flex-1 text-left ${isList ? 'py-4 pr-4 justify-between' : 'p-6'}`}>
        <div>
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-2">
          <MapPin size={14} className="text-blue-500" />
          <span className="text-[11px] font-bold opacity-70 uppercase tracking-tight truncate">
            {localizacao}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>
        <div className={`grid grid-cols-2 gap-y-3 gap-x-2 pt-4 border-t border-gray-50 ${isList ? 'mb-4' : 'mb-6'}`}>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.ano || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.passageiros || 5} Lugares</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Fuel size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold truncate">{carro.combustivel || 'Diesel'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Gauge size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.transmissao || 'Manual'}</span>
          </div>
        </div>
        </div>
        <div className={`flex items-center justify-between ${!isList ? 'mt-auto' : ''}`}>
          <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-black text-gray-800">
              {Number(carro.estrelas || 5).toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a2b6d]">
                {Number(carro.preco_dia || 0).toLocaleString('pt-PT')}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CVE</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">por dia</span>
          </div>
          {isList && (
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md">
              Ver detalhes <ArrowRight size={14} />
            </div>
          )}
        </div>
      </div>

      <Link to={linkTo} state={{ carro }} className="absolute inset-0 z-0" aria-label={`Ver ${titulo}`} />
    </div>
  );
};

export default CardCarro;
