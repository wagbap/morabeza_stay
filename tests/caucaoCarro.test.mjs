import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCaucaoCarro, totalCaucaoCarro } from '../src/features/carros/utils/caucaoCarro.js';
import { decomporFinanceiro } from '../src/utils/financeiro.js';

test('anúncio ID 24 usa os 500 CVE guardados, por carro', () => {
  const dados = { exige_caucao: 1, caucao_valor: '500.00', caucao_formas: 'dinheiro,transferencia' };
  assert.equal(normalizarCaucaoCarro(dados).caucao_valor, 500);
  assert.equal(totalCaucaoCarro(dados, 1), 500);
  assert.equal(totalCaucaoCarro(dados, 2), 1000);
  assert.deepEqual(normalizarCaucaoCarro(dados).caucao_formas, ['dinheiro', 'transferencia']);
});

test('sem caução não recupera um valor antigo e dados ausentes não inventam 20000', () => {
  const sem = normalizarCaucaoCarro({ exige_caucao: '0', caucao_valor: 20000, caucao_formas: ['dinheiro'] });
  assert.equal(sem.caucao_valor, 0);
  assert.deepEqual(sem.caucao_formas, []);
  for (const dados of [{}, { valor_caucao: 20000 }, { exige_caucao: 1 }, { exige_caucao: 1, caucao_valor: -500 }, { exige_caucao: 1, caucao_valor: Infinity }]) {
    assert.equal(normalizarCaucaoCarro(dados), null);
  }
});

test('aluguer, valor online e comissão não recebem a caução de dois carros', () => {
  const aluguer = 5000 * 2 * 2;
  const caucao = totalCaucaoCarro({ exige_caucao: 1, caucao_valor: 500 }, 2);
  const financeiro = decomporFinanceiro(aluguer);
  assert.equal(caucao, 1000);
  assert.equal(financeiro.bruto, 20000);
  assert.equal(financeiro.comissao, 2000);
  assert.notEqual(financeiro.bruto, aluguer + caucao);
});
