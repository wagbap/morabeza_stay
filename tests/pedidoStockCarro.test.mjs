import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterPedidoStockCarro } from '../src/features/carros/utils/pedidoStockCarro.js';
test('tentativas repetidas reutilizam o mesmo pedido; alterar datas ou quantidade cria outro', () => {
  const cache = new Map();
  const storage = { getItem: key => cache.get(key), setItem: (key, value) => cache.set(key, value) };
  const reserva = { id: 24, checkIn: '2026-11-10', checkOut: '2026-11-12', quantidade: 1, totalGeral: 10000 };
  const token = obterPedidoStockCarro(reserva, storage);
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(obterPedidoStockCarro(reserva, storage), token);
  const outro = obterPedidoStockCarro({ ...reserva, quantidade: 2 }, storage);
  assert.notEqual(outro, token);
  assert.notEqual(obterPedidoStockCarro({ ...reserva, checkOut: '2026-11-13' }, storage), outro);
});
