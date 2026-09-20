import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Fuel, Gauge, Star } from 'lucide-react';
import BotaoFavorito from '../../../components/BotaoFavorito';

// Placeholder SVG inline seguro
const PLACEHOLDER_CARRO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect fill="#f1f5f9" width="400" height="300"/>
      <path fill="#cbd5e1" d="M160 130a20 20 0 1 1 40 0 20 20 0 0 1-40 0zm-70 90l60-80 50 60 40-40 60 60H90z"/>
      <text x="200" y="260" font-family="system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">Sem imagem</text>
    </svg>`
  );

const urlAbsoluta = (raw) => {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
  if (s[0] === '/') return `https://welovepalop.com${s}`;
  return `https://welovepalop.com/${s}`;
};

const getCapaFinal = (carro) => {
  if (!carro) return PLACEHOLDER_CARRO;

  // Debug na consola do browser para veres exatamente o que o objeto carro contém
  console.log("Objeto carro recebido no CardCarro:", carro);

  // Tenta todas as chaves possíveis onde a imagem possa vir guardada
  const possiveisChaves = [
    carro.imagem_principal,
    carro.imagem_capa,
    carro.imagem_url,
    carro.imagem,
    carro.foto,
    carro.caminho_url,
    carro.url_imagem
  ];

  for (const img of possiveisChaves) {
    const absoluta = urlAbsoluta(img);
    if (absoluta) return absoluta;
  }

  // Se vier num array de imagens
  if (Array.isArray(carro.imagens) && carro.imagens.length > 0) {
    for (const img of carro.imagens) {
      const absoluta = urlAbsoluta(typeof img === 'string' ? img : img.caminho_url || img.url);
      if (absoluta) return absoluta;
    }
  }

  return PLACEHOLDER_CARRO;
};

const formatarPreco = (valor) => {
  const n = Number(valor || 0);
  if (!n) return '0';
  return n.toLocaleString('pt-PT');
};

const CardCarro = (props) => {
  const carro = props.carro || props;
  if (!carro || (!carro.id && !props.id)) return null;

  const linkTo = carro.slug ? `/carros/${carro.slug}` : `/carros/${carro.id}`;
  const imagemCompleta = getCapaFinal(carro);

  const itemFavorito = {
    id: carro.id,
    titulo: carro.titulo,
    localizacao: carro.localizacao || carro.ilha,
    imagem_url: imagemCompleta,
    preco_dia: carro.preco_dia,
    estrelas: carro.estrelas,
    slug: carro.slug,
    tipo: 'carro',
  };

  const getBadgeText = () => {
    if (carro.combustivel === 'Elétrico' || carro.combustivel === 'Eletrico') {
      return '⚡ Elétrico';
    }
    return carro.tipo || 'Carro';
  };

  return (
    <div className="relative group bg-white rounded-[2.5rem] flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl hover:shadow-gray-100">

      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2.5rem] bg-slate-100">
        <img
          src={imagemCompleta}
          alt={carro.titulo || 'Carro'}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            console.error("Erro ao carregar imagem no img tag:", e.currentTarget.src);
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_CARRO;
          }}
        />

        <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg z-10">
          {getBadgeText()}
        </div>

        <BotaoFavorito
          tipo="carros"
          item={itemFavorito}
          size={18}
          className="absolute top-4 right-4 p-2.5 z-10"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-1 text-left">
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-2">
          <MapPin size={14} className="text-blue-500" />
          <span className="text-[11px] font-bold opacity-70 uppercase tracking-tight">
            {carro.localizacao || carro.ilha || 'Cabo Verde'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {carro.titulo}
        </h3>

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.ano || '2023'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">
              {carro.passageiros || carro.lugares || '5'} Lugares
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Fuel size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold truncate">
              {carro.combustivel || 'Diesel'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Gauge size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">
              {carro.transmissao || 'Manual'}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-black text-gray-800">
              {Number(carro.estrelas || 5.0).toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a2b6d]">
                {formatarPreco(carro.preco_dia)}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                CVE
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              por dia
            </span>
          </div>
        </div>
      </div>

      <Link
        to={linkTo}
        state={{ carro }}
        className="absolute inset-0 z-0"
        aria-label={`Ver detalhes de ${carro.titulo}`}
      />
    </div>
  );
};

export default CardCarro;