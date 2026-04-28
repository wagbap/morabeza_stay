import React from 'react';
import { MapPin, Heart, Star, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardExperiencia = ({ id, imagem_principal, titulo, localizacao, preco, categoria_nome, rating, total_reviews, duracao, isList }) => {
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/"; 
  
  const imagemCompleta = imagem_principal 
    ? (imagem_principal.startsWith('http') ? imagem_principal : `${BASE_URL_IMAGENS}${imagem_principal}`)
    : "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=400";

  return (
    <div className={`relative group bg-white transition-all duration-300 border border-gray-100 hover:shadow-2xl overflow-hidden ${
      isList 
        ? "flex flex-col md:flex-row rounded-[40px] p-4 gap-6 w-full" 
        : "flex flex-col h-full w-full rounded-[32px]"
    }`}>
      
      {/* CONTAINER DA IMAGEM */}
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
        
        
        {/* Badge de Categoria */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg z-10">
          {categoria_nome || 'Experiência'}
        </div>

        {/* Botão Heart */}
        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform">
          <Heart size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* CONTEÚDO DO CARD */}
      <div className={`flex flex-col flex-1 text-left ${isList ? 'py-4 pr-4 justify-between' : 'p-5'}`}>
        
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[#1a2b6d]">
              <MapPin size={14} className="text-blue-500" /> 
              <span className="text-[11px] font-bold opacity-80 tracking-tight truncate">
                {localizacao}
              </span>
            </div>
            {duracao && (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold">{duracao}</span>
              </div>
            )}
          </div>

          <h3 className={`${isList ? 'text-2xl md:text-3xl' : 'text-lg'} font-black text-[#1a2b6d] leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2`}>
            {titulo}
          </h3>
        </div>

        {/* FOOTER */}
        <div className={`flex items-center justify-between ${!isList ? 'mt-auto border-t border-gray-50 pt-4' : ''}`}>
          
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg w-fit">
                <Star size={14} className="fill-orange-400 text-orange-400" />
                <span className="text-xs font-black text-gray-800">
                  {Number(rating || 5.0).toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">({total_reviews || 0})</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`${isList ? 'text-2xl' : 'text-xl'} font-black text-[#1a2b6d]`}>
                  {Number(preco).toLocaleString('pt-PT')}
                </span>
                <span className="text-[10px] font-black text-gray-500 uppercase">CVE</span>
                <span className="text-xs font-semibold text-gray-400">/pessoa</span>
              </div>
          </div>

          {isList && (
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
              Reservar agora <ArrowRight size={14} />
            </div>
          )}
        </div>
      </div>
      
      <Link to={`/experiencia/${id}`} className="absolute inset-0 z-0" />
    </div>
  );
};

export default CardExperiencia;