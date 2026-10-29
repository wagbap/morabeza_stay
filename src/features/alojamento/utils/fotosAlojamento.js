export function extrairFotosAlojamento(alojamento) {
  const normalizar = item => {
    const value = typeof item === 'string' ? item : item?.caminho_url || item?.url || item?.imagem_url || item?.src || item?.path || item?.caminho;
    if (typeof value !== 'string') return null;
    const raw = value.trim().replace(/\\/g, '/');
    if (!raw || /^(null|undefined|false)$/i.test(raw)) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;
    if (raw.startsWith('/') || /^(uploads|api)\//i.test(raw)) return `https://welovepalop.com/${raw.replace(/^\/+/, '')}`;
    return `https://welovepalop.com/api/uploads/${raw}`;
  };
  const lista = value => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  };
  return [...new Set([alojamento.imagem_url, ...lista(alojamento.imagens_extra), ...lista(alojamento.imagens), ...lista(alojamento.fotos)].map(normalizar).filter(Boolean))];
}
