import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarReservadorVagas } from '../src/utils/retencaoExperiencia.js';

test('StrictMode subscriptions share one in-flight hold request', async () => {
  let calls = 0;
  const reservar = criarReservadorVagas(async () => { calls++; return '{"success":true,"token":"fixture","segundos_restantes":900}'; });
  const first = reservar({ sessao_id: 1 });
  const second = reservar({ sessao_id: 1 });
  assert.equal(first, second);
  assert.equal((await second).token, 'fixture');
  assert.equal(calls, 1);
});
test('invalid or concatenated JSON is never accepted as a successful hold', async () => {
  for (const raw of ['{"success":true,"token":"x"}{}', '<br>Warning', '{"success":true}', 'null']) {
    await assert.rejects(criarReservadorVagas(async () => raw)({}), { code: 'INVALID_HOLD_RESPONSE' });
  }
});
test('a failed request can be retried and different sessions remain independent', async () => {
  let calls = 0;
  const reservar = criarReservadorVagas(async () => { if (++calls === 1) throw new Error('Network'); return '{"success":true,"token":"ok"}'; });
  await assert.rejects(reservar({ sessao_id: 1 }));
  await Promise.all([reservar({ sessao_id: 1 }), reservar({ sessao_id: 2 })]);
  assert.equal(calls, 3);
});
