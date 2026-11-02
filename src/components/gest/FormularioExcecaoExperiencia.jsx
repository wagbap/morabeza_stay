import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import MotivoFolgaLov from './MotivoFolgaLov';

export default function FormularioExcecaoExperiencia({ form, setForm, DateField, busy, onSubmit }) {
  const { t } = useTranslation();
  const tr = (key, text) => t(`agenda_experiencia_${key}`, text);
  const input = 'mt-1.5 min-h-11 w-full rounded-md border border-[#ccd8ee] bg-white px-4 py-2 text-base text-[#07104f] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600';
  return <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (form.motivo.trim()) onSubmit(); }}>
    <div className="grid grid-cols-2 gap-5">{[['inicio', tr('inicio', 'Início *')], ['fim', tr('fim', 'Fim *')]].map(([key, label]) => <label key={key} className="block text-base text-[#07104f]">{label}<DateField required value={form[key]} min={key === 'fim' ? form.inicio : undefined} onChange={event => setForm(old => ({ ...old, [key]: event.target.value }))} className={input} /></label>)}</div>
    <MotivoFolgaLov value={form.motivo} onChange={motivo => setForm(old => ({ ...old, motivo }))} />
    <label className="block text-base text-[#07104f]">{tr('estado', 'Estado')}<select className={input} value={form.tipo} onChange={event => setForm(old => ({ ...old, tipo: event.target.value }))}><option value="fechado">{tr('fechado', 'Fechado')}</option><option value="aberto">{tr('aberto', 'Aberto')}</option></select></label>
    <p className="flex items-center gap-2 text-sm text-[#6578ab]"><span className="inline-flex shrink-0"><Info size={18} strokeWidth={1.8} /></span>{tr('motivo_outro_ajuda', 'Ao selecionar “Outro”, pode escrever o motivo.')}</p>
    <button type="submit" disabled={busy} className="cursor-pointer rounded-md border border-blue-800 bg-[#123b9e] px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">{tr('rever', 'Rever alterações')}</button>
  </form>;
}
