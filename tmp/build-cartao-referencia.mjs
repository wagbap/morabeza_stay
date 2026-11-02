import {rolldown} from 'rolldown';
const b=await rolldown({input:'tmp/cartao-referencia-harness.jsx',platform:'browser',plugins:[{name:'test-font-css',resolveId(id){if(id.endsWith('.css'))return '\0font-css';},load(id){if(id==='\0font-css')return 'export default {};';}}]});await b.write({file:'tmp/cartao-referencia-browser.js',format:'es'});await b.close();
