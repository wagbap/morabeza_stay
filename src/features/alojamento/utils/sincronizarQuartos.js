export function ajustesDisponibilidade(quantidades, stocks, bloqueios) {
  return Object.entries(quantidades).flatMap(([id, quantidade]) => {
    if (!(quantidade > 0)) return [];
    const stock = stocks[id];
    const limite = stock == null || !Number.isFinite(Number(stock))
      ? quantidade : Math.max(0, Math.floor(Number(stock)));
    const novaQuantidade = bloqueios[id] ? 0 : Math.min(quantidade, limite);
    return novaQuantidade === quantidade ? [] : [{ id, quantidade: novaQuantidade }];
  });
}
