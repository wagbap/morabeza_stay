import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const DataModal = ({ onClose, onSelectData, experienciaTitulo, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Valores fixos em português (não precisam de tradução)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const diasSemanaCompletos = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  // Inicializar com a data atual se existir
  useEffect(() => {
    if (currentDate && typeof currentDate === 'string') {
      const dateMatch = currentDate.match(/(\d+) de (\w+) de (\d+)/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthName = dateMatch[2];
        const year = parseInt(dateMatch[3]);
        const monthIndex = meses.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
        if (monthIndex !== -1) {
          setSelectedDate(new Date(year, monthIndex, day));
          setCurrentMonth(new Date(year, monthIndex, 1));
        }
      } else if (currentDate.includes('-')) {
        const [year, month, day] = currentDate.split('-');
        setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
      }
    }
  }, [currentDate]);
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    return days;
  };
  
  const formatDate = (date) => {
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };
  
  const isAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  
  const handleDateClick = (date) => {
    if (isAvailable(date)) {
      setSelectedDate(date);
    }
  };
  
  const handleConfirm = () => {
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onSelectData({
        full: formattedDate,
        weekday: diasSemanaCompletos[selectedDate.getDay()],
        day: selectedDate.getDate(),
        month: meses[selectedDate.getMonth()],
        year: selectedDate.getFullYear(),
        iso: selectedDate.toISOString().split('T')[0]
      });
    }
  };
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 z-10">
          <X size={24} />
        </button>
        
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-blue-950 mb-2">Selecionar data</h2>
          <p className="text-slate-500 text-sm mb-8">
            Escolha a melhor data para o seu {experienciaTitulo || 'passeio'}.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* CALENDÁRIO */}
            <div className="border border-slate-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className="font-bold text-blue-900">
                  {meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-4">
                {diasSemana.map(d => <div key={d}>{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day, i) => {
                  const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
                  const available = isAvailable(day.date);
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleDateClick(day.date)}
                      className={`h-10 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-all
                        ${!day.isCurrentMonth ? 'text-slate-300 cursor-not-allowed' : ''}
                        ${available && day.isCurrentMonth ? 'hover:bg-slate-100' : 'opacity-40 cursor-not-allowed'}
                        ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                        ${!available && day.isCurrentMonth ? 'text-slate-300 line-through' : 'text-slate-700'}
                      `}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INFO DA DATA SELECIONADA */}
            <div className="flex flex-col justify-between">
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-8">
                <p className="text-blue-900 font-bold mb-4">Data selecionada</p>
                {selectedDate ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 text-2xl">
                      📅
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold">
                        {diasSemanaCompletos[selectedDate.getDay()]}
                      </p>
                      <p className="text-blue-900 font-black text-xl">
                        {selectedDate.getDate()} de {meses[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
                      </p>
                      <p className="text-green-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Disponível
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-4xl mb-2">📅</p>
                    <p className="text-sm">Selecione uma data no calendário</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleConfirm}
                disabled={!selectedDate}
                className={`w-full py-4 rounded-xl font-bold mt-6 transition-all ${
                  selectedDate 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmar Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataModal;