import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataPesquisaCarro, periodoPesquisaCarro, pesquisaComPeriodoCarro, diasPeriodoCarro } from '../src/features/carros/utils/periodoPesquisaCarro.js';
import { dataLocalCarro } from '../src/features/carros/utils/disponibilidadeCarro.js';

test('limpar o calendário remove o período e conserva os outros filtros', () => {
  const params = new URLSearchParams(pesquisaComPeriodoCarro('?destino=Santiago&data_levantamento=2027-03-01&data_devolucao=2027-03-02', null, null));
  assert.equal(params.get('destino'), 'Santiago');
  assert.equal(params.has('data_levantamento'), false);
  assert.equal(params.has('data_devolucao'), false);
});

test('recebe o período completo da pesquisa sem deslocar o dia pelo fuso horário', () => {
  assert.deepEqual(periodoPesquisaCarro('?data_levantamento=2027-03-27&data_devolucao=2027-03-29', new Date(2027, 2, 1)), { inicio: '2027-03-27', fim: '2027-03-29' });
  assert.equal(dataLocalCarro(dataPesquisaCarro('2028-02-29')), '2028-02-29');
  assert.equal(diasPeriodoCarro(dataPesquisaCarro('2027-03-27'), dataPesquisaCarro('2027-03-29')), 2);
});
test('datas impossíveis, passadas, incompletas ou invertidas não viram períodos reserváveis', () => {
  const hoje = new Date(2027, 2, 1);
  for (const [inicio, fim] of [['2027-02-31', '2027-03-04'], ['2027-02-28', '2027-03-04'], ['2027-03-04', ''], ['2027-03-04', '2027-03-04'], ['2027-03-05', '2027-03-04'], ['invalid', '2027-03-04']]) assert.deepEqual(periodoPesquisaCarro(`?data_levantamento=${inicio}&data_devolucao=${fim}`, hoje), { inicio: '', fim: '' });
});
test('editar o período substitui as datas da pesquisa e conserva os restantes filtros', () => {
  const search = pesquisaComPeriodoCarro('?data_levantamento=2027-03-01&data_devolucao=2027-03-02&localizacao=Sal', dataPesquisaCarro('2027-04-10'), dataPesquisaCarro('2027-04-13'));
  const params = new URLSearchParams(search);
  assert.equal(params.get('localizacao'), 'Sal');assert.equal(params.get('data_levantamento'), '2027-04-10');assert.equal(params.get('data_devolucao'), '2027-04-13');
});
