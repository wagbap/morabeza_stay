// src/components/Calendario/CalendarioMorabeza.jsx
import { useTranslation } from 'react-i18next';
import { periodoSemBloqueios } from './validarPeriodo';
import React, { useMemo, useRef } from 'react';
import AcoesCalendario from './AcoesCalendario';
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
  onLimpar,
  onFechar,
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
  dayClassName: dayClassNameExterna,
  containerClassName = '',
  estado = 'ready',
  onTentarNovamente,
  ...rest
}) => {
  const { t } = useTranslation();
  const picker = useRef(null);
  const indisponivel = estado !== 'ready' || rest.disabled || rest.readOnly;
  const hojeMeiaNoite = new Date();
  hojeMeiaNoite.setHours(0, 0, 0, 0);

  const minDateEfetiva = minDate === undefined ? hojeMeiaNoite : minDate;

  // ------------------------------------------------------------
  // Datas bloqueadas efetivas
  // ------------------------------------------------------------
  const datasBloqueadasEfetivas = useMemo(() => {
    const conjunto = new Set();

    // 1) excludeDates diretas (caminho preferido — vem já filtrado do pai)
    (excludeDates || []).forEach((d) => {
      const iso = paraISO(d);
      if (iso) conjunto.add(iso);
    });

    // 2) Mapa legado por tipoQuartoId
    if (tipoQuartoId != null && datasBloqueadasPorQuarto) {
      const chave = String(tipoQuartoId);
      const especificas = datasBloqueadasPorQuarto[chave] || [];
      especificas.forEach((d) => {
        const iso = paraISO(d);
        if (iso) conjunto.add(iso);
      });
    }

    // 3) Lista normalizada de ocupações (bloqueios + reservas)
    if (Array.isArray(bloqueiosQuartoOcupacao) && bloqueiosQuartoOcupacao.length > 0) {
      const quartosPorData = {};
      const globais = new Set();

      bloqueiosQuartoOcupacao.forEach((b) => {
        const iso = paraISO(b?.data);
        if (!iso) return;
        const qid = b?.quarto_id;

        // Bloqueio sem quarto_id → global
        if (qid == null || Number(qid) === 0) {
          globais.add(iso);
          return;
        }

        const n = Number(qid);
        if (!quartosPorData[iso]) quartosPorData[iso] = new Set();
        quartosPorData[iso].add(n);
      });

      // Globais só bloqueiam quando não há filtro por tipo
      if (tipoQuartoId == null) {
        globais.forEach((iso) => conjunto.add(iso));
      }

      // Se todos os quartos físicos estiverem ocupados → dia bloqueado
      if (totalQuartos > 0) {
        Object.entries(quartosPorData).forEach(([iso, set]) => {
          if (set.size >= totalQuartos) conjunto.add(iso);
        });
      }
    }

    // 4) Reservas reais
    if (Array.isArray(datasReservadas)) {
      datasReservadas.forEach((d) => {
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
    if (minDateEfetiva && d.getTime() < new Date(minDateEfetiva).setHours(0, 0, 0, 0)) return 'morabeza-dia-passado';

    if (!filtrarData(date)) {
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
  const filtrarData = date => {
    if (indisponivel || (rest.filterDate && !rest.filterDate(date))) return false;
    if (selectsRange && startDate && !endDate && date > startDate) {
      return periodoSemBloqueios(startDate, date, datasBloqueadasEfetivas, permitirCheckoutEmBloqueado);
    }
    return !datasBloqueadasEfetivas.includes(paraISO(date));
  };

  const handleChangeInterno = (update) => {
    const datas = Array.isArray(update) ? update : [update];
    if (indisponivel) return;
    if (datas.some(date => {
      if (!date) return false;
      const dia = new Date(date).setHours(0, 0, 0, 0);
      return !Number.isFinite(dia)
        || (minDateEfetiva && dia < new Date(minDateEfetiva).setHours(0, 0, 0, 0))
        || (maxDate && dia > new Date(maxDate).setHours(0, 0, 0, 0))
        || (rest.filterDate && date === datas.filter(Boolean).at(-1) && !rest.filterDate(date));
    })) return;

    if (Array.isArray(update)) {
      const [start, end] = update;
      if (!periodoSemBloqueios(start, end, datasBloqueadasEfetivas, permitirCheckoutEmBloqueado)) return;

      // Rejeita check-in em dia bloqueado
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
    <div className={`morabeza-calendar-wrapper ${containerClassName}`}>
      {estado !== 'ready' && <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-gray-600" role={estado === 'error' ? 'alert' : 'status'}>
        <p>{estado === 'error' ? t('calendario_erro_disponibilidade', 'Não foi possível carregar a disponibilidade.') : t('calendario_carregar_disponibilidade', 'A carregar disponibilidade…')}</p>
        {estado === 'error' && onTentarNovamente && <button type="button" onClick={onTentarNovamente} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700">{t('calendario_tentar_novamente', 'Tentar novamente')}</button>}
      </div>}
      <DatePicker
        {...rest}
        ref={picker}
        inline={inline}
        locale={locale}
        selectsRange={selectsRange}
        selected={!selectsRange ? selected : undefined}
        startDate={selectsRange ? startDate : undefined}
        endDate={selectsRange ? endDate : undefined}
        onChange={handleChangeInterno}
        excludeDates={excludeDatesParaPicker}
        filterDate={filtrarData}
        minDate={minDateEfetiva}
        maxDate={maxDate}
        monthsShown={monthsShown}
        dateFormat={dateFormat || 'dd/MM/yyyy'}
        dayClassName={(date) => [dayClassName(date), dayClassNameExterna?.(date)].filter(Boolean).join(' ')}
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
      >
        {rest.children}
        <AcoesCalendario
          disabled={indisponivel}
          onLimpar={() => onLimpar ? onLimpar() : handleChangeInterno(selectsRange ? [null, null] : null)}
          onFechar={() => { picker.current?.setOpen(false); onFechar?.(); }}
        />
      </DatePicker>
    </div>
  );
};

export default CalendarioMorabeza;
