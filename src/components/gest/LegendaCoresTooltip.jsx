// src/components/gest/LegendaCoresTooltip.jsx
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

const ITENS = [
  {
    cor: 'bg-[#dcfce7] border-[#bbf7d0]',
    texto: 'text-[#16a34a]',
    label: 'Disponível',
    descricao: 'Sem reservas nem bloqueios. Podes clicar para bloquear.',
  },
  {
    cor: 'bg-[#fee2e2] border-[#fecaca]',
    texto: 'text-[#dc2626]',
    label: 'Bloqueado',
    descricao: 'Já bloqueado (global, do quarto ativo, ou geral). Clica para desbloquear.',
  },
  {
    cor: 'bg-[#fef3c7] border-[#fde68a]',
    texto: 'text-[#d97706]',
    label: 'Parcial',
    descricao: 'Outros quartos estão bloqueados neste dia, mas o quarto ativo não. Clica para bloquear também.',
  },
  {
    cor: 'bg-[#dbeafe] border-[#bfdbfe]',
    texto: 'text-[#1d4ed8]',
    label: 'Reservado',
    descricao: 'Tem reserva ativa. Não é clicável — cancela a reserva para libertar.',
  },
  {
    cor: 'bg-gray-100 border-gray-200',
    texto: 'text-gray-300',
    label: 'Passado',
    descricao: 'Data já passou. Não é clicável.',
  },
];

export default function LegendaCoresTooltip({ className = '' }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setAberto(false); };
    if (aberto) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [aberto]);

  return (
    <div className={`relative inline-flex ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
          aberto
            ? 'bg-blue-900 text-white border-blue-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
        }`}
        aria-label="Legenda de cores"
        title="Legenda de cores"
      >
        {aberto ? <X size={16} /> : <HelpCircle size={16} />}
      </button>

      {aberto && (
        <div className="absolute z-50 top-11 left-0 sm:left-auto sm:right-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Legenda de cores
          </p>
          <ul className="space-y-2">
            {ITENS.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={`shrink-0 w-4 h-4 mt-0.5 rounded border ${it.cor}`}
                />
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold ${it.texto}`}>{it.label}</p>
                  <p className="text-[10px] text-slate-500 leading-snug">{it.descricao}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}