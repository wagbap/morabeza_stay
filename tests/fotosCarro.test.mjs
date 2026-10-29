import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrairFotosCarro } from '../src/features/carros/utils/fotosCarro.js';

test('vehicle gallery includes all real uploads before the list thumbnail', () => {
  assert.deepEqual(extrairFotosCarro({ imagem_url: 'https://example.com/old.jpg', imagens: [{ caminho_url: '/uploads/carros/side.jpg', ordem: 2 }, { url: '/uploads/carros/front.jpg', principal: '1' }], fotos: [{ foto_url: '/uploads/carros/interior.jpg' }] }), ['https://welovepalop.com/uploads/carros/front.jpg', 'https://welovepalop.com/uploads/carros/interior.jpg', 'https://welovepalop.com/uploads/carros/side.jpg', 'https://example.com/old.jpg']);
});
test('serialized galleries, missing URLs and duplicate photos are handled', () => {
  assert.deepEqual(extrairFotosCarro({ imagens: '["front.jpg","front.jpg",null]', fotos: [{ url: 5 }, { caminho: 'interior.jpg' }], imagem_url: 'null' }), ['https://welovepalop.com/uploads/carros/front.jpg', 'https://welovepalop.com/uploads/carros/interior.jpg']);
  assert.deepEqual(extrairFotosCarro(null), []);
});

 test('photos aliases override stale thumbnails and empty records stay empty', () => {
  assert.deepEqual(extrairFotosCarro({ imagem_principal: 'old.jpg', photos: [{ src: 'actual.jpg' }] }), ['https://welovepalop.com/uploads/carros/actual.jpg', 'https://welovepalop.com/uploads/carros/old.jpg']);
  assert.deepEqual(extrairFotosCarro({ imagens: [], imagem_url: '' }), []);
});
