// DataModalAlojamento.jsx
import React, { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DataModalAlojamento = ({ onClose, onSelectData, alojamentoTitulo, currentCheckIn, currentCheckOut }) => {
  const [checkIn, setCheckIn] = useState(currentCheckIn || '');
  const [checkOut, setCheckOut] = useState(currentCheckOut || '');
  
  const minDate = new Date().toISOString().split('T')[0];
  
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    
    // Se check-out for anterior ao novo check-in, limpar check-out
    if (checkOut && newCheckIn && checkOut <= newCheckIn) {
      setCheckOut('');
    }
  };
  
  const handleCheckOutChange = (e) => {
    setCheckOut(e.target.value);
  };
  
  const handleConfirm = () => {
    if (!checkIn || !checkOut) {
      alert('Por favor, selecione as datas de Check-in e Check-out');
      return;
    }
    
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('A data de Check-out deve ser posterior à data de Check-in');
      return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    onSelectData({
      checkIn: checkIn,
      checkOut: checkOut,
      noites: diffDays,
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
              <h3 className="text-xl font-bold text-[#1a2b6d]">Selecionar datas</h3>
              <p className="text-xs text-slate-500 mt-1">{alojamentoTitulo}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Check-in */}
            <div>
              <label className="text-[10px] font-black text-[#1a2b6d] uppercase tracking-widest block mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={checkIn}
                  onChange={handleCheckInChange}
                  min={minDate}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
            
            {/* Check-out */}
            <div>
              <label className="text-[10px] font-black text-[#1a2b6d] uppercase tracking-widest block mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={checkOut}
                  onChange={handleCheckOutChange}
                  min={checkIn || minDate}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
            
            {/* Preview das noites */}
            {checkIn && checkOut && (
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-blue-900">
                  📅 {new Date(checkIn).toLocaleDateString('pt-PT')} → {new Date(checkOut).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} noites
                </p>
              </div>
            )}
            
            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Confirmar datas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataModalAlojamento;