import {rolldown} from 'rolldown';
const b=await rolldown({input:'tmp/alinhamento-cliente-harness.jsx',plugins:[{name:'test-font-css',resolveId(id){if(id.endsWith('.css'))return '\0font-css';},load(id){if(id==='\0font-css')return 'export default {};';}}],platform:'browser'});await b.write({file:'tmp/alinhamento-cliente-browser.js',format:'es'});await b.close();
