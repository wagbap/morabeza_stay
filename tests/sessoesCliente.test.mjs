import { equipamentoJetSki } from '../src/features/experiencias/eExperienciaJetSki.js';
import assert from 'node:assert/strict';
import {opcoesDuracao,sessoesDisponiveis,sessoesDaDuracao,periodoDaSessao,vendaPorEquipamento} from '../src/features/experiencias/sessoesCliente.js';
import {totalExperiencia} from '../src/features/experiencias/precoSessao.js';
import {erroDisponibilidadeExperiencia} from '../src/components/ExperienciaRegisto/modeloExperiencia.js';
import {lerConfiguracao,payloadConfiguracao} from '../src/components/gest/sessoesConfiguracao.js';
const rows=[{id:1,hora_inicio:'08:00',hora_fim:'16:00',vagas_disponiveis:10},{id:2,hora_inicio:'08:00',hora_fim:'08:15',vagas_disponiveis:5},{id:3,hora_inicio:'09:00',hora_fim:'09:30',vagas_disponiveis:0},{id:4,hora_inicio:'16:00',hora_fim:'16:15',vagas_disponiveis:3}];
assert.deepEqual(opcoesDuracao(rows),[15,480]);assert.equal(sessoesDaDuracao(rows,480).length,1);assert.equal(periodoDaSessao(rows[0]),'Manhã');assert.equal(sessoesDisponiveis(rows).some(s=>s.id===3),false);
assert.equal(totalExperiencia(2000,1,'por_pessoa'),2000);assert.equal(totalExperiencia(2000,3,'por_pessoa'),6000);assert.equal(totalExperiencia(2000,2,'por_equipamento',1),2000);
const info={modelo_reserva:'por_pessoa',max_pessoas:10,min_pessoas:3};assert.equal(erroDisponibilidadeExperiencia(info,{dias_disponiveis:['terca']}),null);assert.ok(erroDisponibilidadeExperiencia({...info,min_pessoas:11},{dias_disponiveis:['terca']}));
const config=lerConfiguracao(null,{preco:2000,capacidade:10,minimo_participantes:3,unidade:'participante'});assert.equal(config.preco,2000);assert.equal(config.capacidade,10);assert.equal(config.minimo_participantes,3);assert.equal(payloadConfiguracao(config).opcoes.minimo_participantes,3);
console.log('PASS: only available durations/sessions, full-day morning departure, per-person/per-unit totals, session minimum and inherited configuration defaults.');

assert.equal(vendaPorEquipamento({modelo_reserva:'por_equipamento'},{unidade_venda:'participante'}),true);
assert.equal(vendaPorEquipamento({modelo_reserva:'por_pessoa'},{unidade_venda:'unidade'}),false);
assert.equal(vendaPorEquipamento({}, {unidade_venda:'unidade'}),true);

assert.equal(equipamentoJetSki({categoria:'jetski'}),true);
assert.equal(equipamentoJetSki({categoria:'jetski',equipamento_nome:'Kayak'}),false);
assert.equal(equipamentoJetSki({equipamento_nome:'Jet ski'}),true);
assert.equal(equipamentoJetSki({categoria:'aventura',equipamento_nome:'Quad'}),false);
