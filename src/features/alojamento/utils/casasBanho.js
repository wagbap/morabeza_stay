export function obterCasasBanho(valor, comodidades = []) {
  if (valor != null && String(valor).trim() !== '' && Number.isFinite(Number(valor)) && Number(valor) >= 0) {
    return Number(valor);
  }
  const quantidades = (Array.isArray(comodidades) ? comodidades : []).flatMap(item => {
    const nome = String(typeof item === 'string' ? item : item?.nome || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const match = nome.match(/^\s*(\d+)\s+casas?\s+de\s+banho\b/);
    return match ? [Number(match[1])] : [];
  });
  // Do not add duplicated amenities or infer a count from an unnumbered label.
  const unicas = [...new Set(quantidades)];
  return unicas.length === 1 ? unicas[0] : null;
}
