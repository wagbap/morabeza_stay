// src/features/alojamento/components/SearchBarAlojamento.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, ChevronDown, MapPin, Users, Search, User, Baby,
  Bed, PawPrint, Info, X, Minus, Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';

// ------------------------------------------------------------
// Constantes
// ------------------------------------------------------------
const ISLAS = [
  { value: 'Santiago',    label: 'Santiago'    }
];

const LIMITES = { adultos: 30, criancas: 10, quartos: 10 };

// ------------------------------------------------------------
// Utilitários de data (evita bug UTC do toISOString)
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

const noitesEntre = (start, end) => {
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

// ------------------------------------------------------------
// Botão +/- reutilizável
// ------------------------------------------------------------
const Stepper = ({ value, min, max, onChange, label }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      aria-label={`Diminuir ${label}`}
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center
                 text-gray-500 hover:border-blue-600 hover:text-blue-600 font-bold
                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Minus size={14} strokeWidth={3} />
    </button>
    <span className="text-sm font-bold w-6 text-center tabular-nums">{value}</span>
    <button
      type="button"
      aria-label={`Aumentar ${label}`}
      disabled={value >= max}
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center
                 text-gray-500 hover:border-blue-600 hover:text-blue-600 font-bold
                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Plus size={14} strokeWidth={3} />
    </button>
  </div>
);

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
const SearchBar = ({ onSearch, className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------------
  // 1) Inicializar estado a partir da URL (back/forward funcionam)
  // ----------------------------------------------------------
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [destino,    setDestino]    = useState(urlParams.get('destino') || 'Santiago');
  const [startDate,  setStartDate]  = useState(fromISODate(urlParams.get('entrada')));
  const [endDate,    setEndDate]    = useState(fromISODate(urlParams.get('saida')));
  const [adultos,    setAdultos]    = useState(Number(urlParams.get('adultos'))  || 2);
  const [criancas,   setCriancas]   = useState(Number(urlParams.get('criancas')) || 0);
  const [quartos,    setQuartos]    = useState(Number(urlParams.get('quartos'))  || 1);
  const [pet,        setPet]        = useState(urlParams.get('pet') === '1');

  const [showCalendario,   setShowCalendario]   = useState(false);
  const [showHospedes,     setShowHospedes]     = useState(false);
  const [avisoData,        setAvisoData]        = useState('');

  const calendarioRef = useRef(null);
  const hospedesRef   = useRef(null);

  // ----------------------------------------------------------
  // 2) Sincronizar com URL quando ela muda externamente
  // ----------------------------------------------------------
  useEffect(() => {
    setDestino(urlParams.get('destino') || 'Santiago');
    setStartDate(fromISODate(urlParams.get('entrada')));
    setEndDate(fromISODate(urlParams.get('saida')));
    setAdultos(Number(urlParams.get('adultos')) || 2);
    setCriancas(Number(urlParams.get('criancas')) || 0);
    setQuartos(Number(urlParams.get('quartos')) || 1);
    setPet(urlParams.get('pet') === '1');
  }, [urlParams]);

  // ----------------------------------------------------------
  // 3) Fechar popovers ao clicar fora (funciona em mobile)
  // ----------------------------------------------------------
  useEffect(() => {
    const fechar = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setShowCalendario(false);
      }
      if (hospedesRef.current && !hospedesRef.current.contains(e.target)) {
        setShowHospedes(false);
      }
    };
    document.addEventListener('mousedown', fechar);
    document.addEventListener('touchstart', fechar);
    return () => {
      document.removeEventListener('mousedown', fechar);
      document.removeEventListener('touchstart', fechar);
    };
  }, []);

  // Bloquear scroll do body quando modal hóspedes aberto (mobile)
  useEffect(() => {
    if (showHospedes) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showHospedes]);

  // ----------------------------------------------------------
  // 4) Calendário — com validação de datas
  // ----------------------------------------------------------
  const onChangeDatas = useCallback((dates) => {
    const [start, end] = dates || [];

    // Se o utilizador escolheu a 2ª data antes da 1ª, invertemos
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
  // 5) Contagem de noites (mostrada no campo)
  // ----------------------------------------------------------
  const noites = useMemo(() => noitesEntre(startDate, endDate), [startDate, endDate]);

  const labelDatas = useMemo(() => {
    if (!startDate && !endDate) return t('escolher_data', 'Escolher datas');
    if (startDate && !endDate) return `${formatarData(startDate)} → ?`;
    return `${formatarData(startDate)} → ${formatarData(endDate)}`;
  }, [startDate, endDate, t]);

  const totalHospedes = adultos + criancas;

  const labelHospedes = useMemo(() => {
    const parts = [
      `${adultos} ${adultos === 1 ? t('adulto', 'Adulto') : t('adultos', 'Adultos')}`,
    ];
    if (criancas > 0) {
      parts.push(`${criancas} ${criancas === 1 ? t('crianca', 'Criança') : t('criancas', 'Crianças')}`);
    }
    if (quartos > 1) parts.push(`${quartos} ${t('quartos', 'quartos')}`);
    return parts.join(' · ');
  }, [adultos, criancas, quartos, t]);

  // ----------------------------------------------------------
  // 6) Submeter pesquisa
  // ----------------------------------------------------------
  const handleSearch = useCallback((e) => {
    e?.preventDefault?.();

    // Se só uma data foi escolhida, avisa
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setAvisoData(t('aviso_datas_incompletas', 'Escolhe as duas datas ou nenhuma.'));
      return;
    }

    const params = {
      destino,
      entrada:  toISODate(startDate),
      saida:    toISODate(endDate),
      adultos,
      criancas,
      quartos,
      hospedes: totalHospedes,
      pet:      pet ? '1' : '0',
    };

    // Remove strings vazias para não poluir a URL
    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] == null) delete params[k];
    });

    const query = new URLSearchParams(params).toString();

    // callbacks opcionais (permite reuso fora do react-router)
    onSearch?.(params);

    navigate(`/alojamentos?${query}`);
    setShowCalendario(false);
    setShowHospedes(false);
  }, [destino, startDate, endDate, adultos, criancas, quartos, totalHospedes, pet, navigate, onSearch, t]);

  // ----------------------------------------------------------
  // 7) Limpar tudo
  // ----------------------------------------------------------
  const limparTudo = useCallback(() => {
    setDestino('Santiago');
    setStartDate(null);
    setEndDate(null);
    setAdultos(2);
    setCriancas(0);
    setQuartos(1);
    setPet(false);
    setAvisoData('');
    navigate('/alojamentos');
  }, [navigate]);

  const limparHospedes = useCallback(() => {
    setAdultos(2);
    setCriancas(0);
    setQuartos(1);
    setPet(false);
  }, []);

  const temFiltros = startDate || endDate || adultos !== 2 || criancas > 0 || quartos !== 1 || pet;

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className={`max-w-7xl mx-auto px-4 relative z-50 font-sans ${className}`}>
      <form
        onSubmit={handleSearch}
        className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center border border-gray-100 gap-2"
      >
        {/* ---------------- DESTINO ---------------- */}
        <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-xl">
          <div className="flex items-center gap-3 w-full text-left">
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                {t('label_destino', 'DESTINO')}
              </label>
              <div className="relative flex items-center">
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  aria-label={t('label_destino', 'Destino')}
                  className="bg-transparent outline-none w-full text-sm font-bold text-gray-900 cursor-pointer appearance-none pr-5 truncate"
                >
                  {ISLAS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
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
            onClick={() => { setShowCalendario(v => !v); setShowHospedes(false); }}
            className="flex items-center gap-3 w-full text-left"
            aria-expanded={showCalendario}
            aria-haspopup="dialog"
          >
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                {t('label_datas', 'CHECK-IN — CHECK-OUT')}
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold truncate ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {labelDatas}
                  {noites > 0 && (
                    <span className="ml-2 text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      {noites} {noites === 1 ? t('noite', 'noite') : t('noites', 'noites')}
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

          {/* POPOVER CALENDÁRIO — responsivo */}
          {showCalendario && (
            <>
              {/* Overlay mobile */}
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

        {/* ---------------- HÓSPEDES ---------------- */}
        <div ref={hospedesRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => { setShowHospedes(v => !v); setShowCalendario(false); }}
            aria-expanded={showHospedes}
            aria-haspopup="dialog"
            className={`flex items-center w-full px-4 py-3 border transition-all rounded-xl ${
              showHospedes ? 'border-blue-600 ring-1 ring-blue-600 bg-white' : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 w-full text-left">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
                <Users size={18} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                  {t('label_hospedes', 'HÓSPEDES')}
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-gray-900 truncate">{labelHospedes}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform shrink-0 ${showHospedes ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>
            </div>
          </button>

          {/* MODAL HÓSPEDES — bottom sheet em mobile, dropdown em desktop */}
          {showHospedes && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[90] md:hidden"
                onClick={() => setShowHospedes(false)}
                aria-hidden="true"
              />
              <div
                className="fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto md:right-0 md:top-full
                           w-full md:w-[380px] md:mt-2
                           bg-white border-t md:border border-gray-100 md:rounded-2xl rounded-t-2xl
                           shadow-2xl p-5 z-[100] text-left max-h-[85vh] overflow-y-auto"
                role="dialog"
                aria-label="Selecionar hóspedes"
              >
                {/* Handle mobile */}
                <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                {/* Adultos */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex gap-3 items-start">
                    <User size={18} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t('adultos', 'Adultos')}</p>
                      <p className="text-xs text-gray-400">{t('a_partir_13', '13 anos ou mais')}</p>
                    </div>
                  </div>
                  <Stepper
                    value={adultos}
                    min={1}
                    max={LIMITES.adultos}
                    onChange={setAdultos}
                    label="adultos"
                  />
                </div>

                {/* Crianças */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex gap-3 items-start">
                    <Baby size={18} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t('criancas', 'Crianças')}</p>
                      <p className="text-xs text-gray-400">{t('de_2_a_12', '2 – 12 anos')}</p>
                    </div>
                  </div>
                  <Stepper
                    value={criancas}
                    min={0}
                    max={LIMITES.criancas}
                    onChange={setCriancas}
                    label="crianças"
                  />
                </div>

                {/* Quartos */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex gap-3 items-start">
                    <Bed size={18} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t('quartos', 'Quartos')}</p>
                      <p className="text-xs text-gray-400">{t('quantos_quartos', 'Quantos quartos precisa?')}</p>
                    </div>
                  </div>
                  <Stepper
                    value={quartos}
                    min={1}
                    max={LIMITES.quartos}
                    onChange={setQuartos}
                    label="quartos"
                  />
                </div>

                {/* Pet */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <PawPrint size={18} className="text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">
                      {t('com_pet', 'Viajar com animal')}
                    </span>
                    <span
                      title={t('pet_info', 'Só aparecem alojamentos que aceitam animais')}
                      className="text-gray-400 cursor-help"
                    >
                      <Info size={14} />
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pet}
                    onClick={() => setPet(v => !v)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      pet ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      pet ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 gap-3">
                  <button
                    type="button"
                    onClick={limparHospedes}
                    className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600"
                  >
                    {t('limpar', 'LIMPAR')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHospedes(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-200"
                  >
                    {t('aplicar', 'APLICAR')}
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
            <span>{t('botao_buscar', 'BUSCAR')}</span>
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

export default SearchBar;