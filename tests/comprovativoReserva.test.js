import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../src/services/comprovativoReserva.js', import.meta.url), 'utf8'))
  .replace("import api from '../api/api';", 'const api = globalThis.receiptApi;')
  .replace("import { obterTokenValidacao } from '../utils/tokenValidacaoReserva';", 'const obterTokenValidacao = (_storage, _context, session) => session ? "session-jwt" : "expired-extra";');
const authError = () => Object.assign(new Error('Forbidden'), { response: { status: 403, data: new Blob([JSON.stringify({code:'AUTH_REQUIRED'})]) } });
test('expired extra credential retries with the login session and reports expired login', async () => {
  const calls=[];
  globalThis.localStorage={};
  globalThis.receiptApi={get:async (_url,options)=>{calls.push(options.headers.Authorization);throw authError();}};
  const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  await assert.rejects(mod.descarregarComprovativo({tipo:'alojamento',id:98}), error=>error.translationKey==='comprovativo_sessao_expirada');
  assert.deepEqual(calls,['Bearer expired-extra','Bearer session-jwt']);
});
test('database or network failures do not retry with another credential', async () => {
  let calls=0;
  globalThis.receiptApi={get:async()=>{calls++;throw Object.assign(new Error('Server failed'),{response:{status:500,data:new Blob(['Server error'])}});}};
  const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// server failure').toString('base64'));
  await assert.rejects(mod.descarregarComprovativo({tipo:'carro',id:12}),error=>!error.translationKey);
  assert.equal(calls,1);
});
