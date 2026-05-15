import React from 'react';
import { CheckCircle } from 'lucide-react';

export const HostInfo = () => {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm mt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
            alt="Anfitrião" 
            className="w-14 h-14 rounded-full object-cover border border-slate-100"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <CheckCircle className="text-orange-500 fill-orange-500 text-white" size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">Anfitrião: João Silva</h4>
          <p className="text-[11px] text-slate-500 font-medium">Superhost • Responde rápido</p>
        </div>
      </div>

      <button className="w-full py-3 border border-[#003580] text-[#003580] text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors">
        Contactar anfitrião
      </button>
    </div>
  );
};