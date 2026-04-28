import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const DataModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X /></button>
        
        <div className="p-10">
          <h2 className="text-2xl font-bold text-blue-950 mb-2">Selecionar data</h2>
          <p className="text-slate-500 text-sm mb-8">Escolha a melhor data para o seu Cidade Velha Cultura & Tour.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* CALENDÁRIO SIMULADO */}
            <div className="border border-slate-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <button><ChevronLeft size={20}/></button>
                <span className="font-bold text-blue-900">Maio 2024</span>
                <button><ChevronRight size={20}/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-4">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Exemplo de dia selecionado */}
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`h-10 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer
                    ${i + 1 === 24 ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* INFO DA DATA SELECIONADA */}
            <div className="flex flex-col justify-between">
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-8">
                <p className="text-blue-900 font-bold mb-4">Data selecionada</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 italic">📅</div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold">Sexta-feira</p>
                    <p className="text-blue-900 font-black text-xl">24 de maio de 2024</p>
                    <p className="text-green-500 text-xs font-bold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Disponível
                    </p>
                  </div>
                </div>
              </div>
              
              <button onClick={onClose} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6">Confirmar Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataModal;