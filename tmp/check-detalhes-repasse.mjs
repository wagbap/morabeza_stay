import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { rolldown } from 'rolldown';
const fixture=JSON.parse(fs.readFileSync('tmp/repasses-seed-api.json','utf8'));
const row=fixture.reservas.find(r=>r.codigo_reserva==='MS-EXEMPLO-002');
row.cliente_nome='Cliente de teste';row.validado_por_nome='Validador de teste';
const original=fs.readFileSync('src/components/admin/DetalhesRepasse.jsx','utf8').replace("import { pedirRepasses } from '../../services/repassesService';",'const pedirRepasses = async () => { throw Error("Unexpected request"); };');
await i18next.init({lng:'pt',resources:{pt:{translation:{}}},initImmediate:false});
for(const mode of ['available','held','paid']) {
 const r={...row};const payouts=[];
 if(mode==='held'){r.pode_registar=false;r.estado='retido';}
 if(mode==='paid'){r.pode_registar=false;r.estado='pago';r.repasse_id=1;payouts.push({id:1,estado:'pago',valor:9000,referencia:'TRF-TEST',comprovativo_url:'https://welovepalop.com/uploads/teste.pdf'});}
 const source=original.replace('useState(null)',`useState(${JSON.stringify({row:r,payouts})})`);
 fs.writeFileSync(`tmp/detail-${mode}.jsx`,source);
 const bundle=await rolldown({input:`tmp/detail-${mode}.jsx`,platform:'node',external:id=>!id.startsWith('.')&&!path.isAbsolute(id)});
 await bundle.write({file:`tmp/detail-${mode}.mjs`,format:'es'});await bundle.close();
 const {default:Page}=await import(`./detail-${mode}.mjs`);
 const html=renderToStaticMarkup(React.createElement(I18nextProvider,{i18n:i18next},React.createElement(MemoryRouter,{initialEntries:[`/admin/repasses/carro/${r.reserva_id}`]},React.createElement(Routes,null,React.createElement(Route,{path:'/admin/repasses/:tipo/:id',element:React.createElement(Page)})))));
 for(const text of ['Santiago Rent','Cliente de teste','Validador de teste','MS-EXEMPLO-002'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('<dialog'));
 assert.ok(!html.includes(`>${r.iban_numero}<`));
 assert.equal(html.includes(`href="/admin/repasses/carro/${r.reserva_id}/registar"`),mode==='available');
 if(mode==='paid')assert.ok(html.includes('TRF-TEST')&&html.includes('/uploads/teste.pdf'));
 assert.ok(html.includes('/admin/reservas?tipo=carro&amp;reserva='));
}
console.log('PASS: details render available, held and paid states, all real booking fields, masked IBAN, guarded registration link, receipt and complete reservation link; no modal.');
