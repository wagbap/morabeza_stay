export function normalizarComprovativoRepasseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('UPLOAD_URL_INVALID');
  const raw = value.trim().replace(/^(https?):\/{3,}/i, '$1://');
  if (!/^https?:\/\//i.test(raw) && !/^\/?(?:api\/)?uploads\//.test(raw)) throw new Error('UPLOAD_URL_INVALID');
  const url = new URL(raw, 'https://welovepalop.com/');
  if (!['http:', 'https:'].includes(url.protocol)
    || !['welovepalop.com', 'www.welovepalop.com'].includes(url.hostname)
    || !/^\/(?:api\/)?uploads\/.+/.test(url.pathname)
    || url.username || url.password || url.port) throw new Error('UPLOAD_URL_INVALID');
  url.protocol = 'https:';
  url.hash = '';
  return url.href;
}
