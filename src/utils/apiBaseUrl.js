export function normalizarApiBaseUrl(value) {
  const base = typeof value === 'string' && value.trim() ? value.trim().replace(/\/+$/, '') : 'https://welovepalop.com/api';
  return /\/api$/i.test(base) ? base : `${base}/api`;
}
