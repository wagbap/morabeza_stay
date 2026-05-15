import React from 'react';
import { MapPin, Heart, Star, ArrowRight, ZapOffIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardAlojamento = ({ id, imagem_url, titulo, localizacao, descricao, preco_noite, tipo, estrelas, comodidades, imagens_extra, total_avaliacoes, isList }) => {
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/"; 
  
  // Garantia de carregamento da URL
  const imagemCompleta = imagem_url 
    ? (imagem_url.startsWith('http') ? imagem_url : `${BASE_URL_IMAGENS}${imagem_url}`)
    : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  return (
    <div className={`relative group bg-white border border-gray-100 transition-all duration-300 hover:shadow-2xl overflow-hidden ${
      isList 
        ? "flex flex-col md:flex-row rounded-[40px] p-4 gap-6 w-full" 
        : "flex flex-col h-full w-full rounded-2xl"
    }`}>
      
      {/* Container da Imagem - FIX: shrink-0 e h-full para carregar na lista */}
      <div className={`relative overflow-hidden shrink-0 bg-gray-100 ${
        isList 
          ? "w-full md:w-[320px] lg:w-[360px] h-56 md:h-64 rounded-[32px]" 
          : "aspect-[4/3] w-full rounded-t-2xl"
      }`}>
        <img 
          src={imagemCompleta} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy"
        />
        
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg z-10">
          {tipo || 'Alojamento'}
        </div>

        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform">
          <Heart size={18} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* Conteúdo do Card - Ajuste de Texto para Minúsculas */}
      <div className={`flex flex-col flex-1 text-left ${isList ? 'py-4 pr-4 justify-between' : 'p-4'}`}>
        
        <div>
          <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-1.5">
            <MapPin size={14} className="text-blue-500" /> 
            <span className="text-[11px] font-bold opacity-80 tracking-tight truncate">
              {localizacao}
            </span>
          </div>

          {/* Título: font-black mantido, mas removido o uppercase */}
         <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {titulo}
          </h3>
          
          {isList && (
            <p className="text-gray-400 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">
               {descricao}
            </p>
          )}
        </div>

        {/* Footer do card */}
        <div className={`flex items-center justify-between ${!isList ? 'mt-auto border-t border-gray-50 pt-3' : ''}`}>
          
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg w-fit">
                <Star size={14} className="fill-orange-400 text-orange-400" />
                <span className="text-xs font-black text-gray-800">
                  {Number(estrelas || 4.8).toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">({total_avaliacoes || 0})</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`${isList ? 'text-2xl' : 'text-xl'} font-black text-[#1a2b6d]`}>
                  {Number(preco_noite).toLocaleString('pt-PT')}
                </span>
                <span className="text-[10px] font-black text-gray-500 uppercase">CVE</span>
                <span className="text-xs font-semibold text-gray-400">/ noite</span>
              </div>
          </div>

          {isList && (
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
              Ver detalhes <ArrowRight size={14} />
            </div>
          )}
        </div>
      </div>
      
      <Link 
        to={`/alojamento/${id}`} 
        className="absolute inset-0 z-0" 
      />
    </div>
  );
};

export default CardAlojamento;