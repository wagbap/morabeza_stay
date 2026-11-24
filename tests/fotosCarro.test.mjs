import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrairFotosCarro } from '../src/features/carros/utils/fotosCarro.js';

test('vehicle gallery uses uploaded vehicle photos without the stale list thumbnail', () => {
  assert.deepEqual(extrairFotosCarro({ imagem_url: 'https://example.com/old.jpg', imagens: [{ caminho_url: '/uploads/carros/side.jpg', ordem: 2 }, { url: '/uploads/carros/front.jpg', principal: '1' }], fotos: [{ foto_url: '/uploads/carros/interior.jpg' }] }), ['https://welovepalop.com/uploads/carros/front.jpg', 'https://welovepalop.com/uploads/carros/interior.jpg', 'https://welovepalop.com/uploads/carros/side.jpg']);
});
test('serialized galleries, missing URLs and duplicate photos are handled', () => {
  assert.deepEqual(extrairFotosCarro({ imagens: '["front.jpg","front.jpg",null]', fotos: [{ url: 5 }, { caminho: 'interior.jpg' }], imagem_url: 'null' }), ['https://welovepalop.com/uploads/carros/front.jpg', 'https://welovepalop.com/uploads/carros/interior.jpg']);
  assert.deepEqual(extrairFotosCarro(null), []);
});

 test('photos aliases override stale thumbnails and empty records stay empty', () => {
  assert.deepEqual(extrairFotosCarro({ imagem_principal: 'old.jpg', photos: [{ src: 'actual.jpg' }] }), ['https://welovepalop.com/uploads/carros/actual.jpg']);
  assert.deepEqual(extrairFotosCarro({ imagens: [], imagem_url: '' }), []);
});

test('empty gallery never injects a listing cover or advert card', () => {
 assert.deepEqual(extrairFotosCarro({ imagem_url: 'advert-card.png', imagens: [{ url: null }] }), []);
});

test('authoritative vehicle gallery ignores legacy aliases and hidden uploads', () => {
 assert.deepEqual(extrairFotosCarro({ galeria_fonte: 'carro_imagens', imagens: [{ caminho_url: 'real.jpg' }, { caminho_url: 'screenshot.png', exibir_galeria: 0 }], imagens_extra: ['advert-card.png'], fotos: ['other.jpg'], imagem_url: 'cover.jpg' }), ['https://welovepalop.com/uploads/carros/real.jpg']);
 assert.deepEqual(extrairFotosCarro({ galeria_fonte: 'carro_imagens', imagens: [], fotos: ['old.jpg'], imagem_url: 'cover.jpg' }), []);
});
