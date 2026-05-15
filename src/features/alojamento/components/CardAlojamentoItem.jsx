import React from 'react';
import { MapPin, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardAlojamentoItem = ({ id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, total_avaliacoes }) => {
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  
  const imagemCompleta = imagem_url 
    ? (imagem_url.startsWith('http') ? imagem_url : `${BASE_URL_IMAGENS}${imagem_url}`)
    : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  const preco = Number(preco_noite) || 0;
  const rating = Number(estrelas) || 4.5;
  const reviews = total_avaliacoes || 0;

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-100">
      
      {/* Container da Imagem */}
  {/* Container da Imagem - Apenas arredondado no topo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl"> 
        <img 
          src={imagemCompleta} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Ícone de Coração Customizado - Posição e estilo exatos como na imagem de referência */}
        <button className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-lg z-10 hover:scale-110 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300">
          <Heart size={20} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* Conteúdo do Card - Estilo menor e mais clean, como na imagem */}
      <div className="p-4 md:p-5 flex flex-col flex-1 text-left">
        {/* Localização com MapPin Azul */}
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-1.5">
          <MapPin size={16} className="text-blue-500" /> 
          <span className="text-xs font-semibold opacity-90 truncate">
            {localizacao || "Praia, Santiago"}
          </span>
        </div>

        {/* Título do Alojamento */}
        <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {titulo || "Nome do Alojamento"}
        </h3>

        {/* Rating, Reviews e Tipo */}
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

        {/* Preço por Noite */}
        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-[#1a2b6d]">
            ${preco}
          </span>
          <span className="text-sm font-semibold text-gray-500">/ noite</span>
        </div>
      </div>
      
      {/* Link que cobre o card inteiro (para SEO e acessibilidade) */}
      <Link to={`/alojamento/${id}`} className="absolute inset-0 z-0" aria-label={`Ver detalhes de ${titulo}`} />
    </div>
  );
};

export default CardAlojamentoItem;