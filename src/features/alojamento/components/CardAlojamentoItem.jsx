import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import BotaoFavorito from '../../../components/BotaoFavorito';

const CardAlojamentoItem = ({ id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, total_avaliacoes, slug }) => {
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  
  const imagemCompleta = imagem_url 
    ? (imagem_url.startsWith('http') ? imagem_url : `${BASE_URL_IMAGENS}${imagem_url}`)
    : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  const preco = Number(preco_noite) || 0;
  const rating = Number(estrelas) || 4.5;
  const reviews = total_avaliacoes || 0;
  const linkTo = slug ? `/alojamentos/${slug}` : `/alojamentos/${id}`;

  const itemFavorito = {
    id,
    titulo,
    imagem_url: imagemCompleta,
    localizacao,
    preco_noite,
    tipo,
    estrelas,
    slug,
    total_avaliacoes
  };

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-100">
      
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl"> 
        <img 
          src={imagemCompleta} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        

      <BotaoFavorito 
        tipo="alojamento"  // ← IMPORTANTE: usar 'alojamento' sem 's'
        item={{ 
          id: id, 
          titulo: titulo,
          imagem_url: imagem_url,
          localizacao: localizacao,
          preco_noite: preco_noite,
          estrelas: estrelas,
          slug: slug
        }} 
        size={20}
        className="absolute top-4 right-4"
      />
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1 text-left">
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-1.5">
          <MapPin size={16} className="text-blue-500" /> 
          <span className="text-xs font-semibold opacity-90 truncate">
            {localizacao || "Praia, Santiago"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {titulo || "Nome do Alojamento"}
        </h3>

        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-orange-400 text-orange-400" />
            <span className="text-sm font-bold text-gray-800">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({reviews})</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
            {tipo || 'Alojamento inteiro'}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-[#1a2b6d]">
            {preco.toLocaleString('pt-PT')}
          </span>
          <span className="text-sm font-semibold text-gray-500">/ noite</span>
        </div>
      </div>
      
      <Link to={linkTo} className="absolute inset-0 z-0" aria-label={`Ver detalhes de ${titulo}`} />
    </div>
  );
};

export default CardAlojamentoItem;