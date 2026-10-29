import React from 'react';
import { useTranslation } from 'react-i18next';
import CalendarioMorabeza from './CalendarioMorabeza';
import { dataLocalDeISO, dataLocalParaISO } from './dataLocal';

/** Date-only field compatible with the existing controlled form handlers. */
export default function CampoDataMorabeza({ value = '', onChange, min, max, name, className = '', ...props }) {
  const { t } = useTranslation();
  return (
    <CalendarioMorabeza
      {...props}
      inline={false}
      selected={dataLocalDeISO(value)}
      minDate={dataLocalDeISO(min)}
      maxDate={dataLocalDeISO(max)}
      name={name}
      onChange={date => {
        const target = { name, value: dataLocalParaISO(date), type: 'date' };
        onChange?.({ target, currentTarget: target });
      }}
      className={`text-base sm:text-sm ${className}`}
      containerClassName="morabeza-date-field min-w-0 flex-1"
      wrapperClassName="morabeza-date-input-wrapper"
      popperClassName="morabeza-calendar-popper"
      portalId="morabeza-date-popovers"
      autoComplete="off"
      dateFormat="dd/MM/yyyy"
      placeholderText={props.placeholder || t('calendario_formato_data')}
      clearButtonTitle={t('calendario_limpar_data')}
      ariaLabelClose={t('calendario_limpar_data')}
      strictParsing
      isClearable={!props.required && !props.disabled}
    />
  );
}
