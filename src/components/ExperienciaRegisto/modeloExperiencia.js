export const MODELOS_EXPERIENCIA = ['por_pessoa', 'por_equipamento'];
export function erroInformacoesExperiencia(info = {}) {
  if (!MODELOS_EXPERIENCIA.includes(info.modelo_reserva)) return 'experiencia_registo_modelo_obrigatorio';
  if (!info.titulo?.trim()) return 'experiencia_registo_titulo_obrigatorio';
  if (!info.descricao_curta?.trim() || info.descricao_curta.length > 200) return 'experiencia_registo_descricao_obrigatoria';
  if (info.modelo_reserva !== 'por_equipamento' && (!Number.isFinite(Number(info.preco)) || Number(info.preco) <= 0)) return 'experiencia_registo_preco_obrigatorio';
  return null;
}
export function erroDisponibilidadeExperiencia(info = {}, dados = {}) {
  if (!MODELOS_EXPERIENCIA.includes(info.modelo_reserva)) return 'experiencia_registo_modelo_obrigatorio';
  const positive = value => Number.isInteger(Number(value)) && Number(value) > 0;
  if (info.modelo_reserva === 'por_equipamento') {
    if (!info.equipamento_nome?.trim() || info.equipamento_nome.length > 150 || !positive(info.quantidade_equipamentos) || Number(info.quantidade_equipamentos) > 10000 || !positive(info.pessoas_por_equipamento) || Number(info.pessoas_por_equipamento) > 500) return 'experiencia_registo_equipamento_obrigatorio';
  } else if (!positive(info.max_pessoas) || Number(info.max_pessoas) > 10000) return 'experiencia_registo_capacidade_obrigatoria';
  if (info.modelo_reserva !== 'por_equipamento' && (!positive(info.min_pessoas ?? 1) || Number(info.min_pessoas ?? 1) > Number(info.max_pessoas))) return 'experiencia_registo_minimo_invalido';
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  if (!Array.isArray(dados.dias_disponiveis) || !dados.dias_disponiveis.some(d => days.includes(d)) || dados.dias_disponiveis.some(d => !days.includes(d))) return 'experiencia_registo_dias_obrigatorios';
  return null;
}
