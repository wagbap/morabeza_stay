import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Calendar, Users, ChevronRight, CheckCircle } from 'lucide-react';

export const SidebarReserva = ({ precoPorNoite = 85, estrelas = 4.8, checkIn = "12 Dez, 2024", checkOut = "16 Dez, 2024", numHospedes = 2 }) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-[400px]">
      <div className="border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-8 bg-white">
        <div className="flex justify-between items-end mb-6">
          <div className="text-3xl font-bold">{precoPorNoite}€ <span className="text-base font-normal text-slate-500">{t('por_noite_curto')}</span></div>
          <div className="flex items-center gap-1 text-sm font-bold">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {estrelas}
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="flex border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
            <div className="flex-1 p-3 border-r border-slate-200">
              <label>{t('checkin')}</label>
              <div className="flex items-center gap-2 text-sm text-slate-900 mt-1"><Calendar size={14} /> {checkIn}</div>
            </div>
            <div className="flex-1 p-3">
              <label>{t('checkout')}</label>
              <div className="flex items-center gap-2 text-sm text-slate-900 mt-1"><Calendar size={14} /> {checkOut}</div>
            </div>
          </div>
          <div className="p-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase">{t('hospedes')}</label>
            <div className="flex justify-between items-center text-sm mt-1 font-medium">
              <div className="flex items-center gap-2"><Users size={14} /> {numHospedes} {numHospedes === 1 ? t('hospede') : t('hospedes')}</div>
              <ChevronRight size={14} className="rotate-90 text-slate-400" />
            </div>
          </div>
        </div>

        <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl mb-4 hover:bg-blue-800 transition-all">
          {t('ver_disponibilidade')}
        </button>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="text-green-600 mt-1" size={18} />
          <div>
            <h5 className="text-sm font-bold text-green-800">{t('cancelamento_gratis')}</h5>
            <p className="text-xs text-green-700">{t('cancelamento_prazo_checkout')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};