// src/features/alojamento/components/SidebarReserva.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Star, Users, Calendar, ChevronDown, ChevronUp,
  Trash2, Loader2, AlertCircle, Info, ShieldCheck
} from 'lucide-react';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';

// ============================================================
// HELPERS
// ============================================================
const paraISOLocal = (d) => {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const contarNoites = (start, end) => {
  if (!start || !end) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

// ============================================================
// COMPONENTE
// ============================================================
const SidebarReserva = ({
  carrinhoQuartos = [],
  estrelas = 4.5,
  datasBloqueadas = [],
  datasBloqueadasPorQuarto = {},
  // 🔑 NOVO: bloqueios normalizados vindos da BD
  //    [{ quarto_id, data }, ...]
  bloqueiosQuartoOcupacao = [],
  // 🔑 NOVO: datas reservadas (YYYY-MM-DD)
  datasReservadas = [],
  // 🔑 NOVO: total de quartos do alojamento
  totalQuartos = 0,
  onContinueToCheckout,
  onRemoveQuarto,
  onDatasChange,
  vendaPorQuarto = false,
  capacidadeBase = 2,
  validandoProp = false,
  datasIniciais = null,
  alojamentoId = null,
}) => {
  const { t } = useTranslation();

  // ============================================================
  // ESTADOS
  // ============================================================
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [numHospedes, setNumHospedes] = useState(1);
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [erroLocal, setErroLocal] = useState(null);

  // ============================================================
  // INICIALIZAR DATAS A PARTIR DAS DATAS INICIAIS (URL)
  // ============================================================
  useEffect(() => {
    if (datasIniciais?.checkIn && !rangeStart) {
      const [y, m, d] = String(datasIniciais.checkIn).split('-').map(Number);
      if (y && m && d) setRangeStart(new Date(y, m - 1, d));
    }
    if (datasIniciais?.checkOut && !rangeEnd) {
      const [y, m, d] = String(datasIniciais.checkOut).split('-').map(Number);
      if (y && m && d) setRangeEnd(new Date(y, m - 1, d));
    }
    if (datasIniciais?.adultos && !numHospedes) {
      setNumHospedes(Number(datasIniciais.adultos) || 1);
    }
  }, [datasIniciais]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // NOTIFICAR O PAI QUANDO AS DATAS MUDAM
  // ============================================================
  useEffect(() => {
    if (typeof onDatasChange === 'function') {
      onDatasChange({
        checkIn: rangeStart ? paraISOLocal(rangeStart) : null,
        checkOut: rangeEnd ? paraISOLocal(rangeEnd) : null,
      });
    }
  }, [rangeStart, rangeEnd, onDatasChange]);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const noites = useMemo(() => contarNoites(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const precoNoiteTotal = useMemo(() => {
    return carrinhoQuartos.reduce(
      (acc, q) => acc + Number(q.precoNoite || 0) * Number(q.quantidade || 1),
      0
    );
  }, [carrinhoQuartos]);

  const subtotal = useMemo(() => precoNoiteTotal * noites, [precoNoiteTotal, noites]);

  const capacidadeTotal = useMemo(() => {
    return carrinhoQuartos.reduce(
      (acc, q) => acc + Number(q.capacidade || 2) * Number(q.quantidade || 1),
      0
    );
  }, [carrinhoQuartos]);

  const temQuartos = carrinhoQuartos.length > 0;
  const datasValidas = rangeStart && rangeEnd && noites > 0;
  const podeReservar = temQuartos && datasValidas && !validandoProp;

  // ============================================================
  // HANDLER — MUDANÇA DE DATAS NO CALENDÁRIO
  // ============================================================
  const handleDatasChange = useCallback((update) => {
    if (Array.isArray(update)) {
      const [start, end] = update;
      setRangeStart(start || null);
      setRangeEnd(end || null);
    } else {
      setRangeStart(update || null);
      setRangeEnd(null);
    }
    setErroLocal(null);
  }, []);

  // ============================================================
  // HANDLER — CLICAR EM "RESERVAR"
  // ============================================================
  const handleReservarClick = useCallback(async () => {
    setErroLocal(null);

    if (!temQuartos) {
      setErroLocal('Seleciona pelo menos um quarto.');
      return;
    }
    if (!rangeStart || !rangeEnd) {
      setErroLocal('Seleciona as datas de check-in e check-out.');
      return;
    }
    if (noites <= 0) {
      setErroLocal('A data de check-out tem de ser posterior ao check-in.');
      return;
    }
    if (numHospedes > capacidadeTotal) {
      setErroLocal(`A capacidade máxima é ${capacidadeTotal} hóspedes.`);
      return;
    }

    const payload = {
      startDate: rangeStart,
      endDate: rangeEnd,
      numHospedes,
      noites,
      subtotal,
    };

    console.log('[SidebarReserva] A chamar onContinueToCheckout com:', payload);

    if (typeof onContinueToCheckout === 'function') {
      await onContinueToCheckout(payload);
    }
  }, [
    temQuartos, rangeStart, rangeEnd, noites, numHospedes,
    capacidadeTotal, subtotal, onContinueToCheckout,
  ]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      {/* PREÇO + ESTRELAS */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-900">
              {precoNoiteTotal > 0 ? `${precoNoiteTotal} CVE` : '— CVE'}
            </span>
            <span className="text-sm text-slate-500 ml-1">/ noite</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="font-semibold">{estrelas}</span>
          </div>
        </div>
        {vendaPorQuarto && (
          <p className="text-[10px] text-slate-400 mt-1">
            {carrinhoQuartos.length} {carrinhoQuartos.length === 1 ? 'quarto' : 'quartos'} selecionado(s)
          </p>
        )}
      </div>

      {/* CALENDÁRIO */}
      <div className="border-b border-slate-100">
        <button
          type="button"
          onClick={() => setMostrarCalendario((v) => !v)}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar size={16} />
            {rangeStart && rangeEnd
              ? `${paraISOLocal(rangeStart)} → ${paraISOLocal(rangeEnd)} (${noites} ${noites === 1 ? 'noite' : 'noites'})`
              : rangeStart
                ? `${paraISOLocal(rangeStart)} → escolhe check-out`
                : 'Escolhe as datas'}
          </div>
          {mostrarCalendario ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {mostrarCalendario && (
          <div className="px-3 pb-3">
            <CalendarioMorabeza
              inline
              selectsRange
              startDate={rangeStart}
              endDate={rangeEnd}
              onChange={handleDatasChange}
              minDate={new Date()}
              monthsShown={1}
              excludeDates={datasBloqueadas || []}
              tipoQuartoId={carrinhoQuartos[0]?.tipoQuartoId ?? null}
              datasBloqueadasPorQuarto={datasBloqueadasPorQuarto || {}}
              bloqueiosQuartoOcupacao={bloqueiosQuartoOcupacao || []}
              datasReservadas={datasReservadas || []}
              totalQuartos={totalQuartos || 0}
            />
          </div>
        )}
      </div>

      {/* HÓSPEDES */}
      <div className="px-5 py-4 border-b border-slate-100">
        <label className="text-xs font-bold text-slate-600 mb-2 block">
          Hóspedes
        </label>
        <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            <span className="text-sm text-slate-700">
              {numHospedes} {numHospedes === 1 ? 'hóspede' : 'hóspedes'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNumHospedes((n) => Math.max(1, n - 1))}
              className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setNumHospedes((n) => Math.min(capacidadeTotal || 10, n + 1))}
              className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
            >
              +
            </button>
          </div>
        </div>
        {capacidadeTotal > 0 && (
          <p className="text-[10px] text-slate-400 mt-1">
            Capacidade máxima: {capacidadeTotal}
          </p>
        )}
      </div>

      {/* CARRINHO DE QUARTOS */}
      {vendaPorQuarto && carrinhoQuartos.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-600">Quartos selecionados</p>
          {carrinhoQuartos.map((q, i) => (
            <div key={`${q.tipoQuartoId}-${i}`} className="flex items-center gap-3">
              {q.imagem && (
                <img
                  src={q.imagem}
                  alt={q.nome}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {q.nome}
                </p>
                <p className="text-[10px] text-slate-500">
                  {q.quantidade} × {q.precoNoite} CVE
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveQuarto?.(q.tipoQuartoId)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remover quarto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RESUMO DE PREÇO */}
      {noites > 0 && subtotal > 0 && (
        <div className="px-5 py-4 border-b border-slate-100 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{precoNoiteTotal} CVE × {noites} {noites === 1 ? 'noite' : 'noites'}</span>
            <span>{subtotal} CVE</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>{subtotal} CVE</span>
          </div>
        </div>
      )}

      {/* MENSAGENS DE ERRO */}
      {(erroLocal) && (
        <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">{erroLocal}</p>
        </div>
      )}

      {/* BOTÃO RESERVAR */}
      <div className="p-5">
        <button
          type="button"
          onClick={handleReservarClick}
          disabled={!podeReservar}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            podeReservar
              ? 'bg-blue-900 hover:bg-blue-950 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {validandoProp ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              A validar...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Reservar
            </>
          )}
        </button>

        {!temQuartos && (
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Seleciona um quarto acima
          </p>
        )}
        {temQuartos && !datasValidas && (
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Escolhe datas válidas no calendário
          </p>
        )}

        <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-400">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>
            Não serás cobrado agora. O anfitrião confirma a reserva antes do pagamento.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarReserva;