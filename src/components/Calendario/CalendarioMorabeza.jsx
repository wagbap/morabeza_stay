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
  bloqueiosQuartoOcupacao = [],
  datasReservadas = [],
  totalQuartos = 0,
  permitirCheckoutEmBloqueado = true,
  ...rest
}) => {
  const hojeMeiaNoite = new Date();
  hojeMeiaNoite.setHours(0, 0, 0, 0);

  const minDateEfetiva = minDate ?? hojeMeiaNoite;

  // ------------------------------------------------------------
  // Datas bloqueadas efetivas
  // ------------------------------------------------------------
  const datasBloqueadasEfetivas = useMemo(() => {
    const conjunto = new Set();

    // Mapa legado por tipoQuartoId
    if (tipoQuartoId != null && datasBloqueadasPorQuarto) {
      const chave = String(tipoQuartoId);
      const especificas = datasBloqueadasPorQuarto[chave] || [];
      especificas.forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    // Lista normalizada de ocupações
    if (Array.isArray(bloqueiosQuartoOcupacao) && bloqueiosQuartoOcupacao.length > 0) {
      const quartosPorData = {};
      const globais = new Set();

      bloqueiosQuartoOcupacao.forEach((b) => {
        const iso = paraISO(b?.data);
        if (!iso) return;
        const qid = b?.quarto_id;

        // ✅ Em modo por-quarto, bloqueios sem quarto_id NÃO bloqueiam tudo
        if (qid == null || Number(qid) === 0) {
          if (tipoQuartoId == null) globais.add(iso);
          return;
        }

        const n = Number(qid);
        if (!quartosPorData[iso]) quartosPorData[iso] = new Set();
        quartosPorData[iso].add(n);

        if (tipoQuartoId != null && n === Number(tipoQuartoId)) {
          conjunto.add(iso);
        }
      });

      globais.forEach((iso) => conjunto.add(iso));

      // Se TODOS os quartos físicos estiverem ocupados, o dia fica bloqueado
      if (totalQuartos > 0) {
        Object.entries(quartosPorData).forEach(([iso, set]) => {
          if (set.size >= totalQuartos) conjunto.add(iso);
        });
      }
    }

    // Reservas reais
    if (Array.isArray(datasReservadas)) {
      datasReservadas.forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    // Fallback antigo (modo inteiro)
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

  // ------------------------------------------------------------
  // Exclude dinâmico
  // ------------------------------------------------------------
  const excludeDatesParaPicker = useMemo(() => {
    const paraDate = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    if (selectsRange && startDate && !endDate && permitirCheckoutEmBloqueado) {
      const isoStart = paraISO(startDate);
      return datasBloqueadasEfetivas
        .filter((iso) => iso < isoStart)
        .map(paraDate);
    }

    return datasBloqueadasEfetivas.map(paraDate);
  }, [datasBloqueadasEfetivas, selectsRange, startDate, endDate, permitirCheckoutEmBloqueado]);

  // ------------------------------------------------------------
  // onChange com validação
  // ------------------------------------------------------------
  const handleChangeInterno = (update) => {
    if (Array.isArray(update)) {
      const [start, end] = update;

      // Rejeita apenas check-in em dia bloqueado
      if (start && !end) {
        const isoStart = paraISO(start);
        if (isoStart && datasBloqueadasEfetivas.includes(isoStart)) {
          return;
        }
      }

      onChange(update);
    } else {
      if (update) {
        const iso = paraISO(update);
        if (iso && datasBloqueadasEfetivas.includes(iso)) {
          return;
        }
      }
      onChange(update);
    }
  };

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
        onChange={handleChangeInterno}
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