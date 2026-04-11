import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchBar = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [destino, setDestino] = useState('Ilha do Sal');
  const [numHospedes, setNumHospedes] = useState(2);
  
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const dataEntrada = startDate ? startDate.toISOString().split('T')[0] : '';
    const dataSaida = endDate ? endDate.toISOString().split('T')[0] : '';

    const query = new URLSearchParams({
      destino: destino,
      entrada: dataEntrada,
      saida: dataSaida,
      hospedes: numHospedes
    }).toString();

    navigate(`/alojamentos?${query}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 relative z-40 font-sans">
      <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center border border-gray-100">
        
        {/* Destino */}
        <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-black text-blue-600/50 tracking-widest">{t('label_destino')}</label>
            <div className="flex items-center justify-between pt-1">
               <select 
                 value={destino}
                 onChange={(e) => setDestino(e.target.value)}
                 className="bg-transparent outline-none w-full text-sm font-bold text-gray-700 cursor-pointer appearance-none"
               >
                <option value="Ilha do Sal">Ilha do Sal</option>
                <option value="Boa Vista">Boa Vista</option>
                <option value="Santiago">Santiago</option>
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Datas Check-in/out */}
        <div className="flex flex-row flex-[2] border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex-1 px-4 py-3 border-r border-gray-100 relative group text-left">
            <label className="text-[10px] uppercase font-black text-blue-600/50 tracking-widest">{t('label_checkin')}</label>
            <div className="flex items-center gap-2 pt-1">
              <Calendar size={14} className="text-blue-500" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText={t('escolher_data')}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-700 cursor-pointer"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          <div className="flex-1 px-4 py-3 relative group text-left">
            <label className="text-[10px] uppercase font-black text-blue-600/50 tracking-widest">{t('label_checkout')}</label>
            <div className="flex items-center gap-2 pt-1">
              <Calendar size={14} className="text-blue-500" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText={t('escolher_data')}
                minDate={startDate}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-700 cursor-pointer"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>

        {/* Hóspedes */}
        <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 border-gray-100">
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-black text-blue-600/50 tracking-widest">{t('label_hospedes')}</label>
            <div className="flex items-center justify-between pt-1">
              <select 
                value={numHospedes}
                onChange={(e) => setNumHospedes(Number(e.target.value))}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-700 cursor-pointer appearance-none"
              >
                <option value={1}>1 {t('adulto')}</option>
                <option value={2}>2 {t('adultos')}</option>
                <option value={3}>3 {t('adultos')}</option>
                <option value={4}>4 {t('adultos')}</option>
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-2">
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-[#0056b3] hover:bg-blue-700 text-white font-bold py-4 md:py-4 px-12 rounded-lg text-xs transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
          >
            {t('botao_buscar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;