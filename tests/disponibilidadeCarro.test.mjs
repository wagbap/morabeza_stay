import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disponibilidadeCarroConfirmada, dataLocalCarro } from '../src/features/carros/utils/disponibilidadeCarro.js';

test('erro SQL ou resposta incompleta de disponibilidade nunca permite reservar', () => {
  for (const resposta of [null, {}, { success: false, error: 'Unknown column' },
    { success: true }, { success: true, disponivel: false }, { success: true, disponivel: 'true' }]) {
    assert.equal(disponibilidadeCarroConfirmada(resposta), false);
  }
  assert.equal(disponibilidadeCarroConfirmada({ success: true, disponivel: true }), true);
});

test('as datas enviadas mantêm o dia escolhido no calendário local', () => {
  assert.equal(dataLocalCarro(new Date(2026, 10, 10)), '2026-11-10');
  assert.equal(dataLocalCarro(new Date(2026, 0, 2)), '2026-01-02');
});
