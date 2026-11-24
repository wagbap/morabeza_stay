import { test } from 'node:test';
import assert from 'node:assert/strict';
import { janelasCarro, horaNaJanela } from '../src/features/carros/utils/horariosCarro.js';
import { obterPedidoStockCarro } from '../src/features/carros/utils/pedidoStockCarro.js';
test('devolução pode reutilizar a janela de levantamento ou ter intervalo próprio', () => {
  const c = { levantamento_hora_inicio: '10:00:00', levantamento_hora_fim: '14:00:00' };
  assert.deepEqual(janelasCarro(c), { levantamento: ['10:00', '14:00'], devolucao: ['10:00', '14:00'] });
  const j = janelasCarro({ ...c, devolucao_mesmo_horario: 0, devolucao_hora_inicio: '16:30:00', devolucao_hora_fim: '19:45:00' });
  assert.equal(horaNaJanela('16:30', j.devolucao), true);
  assert.equal(horaNaJanela('19:45', j.devolucao), true);
  for (const h of ['', '10:00', '16:29', '19:46', '25:00']) assert.equal(horaNaJanela(h, j.devolucao), false);
  assert.equal(horaNaJanela('10:00', janelasCarro().levantamento), false);
});
test('alterar uma hora cria outra tentativa; atualizar a página preserva a mesma tentativa', () => {
  const m = new Map();const storage = { getItem: k => m.get(k), setItem: (k, v) => m.set(k, v) };
  const r = { id: 24, checkIn: '2026-11-10', checkOut: '2026-11-12', quantidade: 1, totalGeral: 10000, horaLevantamento: '11:00', horaDevolucao: '18:00' };
  const token = obterPedidoStockCarro(r, storage);
  assert.equal(obterPedidoStockCarro(r, storage), token);
  assert.notEqual(obterPedidoStockCarro({ ...r, horaDevolucao: '17:00' }, storage), token);
});
