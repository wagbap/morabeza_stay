import assert from 'node:assert/strict';
import { rolldown } from 'rolldown';
import { mkdir } from 'node:fs/promises';

await mkdir('tmp', { recursive: true });
const bundle = await rolldown({
  input: 'src/services/agendaExperiencias.js', platform: 'node',
  plugins: [{ name: 'isolated-api', resolveId(id) {
    if (id === '../api/api') return '\0api';
    if (id === '../utils/tokenValidacaoReserva') return '\0token';
  }, load(id) {
    if (id === '\0token') return 'export const obterTokenValidacao=()=>null;';
    if (id === '\0api') return 'export default {post:async()=>({data:{success:false,error:"Legacy conflict",code:"LEGACY_SESSION_CONFLICT",conflitos:[{id:99,pode_ligar:true}]}})};';
  } }],
});
await bundle.write({ file: 'tmp/agenda-service-test.mjs', format: 'es' });
await bundle.close();
globalThis.localStorage = {};
const { pedirAgendaExperiencia } = await import('../tmp/agenda-service-test.mjs');
await assert.rejects(pedirAgendaExperiencia({}), error => {
  assert.equal(error.response.data.code, 'LEGACY_SESSION_CONFLICT');
  assert.equal(error.response.data.conflitos[0].id, 99);
  return true;
});
delete globalThis.localStorage;
console.log('PASS: legacy conflict details reach the resolution dialog even when the hosting responds HTTP 200.');
