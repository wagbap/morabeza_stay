// SearchBarCarros.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, MapPin } from 'lucide-react';

const SearchBarCarros = ({ onBuscar }) => {
  const [dataLevantamento, setDataLevantamento] = useState(null);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [destino, setDestino] = useState('');

  const formatarData = (data) => {
    if (!data) return null;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const handleBuscar = () => {
    const params = new URLSearchParams();
    
    if (destino) {
      params.append('localizacao', destino);
    }
    
    // ATENÇÃO: Mudamos os nomes para bater com os filtros da API/DB
    if (dataLevantamento) {
      params.append('data_levantamento', formatarData(dataLevantamento));
    }
    
    if (dataEntrega) {
      params.append('data_devolucao', formatarData(dataEntrega));
    }
    
    const queryString = params.toString();
    if (onBuscar) {
      onBuscar(queryString);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 relative z-50 text-left">
      <div className="bg-white p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-stretch border border-gray-100 overflow-hidden">
        
        {/* LOCALIZAÇÃO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 w-full">
            <MapPin size={20} className="text-blue-500" />
            <div className="flex flex-col w-full text-left">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest text-left">Local de Levantamento</label>
              <select 
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer appearance-none text-left"
              >
                <option value="">Todas as localizações</option>
                <option value="Praia">Cidade da Praia</option>
                <option value="Aeroporto">Aeroporto Nelson Mandela</option>
                <option value="Tarrafal">Tarrafal</option>
                <option value="Assomada">Assomada</option>
                <option value="Cidade Velha">Cidade Velha</option>
              </select>
            </div>
          </div>
        </div>

        {/* DATA DE LEVANTAMENTO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full">
            <Calendar size={20} className="text-blue-500" />
            <div className="flex flex-col w-full text-left">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest text-left">Data do Levantamento</label>
              <DatePicker
                selected={dataLevantamento}
                onChange={(date) => {
                  setDataLevantamento(date);
                  if (dataEntrega && date > dataEntrega) setDataEntrega(null);
                }}
                placeholderText="Escolher data"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5 text-left"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* DATA DE DEVOLUÇÃO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full">
            <Calendar size={20} className="text-blue-500" />
            <div className="flex flex-col w-full text-left">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest text-left">Data de Devolução</label>
              <DatePicker
                selected={dataEntrega}
                onChange={(date) => setDataEntrega(date)}
                placeholderText="Escolher data"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5 text-left"
                dateFormat="dd/MM/yyyy"
                minDate={dataLevantamento || new Date()}
              />
            </div>
          </div>
        </div>

        {/* BOTÃO BUSCAR */}
        <div className="p-1.5 flex items-center justify-center">
          <button 
            onClick={handleBuscar}
            className="w-full md:h-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-14 rounded-xl text-xs transition-all uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95"
          >
            BUSCAR VEÍCULO
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBarCarros;