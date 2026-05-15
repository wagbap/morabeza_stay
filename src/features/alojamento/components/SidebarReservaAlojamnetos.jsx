import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Star, Calendar, Users, ChevronDown, CheckCircle } from 'lucide-react';

export const SidebarReserva = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [numHospedes, setNumHospedes] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setTimeout(() => setShowCalendar(false), 300);
    }
  };

  return (
    // Removido sticky e margens fixas para alinhar com o grupo
    <div className="border border-slate-200 mt-12 rounded-2xl p-6 bg-white shadow-sm w-full relative">
      <div className="flex justify-between items-end mb-6">
        <div className="text-3xl font-bold text-slate-900">85€ <span className="text-base font-normal text-slate-500">/ noite</span></div>
        <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
          <Star size={16} className="fill-orange-500 text-orange-500" /> 4.8
        </div>
      </div>

      <div className="border border-slate-300 rounded-xl mb-4 overflow-visible">
        <div 
          className="flex border-b border-slate-300 cursor-pointer hover:bg-slate-50 transition-all rounded-t-xl"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div className="flex-1 p-3 border-r border-slate-300">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Check-in</label>
            <div className="text-sm font-bold text-slate-900">{startDate ? startDate.toLocaleDateString('pt-PT') : 'Data'}</div>
          </div>
          <div className="flex-1 p-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Check-out</label>
            <div className="text-sm font-bold text-slate-900">{endDate ? endDate.toLocaleDateString('pt-PT') : 'Data'}</div>
          </div>
        </div>

        {showCalendar && (
          <div className="absolute right-0 top-[160px] md:right-[-20px] md:top-[120px] z-[100] shadow-2xl rounded-2xl bg-white border border-slate-200 p-2">
            <DatePicker
              selected={startDate}
              onChange={onChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              monthsShown={window.innerWidth > 768 ? 2 : 1}
              inline
              minDate={new Date()}
              calendarClassName="morabeza-calendar-inline"
            />
            <div className="p-3 border-t border-slate-100 flex justify-end">
              <button onClick={(e) => { e.stopPropagation(); setShowCalendar(false); }} className="text-[#003580] font-bold text-xs uppercase">Fechar</button>
            </div>
          </div>
        )}

        <div className="p-3 flex justify-between items-center relative">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hóspedes</label>
            <select 
              value={numHospedes}
              onChange={(e) => setNumHospedes(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer appearance-none"
            >
              <option value="1">1 hóspede</option>
              <option value="2">2 hóspedes</option>
              <option value="3">3 hóspedes</option>
              <option value="4">4 hóspedes</option>
            </select>
          </div>
          <ChevronDown size={18} className="text-slate-400 pointer-events-none" />
        </div>
      </div>

      <button className="w-full bg-[#003580] text-white font-bold py-4 rounded-xl mb-4 hover:bg-blue-900 transition-all shadow-lg">
        Ver disponibilidade
      </button>

      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
        <CheckCircle className="text-green-600 mt-0.5" size={18} />
        <div>
          <h5 className="text-sm font-bold text-green-800 tracking-tight">Cancelamento gratuito</h5>
          <p className="text-[11px] text-green-700 leading-tight">Até 48 horas antes do check-in</p>
        </div>
      </div>

      <style>{`
        .morabeza-calendar-inline { border: none !important; font-family: inherit !important; }
        .react-datepicker__header { background-color: white !important; border: none !important; }
        .react-datepicker__day--in-range { background-color: #f1f5f9 !important; color: #1e293b !important; }
        .react-datepicker__day--range-start, .react-datepicker__day--range-end {
          background-color: #003580 !important; color: white !important; border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
};