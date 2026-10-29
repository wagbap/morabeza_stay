import { test } from 'node:test';
import assert from 'node:assert/strict';
import { temFotoAnuncio } from '../src/utils/fotosAnuncio.js';

test('requires an uploaded or existing photo, not an empty record or preview', () => {
  for (const value of [null, [], [{}], [{ url: '' }], [{ url: 'blob:pending' }], [{ url: '/uploads/a.jpg', uploadCompleto: false }], ['null']]) assert.equal(temFotoAnuncio(value), false);
  assert.equal(temFotoAnuncio([{ caminho_url: '/uploads/a.jpg' }]), true);
  assert.equal(temFotoAnuncio(['https://example.com/photo.jpg']), true);
  assert.equal(temFotoAnuncio([{ src: '/uploads/a.jpg', principal: true }]), true);
});
