import React from 'react';
import { useTranslation } from 'react-i18next';

const indicativos = [['CV','238'],['PT','351'],['BR','55'],['AO','244'],['MZ','258'],['US','1'],['GB','44'],['FR','33'],['ES','34'],['DE','49'],['IT','39'],['NL','31'],['BE','32'],['CH','41'],['LU','352'],['SN','221'],['GW','245'],['ST','239'],['ZA','27']];

export default function CampoTelefoneInternacional({ value, onChange }) {
  const { t, i18n } = useTranslation();
  const display = new Intl.DisplayNames([i18n.resolvedLanguage === 'cv' ? 'pt' : (i18n.resolvedLanguage || 'pt')], { type: 'region' });
  const digits = String(value || '').replace(/\D/g, '');
  const match = String(value || '').trim().startsWith('+') ? [...indicativos].sort((a, b) => b[1].length - a[1].length).find(([, prefix]) => digits.startsWith(prefix)) : null;
  const selected = match?.[1] || '';
  return <div className="flex flex-col gap-2 sm:flex-row">
    <select aria-label={t('checkout_indicativo_pais', 'Indicativo do país')} value={selected} onChange={e => { const rest = match ? digits.slice(match[1].length) : digits; onChange(e.target.value ? `+${e.target.value}${rest}` : value); }} className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 sm:max-w-[45%]">
      <option value="">{t('checkout_selecionar_indicativo', 'Indicativo')}</option>
      {indicativos.map(([country, prefix]) => <option key={country} value={prefix}>{display.of(country)} (+{prefix})</option>)}
    </select>
    <input aria-label={t('telefone_whatsapp', 'Telefone / WhatsApp')} type="tel" inputMode="tel" autoComplete="tel" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20" placeholder="+238 991 23 45" />
  </div>;
}
