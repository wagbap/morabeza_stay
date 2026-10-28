export function extrairFotosCarro(carro) {
  const url = item => {
    const raw = (typeof item === 'string' ? item : item?.caminho_url || item?.url || item?.imagem_url || item?.path || '').trim();
    if (!raw) return null;
    if (/^(https?:|blob:|data:image\/)/i.test(raw)) return raw;
    if (raw.startsWith('/') || raw.startsWith('uploads/') || raw.startsWith('api/')) {
      return `https://welovepalop.com/${raw.replace(/^\/+/, '')}`;
    }
    return `https://welovepalop.com/uploads/carros/${raw}`;
  };
  const lista = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return [];
  };
  const galeria = [...lista(carro?.imagens), ...lista(carro?.imagens_extra)]
    .sort((a, b) => Number(Boolean(b?.principal && b.principal !== '0')) - Number(Boolean(a?.principal && a.principal !== '0')) || Number(a?.ordem || 0) - Number(b?.ordem || 0));
  return [...new Set([
    carro?.imagem_principal, carro?.imagem_capa, carro?.imagem_url, ...galeria,
  ].map(url).filter(Boolean))];
}
