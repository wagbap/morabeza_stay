import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterUtilizadorCheckout } from '../src/utils/utilizadorCheckout.js';

const jwt = payload => `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
const storage = entries => ({ getItem: key => entries[key] ?? null });
const claims = { exp: 2000000000, data: { id: 7, name: 'João Silva', email: 'joao@example.com' } };
test('Google login with only JWT supplies the checkout identity', () => {
  const user = obterUtilizadorCheckout(storage({ token: jwt(claims) }), 1000);
  assert.equal(user.nome, 'João Silva');
  assert.equal(user.email, 'joao@example.com');
  assert.equal(user.id, 7);
});
test('matching stored profile supplies missing phone without changing JWT identity', () => {
  const user = obterUtilizadorCheckout(storage({ token: jwt(claims), user: JSON.stringify({ email: claims.data.email, phone: '+2381234567' }) }), 1000);
  assert.equal(user.phone, '+2381234567');
  assert.equal(user.id, 7);
});
test('unrelated profile cannot fill another account details', () => {
  const user = obterUtilizadorCheckout(storage({ token: jwt(claims), user: JSON.stringify({ email: 'other@example.com', phone: 'wrong' }) }), 1000);
  assert.equal(user.phone, '');
});
test('expired session and guest return no logged in identity', () => {
  assert.equal(obterUtilizadorCheckout(storage({ token: jwt(claims) }), 2100000000000), null);
  assert.equal(obterUtilizadorCheckout(storage({})), null);
});
test('corrupt profile and token do not prevent another valid JWT', () => {
  const user = obterUtilizadorCheckout(storage({ user: '{', token: 'invalid', morabeza_token: jwt(claims) }), 1000);
  assert.equal(user.email, claims.data.email);
});
