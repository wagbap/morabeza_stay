import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Star, Users, Fuel, Clock } from 'lucide-react';

const CardGridItem = ({ item }) => {
  if (!item) return null;

  // Lógica de Identificação
  const isCarro = !!item.preco_dia || item.tipo?.toLowerCase().includes('car');
  const isExperiencia = !!item.duracao || !!item.categoria_nome;

  // Normalização de Dados
  const id = item.id;
  const titulo = item.titulo || "Sem título";
  const imagem = item.imagem_url || item.imagem_principal || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";
  const preco = Number(item.preco_noite || item.preco_dia || item.preco || 0);
  const rating = Number(item.estrelas || item.rating || 4.8).toFixed(1);
  const reviews = item.total_reviews || item.reviews || "0";
  const localizacao = item.localizacao || item.ilha || "Cabo Verde";

  // Prefixo de rota dinâmico
  const rotaBase = isCarro ? 'carro' : isExperiencia ? 'experiencia' : 'alojamento';

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl">
      
      {/* 1. Container da Imagem - Arredondado apenas no topo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img 
          src={imagem} 
          alt={titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badge de Categoria/Tipo */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg z-10">
          {item.categoria_nome || item.tipo || (isCarro ? "Aluguer" : "Alojamento")}
        </div>

        {/* Botão Heart Padrão (Círculo Branco) */}
        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform">
          <Heart size={18} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* 2. Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1 text-left">
        
        {/* Specs Rápidas / Localização */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1 text-[#1a2b6d]">
            <MapPin size={14} className="text-blue-500" /> 
            <span className="text-[11px] font-bold opacity-80 uppercase tracking-tight truncate max-w-[120px]">
              {localizacao}
            </span>
          </div>
          
          {/* Info extra baseada no tipo */}
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
            {isCarro ? (
              <span className="flex items-center gap-1"><Users size={12} /> {item.passageiros || 5}</span>
            ) : (
              <span className="flex items-center gap-1"><Clock size={12} /> {item.duracao || '4h'}</span>
            )}
          </div>
        </div>

        {/* Título Padronizado */}
        <h3 className="text-base font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>

        {/* 3. Footer: Rating e Preço (Alinhamento Horizontal) */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
          
          {/* Rating à esquerda */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">{rating}</span>
            <span className="text-[10px] text-gray-400">({reviews})</span>
          </div>

          {/* Preço à direita em linha única */}
          <div className="flex items-baseline gap-1 text-right">
            <span className="text-xl font-extrabold text-[#1a2b6d]">
              {preco.toLocaleString('pt-PT')}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">CVE</span>
            <span className="text-[10px] font-semibold text-gray-400 truncate">
              {isCarro ? '/ dia' : isExperiencia ? '/ pessoa' : '/ noite'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Link invisível que cobre o card inteiro */}
      <Link to={`/${rotaBase}/${id}`} className="absolute inset-0 z-0" />
    </div>
  );
};

export default CardGridItem;