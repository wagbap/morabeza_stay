// Empty session overrides retain the existing fixed/seasonal price. Zero is valid.
export function precoDaSessao(sessao, precoNormal) {
  const valor = sessao?.preco_especial;
  if (valor === null || valor === undefined || String(valor).trim() === '') return Number(precoNormal) || 0;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : Number(precoNormal) || 0;
}

export function totalExperiencia(preco, participantes, modelo, unidades = 1) {
  const quantidade = modelo === 'grupo_privado' ? 1 : modelo === 'por_equipamento' ? Number(unidades) || 1 : Number(participantes) || 1;
  return Math.round(Number(preco) * quantidade * 100) / 100;
}

export function minutosDaSessao(sessao) {
  const minutos = value => {
    const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(String(value || ''));
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };
  const inicio = minutos(sessao?.hora_inicio), fim = minutos(sessao?.hora_fim);
  return inicio !== null && fim !== null && fim > inicio ? fim - inicio : null;
}
