import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { parseApiJson, requestApiJson } from '../src/services/apiJson.js';

test('accepts BOM and whitespace but rejects appended documents', () => {
  assert.deepEqual(parseApiJson('\uFEFF\r\n{"success":true}\n'), { success: true });
  assert.throws(() => parseApiJson('{"success":true}{"error":"failure"}'));
  assert.throws(() => parseApiJson('<html>Unavailable</html>'));
});

test('retries a malformed read and recovers on the next valid response', async () => {
  let calls = 0;
  const data = await requestApiJson('/reviews', {
    adapter: async () => ({ status: 200, data: ++calls === 1 ? '{}extra' : '{"avaliacoes":[]}' }),
  });
  assert.equal(calls, 2);
  assert.deepEqual(data, { avaliacoes: [] });
});

test('stops after the configured number of retries', async () => {
  let calls = 0;
  await assert.rejects(requestApiJson('/reviews', {
    retries: 1,
    adapter: async () => { calls++; return { status: 200, data: '{}extra' }; },
  }));
  assert.equal(calls, 2);
});

test('recovers from a temporary HTTP 500', async () => {
  let calls = 0;
  const data = await requestApiJson('/get_alojamento_detalhes.php', {
    params: { slug: 'hotel-de-gelson' },
    adapter: async () => {
      if (++calls === 1) {
        throw new AxiosError('Server failure', 'ERR_BAD_RESPONSE', undefined, undefined, { status: 500 });
      }
      return { status: 200, data: '{"id":1021,"titulo":"Hotel"}' };
    },
  });
  assert.equal(calls, 2);
  assert.equal(data.id, 1021);
});

test('does not retry an HTTP authorization failure', async () => {
  let calls = 0;
  await assert.rejects(requestApiJson('/reviews', {
    adapter: async () => {
      calls++;
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, { status: 401 });
    },
  }));
  assert.equal(calls, 1);
});

test('cancels the retry delay when the component unmounts', async () => {
  let calls = 0;
  const controller = new AbortController();
  const request = requestApiJson('/reviews', {
    signal: controller.signal,
    adapter: async () => { calls++; return { status: 200, data: '{}extra' }; },
  });
  setTimeout(() => controller.abort(), 20);
  await assert.rejects(request);
  assert.equal(calls, 1);
});
