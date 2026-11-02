import { minutosDaSessao } from './precoSessao.js';

export function periodoDaSessao(sessao) {
  const hour = Number(String(sessao.hora_inicio).slice(0, 2));
  return hour < 12 ? 'Manhã' : hour < 16 ? 'Meio dia' : 'Tarde';
}
export function sessoesDisponiveis(sessoes = []) {
  return sessoes.filter(s => Number(s.vagas_disponiveis) > 0 && minutosDaSessao(s) > 0)
    .map(s => ({ ...s, duracao_minutos: minutosDaSessao(s), periodo: periodoDaSessao(s) }))
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio) || Number(a.id) - Number(b.id));
}
export function opcoesDuracao(sessoes = []) {
  return [...new Set(sessoesDisponiveis(sessoes).map(s => s.duracao_minutos))].sort((a, b) => a - b);
}
export function sessoesDaDuracao(sessoes, minutos) {
  return sessoesDisponiveis(sessoes).filter(s => s.duracao_minutos === Number(minutos));
}

export function vendaPorEquipamento(experiencia = {}, sessao = null) {
  if (experiencia?.modelo_reserva === 'por_equipamento') return true;
  if (['por_pessoa','grupo_privado'].includes(experiencia?.modelo_reserva)) return false;
  return sessao?.unidade_venda === 'unidade';
}
