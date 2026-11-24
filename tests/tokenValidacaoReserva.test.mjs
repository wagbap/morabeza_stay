import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterTokenValidacao } from '../src/utils/tokenValidacaoReserva.js';
const storage = values => ({ getItem: key => values[key] ?? null });
const jwt = exp => `${Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url')}.${Buffer.from(JSON.stringify({ exp, data: { id: 7 } })).toString('base64url')}.test-signature`;

test('experience management keeps the login session when the eight-hour auxiliary token expires', () => {
  const token = jwt(Math.floor(Date.now() / 1000) + 86400);
  const saved = storage({ token, morabeza_token: token, reserva_validation_token: 'expired-auxiliary' });
  assert.equal(obterTokenValidacao(saved, 'host', true), token);
  // Reloading the page reads the same persistent login, without rewriting it.
  assert.equal(obterTokenValidacao(saved, 'host', true), token);
});

test('an expired or malformed JWT alias cannot hide another valid login token', () => {
  const valid = jwt(Math.floor(Date.now() / 1000) + 3600);
  assert.equal(obterTokenValidacao(storage({ token: jwt(1), morabeza_token: valid }), 'host', true), valid);
  assert.equal(obterTokenValidacao(storage({ token: 'bad.payload.signature', access_token: valid }), 'host', true), valid);
  assert.equal(obterTokenValidacao(storage({ token: jwt(1), admin_token: valid }), 'host', true), null);
});
test('host validation never borrows the administrative account token', () => {
  assert.equal(obterTokenValidacao(storage({ admin_token: 'admin', morabeza_admin: JSON.stringify({ token: 'admin-profile' }) }), 'host'), null);
  assert.equal(obterTokenValidacao(storage({ admin_token: 'admin', token: 'host' }), 'host'), 'host');
  assert.equal(obterTokenValidacao(storage({ token: 'jwt', reserva_validation_token: 'opaque-host' }), 'host'), 'opaque-host');
});
test('admin validation preserves existing token priority', () => {
  assert.equal(obterTokenValidacao(storage({ token: 'host', admin_token: 'admin' }), 'admin'), 'admin');
  assert.equal(obterTokenValidacao(storage({ admin_token: 'old', morabeza_admin: JSON.stringify({ token: 'current' }) }), 'admin'), 'current');
});

test('host session fallback skips the expired extra credential and never uses admin credentials', () => {
  assert.equal(obterTokenValidacao(storage({ reserva_validation_token: 'expired', token: 'session-jwt', admin_token: 'admin' }), 'host', true), 'session-jwt');
  assert.equal(obterTokenValidacao(storage({ reserva_validation_token: 'expired', admin_token: 'admin' }), 'host', true), null);
});
test('corrupt or blocked storage cannot yield an identity', () => {
  assert.equal(obterTokenValidacao(storage({ morabeza_admin: '{broken' }), 'admin'), null);
  assert.equal(obterTokenValidacao({ getItem: () => { throw new Error('Blocked'); } }, 'host'), null);
  assert.throws(() => obterTokenValidacao(storage({}), 'unknown'));
});
