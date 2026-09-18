// src/components/Calendario/CalendarioMorabeza.jsx
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { pt } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './calendario-morabeza.css';

// Registar pt uma só vez
registerLocale('pt', pt);
registerLocale('pt-PT', pt);

// Nomes pt-PT (date-fns pt é pt-BR em alguns casos)
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
// ou melhor: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

const formatarMes = (date) => {
  if (!date || typeof date.getMonth !== 'function') return '';
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
};

const formatarDiaSemana = (dayName) => {
  // date-fns pt devolve "dom.", "seg.", etc.
  const mapa = {
    'dom': 'dom', 'seg': 'seg', 'ter': 'ter', 'qua': 'qua',
    'qui': 'qui', 'sex': 'sex', 'sáb': 'sáb', 'sab': 'sáb',
  };
  const clean = String(dayName).toLowerCase().replace('.', '').trim().slice(0, 3);
  return mapa[clean] || clean;
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
  ...rest
}) => {
  const hojeMeiaNoite = new Date();
  hojeMeiaNoite.setHours(0, 0, 0, 0);

  const minDateEfetiva = minDate ?? hojeMeiaNoite;

  const dayClassName = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < hojeMeiaNoite) return 'morabeza-dia-passado';
    if (excludeDates.some((ex) => {
      const ed = new Date(ex);
      ed.setHours(0, 0, 0, 0);
      return ed.getTime() === d.getTime();
    })) {
      return 'morabeza-dia-bloqueado';
    }
    return '';
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
        onChange={onChange}
        excludeDates={excludeDates}
        minDate={minDateEfetiva}
        maxDate={maxDate}
        monthsShown={monthsShown}
        dateFormat={dateFormat || (selectsRange ? 'dd/MM/yyyy' : 'dd/MM/yyyy')}
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