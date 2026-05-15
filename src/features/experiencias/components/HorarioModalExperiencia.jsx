import React, { useState, useEffect } from 'react';
import { X, Clock, Sun, Sunset, Check, User, Bus } from 'lucide-react';

const HorarioModal = ({ onClose, onSelectHorario, currentPeriodo, currentHorario }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('manha');
  
  const horarios = {
    manha: {
      label: 'Manhã',
      horario: '08:00',
      icon: Sun,
      color: 'text-orange-400',
      recomendado: true,
      beneficios: [
        'Melhor luz para fotos',
        'Temperatura agradável',
        'Menos multidão'
      ]
    },
    tarde: {
      label: 'Tarde',
      horario: '14:00',
      icon: Sunset,
      color: 'text-orange-300',
      recomendado: false,
      beneficios: [
        'Pôr do sol incrível',
        'Clima mais quente',
        'Ideal para relaxar'
      ]
    }
  };
  
  // Inicializar com o período atual se existir
  useEffect(() => {
    if (currentPeriodo) {
      if (currentPeriodo.toLowerCase() === 'manhã') {
        setSelectedPeriod('manha');
      } else if (currentPeriodo.toLowerCase() === 'tarde') {
        setSelectedPeriod('tarde');
      }
    }
  }, [currentPeriodo]);
  
  const handleConfirm = () => {
    const selected = horarios[selectedPeriod];
    onSelectHorario(selected.horario, selected.label);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2B6D] mb-2">Escolher horário do passeio</h2>
          <p className="text-slate-500 text-sm mb-8">Escolha o horário disponível para o seu tour.</p>

          <div className="space-y-4">
            {Object.entries(horarios).map(([key, h]) => {
              const Icon = h.icon;
              const isSelected = selectedPeriod === key;
              
              return (
                <div 
                  key={key}
                  onClick={() => setSelectedPeriod(key)}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                    </div>
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                      <Icon className={h.color} size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#1A2B6D]">{h.label}</span>
                        {h.recomendado && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                            ⭐ Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-black text-[#1A2B6D]">{h.horario}</p>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        {h.beneficios.map((beneficio, i) => (
                          <p key={i} className="flex items-center gap-2">
                            <Check size={14} className="text-green-500"/> {beneficio}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:border-l border-slate-100 md:pl-8 flex items-center gap-2 mt-4 md:mt-0">
                    <Clock size={18} className="text-blue-600" />
                    <span className="text-sm font-bold text-[#1A2B6D]">3 - 4 horas</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de itens incluídos */}
          <div className="mt-6 bg-[#F6FBF9] border border-[#E8F5F0] rounded-xl p-4 flex flex-wrap gap-6 items-center">
            <span className="text-[11px] font-bold text-slate-700">Incluído em todos os horários:</span>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <User size={14} className="text-[#2D8A61]"/> Guia local
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <Bus size={14} className="text-[#2D8A61]"/> Transporte ida e volta
            </div>
          </div>

          <button 
            onClick={handleConfirm}
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