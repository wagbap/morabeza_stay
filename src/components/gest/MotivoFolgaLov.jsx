import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Luggage, Wrench, Cake, Coffee, Ellipsis } from 'lucide-react';

export default function MotivoFolgaLov({ value = '', onChange }) {
  const { t } = useTranslation();
  const tr = (key, text) => t(`agenda_experiencia_${key}`, text);
  const options = [
    { id: 'ferias', label: tr('motivo_ferias', 'Férias'), icon: Luggage, saved: 'Férias' },
    { id: 'manutencao', label: tr('motivo_manutencao', 'Manutenção'), icon: Wrench, saved: 'Manutenção' },
    { id: 'aniversario', label: tr('motivo_aniversario', 'Aniversário'), icon: Cake, saved: 'Aniversário' },
    { id: 'folga', label: tr('motivo_folga', 'Folga'), icon: Coffee, saved: 'Folga' },
    { id: 'outro', label: tr('motivo_outro', 'Outro'), icon: Ellipsis, saved: null },
  ];
  const selected = options.find(o => o.saved === value || o.label === value);
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [active, setActive] = useState(-1);
  const [custom, setCustom] = useState(Boolean(value && !selected));
  const container = useRef(null), search = useRef(null), customInput = useRef(null);
  const id = useId();
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const filtered = options.filter(o => normalize(o.label).includes(normalize(query)));
  const pick = option => {
    setOpen(false); setQuery(''); setActive(-1);
    setCustom(option.id === 'outro'); onChange(option.saved || '');
    if (option.id === 'outro') requestAnimationFrame(() => customInput.current?.focus());
    else search.current?.focus();
  };
  useEffect(() => {
    const outside = event => { if (!container.current?.contains(event.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => { search.current?.setCustomValidity(!custom && query && !value ? tr('motivo_selecione', 'Selecione um motivo da lista.') : ''); }, [value, custom, query]);
  const display = open ? query : custom ? tr('motivo_outro', 'Outro') : selected?.label || value;
  return <div ref={container} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(''); } }}>
    <label htmlFor={`${id}-search`} className="mb-1.5 block text-base text-[#07104f]">{tr('motivo', 'Motivo *')}</label>
    <div className={`flex h-12 items-center gap-4 rounded-md border bg-white px-5 text-[#070e50] transition ${open ? 'border-[#0055ff] ring-1 ring-[#0055ff]' : 'border-[#ccd8ee] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'}`}>
      <span className="inline-flex shrink-0"><Search size={23} strokeWidth={1.8} aria-hidden="true" /></span>
      <input id={`${id}-search`} ref={search} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open && filtered[active] ? `${id}-${filtered[active].id}` : undefined} aria-required="true" required={!custom} value={display} placeholder={tr('motivo_pesquisar', 'Pesquisar ou selecionar motivo...')} autoComplete="off" className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#07104f] outline-none placeholder:text-[#6578ab]" onClick={() => setOpen(true)} onChange={event => { setOpen(true); setQuery(event.target.value); setActive(0); setCustom(false); onChange(''); }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); setQuery(''); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive(old => filtered.length ? old < 0 ? (event.key === 'ArrowDown' ? 0 : filtered.length - 1) : (old + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length : -1); }
        if (event.key === 'Enter' && open) { event.preventDefault(); if (filtered[active]) pick(filtered[active]); }
      }} />
      <button type="button" tabIndex={-1} aria-label={tr('motivo_abrir_lista', 'Mostrar motivos')} aria-expanded={open} className="cursor-pointer p-1" onClick={() => { setOpen(old => !old); search.current?.focus(); }}><ChevronDown size={21} strokeWidth={2.5} aria-hidden="true" /></button>
    </div>
    {open && <div id={`${id}-options`} role="listbox" aria-label={tr('motivo_lista', 'Motivos disponíveis')} className="rounded-b-lg border border-t-0 border-[#d7dfed] bg-white p-1.5 shadow-[0_5px_12px_rgba(17,32,65,0.12)]">
      {filtered.map((option, index) => { const Icon = option.icon; return <button id={`${id}-${option.id}`} role="option" aria-selected={selected?.id === option.id || custom && option.id === 'outro'} type="button" tabIndex={-1} key={option.id} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => pick(option)} className={`flex min-h-11 w-full cursor-pointer items-center gap-7 rounded-md px-4 py-2 text-left text-base text-[#070e50] hover:bg-[#eaf4ff] ${active === index ? 'bg-[#eaf4ff]' : ''}`}><span className="inline-flex w-8 shrink-0 items-center justify-center"><Icon size={27} strokeWidth={1.8} aria-hidden="true" /></span><span>{option.label}</span></button>; })}
      {!filtered.length && <p role="status" className="px-4 py-3 text-sm text-[#6578ab]">{tr('motivo_sem_resultados', 'Nenhum motivo encontrado. Pesquise “Outro” para escrever um motivo personalizado.')}</p>}
    </div>}
    {custom && <label className="mt-3 block text-sm text-[#07104f]">{tr('motivo_personalizado', 'Escreva o motivo *')}<input ref={customInput} required maxLength={255} value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-[#ccd8ee] px-4 text-base outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" /></label>}
  </div>;
}
