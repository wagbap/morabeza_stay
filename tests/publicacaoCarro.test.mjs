import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carroAprovado, filtrarCarrosAprovados, confirmarAprovacaoCarro } from '../src/features/carros/utils/publicacaoCarro.js';

test('disponibilidade não permite publicar carros pendentes ou rejeitados', () => {
  for (const status_carro of ['pendente', 'rejeitado', undefined, null, '', 'disponivel']) {
    assert.equal(carroAprovado({ status: 'disponivel', status_carro }), false);
  }
  assert.equal(carroAprovado(null), false);
  assert.equal(carroAprovado({ status_carro: 'aprovado' }), true);
});

test('filtra antes de limitar os destaques e não altera a lista do anfitrião', () => {
  const carros = [{ id: 1, status_carro: 'pendente' }, { id: 2, status_carro: 'rejeitado' },
    { id: 3 }, { id: 4, status_carro: 'aprovado' }];
  assert.deepEqual(filtrarCarrosAprovados(carros).slice(0, 3).map(c => c.id), [4]);
  assert.equal(carros.length, 4);
  assert.deepEqual(filtrarCarrosAprovados(undefined), []);
});

test('detalhes legados confirmam aprovação pelo ID no catálogo público', async () => {
  const consultar = async (url, options) => {
    assert.equal(url, '/get_carro.php');
    assert.deepEqual(options.params, { id: 24 });
    return { success: true, data: { id: 24, status_carro: 'aprovado' } };
  };
  assert.equal(await confirmarAprovacaoCarro({ id: 24, status: 'disponivel' }, consultar), true);
  assert.equal(await confirmarAprovacaoCarro({ id: 24 }, async () => ({ success: true, data: { id: 25, status_carro: 'aprovado' } })), false);
  assert.equal(await confirmarAprovacaoCarro({ id: 24 }, async () => ({ success: true, data: { id: 24, status_carro: 'pendente' } })), false);
  assert.equal(await confirmarAprovacaoCarro({ id: 24 }, async () => ({ success: false })), false);
});

test('aprovação explícita não é substituída pela resposta de outro endpoint', async () => {
  const naoConsultar = () => { throw new Error('Consulta desnecessária'); };
  assert.equal(await confirmarAprovacaoCarro({ id: 24, status_carro: 'pendente' }, naoConsultar), false);
  assert.equal(await confirmarAprovacaoCarro({ id: 24, status_carro: 'aprovado' }, naoConsultar), true);
});
