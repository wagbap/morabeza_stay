import {rolldown} from 'rolldown';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
const b=await rolldown({input:'src/utils/comodidadesQuarto.jsx',platform:'node',external:['react']});
await b.write({file:'tmp/comodidades-icons-bundle.mjs',format:'es'});await b.close();
const {getIconeComodidade,COMODIDADES_QUARTO}=await import('./comodidades-icons-bundle.mjs');
const names=['TV ecra plano','Pequeno-almoco','2 Quartos','4 Hospedes','Piscina','Ginasio','Frigorifico','Micro-ondas','Berco','Secador de cabelo','Ferro de engomar','Churrasqueira','Varanda','Animais permitidos'];
const icons=names.map(n=>renderToStaticMarkup(getIconeComodidade(n,22)));
assert.equal(new Set(icons).size,names.length,'Each pictured amenity has its own distinct icon');
for(const svg of icons){assert.ok(svg.includes('width="22"'));assert.ok(svg.includes('currentColor'));}
assert.equal(renderToStaticMarkup(getIconeComodidade('Frigorifico')),renderToStaticMarkup(getIconeComodidade('frigorifico')));
assert.equal(renderToStaticMarkup(getIconeComodidade('Animais permitidos')),renderToStaticMarkup(getIconeComodidade('pets')));
console.log('PASS: 14 distinct amenity icons, accent-insensitive names, pets alias, inherited color and requested size.');

for(const amenity of COMODIDADES_QUARTO){const svg=renderToStaticMarkup(getIconeComodidade(amenity.nome));assert.ok(!svg.includes('lucide-check'),amenity.nome+' must have a specific icon');assert.equal(svg,renderToStaticMarkup(getIconeComodidade(amenity.id)),amenity.id+' and label must agree');}
console.log('PASS: all official room amenities use specific icons, consistent by label and stored ID.');
