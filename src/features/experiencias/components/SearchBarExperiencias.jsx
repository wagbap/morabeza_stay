// SearchBarExperiencias.js - Versão corrigida
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, MapPin } from 'lucide-react';

const SearchBarExperiencias = ({ onBuscar }) => {
  const [dataLevantamento, setDataLevantamento] = useState(null);
  const [dataParticipacao, setDataParticipacao] = useState(null);
  const [destino, setDestino] = useState('');

  const handleBuscar = () => {
    const params = new URLSearchParams();
    
    // Só adiciona localização se não for "Todas as localizações" ou vazio
    if (destino && destino !== '') {
      params.append('localizacao', destino);
    }
    
    // CORREÇÃO: Formatar a data corretamente para YYYY-MM-DD
    if (dataLevantamento) {
      const ano = dataLevantamento.getFullYear();
      const mes = String(dataLevantamento.getMonth() + 1).padStart(2, '0');
      const dia = String(dataLevantamento.getDate()).padStart(2, '0');
      const dataFormatada = `${ano}-${mes}-${dia}`;
      console.log('Data Levantamento enviada:', dataFormatada); // Debug
      params.append('data_levantamento', dataFormatada);
    }
    
    if (dataParticipacao) {
      const ano = dataParticipacao.getFullYear();
      const mes = String(dataParticipacao.getMonth() + 1).padStart(2, '0');
      const dia = String(dataParticipacao.getDate()).padStart(2, '0');
      const dataFormatada = `${ano}-${mes}-${dia}`;
      console.log('Data Participação enviada:', dataFormatada); // Debug
      params.append('data_participacao', dataFormatada);
    }
    
    const queryString = params.toString();
    console.log('Query String completa:', queryString); // Debug
    
    if (onBuscar) {
      onBuscar(queryString);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 relative z-50">
      <div className="bg-white p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-stretch border border-gray-100 overflow-hidden">
        
        {/* LOCALIZAÇÃO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 w-full">
            <MapPin size={20} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Local de Levantamento</label>
              <select 
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer appearance-none"
              >
                <option value="">Todas as localizações</option>
                <option value="Cidade Velha">Cidade Velha</option>
                <option value="Tarrafal">Tarrafal</option>
                <option value="Praia">Praia</option>
                <option value="Assomada">Assomada</option>
                <option value="São Domingos">São Domingos</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                 <option value="São Salvador do Mundoa">São Salvador do Mundoa</option>
              </select>
            </div>
          </div>
        </div>

        {/* DATA DE LEVANTAMENTO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full">
            <Calendar size={20} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Data do Levantamento</label>
              <DatePicker
                selected={dataLevantamento}
                onChange={(date) => setDataLevantamento(date)}
                placeholderText="Escolher data"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* DATA DE PARTICIPAÇÃO */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full">
            <Calendar size={20} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Data de Participação</label>
              <DatePicker
                selected={dataParticipacao}
                onChange={(date) => setDataParticipacao(date)}
                placeholderText="Escolher data"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5"
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
            BUSCAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBarExperiencias;