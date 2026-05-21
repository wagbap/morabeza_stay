// DataModalCarro.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar } from 'lucide-react';

const DataModalCarro = ({ onClose, onSelectData, carroTitulo, currentCheckIn, currentCheckOut }) => {
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState(currentCheckIn || '');
  const [checkOut, setCheckOut] = useState(currentCheckOut || '');
  
  const minDate = new Date().toISOString().split('T')[0];
  
  const handleConfirm = () => {
    if (!checkIn || !checkOut) {
      alert(t('selecione_datas_lev_devolucao'));
      return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      alert(t('devolucao_posterior_levantamento'));
      return;
    }
    
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    onSelectData({
      checkIn: checkIn,
      checkOut: checkOut,
      dias: diffDays,
      checkInFormatada: checkInDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      checkOutFormatada: checkOutDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  };
  
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1a2b6d]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#1a2b6d]">{t('selecionar_datas_carro')}</h3>
              <p className="text-xs text-slate-500 mt-1">{carroTitulo}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-[#1a2b6d] uppercase tracking-widest block mb-2">
                {t('data_levantamento')}
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={minDate}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-[#1a2b6d] uppercase tracking-widest block mb-2">
                {t('data_devolucao')}
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || minDate}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
            
            {checkIn && checkOut && (
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-blue-900">
                  📅 {new Date(checkIn).toLocaleDateString('pt-PT')} → {new Date(checkOut).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} {t('dias')}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('cancelar')}
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                {t('confirmar_datas')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataModalCarro;