import React, { memo } from 'react'; // Adicionamos memo
import { Link } from 'react-router-dom';

const CardPromocionalBanner = () => {
  const bgImage = "https://res.cloudinary.com/dpsrmzvsl/image/upload/v1776894197/trekking-nas-montanhas-caminhada-da-montanha-os-turistas-com-trouxas-caminham-na-maneira-rochosa-perto-do-rio-natureza-selvagem-126682866_bank6i.webp";

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden h-full min-h-[350px] group shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50">
      
      {/* Imagem com alt mais descritivo para SEO de Cabo Verde */}
      <img 
        src={bgImage} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        alt="Trekking na Serra Malagueta Santiago Cabo Verde"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-r lg:from-white/95 lg:via-white/80 lg:to-transparent transition-colors duration-500"></div>
      
      <div className="relative z-10 p-8 md:p-10 flex flex-col h-full text-left justify-center max-w-[320px]">
        <h3 className="text-2xl md:text-3xl font-black text-white lg:text-gray-900 leading-tight mb-2 tracking-tighter uppercase italic">
          Passeios Populares
        </h3>
        
        <div className="inline-block bg-green-500 lg:bg-green-100 text-white lg:text-green-700 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest mb-4 w-fit shadow-sm">
          Trekking & Natureza
        </div>
        
        <p className="text-gray-100 lg:text-gray-600 text-xs font-bold leading-relaxed mb-8">
          Descubra a deslumbrante Serra Malagueta com guias locais e vistas espetaculares de Santiago.
        </p>
        
        <Link 
          to="/experiencias"
          className="bg-[#22C55E] hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-green-500/20 uppercase text-[10px] tracking-[0.2em] w-full"
        >
          <span>Explorar Passeios</span>
          <span className="text-xl leading-none ml-2">›</span>
        </Link>
      </div>
    </div>
  );
};

// Exportamos com memo para performance máxima
export default memo(CardPromocionalBanner);