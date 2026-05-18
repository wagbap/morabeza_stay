import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, MapPin } from 'lucide-react';

const SearchBarExperiencias = ({ onBuscar }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [destino, setDestino] = useState('');

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleBuscar = () => {
    const params = new URLSearchParams();
    
    if (destino && destino !== '') {
      params.append('localizacao', destino);
    }
    
    // Formata e adiciona a data de levantamento (início)
    if (startDate) {
      const ano = startDate.getFullYear();
      const mes = String(startDate.getMonth() + 1).padStart(2, '0');
      const dia = String(startDate.getDate()).padStart(2, '0');
      params.append('data_levantamento', `${ano}-${mes}-${dia}`);
    }
    
    // Formata e adiciona a data de participação (fim)
    if (endDate) {
      const ano = endDate.getFullYear();
      const mes = String(endDate.getMonth() + 1).padStart(2, '0');
      const dia = String(endDate.getDate()).padStart(2, '0');
      params.append('data_participacao', `${ano}-${mes}-${dia}`);
    }
    
    const queryString = params.toString();
    if (onBuscar) {
      onBuscar(queryString);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 relative z-50 font-sans">
      <div className="bg-white p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-stretch border border-gray-100 overflow-hidden">
        
        {/* LOCALIZAÇÃO */}
        <div className="flex-[1.5] flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 w-full text-left">
            <MapPin size={22} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col w-full">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-[0.2em]">Local de Levantamento</label>
              <select 
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer appearance-none pt-0.5"
              >
                <option value="">Todas as localizações</option>
                <option value="Cidade Velha">Cidade Velha</option>
                <option value="Tarrafal">Tarrafal</option>
                <option value="Praia">Praia</option>
                <option value="Assomada">Assomada</option>
                <option value="São Domingos">São Domingos</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="São Salvador do Mundoa">São Salvador do Mundoa</option>
              </select>
            </div>
          </div>
        </div>

        {/* DATAS (RANGE MODE - IGUAL AO ALOJAMENTO) */}
        <div className="flex-[2] flex items-center px-6 py-4 border-b md:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full text-left">
            <Calendar size={22} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-[0.2em]">Levantamento — Participação</label>
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                placeholderText="Escolher data"
                dateFormat="dd/MM/yyyy"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5"
                isClearable={true}
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* BOTÃO BUSCAR */}
        <div className="p-1.5 md:p-1 flex items-center justify-center">
          <button 
            onClick={handleBuscar}
            className="w-full md:h-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-14 rounded-xl text-xs transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-200 active:scale-95"
          >
            BUSCAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBarExperiencias;