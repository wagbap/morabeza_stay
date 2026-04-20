import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronDown, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [destino, setDestino] = useState('Ilha do Sal');
  const [numHospedes, setNumHospedes] = useState(2);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

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
    <div className="max-w-7xl mx-auto px-4 relative z-50 font-sans">
      {/* REMOVEU-SE A BORDA AMARELA 
          Adicionou-se uma borda suave cinza e sombra profunda para destaque 
      */}
      <div className="bg-white p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-stretch border border-gray-100 overflow-hidden">
        
        {/* DESTINO */}
        <div className="flex-[1.5] flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 w-full text-left">
            <MapPin size={22} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col w-full">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-[0.2em]">{t('label_destino')}</label>
              <select 
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer appearance-none pt-0.5"
              >
           
                <option value="Santiago">Santiago</option>
        
              </select>
            </div>
          </div>
        </div>

        {/* DATAS (RANGE MODE) */}
        <div className="flex-[2] flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 w-full text-left">
            <Calendar size={22} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-[0.2em]">Check-in — Check-out</label>
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                placeholderText={t('escolher_data')}
                dateFormat="dd/MM/yyyy"
                className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer pt-0.5"
                isClearable={true}
              />
            </div>
          </div>
        </div>

        {/* HÓSPEDES */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 w-full text-left">
            <Users size={22} className="text-blue-500" />
            <div className="flex flex-col w-full">
              <label className="text-[9px] uppercase font-black text-gray-400 tracking-[0.2em]">{t('label_hospedes')}</label>
              <div className="flex items-center justify-between pt-0.5">
                <select 
                  value={numHospedes}
                  onChange={(e) => setNumHospedes(Number(e.target.value))}
                  className="bg-transparent outline-none w-full text-sm font-bold text-gray-800 cursor-pointer appearance-none"
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
        </div>

        {/* BOTÃO BUSCAR 🚀 */}
        <div className="p-1.5 md:p-1 flex items-center justify-center">
          <button 
            onClick={handleSearch}
            className="w-full md:h-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-12 rounded-xl md:rounded-xl text-xs transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-200 active:scale-95"
          >
            {t('botao_buscar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;