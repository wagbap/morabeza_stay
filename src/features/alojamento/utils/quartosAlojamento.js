export function obterQuartosAlojamento(alojamento) {
  for (const valor of [alojamento.numero_quartos, alojamento.quartos]) {
    if (typeof valor !== 'number' && typeof valor !== 'string') continue;
    if (String(valor).trim() !== '' && Number.isInteger(Number(valor)) && Number(valor) >= 0) return Number(valor);
  }
  const comodidades = Array.isArray(alojamento.comodidades) ? alojamento.comodidades : [];
  const quantidades = comodidades.flatMap(item => {
    const nome = typeof item === 'string' ? item : item?.nome || '';
    const match = nome.match(/^\s*(\d+)\s+quartos?\b/i);
    return match ? [Number(match[1])] : [];
  });
  const unicas = [...new Set(quantidades)];
  return unicas.length === 1 ? unicas[0] : null;
}

export function completarDadosCardAlojamento(destaques, catalogo) {
  if (!Array.isArray(catalogo)) return destaques;
  const porId = new Map(catalogo.map(item => [String(item.id), item]));
  const campos = ['numero_quartos', 'quartos', 'casas_banho', 'comodidades', 'capacidade_efetiva', 'total_avaliacoes'];
  return destaques.map(item => {
    const origem = porId.get(String(item.id));
    if (!origem) return item;
    const resultado = { ...item };
    for (const campo of campos) {
      if (origem[campo] != null) resultado[campo] = origem[campo];
    }
    return resultado;
  });
}
