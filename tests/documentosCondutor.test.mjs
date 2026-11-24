import test from 'node:test';
import assert from 'node:assert/strict';
import { documentosCondutorCompletos, validarDocumentoCondutor, FORMATOS_DOCUMENTOS_CONDUTOR } from '../src/features/carros/utils/documentosCondutor.js';
const file = (name, type, size = 100) => ({ name, type, size });
test('driver requires three distinct file fields and accepts only JPG PNG PDF', () => {
  const docs = { carta_frente: file('front.jpg', 'image/jpeg'), carta_verso: file('back.png', 'image/png'), identificacao: file('id.pdf', 'application/pdf') };
  assert.equal(documentosCondutorCompletos(docs), true);
  for (const kind of Object.keys(docs)) assert.equal(documentosCondutorCompletos({ ...docs, [kind]: null }), false);
  for (const f of [file('id.doc', 'application/msword'), file('id.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), file('id.svg', 'image/svg+xml'), file('renamed.jpg', 'application/msword'), file('large.pdf', 'application/pdf', 10 * 1024 * 1024 + 1), file('empty.png', 'image/png', 0)]) assert.equal(validarDocumentoCondutor(f), false);
  assert.equal(FORMATOS_DOCUMENTOS_CONDUTOR, '.jpg,.jpeg,.png,.pdf');
});
