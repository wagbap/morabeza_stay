import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairCondicoesCarro } from '../src/features/carros/utils/condicoesCarro.js';
test('conditions stay with their listing and exclude private vehicle data', () => {
 const a = extrairCondicoesCarro({ levantamento_local: 'praia', levantamento_hora_inicio: '08:00:00', levantamento_hora_fim: '17:00:00', limite_km: 0, matricula: 'PRIVATE' });
 const b = extrairCondicoesCarro({ levantamento_local: 'Sal' });
 assert.equal(a.levantamento_local, 'praia');
 assert.equal(a.levantamento_hora_fim, '17:00:00');
 assert.equal(a.limite_km, 0);
 assert.equal(b.levantamento_local, 'Sal');
 assert.equal(b.levantamento_hora_fim, undefined);
 assert.equal(a.matricula, undefined);
 assert.deepEqual(extrairCondicoesCarro(null), {});
});
