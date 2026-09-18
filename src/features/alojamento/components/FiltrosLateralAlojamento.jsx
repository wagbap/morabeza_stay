// src/features/alojamento/components/FiltrosLateralAlojamento.jsx
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  X, Building2, Home, Palmtree, Hotel, Map,
  Users, Baby, Bed, PawPrint, Plus, Minus, Sparkles,
} from 'lucide-react';

// ------------------------------------------------------------
// Stepper (+/-)
// ------------------------------------------------------------
const Stepper = ({ value, min = 0, max = 20, onChange, label }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      aria-label={`Diminuir ${label}`}
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                 text-gray-500 hover:border-blue-600 hover:text-blue-600 font-bold
                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Minus size={12} strokeWidth={3} />
    </button>
    <span className="text-xs font-black w-5 text-center tabular-nums">{value}</span>
    <button
      type="button"
      aria-label={`Aumentar ${label}`}
      disabled={value >= max}
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                 text-gray-500 hover:border-blue-600 hover:text-blue-600 font-bold
                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Plus size={12} strokeWidth={3} />
    </button>
  </div>
);

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
const FiltrosLaterais = ({
  // Orçamento
  orcamento,
  setOrcamento,
  orcamentoMaximo = 100000,
  orcamentoMinimo = 1000,

  // Tipos
  tiposSelecionados = [],
  setTiposSelecionados,

  // Contador
  totalEncontrados,

  // Mapa
  onAbrirMapa,

  // Pesquisa (URL como fonte de verdade)
  searchParams = {},
  onUpdateSearchParams,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // Valores atuais
  // ----------------------------------------------------------
  const adultos  = Number(searchParams.adultos  ?? 0) || 2;
  const criancas = Number(searchParams.criancas ?? 0) || 0;
  const quartos  = Number(searchParams.quartos  ?? 1) || 1;
  const pet      = Boolean(searchParams.pet);

  // ----------------------------------------------------------
  // Atualizar URL
  // ----------------------------------------------------------
  const updateParam = useCallback((patch) => {
    if (onUpdateSearchParams) {
      onUpdateSearchParams(patch);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || v === false) params.delete(k);
      else params.set(k, String(v));
    });
    navigate({ search: params.toString() }, { replace: true });
  }, [onUpdateSearchParams, navigate]);

  // ----------------------------------------------------------
  // Steppers
  // ----------------------------------------------------------
  const setAdultos = useCallback((v) => {
    updateParam({ adultos: v, hospedes: v + criancas });
  }, [criancas, updateParam]);

  const setCriancas = useCallback((v) => {
    updateParam({ criancas: v, hospedes: adultos + v });
  }, [adultos, updateParam]);

  const setQuartos = useCallback((v) => {
    updateParam({ quartos: v });
  }, [updateParam]);

  const togglePet = useCallback(() => {
    updateParam({ pet: pet ? null : 1 });
  }, [pet, updateParam]);

  // ----------------------------------------------------------
  // Tipos de propriedade
  // ----------------------------------------------------------
  const listaTipos = [
    { id: 'Apartamento', label: t('apartamento', 'Apartamento'), icon: <Building2 size={16} /> },
    { id: 'Villa',       label: t('villa',       'Villa'),       icon: <Home       size={16} /> },
    { id: 'Guesthouse',  label: t('guesthouse',  'Guesthouse'),  icon: <Palmtree   size={16} /> },
    { id: 'Hotel',       label: t('hotel',       'Hotel'),       icon: <Hotel      size={16} /> },
  ];

  const handleTipoChange = (tipoId) => {
    setTiposSelecionados((prev) =>
      prev.includes(tipoId)
        ? prev.filter((x) => x !== tipoId)
        : [...prev, tipoId]
    );
  };

  // ----------------------------------------------------------
  // Limpar
  // ----------------------------------------------------------
  const temFiltrosAtivos =
    tiposSelecionados.length > 0 ||
    orcamento < orcamentoMaximo ||
    criancas > 0 ||
    quartos > 1 ||
    pet;

  const limparTudo = useCallback(() => {
    setOrcamento(orcamentoMaximo);
    setTiposSelecionados([]);
    updateParam({ criancas: null, quartos: null, pet: null, adultos: 2, hospedes: 2 });
  }, [orcamentoMaximo, setOrcamento, setTiposSelecionados, updateParam]);

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className="space-y-6 text-left">

      {/* MAPA */}
      <div
        onClick={() => navigate('/mapa')}
        className="relative rounded-2xl overflow-hidden h-32 border-4 border-white shadow-lg cursor-pointer group"
      >
        <img
          src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=400"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt="Map Preview"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center transition-colors group-hover:bg-blue-900/40">
          <div className="bg-white text-blue-700 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
            <Map size={14} /> {t('ver_no_mapa', 'Ver no Mapa')}
          </div>
        </div>
      </div>

      {/* BLOCO DE FILTROS */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-blue-900/5">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">
            {t('filtrar_por', 'Filtrar por')}
          </h3>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[9px] font-black">
            {totalEncontrados}
          </span>
        </div>

        {/* HÓSPEDES */}
        <div className="mb-8">
          <label className="block font-black text-gray-900 uppercase text-[10px] tracking-tight mb-4">
            {t('hospedes', 'Hóspedes')}
          </label>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-blue-600" />
              <span className="text-[11px] font-bold text-gray-600">{t('adultos', 'Adultos')}</span>
            </div>
            <Stepper value={adultos} min={1} max={30} onChange={setAdultos} label="adultos" />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <Baby size={14} className="text-blue-600" />
              <div>
                <span className="text-[11px] font-bold text-gray-600">{t('criancas', 'Crianças')}</span>
                <span className="text-[9px] text-gray-400 ml-1">2-12</span>
              </div>
            </div>
            <Stepper value={criancas} min={0} max={10} onChange={setCriancas} label="crianças" />
          </div>
        </div>

        {/* QUARTOS */}
        <div className="mb-8">
          <label className="block font-black text-gray-900 uppercase text-[10px] tracking-tight mb-4">
            {t('quartos', 'Quartos')}
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed size={14} className="text-blue-600" />
              <span className="text-[11px] font-bold text-gray-600">
                {t('quantos_quartos', 'Quantos quartos?')}
              </span>
            </div>
            <Stepper value={quartos} min={1} max={10} onChange={setQuartos} label="quartos" />
          </div>
        </div>

        {/* PET */}
        <div className="mb-8 pb-6 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={14} className="text-blue-600" />
              <span className="text-[11px] font-bold text-gray-600">
                {t('viajar_com_animal', 'Viajar com animal')}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pet}
              onClick={togglePet}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                pet ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  pet ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {pet && (
            <p className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <Sparkles size={10} />
              {t('apenas_pet_friendly', 'Só alojamentos que aceitam animais')}
            </p>
          )}
        </div>

        {/* ORÇAMENTO */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <label className="font-black text-gray-900 uppercase text-[10px] tracking-tight">
              {t('orcamento', 'Orçamento')}
            </label>
            <span className="text-blue-600 font-black text-xs">
              {t('ate', 'Até')} {Number(orcamento).toLocaleString('pt-PT')} CVE
            </span>
          </div>
          <input
            type="range"
            min={orcamentoMinimo}
            max={orcamentoMaximo}
            step="500"
            value={orcamento}
            onChange={(e) => setOrcamento(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-2">
            <span>{orcamentoMinimo.toLocaleString('pt-PT')}</span>
            <span>{orcamentoMaximo.toLocaleString('pt-PT')} CVE</span>
          </div>
        </div>

        {/* TIPO */}
        <div className="space-y-4">
          <label className="block font-black text-gray-900 uppercase text-[10px] tracking-tight mb-2">
            {t('tipo_alojamento', 'Tipo de propriedade')}
          </label>
          <div className="space-y-3">
            {listaTipos.map((tipo) => (
              <div key={tipo.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`f-${tipo.id}`}
                  checked={tiposSelecionados.includes(tipo.id)}
                  onChange={() => handleTipoChange(tipo.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                />
                <label
                  htmlFor={`f-${tipo.id}`}
                  className="flex-1 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {tipo.icon} {tipo.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* LIMPAR */}
        {temFiltrosAtivos && (
          <button
            type="button"
            onClick={limparTudo}
            className="w-full mt-8 pt-4 border-t border-gray-50 text-gray-400 hover:text-red-500
                       text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <X size={14} /> {t('limpar_filtros', 'Limpar filtros')}
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltrosLaterais;