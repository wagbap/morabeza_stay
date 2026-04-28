import React, { useState } from 'react';
import { X, Clock, Sun, Sunset, Info, Check, User, Bus, Landmark } from 'lucide-react';

const HorarioModal = ({ onClose }) => {
  const [selected, setSelected] = useState('manha');

  return (
    // O 'fixed inset-0' garante que ocupe a tela toda e o 'z-[100]' coloca na frente
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Botão para fechar o modal chamando a função onClose */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2B6D] mb-2">Escolher horário do passeio</h2>
          <p className="text-slate-500 text-sm mb-8">Escolha o horário disponível para o seu tour.</p>

          <div className="space-y-4">
            {/* CARD MANHÃ - RECOMENDADO */}
            <div 
              onClick={() => setSelected('manha')}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                selected === 'manha' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === 'manha' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {selected === 'manha' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                  <Sun className="text-orange-400" size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#1A2B6D]">Manhã</span>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">⭐ Recomendado</span>
                  </div>
                  <p className="text-3xl font-black text-[#1A2B6D]">08:00</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Melhor luz para fotos</p>
                    <p className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Temperatura agradável</p>
                  </div>
                </div>
              </div>
              <div className="md:border-l border-slate-100 md:pl-8 flex items-center gap-2">
                 <Clock size={18} className="text-blue-600" />
                 <span className="text-sm font-bold text-[#1A2B6D]">3 - 4 horas</span>
              </div>
            </div>

            {/* CARD TARDE */}
            <div 
              onClick={() => setSelected('tarde')}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                selected === 'tarde' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === 'tarde' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {selected === 'tarde' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                  <Sunset className="text-orange-300" size={32} />
                </div>
                <div>
                  <span className="text-lg font-bold text-[#1A2B6D]">Tarde</span>
                  <p className="text-3xl font-black text-[#1A2B6D]">14:00</p>
                </div>
              </div>
              <div className="md:border-l border-slate-100 md:pl-8 flex items-center gap-2">
                 <Clock size={18} className="text-blue-600" />
                 <span className="text-sm font-bold text-[#1A2B6D]">3 - 4 horas</span>
              </div>
            </div>
          </div>

          {/* Banner de itens incluídos */}
          <div className="mt-6 bg-[#F6FBF9] border border-[#E8F5F0] rounded-xl p-4 flex flex-wrap gap-6 items-center">
            <span className="text-[11px] font-bold text-slate-700">Incluído em todos os horários:</span>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><User size={14} className="text-[#2D8A61]"/> Guia local</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><Bus size={14} className="text-[#2D8A61]"/> Transporte ida e volta</div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-8 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            Confirmar Horário
          </button>
        </div>
      </div>
    </div>
  );
};

export default HorarioModal;