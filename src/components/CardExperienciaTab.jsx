import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Heart } from 'lucide-react';

const CardExperienciaTab = ({ experiencia }) => {
  const dados = experiencia || {};
  
  if (!dados.id && !experiencia) return null;

  const id = dados.id;
  const slug = dados.slug || `experiencia-${id}`;
  const titulo = dados.titulo || "Experiência";
  const imagem = dados.imagem_principal || dados.imagem_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400";
  const localizacao = dados.localizacao || dados.ilha || "Cabo Verde";
  const preco = Number(dados.preco || dados.preco_pessoa) || 0;
  const duracao = dados.duracao || "Flexível";
  const categoria = dados.categoria_nome || "Experiência";
  const rating = Number(dados.rating || dados.estrelas) || 4.5;
  const totalReviews = dados.total_reviews || dados.total_avaliacoes || 0;

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl">
      
      {/* Container da Imagem - Arredondado apenas no topo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img 
          src={imagem} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badge de Categoria */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg z-10">
          {categoria}
        </div>

        {/* Coração Padrão (Círculo Branco) */}
        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform">
          <Heart size={18} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1 text-left">
        
        {/* Localização e Duração */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1 text-[#1a2b6d]">
            <MapPin size={14} className="text-blue-500" /> 
            <span className="text-[11px] font-bold opacity-80 uppercase tracking-tight truncate">
              {localizacao}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase">{duracao}</span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-base font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>

        {/* Footer: Rating e Preço (Padrão UI) */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
          {/* Rating à esquerda */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">
              {rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">({totalReviews})</span>
          </div>

          {/* Preço à direita em linha única */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#1a2b6d]">
              {preco.toLocaleString('pt-PT')}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">CVE</span>
            <span className="text-xs font-semibold text-gray-400">/ pessoa</span>
          </div>
        </div>
      </div>
      
      {/* Link invisível sobre o card todo */}
      <Link to={`/experiencia/${slug}`} className="absolute inset-0 z-0" />
    </div>
  );
};

export default CardExperienciaTab;