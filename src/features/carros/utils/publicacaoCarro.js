// Disponibilidade não substitui a decisão de moderação. Sem aprovação
// explícita, o anúncio não pode ser apresentado ao público.
export function carroAprovado(carro) {
  return carro?.status_carro === 'aprovado';
}

export function filtrarCarrosAprovados(carros) {
  return Array.isArray(carros) ? carros.filter(carroAprovado) : [];
}

export async function confirmarAprovacaoCarro(carro, consultar) {
  if (!carro) return false;
  if (Object.hasOwn(carro, 'status_carro')) return carroAprovado(carro);
  if (!carro.id) return false;

  // O endpoint legado de detalhes omite a moderação. Confirmar o mesmo
  // veículo no catálogo público, sem tratar disponibilidade como aprovação.
  const resposta = await consultar('/get_carro.php', { params: { id: carro.id } });
  if (resposta?.success !== true) return false;
  const lista = Array.isArray(resposta.data) ? resposta.data : [resposta.data];
  return lista.some(item => item && String(item.id) === String(carro.id) && carroAprovado(item));
}
