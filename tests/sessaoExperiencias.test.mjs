import assert from 'node:assert/strict';
import { rolldown } from 'rolldown';
import { mkdir } from 'node:fs/promises';

await mkdir('tmp', { recursive: true });
const mockApi = `const send=async config=>{globalThis.__authRequests.push(config);if(globalThis.__authError)throw globalThis.__authError;return {data:{success:true,data:{id:20},configuracoes:[]}}};export default {post:(url,data,config)=>send({...config,url,data}),request:send};`;
async function bundleService(entry, output) {
  const bundle = await rolldown({input:entry,platform:'node',plugins:[{
    name:'isolated-session-api',
    resolveId(id){if(id==='../api/api')return '\0api';if(id==='../i18n')return '\0i18n';},
    load(id){if(id==='\0api')return mockApi;if(id==='\0i18n')return 'export default {t:key=>key};';},
  }]});
  await bundle.write({file:output,format:'es'});await bundle.close();
}
await bundleService('src/services/agendaExperiencias.js','tmp/session-agenda-test.mjs');
await bundleService('src/services/experienciaApiService.js','tmp/session-experience-test.mjs');
const {pedirAgendaExperiencia}=await import('../tmp/session-agenda-test.mjs');
const {buscarExperienciaParaEdicao}=await import('../tmp/session-experience-test.mjs');
const jwt=exp=>`${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({exp,data:{id:7}})).toString('base64url')}.fixture`;
let values={};
globalThis.localStorage={getItem:key=>values[key]??null};
globalThis.__authRequests=[];
const valid=jwt(Math.floor(Date.now()/1000)+86400);
values={token:valid,morabeza_token:valid,reserva_validation_token:'expired-eight-hour-token'};
await pedirAgendaExperiencia({action:'painel',experiencia_id:20});
await buscarExperienciaParaEdicao(20);
assert.equal(globalThis.__authRequests.length,2);
for(const request of globalThis.__authRequests)assert.equal(request.headers.Authorization,`Bearer ${valid}`);
// Direct entry/reload reads the persistent login, not the expired auxiliary token.
await pedirAgendaExperiencia({action:'painel',experiencia_id:20});
assert.equal(globalThis.__authRequests.at(-1).headers.Authorization,`Bearer ${valid}`);
values.token=jwt(1);
await pedirAgendaExperiencia({action:'painel',experiencia_id:20});
assert.equal(globalThis.__authRequests.at(-1).headers.Authorization,`Bearer ${valid}`);
values={reserva_validation_token:'legacy-valid-host-token',admin_token:'admin-must-never-be-used'};
await pedirAgendaExperiencia({action:'painel',experiencia_id:20});
assert.equal(globalThis.__authRequests.at(-1).headers.Authorization,'Bearer legacy-valid-host-token');
values={admin_token:'admin-must-never-be-used'};
await pedirAgendaExperiencia({action:'painel',experiencia_id:20});
assert.equal(globalThis.__authRequests.at(-1).headers.Authorization,undefined);
values={token:valid,reserva_validation_token:'expired-eight-hour-token'};
globalThis.__authError={response:{status:403,data:{code:'AUTH_REQUIRED'}}};
const before=globalThis.__authRequests.length;
await assert.rejects(pedirAgendaExperiencia({action:'painel',experiencia_id:20}));
assert.equal(globalThis.__authRequests.length,before+1,'no retry loop or credential escalation');
assert.equal(values.token,valid,'an API failure must not erase the login');
delete globalThis.localStorage;delete globalThis.__authRequests;delete globalThis.__authError;
console.log('PASS: agenda and experience details use persistent login before auxiliary token; reload, stale alias, legacy fallback, admin isolation and no logout/retry loop.');
