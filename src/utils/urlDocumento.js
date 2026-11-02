export function urlDocumento(raw, apiBase, enviadoEm) {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  try {
    const base = new URL(apiBase);
    const value = raw.trim().replace(/^(https?):\/{3,}/i, '$1://');
    const url = new URL(value, `${base.origin}/`);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const timestamp = Date.parse(enviadoEm);
    if (Number.isFinite(timestamp)) url.searchParams.set('v', String(timestamp));
    return url.href;
  } catch { return ''; }
}
