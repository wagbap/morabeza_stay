// src/features/alojamento/components/BannerDisponibilidade.jsx
// ============================================================
// 🎨 Banner — feedback visual de disponibilidade
// ============================================================
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const CORES = {
  sem_stock:      { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    icon: 'text-red-600' },
  hold_falhou:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    icon: 'text-red-600' },
  erro_rede:      { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800',  icon: 'text-amber-600' },
  erro_validacao: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800',  icon: 'text-amber-600' },
};

const TITULOS = {
  sem_stock:      'Sem disponibilidade',
  hold_falhou:    'Não foi possível reservar o stock',
  erro_rede:      'Erro de ligação',
  erro_validacao: 'Erro de validação',
};

export function BannerDisponibilidade({
  erro,
  onClose,
  onVoltar,
  showVoltar = false,
}) {
  if (!erro) return null;

  const cor = CORES[erro.tipo] || CORES.sem_stock;
  const titulo = TITULOS[erro.tipo] || 'Erro';

  return (
    <div className={`mb-6 p-4 ${cor.bg} border ${cor.border} rounded-xl flex items-start gap-3`}>
      <AlertCircle className={`${cor.icon} shrink-0 mt-0.5`} size={20} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${cor.text}`}>{titulo}</p>
        <p className={`text-xs ${cor.text} mt-1 opacity-90`}>{erro.mensagem}</p>
      </div>
      {showVoltar && onVoltar && (
        <button
          onClick={onVoltar}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-lg shrink-0 transition"
        >
          Voltar
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg shrink-0 transition"
          aria-label="Fechar"
        >
          <X size={14} className={cor.text} />
        </button>
      )}
    </div>
  );
}

export default BannerDisponibilidade;