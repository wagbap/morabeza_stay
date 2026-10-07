// src/components/Calendario/CalendarioMorabeza.jsx
import React, { useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { pt } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './calendario-morabeza.css';

registerLocale('pt', pt);
registerLocale('pt-PT', pt);

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatarMes = (date) => {
  if (!date || typeof date.getMonth !== 'function') return '';
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
};

const formatarDiaSemana = (dayName) => {
  const mapa = {
    'dom': 'dom', 'seg': 'seg', 'ter': 'ter', 'qua': 'qua',
    'qui': 'qui', 'sex': 'sex', 'sáb': 'sáb', 'sab': 'sáb',
  };
  const clean = String(dayName).toLowerCase().replace('.', '').trim().slice(0, 3);
  return mapa[clean] || clean;
};

// ============================================================
// Normalizar data para "YYYY-MM-DD"
// ============================================================
const paraISO = (d) => {
  if (!d) return null;
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.substring(0, 10);
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return null;
    return paraISO(parsed);
  }
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  return null;
};

const CalendarioMorabeza = ({
  inline = true,
  selected,
  onChange,
  startDate,
  endDate,
  selectsRange = false,
  excludeDates = [],
  minDate,
  maxDate,
  monthsShown = 1,
  locale = 'pt',
  dateFormat,
  tipoQuartoId = null,
  datasBloqueadasPorQuarto = {},
  // 🔑 Lista normalizada de bloqueios da BD
  //    [{ quarto_id, data (YYYY-MM-DD) }, ...]
  //    - quarto_id = 0  ou null → bloqueio GLOBAL
  //    - quarto_id > 0           → bloqueio apenas desse quarto
  bloqueiosQuartoOcupacao = [],
  // 🔑 Datas com reservas reais (bloqueiam sempre)
  datasReservadas = [],
  // 🔑 Total de quartos do alojamento
  totalQuartos = 0,
  ...rest
}) => {
  const hojeMeiaNoite = new Date();
  hojeMeiaNoite.setHours(0, 0, 0, 0);

  const minDateEfetiva = minDate ?? hojeMeiaNoite;

  // ============================================================
  // 🔥 CALCULAR DATAS BLOQUEADAS (misturado: por quarto + global)
  //
  // Regras:
  //  1) `datasBloqueadasPorQuarto[tipoQuartoId]` (formato antigo)
  //  2) `bloqueiosQuartoOcupacao` (novo):
  //       - quarto_id = 0 / null → bloqueio GLOBAL (sempre)
  //       - quarto_id = tipoQuartoId → bloqueia este quarto
  //       - quarto_id > 0 (outro): só bloqueia se TODOS os
  //         quartos estiverem bloqueados nesse dia
  //  3) `datasReservadas` → bloqueiam SEMPRE
  //  4) `excludeDates` → só como fallback (sem tipoQuartoId)
  // ============================================================
  const datasBloqueadasEfetivas = useMemo(() => {
    const conjunto = new Set();

    // ----------------------------------------------------------
    // 1) Mapa antigo: datasBloqueadasPorQuarto[tipoQuartoId]
    // ----------------------------------------------------------
    if (tipoQuartoId != null && datasBloqueadasPorQuarto) {
      const chave = String(tipoQuartoId);
      const especificas = datasBloqueadasPorQuarto[chave] || [];
      especificas.forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    // ----------------------------------------------------------
    // 2) Lista normalizada de quarto_ocupacao
    // ----------------------------------------------------------
    if (Array.isArray(bloqueiosQuartoOcupacao) && bloqueiosQuartoOcupacao.length > 0) {
      const quartosPorData = {}; // { 'YYYY-MM-DD': Set(quarto_id) }
      const globais = new Set(); // datas com quarto_id = 0/null

      bloqueiosQuartoOcupacao.forEach((b) => {
        const iso = paraISO(b?.data);
        if (!iso) return;
        const qid = b?.quarto_id;

        // 🔑 Global (0, null, undefined)
        if (qid == null || Number(qid) === 0) {
          globais.add(iso);
          return;
        }

        const n = Number(qid);
        if (!quartosPorData[iso]) quartosPorData[iso] = new Set();
        quartosPorData[iso].add(n);

        // 🔑 Este é o quarto selecionado → bloqueia já
        if (tipoQuartoId != null && n === Number(tipoQuartoId)) {
          conjunto.add(iso);
        }
      });

      // Globais entram sempre
      globais.forEach((iso) => conjunto.add(iso));

      // 🔑 Se TODOS os quartos estiverem bloqueados → bloqueia também
      if (totalQuartos > 0) {
        Object.entries(quartosPorData).forEach(([iso, set]) => {
          if (set.size >= totalQuartos) conjunto.add(iso);
        });
      }
    }

    // ----------------------------------------------------------
    // 3) Reservas reais — bloqueiam sempre
    // ----------------------------------------------------------
    if (Array.isArray(datasReservadas)) {
      datasReservadas.forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    // ----------------------------------------------------------
    // 4) Fallback: excludeDates só se não houver tipoQuartoId
    // ----------------------------------------------------------
    if (tipoQuartoId == null) {
      (excludeDates || []).forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    return Array.from(conjunto);
  }, [
    excludeDates,
    tipoQuartoId,
    datasBloqueadasPorQuarto,
    bloqueiosQuartoOcupacao,
    datasReservadas,
    totalQuartos,
  ]);

  const dayClassName = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < hojeMeiaNoite) return 'morabeza-dia-passado';

    const iso = paraISO(d);
    if (datasBloqueadasEfetivas.includes(iso)) {
      return 'morabeza-dia-bloqueado';
    }
    return '';
  };

  const excludeDatesParaPicker = useMemo(() => {
    return datasBloqueadasEfetivas.map((iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    });
  }, [datasBloqueadasEfetivas]);

  return (
    <div className="morabeza-calendar-wrapper">
      <DatePicker
        {...rest}
        inline={inline}
        locale={locale}
        selectsRange={selectsRange}
        selected={!selectsRange ? selected : undefined}
        startDate={selectsRange ? startDate : undefined}
        endDate={selectsRange ? endDate : undefined}
        onChange={onChange}
        excludeDates={excludeDatesParaPicker}
        minDate={minDateEfetiva}
        maxDate={maxDate}
        monthsShown={monthsShown}
        dateFormat={dateFormat || 'dd/MM/yyyy'}
        dayClassName={dayClassName}
        calendarClassName="morabeza-calendar-inline morabeza-calendar-compact"
        formatWeekDay={formatarDiaSemana}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="morabeza-custom-header">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="morabeza-nav-btn"
              aria-label="Mês anterior"
            >
              ‹
            </button>
            <span className="morabeza-month-label">{formatarMes(date)}</span>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="morabeza-nav-btn"
              aria-label="Mês seguinte"
            >
              ›
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default CalendarioMorabeza;