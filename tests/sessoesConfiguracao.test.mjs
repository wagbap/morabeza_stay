import assert from 'node:assert/strict';
import { gerarHorarios, lerConfiguracao, payloadConfiguracao, modeloReservaAgenda, trocarModeloConfiguracao } from '../src/components/gest/sessoesConfiguracao.js';

const slots = gerarHorarios({ abertura: '08:00', fecho: '11:00', intervalo: 15, duracao_minutos: 15 });
assert.equal(slots.length, 12);
assert.equal(slots.at(-1), '10:45');
assert.equal(gerarHorarios({ abertura: '08:00', fecho: '11:00', intervalo: 30, duracao_minutos: 15 }).length, 6);
assert.deepEqual(gerarHorarios({ abertura: '08:00', fecho: '08:20', intervalo: 5, duracao_minutos: 15 }), ['08:00', '08:05']);
assert.deepEqual(gerarHorarios({ abertura: '11:00', fecho: '08:00', intervalo: 15, duracao_minutos: 15 }), []);
const config = lerConfiguracao({ id: 3, duracao_minutos: 15, horarios_json: JSON.stringify(slots.slice(0, 8)), recursos_json: '[2]', opcoes_json: '{"metodo":"intervalos","abertura":"08:00","fecho":"11:00","intervalo":15,"preparacao":5}' });
assert.equal(config.horarios.length, 8);
assert.equal(gerarHorarios(config).length, 12);
assert.equal(config.preparacao, 5);
assert.deepEqual(payloadConfiguracao(config).horarios, slots.slice(0, 8));
assert.equal(payloadConfiguracao(config).opcoes.fecho, '11:00');
assert.equal(lerConfiguracao({ duracao_minutos: 120, horarios_json: '["09:00","14:00"]' }).fecho, '16:00');
console.log('PASS: independent duration/start interval, five-minute intervals, closing limits, 8 of 12 selected slots, preparation metadata and legacy configuration loading.');

assert.equal(modeloReservaAgenda({ modelo_reserva: 'por_pessoa', titulo: 'Jet ski', categoria: 'jet-ski' }, [{ unidade: 'unidade' }]), 'por_pessoa');
assert.equal(modeloReservaAgenda({ modelo_reserva: 'por_equipamento' }, []), 'por_equipamento');
assert.equal(modeloReservaAgenda({ titulo: 'Jet ski', categoria: 'jet-ski' }, []), 'por_pessoa');
assert.equal(modeloReservaAgenda({}, [{ unidade: 'unidade' }]), 'por_equipamento');
assert.equal(lerConfiguracao(undefined, { unidade: modeloReservaAgenda({ modelo_reserva: 'por_pessoa' }) === 'por_equipamento' ? 'unidade' : 'participante' }).unidade, 'participante');
console.log('PASS: registered booking model overrides category, title and equipment configurations.');

const resources = [{id: 1, tipo: 'guia', quantidade: 1}, {id: 2, tipo: 'equipamento', quantidade: 5}, {id: 3, tipo: 'equipamento', quantidade: 8}];
const switched = trocarModeloConfiguracao({recursos: [1], capacidade: 10}, 'unidade', resources, {recurso_id: 3});
assert.deepEqual(switched.recursos, [1,3]);
assert.equal(switched.capacidade, 8);
const back = trocarModeloConfiguracao(switched, 'participante', resources, {max_pessoas: 10, min_pessoas: 3});
assert.deepEqual(back.recursos, [1]);
assert.equal(back.capacidade, 10);
assert.equal(back.minimo_participantes, 3);
assert.equal(trocarModeloConfiguracao(switched, 'unidade', resources.map(r => r.id===3 ? {...r,quantidade:4} : r), {recurso_id:3}).capacidade, 4);
console.log('PASS: switching model loads registered equipment despite guide links, restores participant capacity and refreshes stock after editing.');

assert.equal(modeloReservaAgenda(null, null), 'por_pessoa');
