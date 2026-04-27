import React from 'react';
import { MapPin, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardAlojamento = ({ id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, comodidades, imagens_extra, total_avaliacoes }) => {
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/"; 
  const imagemCompleta = imagem_url 
    ? (imagem_url.startsWith('http') ? imagem_url : `${BASE_URL_IMAGENS}${imagem_url}`)
    : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl">
      
      {/* Container da Imagem - CORRIGIDO: Arredondado apenas no topo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img 
          src={imagemCompleta} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badge de Tipo (Ex: Apartamento Inteiro) */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg z-10">
          {tipo || 'Alojamento'}
        </div>

        {/* CORRIGIDO: Botão Heart padrão do projeto (Círculo Branco) */}
        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform">
          <Heart size={18} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1 text-left">
        
        {/* Localização */}
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-1.5">
          <MapPin size={14} className="text-blue-500" /> 
          <span className="text-[11px] font-bold opacity-80 uppercase tracking-tight truncate">
            {localizacao}
          </span>
        </div>

        {/* Título com a cor padrão #1a2b6d */}
        <h3 className="text-base font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>

        {/* Footer do card: Rating à esquerda e Preço à direita */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
          
          {/* Rating padronizado */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">
              {Number(estrelas || 4.8).toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">({total_avaliacoes || 0})</span>
          </div>

          {/* Preço em linha única com CVE */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#1a2b6d]">
              {Number(preco_noite).toLocaleString('pt-PT')}
            </span>
            <span className="text-[10px] font-bold text-gray-500">CVE</span>
            <span className="text-xs font-semibold text-gray-400">/ noite</span>
          </div>
        </div>
      </div>
      
      {/* Link invisível que cobre o card todo para remover o botão manual */}
      <Link 
        to={`/alojamento/${id}`} 
        state={{ alojamento: { id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas, comodidades, imagens_extra } }}
        className="absolute inset-0 z-0" 
      />
    </div>
  );
};

export default CardAlojamento;