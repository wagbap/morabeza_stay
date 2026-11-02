import {rolldown} from 'rolldown';
const b=await rolldown({input:'tmp/registo-modelo-harness.jsx',platform:'browser'});await b.write({file:'tmp/registo-modelo-browser.js',format:'es'});await b.close();
