import React from 'react';
import { useTranslation } from 'react-i18next';
import useTaxaUsd from '../hooks/useTaxaUsd';

export default function ConversaoPreco({ valorCve, valorUsd, className = 'mt-0.5 text-[10px] text-[#64739e]' }) {
  const { t } = useTranslation();
  const rate = useTaxaUsd();
  const eur = (Number(valorCve) || 0) / 110.265;
  const usd = Number(valorUsd) > 0 ? Number(valorUsd) : eur * rate.usd;
  const format = value => value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <p className={className} title={t('card_conversao_estimativa', { date: rate.date })}>
    <span className="whitespace-nowrap">≈ {format(eur)} EUR</span>{' · '}<span className="whitespace-nowrap">{format(usd)} USD</span>
  </p>;
}
