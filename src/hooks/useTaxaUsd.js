import { useSyncExternalStore } from 'react';
import api from '../api/api';

// Last verified reference, refreshed from the provider and cached for one day.
const reference = { usd: 1.1133, date: '2026-10-28', fetchedAt: 0 };
const key = 'morabeza_cambio_eur_usd';
let snapshot = reference;
try {
  const stored = JSON.parse(localStorage.getItem(key));
  if (Number.isFinite(stored?.usd) && stored.usd > 0 && typeof stored.date === 'string') snapshot = stored;
} catch { /* Reference remains available when storage is blocked. */ }
let request = null;
const listeners = new Set();
function subscribe(listener) {
  listeners.add(listener);
  if (!request && Date.now() - (snapshot.fetchedAt || 0) > 86400000) {
    request = api.get('https://api.frankfurter.dev/v1/latest', {
      params: { base: 'EUR', symbols: 'USD' }, timeout: 10000,
      headers: { 'Content-Type': undefined },
    }).then(({ data }) => {
      if (!Number.isFinite(data?.rates?.USD) || data.rates.USD <= 0 || data.base !== 'EUR') return;
      snapshot = { usd: data.rates.USD, date: data.date, fetchedAt: Date.now() };
      try { localStorage.setItem(key, JSON.stringify(snapshot)); } catch { /* Storage is optional. */ }
      listeners.forEach(notify => notify());
    }).catch(() => { /* Keep the dated reference; never hide or invent a conversion. */ });
  }
  return () => listeners.delete(listener);
}
export default function useTaxaUsd() {
  return useSyncExternalStore(subscribe, () => snapshot, () => reference);
}
