export function obterPedidoStockCarro(reserva, storage = sessionStorage) {
  const assinatura = JSON.stringify([reserva.id, reserva.checkIn, reserva.checkOut, reserva.quantidade, reserva.horaLevantamento, reserva.horaDevolucao, reserva.precoTotal ?? reserva.totalGeral]);
  let anterior;
  try { anterior = JSON.parse(storage.getItem('pedidoStockCarro')); } catch { /* Discard an invalid cached request. */ }
  if (anterior?.assinatura === assinatura && /^[a-f0-9]{64}$/.test(anterior.token)) return anterior.token;
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join('');
  storage.setItem('pedidoStockCarro', JSON.stringify({ assinatura, token }));
  return token;
}
