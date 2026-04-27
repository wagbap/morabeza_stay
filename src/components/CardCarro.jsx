import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Calendar, Users, Fuel, Gauge, Star } from 'lucide-react';

const CardCarro = ({ carro }) => {
  if (!carro) return null;

  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  const imagemCompleta = carro.imagem_url 
    ? (carro.imagem_url.startsWith('http') ? carro.imagem_url : `${BASE_URL_IMAGENS}${carro.imagem_url}`)
    : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400";

  return (
    <div className="relative group bg-white rounded-2xl flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl hover:shadow-gray-100">
      
      {/* Container da Imagem - Arredondado apenas no topo para não vazar no texto */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img 
          src={imagemCompleta} 
          alt={carro.titulo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badge de Tipo (Ex: Elétrico) - Como na imagem de referência */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
          {carro.combustivel === 'Elétrico' || carro.combustivel === 'Eletrico' ? 'Elétrico' : (carro.tipo || 'Carro')}
        </div>

        {/* Ícone de Coração - Posição padrão do projeto */}
        <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-10 hover:scale-110 transition-transform active:scale-95">
          <Heart size={18} strokeWidth={2.5} className="text-gray-900" />
        </button>
      </div>

      {/* Conteúdo do Card - Alinhado ao padrão de Alojamentos */}
      <div className="p-4 flex flex-col flex-1 text-left">
        
        {/* Localização */}
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-1.5">
          <MapPin size={14} className="text-blue-500" /> 
          <span className="text-xs font-semibold opacity-90 truncate uppercase tracking-tight">
            {carro.localizacao || "Praia, Santiago"}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-[#1a2b6d] mb-2 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
          {carro.titulo}
        </h3>

        {/* Info Grid (Ano, Pessoas, etc) - Ícones cinzas discretos */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-4 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={14} />
            <span className="text-[11px] font-bold">{carro.ano || '2024'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Users size={14} />
            <span className="text-[11px] font-bold">{carro.passageiros || '5'} pessoas</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Fuel size={14} />
            <span className="text-[11px] font-bold">{carro.combustivel || 'Híbrido'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Gauge size={14} />
            <span className="text-[11px] font-bold">{carro.quilometragem || '0'} km</span>
          </div>
        </div>

        {/* Rating e Preço - Estilo idêntico ao Alojamento para manter o padrão */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">{carro.estrelas || '5.0'}</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#1a2b6d]">
              ${Number(carro.preco_dia).toLocaleString('pt-PT')}
            </span>
            <span className="text-xs font-semibold text-gray-500">/ dia</span>
          </div>
        </div>
      </div>
      
      {/* Link invisível sobre o card */}
      <Link to={`/carro/${carro.id}`} state={{ carro }} className="absolute inset-0 z-0" />
    </div>
  );
};

export default CardCarro;