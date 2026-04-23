import React from 'react';
import { MapPin, Clock, Star } from 'lucide-react';

const CardExperiencia = ({ imagem, titulo, local, duracao, preco, rating, reviews }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img src={imagem} alt={titulo} className="w-full h-full object-cover" />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{titulo}</h3>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin size={14} /> {local} • {duracao}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-black text-blue-600">{preco} CVE</span>
            <span className="text-gray-400 text-xs ml-1">/pessoa</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold text-gray-700">{rating}</span>
            <span className="text-gray-400 text-xs">({reviews})</span>
          </div>
        </div>

        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Ver detalhes
        </button>
      </div>
    </div>
  );
};

export default CardExperiencia;