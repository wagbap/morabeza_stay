import {rolldown} from 'rolldown';
const b=await rolldown({input:'tmp/motivo-lov-harness.jsx',platform:'browser'});await b.write({file:'tmp/motivo-lov-browser.js',format:'es'});await b.close();
