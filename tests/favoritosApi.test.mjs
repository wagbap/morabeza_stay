import { test } from 'node:test';
import assert from 'node:assert/strict';
import api from '../src/api/api.js';
import { carregarFavoritosApi } from '../src/services/favoritosApi.js';

test('cards share an in-flight favorites request and later loads remain fresh', async () => {
  const original = api.defaults.adapter;
  let calls = 0;
  api.defaults.adapter = async () => {
    calls++;
    await new Promise(resolve => setTimeout(resolve, 10));
    return { status: 200, data: '{"success":true,"data":[]}' };
  };
  try {
    const first = carregarFavoritosApi('test@example.com', 1);
    const second = carregarFavoritosApi('test@example.com', 1);
    assert.equal(first, second);
    assert.deepEqual(await first, { success: true, data: [] });
    assert.equal(calls, 1);
    await carregarFavoritosApi('test@example.com', 1);
    assert.equal(calls, 2);
  } finally {
    api.defaults.adapter = original;
  }
});
