import { test } from 'node:test';
import assert from 'node:assert/strict';
import api from '../src/api/api.js';
import { removerImagemRegisto } from '../src/services/removerImagemRegisto.js';

test('image deletion requires server confirmation and leaves local previews off the API', async () => {
  const original = api.delete;
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null };
  let calls = 0;
  api.delete = async () => { calls++; return { status: 200, data: { success: true } }; };
  try {
    await removerImagemRegisto('carro', { id: 5, pendingUpload: true });
    await removerImagemRegisto('experiencia', { id: 5, persistida: false });
    assert.equal(calls, 0);
    for (const domain of ['alojamento', 'carro', 'experiencia']) await removerImagemRegisto(domain, { id: 5 });
    assert.equal(calls, 3);
    api.delete = async () => ({ status: 200, data: { success: false } });
    await assert.rejects(removerImagemRegisto('alojamento', { id: 5 }));
    api.delete = async () => { throw new Error('Network unavailable'); };
    await assert.rejects(removerImagemRegisto('experiencia', { id: 5 }));
  } finally {
    api.delete = original;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
