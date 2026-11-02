import assert from 'node:assert/strict';
import { guardarAlteracaoAgenda } from '../src/components/gest/guardarAgendaExperiencia.js';

const agenda = { dias: [4, 5, 6, 7], inicio: '2026-10-31' };
const config = { nome: 'Mergulho', horarios: ['09:00'] };
const calls = [], saved = [];
const request = async (action, dados) => { calls.push([action, dados]); return { action }; };
await guardarAlteracaoAgenda(request, 'guardar_configuracao', config, agenda, value => saved.push(value));
assert.deepEqual(calls, [['guardar_agenda', agenda], ['guardar_configuracao', config]]);
assert.equal(saved[0].action, 'guardar_agenda');
calls.length = 0;
await guardarAlteracaoAgenda(request, 'guardar_configuracao', config, null, () => assert.fail('Existing agenda must remain unchanged'));
assert.deepEqual(calls, [['guardar_configuracao', config]]);

calls.length = 0;
await guardarAlteracaoAgenda(request, 'guardar_configuracao', { ...config, ligar_sessoes_legadas: [99] }, agenda, () => {});
assert.deepEqual(calls[0][1].ligar_sessoes_legadas, [99]);
assert.deepEqual(calls[1][1].ligar_sessoes_legadas, [99]);

let configurations = 0;
await assert.rejects(guardarAlteracaoAgenda(async action => {
  if (action === 'guardar_agenda') throw new Error('Invalid working days');
  configurations++;
}, 'guardar_configuracao', config, agenda, () => {}), /Invalid working days/);
assert.equal(configurations, 0);

let persistedAgenda = false;
await assert.rejects(guardarAlteracaoAgenda(async action => {
  if (action === 'guardar_configuracao') throw new Error('Duplicate departure');
  return { agenda };
}, 'guardar_configuracao', config, agenda, () => { persistedAgenda = true; }), /Duplicate departure/);
assert.equal(persistedAgenda, true);
console.log('PASS: first configuration saves agenda first, existing agendas are preserved, invalid agendas block creation and a configuration error keeps the saved agenda visible.');
