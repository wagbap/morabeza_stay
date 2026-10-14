// src/components/gest/ModalStock.jsx
import React, { useEffect } from 'react';
import { X, Bed, Loader2, Calendar as CalendarIcon } from 'lucide-react';

export default function ModalStock({
  isOpen,
  onClose,
  stocks = [],
  carregando = false,
  mesLabel = '',
  tipoAtivoId = null,
  onEscolherTipo = null,
}) {
  const quantidade = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalGeral = stocks.reduce(
    (acc, s) => ({
      total: acc.total + quantidade(s.quantidade_total),
      disponivel: acc.disponivel + quantidade(s.quantidade_disponivel),
      reservado: acc.reservado + quantidade(s.quantidade_reservada),
      bloqueado: acc.bloqueado + quantidade(s.quantidade_bloqueada),
    }),
    { total: 0, disponivel: 0, reservado: 0, bloqueado: 0 }
  );

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header azul bold */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-5 py-5 text-white shrink-0">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg">
                <Bed size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight">Stock de Quartos</h3>
                <p className="text-[11px] text-blue-100 font-semibold flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon size={11} />
                  {mesLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/15 transition shrink-0"
              aria-label="Fechar"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Big stats totais */}
          {!carregando && stocks.length > 0 && (
            <div className="relative grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2.5 border border-white/20">
                <div className="text-2xl font-black leading-none tabular-nums">{totalGeral.disponivel}</div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-blue-100 mt-1">Livres</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2.5 border border-white/20">
                <div className="text-2xl font-black leading-none tabular-nums">{totalGeral.reservado}</div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-blue-100 mt-1">Reserv.</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2.5 border border-white/20">
                <div className="text-2xl font-black leading-none tabular-nums">{totalGeral.bloqueado}</div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-blue-100 mt-1">Bloq.</div>
              </div>
            </div>
          )}
        </div>

        {/* Body scrollável */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <span className="text-sm font-semibold">A calcular stock...</span>
            </div>
          ) : stocks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bed size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Sem stock configurado.</p>
            </div>
          ) : (
            stocks.map((s) => {
              const total = quantidade(s.quantidade_total);
              const disp = quantidade(s.quantidade_disponivel);
              const res = quantidade(s.quantidade_reservada);
              const bloq = quantidade(s.quantidade_bloqueada);
              const pctD = total > 0 ? (disp / total) * 100 : 0;
              const pctR = total > 0 ? (res / total) * 100 : 0;
              const pctB = total > 0 ? (bloq / total) * 100 : 0;
              const isAtivo = Number(s.tipo_quarto_id) === Number(tipoAtivoId);

              return (
                <button
                  key={s.tipo_quarto_id}
                  type="button"
                  onClick={() => onEscolherTipo && onEscolherTipo(s.tipo_quarto_id)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    isAtivo
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-md shadow-blue-500/10'
                      : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  {/* Header do card */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isAtivo
                            ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Bed size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0f172a] truncate flex items-center gap-1.5">
                          {s.nome}
                          {isAtivo && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-black">
                              Ativo
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                          {total} quarto{total !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-2xl font-black tabular-nums leading-none ${
                          disp > 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {disp}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                        livres
                      </div>
                    </div>
                  </div>

                  {/* Barra segmentada */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
                    {disp > 0 && (
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                        style={{ width: `${pctD}%` }}
                      />
                    )}
                    {res > 0 && (
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        style={{ width: `${pctR}%` }}
                      />
                    )}
                    {bloq > 0 && (
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500"
                        style={{ width: `${pctB}%` }}
                      />
                    )}
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-700 tabular-nums">{disp}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600/70">
                        Livres
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px] font-bold text-blue-700 tabular-nums">{res}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-blue-600/70">
                        Reserv.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-[10px] font-bold text-red-700 tabular-nums">{bloq}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-red-600/70">
                        Bloq.
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-black rounded-xl transition shadow-md shadow-blue-600/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
