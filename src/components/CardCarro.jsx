// CardCarro.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Calendar, Users, Fuel, Gauge } from 'lucide-react';

const CardCarro = ({ carro }) => {
  if (!carro) return null;

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={carro.imagem_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400"} 
          alt={carro.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all shadow-lg">
          <Heart size={18} />
        </button>
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
          {carro.tipo || 'Carro'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 text-left">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">
            {carro.titulo}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl">
            <span className="text-amber-600 font-black text-xs">{carro.estrelas || '4.8'}</span>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <MapPin size={14} className="text-blue-500" /> {carro.localizacao}
        </p>

        <div className="flex flex-wrap gap-3 mb-4 pt-2 border-t border-gray-50">
          {carro.ano && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar size={14} />
              <span className="text-[11px] font-bold">{carro.ano}</span>
            </div>
          )}
          {carro.passageiros && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={14} />
              <span className="text-[11px] font-bold">{carro.passageiros} pessoas</span>
            </div>
          )}
          {carro.combustivel && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Fuel size={14} />
              <span className="text-[11px] font-bold">{carro.combustivel}</span>
            </div>
          )}
          {carro.quilometragem && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Gauge size={14} />
              <span className="text-[11px] font-bold">{carro.quilometragem} km</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-end">
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">por dia</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{Number(carro.preco_dia).toLocaleString('pt-PT')}</span>
              <span className="text-xs font-black text-blue-600 uppercase">CVE</span>
            </div>
          </div>
          <Link 
            to={`/carro/${carro.id}`} 
            state={{ carro }}
            className="bg-gray-900 hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardCarro;