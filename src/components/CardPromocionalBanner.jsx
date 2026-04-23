import React from 'react';

const CardPromocionalBanner = () => {
  return (
    <div className="relative rounded-[2.5rem] overflow-hidden h-full min-h-[320px] group shadow-sm hover:shadow-2xl transition-all duration-500">
      {/* Imagem de Fundo (Fiel à foto: Serra Malagueta) */}
      <img 
        src="https://res.cloudinary.com/dpsrmzvsl/image/upload/v1776894197/trekking-nas-montanhas-caminhada-da-montanha-os-turistas-com-trouxas-caminham-na-maneira-rochosa-perto-do-rio-natureza-selvagem-126682866_bank6i.webp" 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        alt="Passeios Populares"
      />
      {/* Overlay Gradiente para garantir a leitura do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/95 lg:to-transparent"></div>
      
      {/* Conteúdo (Fiel à imagem em tipografia e alinhamento) */}
      <div className="relative z-10 p-10 flex flex-col h-full text-left justify-center max-w-[290px]">
        {/* Título com estilo premium italic/uppercase */}
        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 tracking-tighter uppercase italic">
          Passeios Populares
        </h3>
        
        {/* Badge Verde */}
        <div className="inline-block bg-green-100 text-green-700 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest mb-4 w-fit">
          Passeios Náuticos
        </div>
        
        {/* Descrição */}
        <p className="text-white text-xs font-bold leading-relaxed mb-10">
          Caminhada pela deslumbrante Serra Malagueta com vistas espetaculares.
        </p>
        
        {/* Botão Verde de Reserva (Fiel à foto) */}
        <button className="bg-[#22C55E] hover:bg-green-600 text-white font-black py-4.5 px-6 rounded-2xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-green-100 uppercase text-[10px] tracking-[0.2em]">
          Reservar Passeios <span className="ml-2 text-xl font-light">›</span>
        </button>
      </div>
    </div>
  );
};

export default CardPromocionalBanner;