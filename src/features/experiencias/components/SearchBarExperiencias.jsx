// src/features/experiencia/components/SearchBarExperiencias.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, ChevronDown, MapPin, Search, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';

// ------------------------------------------------------------
// Constantes
// ------------------------------------------------------------
const LOCAIS = [
  { value: '',                     labelKey: 'todas_localizacoes',      fallback: 'Todas as localizações' },
  { value: 'Cidade Velha',         labelKey: 'cidade_velha',            fallback: 'Cidade Velha' },
  { value: 'Tarrafal',             labelKey: 'tarrafal',                fallback: 'Tarrafal' },
  { value: 'Praia',                labelKey: 'praia',                   fallback: 'Praia' },
  { value: 'Assomada',             labelKey: 'assomada',                fallback: 'Assomada' },
  { value: 'São Domingos',         labelKey: 'sao_domingos',            fallback: 'São Domingos' },
  { value: 'Santa Cruz',           labelKey: 'santa_cruz',              fallback: 'Santa Cruz' },
  { value: 'São Salvador do Mundo',labelKey: 'sao_salvador_mundo',      fallback: 'São Salvador do Mundo' },
];

// ------------------------------------------------------------
// Utilitários de data
// ------------------------------------------------------------
const toISODate = (d) => {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const fromISODate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const formatarData = (d) => {
  if (!d) return '';
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short'
  }).replace('.', '');
};

const diasEntre = (start, end) => {
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
const SearchBarExperiencias = ({ onBuscar, className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------------
  // 1) Inicializar estado a partir da URL
  // ----------------------------------------------------------
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [destino,   setDestino]   = useState(urlParams.get('localizacao') || '');
  const [startDate, setStartDate] = useState(fromISODate(urlParams.get('data_inicio')));
  const [endDate,   setEndDate]   = useState(fromISODate(urlParams.get('data_fim')));
  const [avisoData, setAvisoData] = useState('');

  const [showCalendario, setShowCalendario] = useState(false);

  const calendarioRef = useRef(null);

  // ----------------------------------------------------------
  // 2) Sincronizar com URL
  // ----------------------------------------------------------
  useEffect(() => {
    setDestino(urlParams.get('localizacao') || '');
    setStartDate(fromISODate(urlParams.get('data_inicio')));
    setEndDate(fromISODate(urlParams.get('data_fim')));
  }, [urlParams]);

  // ----------------------------------------------------------
  // 3) Fechar popover ao clicar fora
  // ----------------------------------------------------------
  useEffect(() => {
    const fechar = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setShowCalendario(false);
      }
    };
    document.addEventListener('mousedown', fechar);
    document.addEventListener('touchstart', fechar);
    return () => {
      document.removeEventListener('mousedown', fechar);
      document.removeEventListener('touchstart', fechar);
    };
  }, []);

  // ----------------------------------------------------------
  // 4) Calendário
  // ----------------------------------------------------------
  const onChangeDatas = useCallback((dates) => {
    const [start, end] = dates || [];

    if (start && end && end < start) {
      setStartDate(end);
      setEndDate(start);
      setAvisoData('');
    } else {
      setStartDate(start);
      setEndDate(end);
    }

    if (start && end) {
      setAvisoData('');
      setTimeout(() => setShowCalendario(false), 200);
    }
  }, []);

  // ----------------------------------------------------------
  // 5) Labels
  // ----------------------------------------------------------
  const dias = useMemo(() => diasEntre(startDate, endDate), [startDate, endDate]);

  const labelDatas = useMemo(() => {
    if (!startDate && !endDate) return t('escolher_data', 'Escolher datas');
    if (startDate && !endDate) return `${formatarData(startDate)} → ?`;
    return `${formatarData(startDate)} → ${formatarData(endDate)}`;
  }, [startDate, endDate, t]);

  // ----------------------------------------------------------
  // 6) Submeter pesquisa
  // ----------------------------------------------------------
  const handleSearch = useCallback((e) => {
    e?.preventDefault?.();

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setAvisoData(t('aviso_datas_incompletas', 'Escolhe as duas datas ou nenhuma.'));
      return;
    }

    const params = {
      localizacao: destino,
      data_inicio: toISODate(startDate),
      data_fim: toISODate(endDate),
    };

    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] == null) delete params[k];
    });

    const query = new URLSearchParams(params).toString();

    if (onBuscar) {
      onBuscar(query);
    } else {
      navigate(`/experiencias?${query}`);
    }

    setShowCalendario(false);
  }, [destino, startDate, endDate, navigate, onBuscar, t]);

  // ----------------------------------------------------------
  // 7) Limpar tudo
  // ----------------------------------------------------------
  const limparTudo = useCallback(() => {
    setDestino('');
    setStartDate(null);
    setEndDate(null);
    setAvisoData('');
    navigate('/experiencias');
  }, [navigate]);

  const temFiltros = destino || startDate || endDate;

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className={`max-w-7xl mx-auto px-4 relative z-50 font-sans ${className}`}>
      <form
        onSubmit={handleSearch}
        className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center border border-gray-100 gap-2"
      >
        {/* ---------------- LOCALIZAÇÃO ---------------- */}
        <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-xl">
          <div className="flex items-center gap-3 w-full text-left">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                {t('local_experiencia', 'LOCAL')}
              </label>
              <div className="relative flex items-center">
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  aria-label={t('local_experiencia', 'Local da experiência')}
                  className="bg-transparent outline-none w-full text-sm font-bold text-gray-900 cursor-pointer appearance-none pr-5 truncate"
                >
                  {LOCAIS.map(({ value, labelKey, fallback }) => (
                    <option key={value || 'all'} value={value}>
                      {t(labelKey, fallback)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-gray-400 pointer-events-none absolute right-0" />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- DATAS ---------------- */}
        <div ref={calendarioRef} className="flex-[1.4] relative flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-xl">
          <button
            type="button"
            onClick={() => setShowCalendario(v => !v)}
            className="flex items-center gap-3 w-full text-left"
            aria-expanded={showCalendario}
            aria-haspopup="dialog"
          >
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                {t('datas_experiencia', 'DATAS')}
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold truncate ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {labelDatas}
                  {dias > 0 && (
                    <span className="ml-2 text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      {dias} {dias === 1 ? t('dia', 'dia') : t('dias', 'dias')}
                    </span>
                  )}
                </span>
                {startDate && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setStartDate(null);
                      setEndDate(null);
                      setAvisoData('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setStartDate(null), setEndDate(null))}
                    className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
                    aria-label="Limpar datas"
                  >
                    <X size={14} />
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* POPOVER CALENDÁRIO */}
          {showCalendario && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[90] md:hidden"
                onClick={() => setShowCalendario(false)}
                aria-hidden="true"
              />
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 z-[100]
                           shadow-2xl rounded-2xl bg-white border border-slate-200 p-2
                           w-[calc(100vw-2rem)] max-w-[420px] md:w-auto"
                role="dialog"
                aria-label="Selecionar datas"
              >
                <CalendarioMorabeza
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={onChangeDatas}
                  minDate={new Date()}
                  locale="pt"
                  monthsShown={typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1}
                />
                <div className="p-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    className="text-gray-500 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider"
                  >
                    {t('limpar', 'Limpar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCalendario(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg"
                  >
                    {t('fechar', 'Fechar')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ---------------- BOTÃO BUSCAR ---------------- */}
        <div className="w-full md:w-auto flex gap-2">
          {temFiltros && (
            <button
              type="button"
              onClick={limparTudo}
              aria-label={t('limpar_pesquisa', 'Limpar pesquisa')}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
          >
            <Search size={16} strokeWidth={3} />
            <span>{t('buscar', 'BUSCAR')}</span>
          </button>
        </div>
      </form>

      {/* Aviso de validação */}
      {avisoData && (
        <p className="mt-2 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-left">
          ⚠️ {avisoData}
        </p>
      )}
    </div>
  );
};

export default SearchBarExperiencias;