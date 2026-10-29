import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSidebarSession, parseSidebarRoles, EMPTY_ROLES, rolesFromUpdate } from '../src/components/gest/sidebarSession.js';
const storage = values => ({ getItem: key => values[key] ?? null });
const token = payload => `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

test('malformed JWT and stored JSON do not crash the menu; legacy storage remains supported', () => {
  const session = readSidebarSession(storage({ token: 'broken', user: '{broken', morabeza_user: '{"id":7,"nome":"Ana"}' }));
  assert.equal(session.user.id, 7);
  assert.equal(readSidebarSession(storage({ user: '{broken' })), null);
  assert.equal(readSidebarSession({ getItem() { throw new Error('Storage unavailable'); } }), null);
});
test('profile updates take precedence over immutable token claims for the same account', () => {
  const session = readSidebarSession(storage({ token: token({ data: { id: 7, nome: 'Old name' } }), user: '{"id":7,"name":"New name"}' }));
  assert.equal(session.user.nome, 'New name');
});
test('profile data from another account must never be merged', () => {
  const session = readSidebarSession(storage({ token: token({ user: { usuario_id: 8, nome: 'Current' } }), user: '{"id":7,"name":"Other"}' }));
  assert.equal(session.user.id, 8);
  assert.equal(session.user.nome, 'Current');
});
test('expired sessions and invalid identifiers do not request roles', () => {
  assert.equal(readSidebarSession(storage({ token: token({ id: 7, exp: 1 }), user: '{"id":7}' })), null);
  assert.equal(readSidebarSession(storage({ user: '{"id":"invalid"}' })), null);
  assert.equal(readSidebarSession(storage({ access_token: token({ sub: '42' }) })).user.id, 42);
});
test('only approved management roles enable links and an empty successful response revokes them', () => {
  assert.deepEqual(parseSidebarRoles({ success: true, roles: [null, { name: 'anfitrion', status: 'pending' }, { name: 'guia_experiencias', status: 'approved' }, { name: 'proprietario_veiculos', status: 'approved' }] }), { anfitrion: false, guia: true, proprietarioVeiculos: true });
  assert.deepEqual(parseSidebarRoles({ success: true, roles: [] }), EMPTY_ROLES);
});
test('malformed API responses are errors rather than accidental permission revocations', () => {
  for (const data of [null, { success: false, roles: [] }, { success: true, roles: {} }, '{"error":"SQL failure"}']) {
    assert.throws(() => parseSidebarRoles(data), /Invalid roles/);
  }
});

test('confirmed role activation and removal immediately replace the menu permissions', () => {
  assert.deepEqual(rolesFromUpdate({ usuarioId: 7, roles: [{ name: 'anfitrion', status: 'approved' }] }, 7), { anfitrion: true, guia: false, proprietarioVeiculos: false });
  assert.deepEqual(rolesFromUpdate({ usuarioId: 7, roles: [] }, 7), EMPTY_ROLES);
});
test('role update events cannot apply another account permissions or malformed data', () => {
  assert.equal(rolesFromUpdate({ usuarioId: 8, roles: [{ name: 'anfitrion', status: 'approved' }] }, 7), null);
  assert.equal(rolesFromUpdate({ usuarioId: 7, roles: null }, 7), null);
});
