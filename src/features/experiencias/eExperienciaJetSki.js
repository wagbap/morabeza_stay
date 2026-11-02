export function eExperienciaJetSki(experiencia = {}) {
  return ['categoria', 'categoria_slug', 'categoria_nome', 'tipo_experiencia', 'titulo'].some(key => {
    const value = String(experiencia[key] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return /\bjet[\s_-]*skis?\b/.test(value);
  });
}

// Identify the equipment independently from the booking model.
export function equipamentoJetSki(experiencia = {}, sessao = null) {
  const name = sessao?.equipamento_nome || experiencia?.equipamento_nome;
  if (name) return /\bjet[\s_-]*skis?\b|\bmotas?\b/i.test(name);
  return eExperienciaJetSki(experiencia || {});
}
