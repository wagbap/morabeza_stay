import React from 'react';
import { MapPin, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardAlojamentoItem = ({ id, imagem_url, titulo, localizacao, preco_noite, tipo, estrelas }) => {
  // URL base para imagens
  const BASE_URL_IMAGENS = "https://welovepalop.com/api/uploads/";
  
  const imagemCompleta = imagem_url 
    ? (imagem_url.startsWith('http') ? imagem_url : `${BASE_URL_IMAGENS}${imagem_url}`)
    : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";

  const preco = Number(preco_noite) || 5000;
  const rating = Number(estrelas) || 4.5;

  if (!id) return null;

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imagemCompleta} 
          alt={titulo || "Alojamento"} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all shadow-lg z-10">
          <Heart size={18} />
        </button>
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] z-10">
          {tipo || 'Alojamento'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 text-left">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase line-clamp-1">
            {titulo || "Alojamento"}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl flex-shrink-0 ml-2">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-amber-600 font-black text-xs">{rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">
          <MapPin size={14} className="text-blue-500 flex-shrink-0" /> 
          <span className="truncate">{localizacao || "Cabo Verde"}</span>
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-end">
          <div className="text-left">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">por noite</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-gray-900">{preco.toLocaleString('pt-PT')}</span>
              <span className="text-[9px] font-black text-blue-600 uppercase">CVE</span>
            </div>
          </div>
          <Link 
            to={`/alojamento/${id}`}
            className="bg-gray-900 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex-shrink-0 ml-2"
          >
            Ver estadia
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardAlojamentoItem;