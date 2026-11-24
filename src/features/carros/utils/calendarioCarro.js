import { dataLocalCarro } from './disponibilidadeCarro.js';
export function podeSelecionarDataCarro(calendario, data, inicio, fim) {
  if (calendario.estado !== 'ready') return false;
  const iso = dataLocalCarro(data);
  const campo = inicio && !fim && iso > dataLocalCarro(inicio) ? 'devolucao' : 'levantamento';
  return calendario.dias[iso]?.[campo] === true;
}
