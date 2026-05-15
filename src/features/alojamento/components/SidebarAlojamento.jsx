import React from 'react';
import { Star, Calendar, Users, ChevronRight, CheckCircle } from 'lucide-react';

export const SidebarReserva = () => (
  <div className="w-[400px]">
    <div className="border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-8 bg-white">
      <div className="flex justify-between items-end mb-6">
        <div className="text-3xl font-bold">85€ <span className="text-base font-normal text-slate-500">/ noite</span></div>
        <div className="flex items-center gap-1 text-sm font-bold">
          <Star size={14} className="fill-orange-500 text-orange-500" /> 4.8
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
        <div className="flex border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
          <div className="flex-1 p-3 border-r border-slate-200">
            <label>Check-in</label>
            <div className="flex items-center gap-2 text-sm text-slate-900 mt-1"><Calendar size={14} /> 12 Dez, 2024</div>
          </div>
          <div className="flex-1 p-3">
            <label>Check-out</label>
            <div className="flex items-center gap-2 text-sm text-slate-900 mt-1"><Calendar size={14} /> 16 Dez, 2024</div>
          </div>
        </div>
        <div className="p-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Hóspedes</label>
          <div className="flex justify-between items-center text-sm mt-1 font-medium">
            <div className="flex items-center gap-2"><Users size={14} /> 2 hóspedes</div>
            <ChevronRight size={14} className="rotate-90 text-slate-400" />
          </div>
        </div>
      </div>

      <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl mb-4 hover:bg-blue-800 transition-all">
        Ver disponibilidade
      </button>

      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
        <CheckCircle className="text-green-600 mt-1" size={18} />
        <div>
          <h5 className="text-sm font-bold text-green-800">Cancelamento gratuito</h5>
          <p className="text-xs text-green-700">Até 48 horas antes do check-in</p>
        </div>
      </div>
    </div>
  </div>
);