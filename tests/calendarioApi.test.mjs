import { test } from 'node:test';
import assert from 'node:assert/strict';
import api from '../src/api/api.js';
import { fetchJsonBlindado } from '../src/components/gest/calendarioApi.js';

test('calendar API preserves data and rejects server failures without treating them as empty stock', async () => {
  const original = api.request;
  let response;
  api.request = async (config) => {
    assert.equal(config.timeout, 20000);
    return response;
  };
  try {
    const payload = { success: true, stocks: [{ tipo_quarto_id: 4, quantidade_disponivel: 2 }] };
    response = { status: 200, data: JSON.stringify(payload) };
    assert.deepEqual((await fetchJsonBlindado('/get_stock_quartos.php')).data, payload);
    assert.equal((await fetchJsonBlindado('/get_stock_quartos.php')).ok, true);
    response = { status: 200, data: '{"error":"SQLSTATE[HY000] [2002]"}{"success":false,"error":"Connection failed"}' };
    assert.equal((await fetchJsonBlindado('/alojamento_bloqueios.php')).ok, false);
    response = { status: 200, data: '{"success":false,"error":"Connection failed"}' };
    assert.equal((await fetchJsonBlindado('/alojamento_bloqueios.php')).ok, false);
    response = { status: 503, data: '{"success":true}' };
    assert.equal((await fetchJsonBlindado('/alojamento_bloqueios.php')).ok, false);
    response = { status: 200, data: '<html>Server unavailable</html>' };
    assert.equal((await fetchJsonBlindado('/get_stock_quartos.php')).ok, false);
    response = { status: 200, data: '{"success":true,"stocks":[]}' };
    assert.equal((await fetchJsonBlindado('/get_stock_quartos.php')).ok, true);
    api.request = async () => { throw new Error('Network unavailable'); };
    await assert.rejects(fetchJsonBlindado('/get_stock_quartos.php'), /Network unavailable/);
  } finally { api.request = original; }
});
