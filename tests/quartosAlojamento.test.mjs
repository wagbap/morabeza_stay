import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterQuartosAlojamento, completarDadosCardAlojamento } from '../src/features/alojamento/utils/quartosAlojamento.js';
import { obterCasasBanho } from '../src/features/alojamento/utils/casasBanho.js';

test('quantidade explícita prevalece sobre comodidades; vazio usa a quantidade guardada na comodidade', () => {
  assert.equal(obterQuartosAlojamento({ numero_quartos: 8, comodidades: ['2 Quartos'] }), 8);
  assert.equal(obterQuartosAlojamento({ numero_quartos: null, comodidades: [{ nome: '2 Quartos' }] }), 2);
  assert.equal(obterQuartosAlojamento({ numero_quartos: '', quartos: '3' }), 3);
  assert.equal(obterQuartosAlojamento({ numero_quartos: 0 }), 0);
  assert.equal(obterQuartosAlojamento({ comodidades: ['2 Quartos', '3 Quartos'] }), null);
  assert.equal(obterQuartosAlojamento({}), null);
});

test('destaques recebem os mesmos dados de quartos e banhos sem alterar preços ou ordem', () => {
  const destaques = [{ id: 2, preco_noite: 1500 }, { id: 1 }];
  const resultado = completarDadosCardAlojamento(destaques, [{ id: '2', numero_quartos: 8, preco_noite: 1000, comodidades: [{ nome: '2 Casas de banho' }] }]);
  assert.equal(obterQuartosAlojamento(resultado[0]), 8);
  assert.equal(obterCasasBanho(resultado[0].casas_banho, resultado[0].comodidades), 2);
  assert.equal(resultado[0].preco_noite, 1500);
  assert.deepEqual(resultado.map(item => item.id), [2, 1]);
  assert.equal(destaques[0].numero_quartos, undefined);
  assert.equal(obterCasasBanho(null, []), null);
});
