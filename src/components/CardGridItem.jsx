import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Star, Users, Fuel, Clock } from 'lucide-react';

const CardGridItem = ({ item }) => {
  if (!item) return null;

  // Lógica de Identificação
  const isCarro = !!item.preco_dia || item.tipo?.toLowerCase().includes('car');
  const isExperiencia = !!item.duracao || !!item.categoria_nome;

  // Normalização
  const titulo = item.titulo || "Sem título";
  const imagem = item.imagem_url || item.imagem_principal || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400";
  const preco = Number(item.preco_noite || item.preco_dia || item.preco || 0).toLocaleString('pt-PT');
  const rating = Number(item.estrelas || item.rating || 4.8).toFixed(1);
  const reviews = item.total_reviews || item.reviews || "0";

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      {/* Imagem com Aspect Ratio fixo */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={imagem} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={titulo} 
        />
        <button className="absolute top-5 right-5 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all">
          <Heart size={20} />
        </button>
        <div className="absolute bottom-5 left-5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
          {item.categoria_nome || item.tipo || (isCarro ? "Aluguer" : "Alojamento")}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 text-left">
        {/* Título Estilo Premium */}
        <h3 className="text-xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter mb-2 line-clamp-1">
          {titulo}
        </h3>

        {/* Specs Dinâmicas baseadas na foto */}
        <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold uppercase tracking-wide mb-4">
          {isCarro ? (
            <>
              <span className="flex items-center gap-1"><Users size={14} className="text-blue-500"/> {item.passageiros || 5} lugares</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Fuel size={14} className="text-blue-500"/> {item.combustivel || 'Manual'}</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500"/> {item.duracao || '4 horas'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">{item.localizacao || 'Santiago'}</span>
            </>
          )}
        </div>

        {/* Preço e Rating (Alinhados como na imagem) */}
        <div className="mt-auto pt-5 border-t border-gray-50">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-black text-gray-900">{preco} CVE</span>
            <span className="text-[11px] font-bold text-gray-400">/pessoa</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-400">({rating} ({reviews}))</span>
            </div>

            <Link 
              to={`/${isCarro ? 'carro' : 'experiencia'}/${item.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-200"
            >
              {isCarro ? 'Ver estadia' : 'Ver detalhes'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGridItem;