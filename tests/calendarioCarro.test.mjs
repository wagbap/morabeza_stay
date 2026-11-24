import test from 'node:test';
import assert from 'node:assert/strict';
import { podeSelecionarDataCarro } from '../src/features/carros/utils/calendarioCarro.js';

test('client calendar disables maintenance, missing days and invalid continuous returns, preserving free periods', () => {
  const calendar = { estado: 'ready', dias: {
    '2026-11-10': { levantamento: true, devolucao: false },
    '2026-11-11': { levantamento: true, devolucao: true },
    '2026-11-12': { levantamento: true, devolucao: false },
    '2026-11-13': { levantamento: false, devolucao: false },
  } };
  const date = day => new Date(2026, 10, day);
  assert.equal(podeSelecionarDataCarro(calendar, date(10), null, null), true);
  assert.equal(podeSelecionarDataCarro(calendar, date(11), date(10), null), true);
  assert.equal(podeSelecionarDataCarro(calendar, date(12), date(10), null), false);
  assert.equal(podeSelecionarDataCarro(calendar, date(13), null, null), false);
  assert.equal(podeSelecionarDataCarro(calendar, date(14), null, null), false);
  assert.equal(podeSelecionarDataCarro({ estado: 'loading', dias: {} }, date(10), null, null), false);
});
