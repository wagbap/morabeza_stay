import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterUtilizadorRegisto } from '../src/utils/registoSession.js';
const storage = values => ({ getItem: key => values[key] ?? null });
test('broken tokens do not hide a valid saved user', () => {
  assert.equal(obterUtilizadorRegisto(storage({ token: 'invalid', user: JSON.stringify({ id: 12 }) })).id, 12);
  assert.equal(obterUtilizadorRegisto(storage({ morabeza_token: 'opaque', morabeza_user: JSON.stringify({ user_id: 13 }) })).id, 13);
});
test('administrative profiles and empty or corrupt storage are handled', () => {
  assert.equal(obterUtilizadorRegisto(storage({ token: 'bad', morabeza_admin: JSON.stringify({ id: 5 }) })).id, 5);
  assert.equal(obterUtilizadorRegisto(storage({ user: 'bad', morabeza_admin: 'bad' })), null);
  assert.equal(obterUtilizadorRegisto({ getItem: () => { throw new Error('Unavailable'); } }), null);
});
