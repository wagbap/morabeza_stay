 import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

export const MapLocation = () => {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm mt-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Localização</h4>
          <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase">Praia, Cidade da Praia</p>
        </div>
        <button className="flex items-center gap-1 text-[#003580] text-[11px] font-bold hover:underline">
          Ver no mapa <ExternalLink size={12} />
        </button>
      </div>

      {/* Placeholder do Mapa */}
      <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400&h=200&fit=crop" 
          alt="Mapa" 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Pin do Mapa Centralizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
             <MapPin size={32} className="text-[#003580] fill-[#003580] text-white" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 blur-sm rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};