export function janelasCarro(dados = {}) {
  const inicio = dados.levantamento_hora_inicio?.slice(0, 5);
  const fim = dados.levantamento_hora_fim?.slice(0, 5);
  const mesmo = Number(dados.devolucao_mesmo_horario ?? 1) === 1;
  return { levantamento: [inicio, fim], devolucao: mesmo ? [inicio, fim] : [dados.devolucao_hora_inicio?.slice(0, 5), dados.devolucao_hora_fim?.slice(0, 5)] };
}
export function horaNaJanela(hora, janela) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora || '') && Boolean(janela?.[0] && janela?.[1]) && hora >= janela[0] && hora <= janela[1];
}
