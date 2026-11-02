import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import pt from '../src/locales/pt.js';
import Card from '../src/features/experiencias/components/CartaoReservaExperiencia.jsx';
await i18next.init({lng:'pt',resources:{pt:{translation:pt.translation || pt}},initImmediate:false});
function Harness(){const [people,setPeople]=useState(1);return <main style={{maxWidth:684,margin:'42px auto'}}><Card preco={2000} total={2000*people} rating={0} avaliacoes={0} participantes={people} setParticipantes={setPeople} minParticipantes={1} maxParticipantes={10} minimoRealizacao={3} duracao="8 horas" duracoes={[480]} duracaoSelecionada={480} data="03/11/2026" periodo="Manhã" periodos={[]} sessoes={[{id:1,hora_inicio:'08:00',hora_fim:'16:00',vagas_disponiveis:10}]} vagas={10} sessaoIdSelecionada={1} reservar={()=>{window.submittedPeople=people;}}/></main>};
createRoot(document.getElementById('participant-test')).render(<I18nextProvider i18n={i18next}><Harness/></I18nextProvider>);
