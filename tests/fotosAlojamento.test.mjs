import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrairFotosAlojamento } from '../src/features/alojamento/utils/fotosAlojamento.js';

test('preserves absolute URLs and resolves upload paths without duplicating api/uploads', () => {
  assert.deepEqual(extrairFotosAlojamento({ imagem_url: 'uploads/alojamentos/a.jpg', imagens_extra: ['/uploads/alojamentos/b.jpg', 'api/uploads/c.jpg', 'd.jpg', '//cdn.example.com/e.jpg'] }), [
    'https://welovepalop.com/uploads/alojamentos/a.jpg',
    'https://welovepalop.com/uploads/alojamentos/b.jpg',
    'https://welovepalop.com/api/uploads/c.jpg',
    'https://welovepalop.com/api/uploads/d.jpg',
    'https://cdn.example.com/e.jpg',
  ]);
});

test('accepts JSON galleries and photo objects while removing invalid and duplicate entries', () => {
  assert.deepEqual(extrairFotosAlojamento({ imagem_url: 'null', imagens_extra: JSON.stringify([{ caminho_url: '/uploads/a.jpg' }, { path: '/uploads/a.jpg' }, 'undefined', 'javascript:alert(1)']), fotos: [{ src: 'https://example.com/b.jpg' }] }), [
    'https://welovepalop.com/uploads/a.jpg', 'https://example.com/b.jpg',
  ]);
  assert.deepEqual(extrairFotosAlojamento({ imagens_extra: '{broken' }), []);
});
