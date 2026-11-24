import test from 'node:test';
import assert from 'node:assert/strict';
import { periodoSemBloqueios } from '../src/components/Calendario/validarPeriodo.js';
const dia = value => new Date(value + 'T00:00:00');
test('rejects a stay crossing a blocked night even when both endpoints are free', () => {
  assert.equal(periodoSemBloqueios(dia('2026-11-10'), dia('2026-11-15'), ['2026-11-12']), false);
});
test('allows checkout on the first occupied night, but never entry on it', () => {
  assert.equal(periodoSemBloqueios(dia('2026-11-10'), dia('2026-11-12'), ['2026-11-12']), true);
  assert.equal(periodoSemBloqueios(dia('2026-11-12'), dia('2026-11-14'), ['2026-11-12']), false);
  assert.equal(periodoSemBloqueios(dia('2026-11-10'), dia('2026-11-12'), ['2026-11-12'], false), false);
});
test('checks periods across months and rejects reversed or zero-night stays', () => {
  assert.equal(periodoSemBloqueios(dia('2026-11-29'), dia('2026-12-03'), ['2026-12-01']), false);
  assert.equal(periodoSemBloqueios(dia('2026-11-29'), dia('2026-12-03'), ['2026-12-04']), true);
  assert.equal(periodoSemBloqueios(dia('2026-11-29'), dia('2026-11-29'), []), false);
  assert.equal(periodoSemBloqueios(dia('2026-12-03'), dia('2026-11-29'), []), false);
});
test('allows incomplete selection and clearing', () => {
  assert.equal(periodoSemBloqueios(dia('2026-11-29'), null, []), true);
  assert.equal(periodoSemBloqueios(null, null, []), true);
});
