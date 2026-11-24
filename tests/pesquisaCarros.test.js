import test from 'node:test';
import assert from 'node:assert/strict';
import { carroEmSantiago, correspondePesquisaCarro } from '../src/features/carros/utils/pesquisaCarros.js';

const carros = [
  { ilha: 'Santiago', marca: 'Toyota', modelo: 'RAV4', tipo: 'SUV', passageiros: 7 },
  { ilha: 'Santiago', marca: 'Renault', modelo: 'Clio', tipo: 'Compacto', passageiros: 5 },
  { ilha: 'Sal', marca: 'Toyota', modelo: 'Yaris', tipo: 'Compacto', passageiros: 5 },
];
test('Santiago excludes vehicles on other islands, even with matching brands', () => {
  assert.deepEqual(carros.filter(c => carroEmSantiago(c) && correspondePesquisaCarro(c, 'Toyota', 'marca')), [carros[0]]);
});
test('model suggestions match brand and model together', () => {
  assert.equal(correspondePesquisaCarro(carros[1], 'Renault Clio', 'modelo'), true);
  assert.equal(correspondePesquisaCarro(carros[0], 'Renault Clio', 'modelo'), false);
});
test('categories and seat capacity use vehicle data', () => {
  assert.equal(correspondePesquisaCarro(carros[0], 'SUV', 'categoria'), true);
  assert.equal(correspondePesquisaCarro(carros[0], '7 lugares', 'lugares'), true);
  assert.equal(correspondePesquisaCarro(carros[1], '7 lugares', 'lugares'), false);
  assert.equal(correspondePesquisaCarro({...carros[1], titulo:'7 lugares especiais'}, '7 lugares'), false);
});
