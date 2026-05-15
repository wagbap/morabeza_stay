import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Calendar, Users, Fuel, Gauge, Star } from 'lucide-react';

// Renomeado para CardCarro para dar match com o import na página de listagem
const CardCarro = (props) => {
  // Suporte para dois tipos de passagem de props:
  // 1. <CardCarro carro={obj} /> 
  // 2. <CardCarro {...obj} />
  const carro = props.carro || props; 

  if (!carro || (!carro.id && !props.id)) return null;

  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  
  // Lógica de imagem flexível (suporta imagem_url ou imagem_principal)
  const imgPath = carro.imagem_url || carro.imagem_principal;
  const imagemCompleta = imgPath 
    ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL_IMAGENS}${imgPath}`)
    : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400";

  return (
    <div className="relative group bg-white rounded-[2.5rem] flex flex-col h-full w-full overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-2xl hover:shadow-gray-100">
      
      {/* Container da Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2.5rem]">
        <img 
          src={imagemCompleta} 
          alt={carro.titulo || carro.modelo} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badge de Tipo */}
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg z-10">
          {carro.combustivel === 'Elétrico' || carro.combustivel === 'Eletrico' ? '⚡ Elétrico' : (carro.tipo || carro.categoria_nome || 'Carro')}
        </div>

        {/* Ícone de Coração */}
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 shadow-md z-20 hover:scale-110 transition-transform active:scale-95">
          <Heart size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-6 flex flex-col flex-1 text-left">
        
        {/* Localização */}
        <div className="flex items-center gap-1.5 text-[#1a2b6d] mb-2">
          <MapPin size={14} className="text-blue-500" /> 
          <span className="text-[11px] font-bold opacity-70 uppercase tracking-tight">
            {carro.localizacao || "Santiago, Cabo Verde"}
          </span>
        </div>

        {/* Título (Marca + Modelo) */}
        <h3 className="text-lg font-bold text-[#1a2b6d] mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {carro.titulo || `${carro.marca} ${carro.modelo}`}
        </h3>

        {/* Info Grid - Ícones minimalistas */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.ano || '2023'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold">{carro.passageiros || '5'} Lugares</span>
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

        {/* Preço e Avaliação */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-black text-gray-800">{carro.estrelas || '5.0'}</span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a2b6d]">
                {Number(carro.preco_dia || carro.preco || 0).toLocaleString('pt-PT')}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CVE</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">por dia</span>
          </div>
        </div>
      </div>
      
      {/* Link de Navegação */}
      <Link to={`/carro/${carro.id}`} state={{ carro }} className="absolute inset-0 z-0" />
    </div>
  );
};

export default CardCarro;