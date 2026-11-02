// The booking model belongs to the experience, never to its title or category.
export function modeloReservaAgenda(experiencia = {}, configuracoes = []) {
  experiencia = experiencia || {};
  configuracoes = configuracoes || [];
  if (['por_pessoa', 'por_equipamento', 'grupo_privado'].includes(experiencia.modelo_reserva)) return experiencia.modelo_reserva;
  // Compatibility with older APIs: only existing configurations provide evidence of equipment rental.
  return configuracoes.length && configuracoes.every(c => c.unidade === 'unidade') ? 'por_equipamento' : 'por_pessoa';
}

export const minutosHora = value => {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return NaN;
  const [h, m] = value.split(':').map(Number);
  return h < 24 && m < 60 ? h * 60 + m : NaN;
};
export const horaMinutos = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export function gerarHorarios({ abertura, fecho, intervalo, duracao_minutos }) {
  const start = minutosHora(abertura), end = minutosHora(fecho), step = Number(intervalo), duration = Number(duracao_minutos);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || step < 1 || duration < 1) return [];
  const result = [];
  for (let n = start; n + duration <= end && n + duration < 1440; n += step) result.push(horaMinutos(n));
  return result;
}
export function lerConfiguracao(value, defaults = {}) {
  const parse = (v, fallback) => { try { return typeof v === 'string' ? JSON.parse(v) : v ?? fallback; } catch { return fallback; } };
  const starts = parse(value?.horarios_json, []).slice().sort();
  const duration = Number(value?.duracao_minutos || 15);
  const options = parse(value?.opcoes_json, {});
  const form = { nome: defaults.nome || '', duracao_minutos: duration, preco: defaults.preco || 0, capacidade: defaults.capacidade || 1, unidade: defaults.unidade || 'participante', ativo: 1, ...value,
    recursos: parse(value?.recursos_json, defaults.recursos || []), horarios: starts.length ? starts : ['08:00'],
    metodo: options.metodo || 'intervalos', abertura: options.abertura || starts[0] || '08:00',
    fecho: options.fecho || (starts.length ? horaMinutos(minutosHora(starts.at(-1)) + duration) : '11:00'),
    intervalo: Number(options.intervalo || duration), preparacao: Number(options.preparacao || 0), minimo_participantes: Number(options.minimo_participantes ?? defaults.minimo_participantes ?? 1) };
  return form;
}
export function payloadConfiguracao(form) {
  return { ...form, horarios: [...new Set(form.horarios)].sort(), opcoes: { metodo: form.metodo, abertura: form.abertura, fecho: form.fecho, intervalo: Number(form.intervalo), preparacao: Number(form.preparacao), minimo_participantes: form.unidade === 'participante' ? Number(form.minimo_participantes || 1) : 1 } };
}

export function trocarModeloConfiguracao(form, unidade, resources = [], experiencia = {}) {
  const selected = resources.find(r => r.tipo === 'equipamento' && Number(r.id) === Number(experiencia.recurso_id))
    || resources.find(r => r.tipo === 'equipamento' && (form.recursos || []).includes(Number(r.id)))
    || resources.find(r => r.tipo === 'equipamento');
  const nonEquipment = (form.recursos || []).filter(id => resources.some(r => Number(r.id) === Number(id) && r.tipo !== 'equipamento'));
  if (unidade === 'unidade') return { ...form, unidade, recursos: selected ? [...nonEquipment, Number(selected.id)] : nonEquipment, capacidade: selected ? Number(selected.quantidade) : 1 };
  return { ...form, unidade, recursos: nonEquipment, capacidade: Number(experiencia.max_pessoas) || form.capacidade || 1, minimo_participantes: Number(experiencia.min_pessoas) || 1 };
}
