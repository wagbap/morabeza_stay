export function extrairFotosCarro(carro) {
  const url = item => {
    const value = typeof item === 'string' ? item : item?.caminho_url || item?.src || item?.url || item?.imagem_url || item?.foto_url || item?.caminho || item?.path;
    if (typeof value !== 'string') return null;
    const raw = value.trim().replace(/\\/g, '/');
    if (!raw || /^(null|undefined)$/i.test(raw)) return null;
    if (/^(https?:|blob:|data:image\/)/i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('/') || raw.startsWith('uploads/') || raw.startsWith('api/')) return `https://welovepalop.com/${raw.replace(/^\/+/, '')}`;
    return `https://welovepalop.com/uploads/carros/${raw}`;
  };
  const lista = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return [];
  };
  const principal = item => item?.principal === true || item?.principal === 1 || item?.principal === '1';
  const galeria = (carro?.galeria_fonte === 'carro_imagens' ? lista(carro.imagens) : [...lista(carro?.imagens), ...lista(carro?.photos), ...lista(carro?.fotos), ...lista(carro?.galeria), ...lista(carro?.imagens_extra)])
    .filter(item => ![0, '0', false].includes(item?.exibir_galeria))
    .sort((a, b) => Number(principal(b)) - Number(principal(a)) || Number(a?.ordem || 0) - Number(b?.ordem || 0));
  // Listing covers may contain a whole advert; never inject them into vehicle photos.
  return [...new Set(galeria.map(url).filter(Boolean))];
}
