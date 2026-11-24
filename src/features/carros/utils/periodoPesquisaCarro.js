import { dataLocalCarro } from './disponibilidadeCarro.js';

export function dataPesquisaCarro(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [ano, mes, dia] = value.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return Number.isFinite(data.getTime()) && dataLocalCarro(data) === value ? data : null;
}

export function periodoPesquisaCarro(search, hoje = new Date()) {
  const params = new URLSearchParams(search);
  const inicio = params.get('data_levantamento') || '';
  const fim = params.get('data_devolucao') || '';
  if (!dataPesquisaCarro(inicio) || !dataPesquisaCarro(fim) || inicio < dataLocalCarro(hoje) || fim <= inicio) return { inicio: '', fim: '' };
  return { inicio, fim };
}

export function pesquisaComPeriodoCarro(search, inicio, fim) {
  const params = new URLSearchParams(search);
  if (inicio) params.set('data_levantamento', dataLocalCarro(inicio));
  else params.delete('data_levantamento');
  if (fim) params.set('data_devolucao', dataLocalCarro(fim));
  else params.delete('data_devolucao');
  return `?${params.toString()}`;
}

export function diasPeriodoCarro(inicio, fim) {
  if (!inicio || !fim) return 0;
  const dia = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(0, Math.round((dia(fim) - dia(inicio)) / 86400000));
}
