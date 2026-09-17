import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Users } from 'lucide-react';

export const SearchBar = () => {
  const { t } = useTranslation();
  const [destino, setDestino] = useState('Santiago');
  const [datas, setDatas] = useState('');
  const [hospedes, setHospedes] = useState('1');

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 flex flex-col md:flex-row items-center gap-2">
        
        {/* Campo DESTINO */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 w-full">
          <MapPin size={20} className="text-blue-600 flex-shrink-0" />
          <div className="flex flex-col text-left w-full">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              {t('destino', 'DESTINO')}
            </span>
            <select 
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer w-full"
            >
              <option value="Santiago">Santiago</option>
              <option value="Sal">Sal</option>
              <option value="Boa Vista">Boa Vista</option>
              <option value="São Vicente">São Vicente</option>
            </select>
          </div>
        </div>

        {/* Campo CHECK-IN — CHECK-OUT */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 w-full">
          <Calendar size={20} className="text-blue-600 flex-shrink-0" />
          <div className="flex flex-col text-left w-full">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              {t('checkin_checkout', 'CHECK-IN — CHECK-OUT')}
            </span>
            <input 
              type="text"
              placeholder={t('escolher_data', 'Escolher data')}
              value={datas}
              onChange={(e) => setDatas(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-500 w-full"
            />
          </div>
        </div>

        {/* Campo HÓSPEDES (Select nativo como na imagem) */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
          <Users size={20} className="text-blue-600 flex-shrink-0" />
          <div className="flex flex-col text-left w-full">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              {t('hospedes', 'HÓSPEDES')}
            </span>
            <select 
              value={hospedes}
              onChange={(e) => setHospedes(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer w-full"
            >
              <option value="1">1 Adulto</option>
              <option value="2">2 Adultos</option>
              <option value="3">3 Adultos</option>
              <option value="4">4 Adultos</option>
            </select>
          </div>
        </div>

        {/* Botão BUSCAR */}
        <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-xl transition-colors tracking-wider text-sm flex-shrink-0 uppercase">
          {t('buscar', 'BUSCAR')}
        </button>

      </div>
    </div>
  );
};